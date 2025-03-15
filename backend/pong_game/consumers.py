import json
import asyncio
import uuid
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from django.db import transaction
from django.db.models import Q

from .models import PlayerProfile, MatchmakingQueue, Game, StatusChoices
from authentication.models import User


class MatchmakingConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for handling matchmaking functionality.
    Handles queue management and continuously searches for matches.
    """
    
    async def connect(self):
        """
        Called when a WebSocket connection is established.
        Authenticates the user, adds them to relevant groups, and starts matchmaking.
        """
        # Reject unauthenticated users
        if self.scope["user"].is_anonymous:
            await self.close()
            return
        
        # Store user information for easy access
        self.user = self.scope["user"]
        self.user_id = self.user.id
        
        # Define group names
        self.matchmaking_group = "matchmaking"
        self.user_group = f"user_{self.user_id}"
        
        # Join the general matchmaking group
        await self.channel_layer.group_add(
            self.matchmaking_group,
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
            "message": "Connected to matchmaking server"
        })
        
        # Get current queue status
        queue_status = await self.get_queue_status()
        await self.send_json({
            "type": "queue_status",
            "status": queue_status
        })
        
        # Start periodic matchmaking task
        self.matchmaking_task = asyncio.create_task(self.periodic_matchmaking())
    
    async def disconnect(self, close_code):
        """
        Called when the WebSocket connection is closed.
        Cleans up tasks, group memberships, and queue entries.
        """
        # Cancel the periodic matchmaking task
        if hasattr(self, 'matchmaking_task'):
            self.matchmaking_task.cancel()
            try:
                await self.matchmaking_task
            except asyncio.CancelledError:
                pass
        
        # Leave the matchmaking groups
        await self.channel_layer.group_discard(
            self.matchmaking_group,
            self.channel_name
        )
        
        await self.channel_layer.group_discard(
            self.user_group,
            self.channel_name
        )
        
        # Remove the user from the matchmaking queue
        await self.leave_queue()
    
    async def receive_json(self, content):
        """
        Processes incoming messages from the client.
        Handles queue joining, leaving, and status requests.
        """
        message_type = content.get("type", "")
        
        if message_type == "join_queue":
            # Get difficulty preference from message or use default
            difficulty = content.get("difficulty")
            result = await self.join_queue(difficulty)
            
            # Send confirmation to the client
            await self.send_json({
                "type": "queue_status",
                "status": result
            })
            
        elif message_type == "leave_queue":
            result = await self.leave_queue()
            
            # Send confirmation to the client
            await self.send_json({
                "type": "queue_status",
                "status": result
            })
            
        elif message_type == "request_status":
            queue_status = await self.get_queue_status()
            await self.send_json({
                "type": "queue_status",
                "status": queue_status
            })
    
    async def send_json(self, content):
        """Helper method to send JSON messages to the client."""
        await self.send(text_data=json.dumps(content))
    
    async def periodic_matchmaking(self):
        """
        Periodically checks for potential matches.
        Uses a distributed lock to ensure only one consumer performs matching at a time.
        """
        while True:
            try:
                # Try to acquire the matchmaking lock
                should_run = await self.try_acquire_matchmaking_lock()
                
                if should_run:
                    # This consumer will perform the matchmaking
                    matches = await self.find_matches()
                    
                    # If matches were found, notify the relevant players
                    for match in matches:
                        # Notify player 1
                        await self.channel_layer.group_send(
                            f"user_{match['player1_id']}",
                            {
                                "type": "match_found",
                                "game_id": match['game_id'],
                                "opponent": match['player2_username'],
                                "opponent_avatar": match['player2_avatar']
                            }
                        )
                        
                        # Notify player 2
                        await self.channel_layer.group_send(
                            f"user_{match['player2_id']}",
                            {
                                "type": "match_found",
                                "game_id": match['game_id'],
                                "opponent": match['player1_username'],
                                "opponent_avatar": match['player1_avatar']
                            }
                        )
                    
                    if matches:
                        print(f"Created {len(matches)} matches")
                    
                    # Release the lock after completion
                    await self.release_matchmaking_lock()
                
                # Wait before checking again
                await asyncio.sleep(5)  # Check every 5 seconds
                
            except asyncio.CancelledError:
                # Task was cancelled (during disconnect)
                break
            except Exception as e:
                print(f"Error in matchmaking: {str(e)}")
                await asyncio.sleep(5)
    
    async def try_acquire_matchmaking_lock(self):
        """
        Attempts to acquire a distributed lock for matchmaking.
        Ensures only one consumer is performing matching at a time.
        """
        try:
            # Generate a unique ID for this lock attempt
            lock_id = f"{self.channel_name}_{uuid.uuid4()}"
            
            # Try to set a key in the channel layer
            # This works as a simple distributed lock
            await self.channel_layer.set_expiry_key(
                "matchmaking_lock", 
                lock_id,
                10  # Lock expires after 10 seconds
            )
            
            # Check if we got the lock
            current_lock = await self.channel_layer.get_key("matchmaking_lock")
            return current_lock == lock_id
            
        except Exception as e:
            print(f"Lock error: {str(e)}")
            # If the channel layer doesn't support key-value storage,
            # fall back to a group-based approach
            return False
    
    async def release_matchmaking_lock(self):
        """Releases the matchmaking lock."""
        try:
            await self.channel_layer.delete_key("matchmaking_lock")
        except Exception as e:
            print(f"Error releasing lock: {str(e)}")
    
    @database_sync_to_async
    def join_queue(self, difficulty=None):
        """
        Adds the user to the matchmaking queue with their preferred difficulty.
        Returns the current status of the queue entry.
        """
        try:
            # Get or create player profile
            profile, created = PlayerProfile.objects.get_or_create(player=self.user)
            
            # Use provided difficulty or player's default
            if difficulty is None:
                difficulty = profile.difficulty
            
            # Check if player is already in queue
            existing_entry = MatchmakingQueue.objects.filter(
                player=self.user,
                is_active=True
            ).first()
            
            if existing_entry:
                # Player is already in queue, update their preference if needed
                if existing_entry.difficulty_preference != difficulty:
                    existing_entry.difficulty_preference = difficulty
                    existing_entry.save()
                return {"status": "already_in_queue", "position": self._get_queue_position(existing_entry)}
            
            # Create new queue entry
            queue_entry = MatchmakingQueue.objects.create(
                player=self.user,
                difficulty_preference=difficulty,
                is_active=True,
                status=StatusChoices.QUEUE_WAITING
            )
            
            # Return queue status
            return {"status": "in_queue", "position": self._get_queue_position(queue_entry)}
                
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    @database_sync_to_async
    def leave_queue(self):
        """
        Removes the user from the matchmaking queue.
        Returns the updated status.
        """
        entries = MatchmakingQueue.objects.filter(
            player=self.user,
            is_active=True
        )
        
        for entry in entries:
            entry.is_active = False
            entry.status = StatusChoices.QUEUE_TIMEOUT
            entry.save()
        
        return {"status": "left_queue"}
    
    @database_sync_to_async
    def get_queue_status(self):
        """
        Gets the current status of the user in the matchmaking queue.
        Returns information about their position and waiting time.
        """
        # Check if user is in queue
        entry = MatchmakingQueue.objects.filter(
            player=self.user,
            is_active=True
        ).first()
        
        if not entry:
            return {"status": "not_in_queue"}
        
        # Get position in queue
        position = self._get_queue_position(entry)
        
        # Get total waiting players with same difficulty
        total_waiting = MatchmakingQueue.objects.filter(
            difficulty_preference=entry.difficulty_preference,
            is_active=True,
            status=StatusChoices.QUEUE_WAITING
        ).count()
        
        return {
            "status": "in_queue",
            "position": position,
            "total_waiting": total_waiting,
            "difficulty": entry.difficulty_preference,
            "joined_at": entry.joined_at.isoformat()
        }
    
    def _get_queue_position(self, entry):
        """
        Helper method to get the position of an entry in the queue.
        Position is based on first-come-first-served principle.
        """
        position = MatchmakingQueue.objects.filter(
            difficulty_preference=entry.difficulty_preference,
            is_active=True,
            status=StatusChoices.QUEUE_WAITING,
            joined_at__lt=entry.joined_at  # Players who joined earlier
        ).count() + 1  # Add 1 because positions start at 1, not 0
        
        return position
    
    @database_sync_to_async
    def find_matches(self):
        """
        Finds potential matches among players in the queue.
        Uses transaction to ensure data consistency.
        """
        matches_created = []
        
        with transaction.atomic():
            # Get all active difficulty preferences
            difficulties = MatchmakingQueue.objects.filter(
                is_active=True,
                status=StatusChoices.QUEUE_WAITING
            ).values_list('difficulty_preference', flat=True).distinct()
            
            # Process each difficulty level separately
            for difficulty in difficulties:
                # Get waiting players for this difficulty, ordered by join time
                waiting_players = list(MatchmakingQueue.objects.filter(
                    difficulty_preference=difficulty,
                    is_active=True,
                    status=StatusChoices.QUEUE_WAITING
                ).order_by('joined_at'))
                
                # Match players (taking two at a time)
                while len(waiting_players) >= 2:
                    player1_entry = waiting_players[0]
                    
                    # Find the next player who isn't the same as player1
                    player2_entry = None
                    for entry in waiting_players[1:]:
                        if entry.player.id != player1_entry.player.id:
                            player2_entry = entry
                            break
                    
                    # If we couldn't find a valid second player, break out
                    if not player2_entry:
                        break
                    
                    # Create a game between these players
                    try:
                        # Get player profiles for preferences
                        player1_profile = PlayerProfile.objects.get(player=player1_entry.player)
                        
                        game = Game.objects.create(
                            player1=player1_entry.player,
                            player2=player2_entry.player,
                            status=StatusChoices.WAITING,
                            difficulty=difficulty,
                            theme=player1_profile.theme  # Use player1's theme
                        )
                        
                        # Update both queue entries
                        now = timezone.now()
                        
                        player1_entry.status = StatusChoices.QUEUE_MATCHED
                        player1_entry.is_active = False
                        player1_entry.matched_at = now
                        player1_entry.resulting_game = game
                        player1_entry.save()
                        
                        player2_entry.status = StatusChoices.QUEUE_MATCHED
                        player2_entry.is_active = False
                        player2_entry.matched_at = now
                        player2_entry.resulting_game = game
                        player2_entry.save()
                        
                        # Store match information for notification
                        matches_created.append({
                            'game_id': game.id,
                            'player1_id': player1_entry.player.id,
                            'player2_id': player2_entry.player.id,
                            'player1_username': player1_entry.player.username,
                            'player2_username': player2_entry.player.username,
                            'player1_avatar': getattr(player1_entry.player, 'avatar', ''),
                            'player2_avatar': getattr(player2_entry.player, 'avatar', '')
                        })
                        
                        # Remove these players from the local list
                        waiting_players.remove(player1_entry)
                        waiting_players.remove(player2_entry)
                        
                    except Exception as e:
                        print(f"Error creating match: {str(e)}")
                        # Skip these players and try the next pair
                        waiting_players = waiting_players[1:]
        
        return matches_created
    
    async def match_found(self, event):
        """
        Handles the match_found event from the channel layer.
        Notifies the client that a match has been found.
        """
        await self.send_json({
            "type": "match_found",
            "game_id": event["game_id"],
            "opponent": event["opponent"],
            "opponent_avatar": event.get("opponent_avatar", ""),
            "game_url": f"/game/{event['game_id']}/"
        })
    
    async def queue_status_update(self, event):
        """
        Handles queue status updates from the channel layer.
        Forwards the status to the client.
        """
        await self.send_json({
            "type": "queue_status",
            "status": event["status"]
        })