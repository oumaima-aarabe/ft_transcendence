import json
import asyncio
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from django.db.models import Q

from .models import PlayerProfile, Game, GameInvite, StatusChoices
from authentication.models import User


class InvitationConsumer(AsyncJsonWebsocketConsumer):
    """
    WebSocket consumer for handling game invitations.
    Manages sending, accepting, declining, and expiration of invitations.
    """
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.expiry_tasks = {}
        
    async def connect(self):
        """
        Called when a WebSocket connection is established.
        Authenticates the user and adds them to relevant groups.
        """
        # Get user_id from scope (set by your existing TokenAuthMiddleware)
        user_id = self.scope.get('user_id')
        
        if not user_id:
            # No user_id means authentication failed
            print("Authentication failed: No user_id in scope")
            await self.close()
            return
        
        try:
            # Get the actual User object from the database
            self.user = await database_sync_to_async(User.objects.get)(id=user_id)
            self.user_id = user_id
        except Exception as e:
            print(f"Error fetching user: {str(e)}")
            await self.close()
            return
        
        # Define group names
        self.invitation_group = "game_invitations"
        self.user_group = f"user_{self.user_id}"
        
        # Join the general invitation group
        await self.channel_layer.group_add(
            self.invitation_group,
            self.channel_name
        )
        
        # Join user-specific group for direct notifications
        await self.channel_layer.group_add(
            self.user_group,
            self.channel_name
        )
        
        # Accept the WebSocket connection
        await self.accept()
        
        # Send connection confirmation
        await self.send_json({
            "type": "connection_established",
            "message": "Connected to invitation server"
        })
        
        try:
            # Get active invitations for this user
            invitations = await self.get_active_invitations()
            await self.send_json({
                "type": "active_invitations",
                "invitations": invitations
            })
        except Exception as e:
            print(f"Error sending initial invitations: {str(e)}")
            # Send a simple confirmation instead
            await self.send_json({
                "type": "active_invitations",
                "invitations": {"sent": [], "received": []}
            })
    
    async def disconnect(self, close_code):
        """
        Called when the WebSocket connection is closed.
        Cleans up group memberships and tasks.
        """
        try:
            # Leave the groups
            await self.channel_layer.group_discard(
                self.invitation_group,
                self.channel_name
            )
            
            await self.channel_layer.group_discard(
                self.user_group,
                self.channel_name
            )
            
            # Cancel any pending invitation expiry tasks
            if hasattr(self, 'expiry_tasks'):
                for task in list(self.expiry_tasks.values()):
                    task.cancel()
                    try:
                        await task
                    except asyncio.CancelledError:
                        pass
                    except Exception as e:
                        print(f"Error cancelling expiry task: {str(e)}")
        except Exception as e:
            print(f"Error during disconnect: {str(e)}")
    
    async def receive_json(self, content):
        """
        Processes incoming messages from the client.
        """
        print(f"Received message: {content}")
        
        try:
            message_type = content.get("type", "")
            
            if message_type == "send_invitation":
                # Get recipient and difficulty
                recipient_id = content.get("recipient_id")
                difficulty = content.get("difficulty", "medium")
                
                if not recipient_id:
                    await self.send_json({
                        "type": "error",
                        "message": "Recipient ID is required"
                    })
                    return
                
                # Check if recipient exists and is not the sender
                if str(recipient_id) == str(self.user_id):
                    await self.send_json({
                        "type": "error",
                        "message": "Cannot send invitation to yourself"
                    })
                    return
                
                # Check if recipient is in a game or has a pending invitation
                recipient_available = await self.is_user_available(recipient_id)
                if not recipient_available:
                    await self.send_json({
                        "type": "error",
                        "message": "Recipient is unavailable for a game"
                    })
                    return
                
                # Create invitation
                invitation = await self.create_invitation(recipient_id, difficulty)
                
                if invitation:
                    # Notify recipient about the invitation
                    await self.channel_layer.group_send(
                        f"user_{recipient_id}",
                        {
                            "type": "invitation_received",
                            "invitation_id": invitation["id"],
                            "sender_id": self.user_id,
                            "sender_username": self.user.username,
                            "difficulty": difficulty
                        }
                    )
                    
                    # Send confirmation to sender
                    await self.send_json({
                        "type": "invitation_sent",
                        "invitation_id": invitation["id"],
                        "recipient_id": recipient_id,
                        "difficulty": difficulty
                    })
                    
                    # Set up expiry task
                    if not hasattr(self, 'expiry_tasks'):
                        self.expiry_tasks = {}
                    
                    # Calculate seconds until expiry
                    # expiry_time = invitation["expires_at"]
                    # now = timezone.now()
                    # seconds_until_expiry = (expiry_time - now).total_seconds()
                    
                    # Create task for expiration
                    # self.expiry_tasks[invitation["id"]] = asyncio.create_task(
                    #     self.handle_invitation_expiry(invitation["id"], seconds_until_expiry)
                    # )
            
            elif message_type == "accept_invitation":
                invitation_id = content.get("invitation_id")
                
                if not invitation_id:
                    await self.send_json({
                        "type": "error",
                        "message": "Invitation ID is required"
                    })
                    return
                
                # Check if the invitation is for this user and still valid
                invitation = await self.get_invitation(invitation_id)
                
                if not invitation:
                    await self.send_json({
                        "type": "error",
                        "message": "Invitation not found"
                    })
                    return
                
                if str(invitation["recipient_id"]) != str(self.user_id):
                    await self.send_json({
                        "type": "error",
                        "message": "This invitation is not for you"
                    })
                    return
                
                if invitation["status"] != StatusChoices.PENDING:
                    await self.send_json({
                        "type": "error",
                        "message": f"Invitation is already {invitation['status']}"
                    })
                    return
                
                # Accept the invitation and create a game
                game = await self.accept_invitation(invitation_id)
                
                if game:
                    # Notify both sender and recipient
                    await self.channel_layer.group_send(
                        f"user_{invitation['sender_id']}",
                        {
                            "type": "invitation_accepted",
                            "invitation_id": invitation_id,
                            "game_id": game["id"],
                            "recipient_id": self.user_id,
                            "recipient_username": self.user.username
                        }
                    )
                    
                    await self.send_json({
                        "type": "invitation_accepted",
                        "invitation_id": invitation_id,
                        "game_id": game["id"],
                        "sender_id": invitation["sender_id"],
                        "sender_username": invitation["sender_username"]
                    })
                    
                    # Cancel expiry task
                    if hasattr(self, 'expiry_tasks') and invitation_id in self.expiry_tasks:
                        self.expiry_tasks[invitation_id].cancel()
                        del self.expiry_tasks[invitation_id]
            
            elif message_type == "decline_invitation":
                invitation_id = content.get("invitation_id")
                
                if not invitation_id:
                    await self.send_json({
                        "type": "error",
                        "message": "Invitation ID is required"
                    })
                    return
                
                # Check if the invitation is for this user and still valid
                invitation = await self.get_invitation(invitation_id)
                
                if not invitation:
                    await self.send_json({
                        "type": "error",
                        "message": "Invitation not found"
                    })
                    return
                
                if str(invitation["recipient_id"]) != str(self.user_id):
                    await self.send_json({
                        "type": "error",
                        "message": "This invitation is not for you"
                    })
                    return
                
                if invitation["status"] != StatusChoices.PENDING:
                    await self.send_json({
                        "type": "error",
                        "message": f"Invitation is already {invitation['status']}"
                    })
                    return
                
                # Decline the invitation
                success = await self.decline_invitation(invitation_id)
                
                if success:
                    # Notify both sender and recipient
                    await self.channel_layer.group_send(
                        f"user_{invitation['sender_id']}",
                        {
                            "type": "invitation_declined",
                            "invitation_id": invitation_id,
                            "recipient_id": self.user_id,
                            "recipient_username": self.user.username
                        }
                    )
                    
                    await self.send_json({
                        "type": "invitation_declined",
                        "invitation_id": invitation_id,
                        "sender_id": invitation["sender_id"],
                        "sender_username": invitation["sender_username"]
                    })
                    
                    # Cancel expiry task
                    if hasattr(self, 'expiry_tasks') and invitation_id in self.expiry_tasks:
                        self.expiry_tasks[invitation_id].cancel()
                        del self.expiry_tasks[invitation_id]
            
            elif message_type == "cancel_invitation":
                invitation_id = content.get("invitation_id")
                
                if not invitation_id:
                    await self.send_json({
                        "type": "error",
                        "message": "Invitation ID is required"
                    })
                    return
                
                # Check if the invitation is from this user and still valid
                invitation = await self.get_invitation(invitation_id)
                
                if not invitation:
                    await self.send_json({
                        "type": "error",
                        "message": "Invitation not found"
                    })
                    return
                
                if str(invitation["sender_id"]) != str(self.user_id):
                    await self.send_json({
                        "type": "error",
                        "message": "This is not your invitation to cancel"
                    })
                    return
                
                if invitation["status"] != StatusChoices.PENDING:
                    await self.send_json({
                        "type": "error",
                        "message": f"Invitation is already {invitation['status']}"
                    })
                    return
                
                # Mark invitation as expired (reuse the same status)
                success = await self.expire_invitation(invitation_id)
                
                if success:
                    # Notify both sender and recipient
                    await self.channel_layer.group_send(
                        f"user_{invitation['recipient_id']}",
                        {
                            "type": "invitation_cancelled",
                            "invitation_id": invitation_id,
                            "sender_id": self.user_id,
                            "sender_username": self.user.username
                        }
                    )
                    
                    await self.send_json({
                        "type": "invitation_cancelled",
                        "invitation_id": invitation_id,
                        "recipient_id": invitation["recipient_id"],
                        "recipient_username": invitation["recipient_username"]
                    })
                    
                    # Cancel expiry task
                    if hasattr(self, 'expiry_tasks') and invitation_id in self.expiry_tasks:
                        self.expiry_tasks[invitation_id].cancel()
                        del self.expiry_tasks[invitation_id]
            
            elif message_type == "get_active_invitations":
                # Get active invitations for this user
                invitations = await self.get_active_invitations()
                await self.send_json({
                    "type": "active_invitations",
                    "invitations": invitations
                })
                
        except Exception as e:
            print(f"Error processing message: {str(e)}")
            # Try to send an error response
            try:
                await self.send_json({
                    "type": "error",
                    "message": f"Error processing your request: {str(e)}"
                })
            except Exception as inner_e:
                print(f"Failed to send error message: {str(inner_e)}")
    
    # Event handlers for messages from channel layer
    
    async def invitation_received(self, event):
        """Send notification about new invitation"""
        await self.send_json(event)
    
    async def invitation_accepted(self, event):
        """Send notification about accepted invitation"""
        await self.send_json(event)
    
    async def invitation_declined(self, event):
        """Send notification about declined invitation"""
        await self.send_json(event)
    
    async def invitation_expired(self, event):
        """Send notification about expired invitation"""
        await self.send_json(event)
    
    async def invitation_cancelled(self, event):
        """Send notification about cancelled invitation"""
        await self.send_json(event)
    
    # Expiry handler
    
    # async def handle_invitation_expiry(self, invitation_id, seconds):
    #     """
    #     Wait for the specified time and then expire the invitation if it's still pending
    #     """
    #     try:
    #         # Wait for expiry time
    #         await asyncio.sleep(seconds)
            
    #         # Check if invitation is still pending
    #         invitation = await self.get_invitation(invitation_id)
            
    #         if invitation and invitation["status"] == StatusChoices.PENDING:
    #             # Mark as expired
    #             success = await self.expire_invitation(invitation_id)
                
    #             if success:
    #                 # Notify both sender and recipient
    #                 await self.channel_layer.group_send(
    #                     f"user_{invitation['sender_id']}",
    #                     {
    #                         "type": "invitation_expired",
    #                         "invitation_id": invitation_id,
    #                         "recipient_id": invitation["recipient_id"],
    #                         "recipient_username": invitation["recipient_username"]
    #                     }
    #                 )
                    
    #                 await self.channel_layer.group_send(
    #                     f"user_{invitation['recipient_id']}",
    #                     {
    #                         "type": "invitation_expired",
    #                         "invitation_id": invitation_id,
    #                         "sender_id": invitation["sender_id"],
    #                         "sender_username": invitation["sender_username"]
    #                     }
    #                 )
    #     except asyncio.CancelledError:
    #         # Task was cancelled, no problem
    #         pass
    #     except Exception as e:
    #         print(f"Error in expiry task: {str(e)}")
    #     finally:
    #         # Clean up task reference
    #         if hasattr(self, 'expiry_tasks') and invitation_id in self.expiry_tasks:
    #             del self.expiry_tasks[invitation_id]
    
    # Database access methods
    
    @database_sync_to_async
    def is_user_available(self, user_id):
        """
        Check if a user is available to receive a game invitation.
        A user is unavailable if they are:
        1. Currently in a game
        2. Already have a pending invitation from this user
        3. In a matchmaking queue
        """
        try:
            # Check if user exists
            user = User.objects.get(id=user_id)
            
            # Check if user is in a game
            in_game = Game.objects.filter(
                Q(player1=user) | Q(player2=user),
                status__in=[StatusChoices.WAITING, StatusChoices.IN_PROGRESS]
            ).exists()
            
            if in_game:
                return False
            
            # Check if user already has a pending invitation from this user
            # has_pending_invitation = GameInvite.objects.filter(
            #     sender=self.user,
            #     recipient=user,
            #     status=StatusChoices.PENDING
            # ).exists()
            
            # if has_pending_invitation:
            #     return False
            
            # Check if user is in matchmaking queue
            in_queue = user.stats.is_in_queue() if hasattr(user, 'stats') else False
            
            if in_queue:
                return False
            
            return True
        except User.DoesNotExist:
            return False
        except Exception as e:
            print(f"Error checking user availability: {str(e)}")
            return False
    
    @database_sync_to_async
    def create_invitation(self, recipient_id, difficulty):
        """
        Create a new game invitation.
        """
        try:
            recipient = User.objects.get(id=recipient_id)
            
            # Create the invitation
            invitation = GameInvite.objects.create(
                sender=self.user,
                recipient=recipient,
                difficulty=difficulty
            )
            
            return {
                "id": invitation.id,
                "sender_id": invitation.sender.id,
                "recipient_id": invitation.recipient.id,
                "difficulty": invitation.difficulty,
                "status": invitation.status
            }
        except User.DoesNotExist:
            return None
        except Exception as e:
            print(f"Error creating invitation: {str(e)}")
            return None
    
    @database_sync_to_async
    def get_invitation(self, invitation_id):
        """
        Get invitation details.
        """
        try:
            invitation = GameInvite.objects.get(id=invitation_id)
            
            return {
                "id": invitation.id,
                "sender_id": invitation.sender.id,
                "sender_username": invitation.sender.username,
                "recipient_id": invitation.recipient.id,
                "recipient_username": invitation.recipient.username,
                "difficulty": invitation.difficulty,
                "status": invitation.status
            }
        except GameInvite.DoesNotExist:
            return None
        except Exception as e:
            print(f"Error getting invitation: {str(e)}")
            return None
    
    @database_sync_to_async
    def accept_invitation(self, invitation_id):
        """
        Accept a game invitation and create a game.
        """
        try:
            invitation = GameInvite.objects.get(id=invitation_id)
            
            # Check if invitation is still valid
            if invitation.status != StatusChoices.PENDING:
                return None
            
            # if timezone.now() > invitation.expires_at:
            #     invitation.status = StatusChoices.EXPIRED
            #     invitation.save()
            #     return None
            
            # Accept and create game
            game = invitation.accept()
            
            if not game:
                return None
            
            return {
                "id": game.id,
                "player1_id": game.player1.id,
                "player2_id": game.player2.id,
                "difficulty": game.difficulty,
                "status": game.status
            }
        except GameInvite.DoesNotExist:
            return None
        except Exception as e:
            print(f"Error accepting invitation: {str(e)}")
            return None
    
    @database_sync_to_async
    def decline_invitation(self, invitation_id):
        """
        Decline a game invitation.
        """
        try:
            invitation = GameInvite.objects.get(id=invitation_id)
            
            # Check if invitation is still valid
            if invitation.status != StatusChoices.PENDING:
                return False
            
            # Decline invitation
            return invitation.decline()
        except GameInvite.DoesNotExist:
            return False
        except Exception as e:
            print(f"Error declining invitation: {str(e)}")
            return False
    
    @database_sync_to_async
    def expire_invitation(self, invitation_id):
        """
        Mark a game invitation as expired.
        """
        try:
            invitation = GameInvite.objects.get(id=invitation_id)
            
            # Check if invitation is still valid
            if invitation.status != StatusChoices.PENDING:
                return False
            
            # Expire invitation
            return invitation.expire()
        except GameInvite.DoesNotExist:
            return False
        except Exception as e:
            print(f"Error expiring invitation: {str(e)}")
            return False
    
    @database_sync_to_async
    def get_active_invitations(self):
        """
        Get all active invitations for the current user.
        This includes both sent and received pending invitations.
        """
        try:
            # Get pending invitations sent by this user
            sent_invitations = GameInvite.objects.filter(
                sender=self.user,
                status=StatusChoices.PENDING
            ).select_related('recipient').order_by('-created_at')
            
            # Get pending invitations received by this user
            received_invitations = GameInvite.objects.filter(
                recipient=self.user,
                status=StatusChoices.PENDING
            ).select_related('sender').order_by('-created_at')
            
            # Format response
            result = {
                "sent": [
                    {
                        "id": invitation.id,
                        "recipient_id": invitation.recipient.id,
                        "recipient_username": invitation.recipient.username,
                        "difficulty": invitation.difficulty
                    }
                    for invitation in sent_invitations
                ],
                "received": [
                    {
                        "id": invitation.id,
                        "sender_id": invitation.sender.id,
                        "sender_username": invitation.sender.username,
                        "difficulty": invitation.difficulty
                    }
                    for invitation in received_invitations
                ]
            }
            
            return result
        except Exception as e:
            print(f"Error getting active invitations: {str(e)}")
            return {"sent": [], "received": []}