from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import PlayerProfile, Game, Match, GameInvite, StatusChoices
from .serializers import (PlayerProfileSerializer, GameHistorySerializer, 
                         GameDetailSerializer, MatchSerializer,
                         GameInviteSerializer)
from django.shortcuts import get_object_or_404
import uuid
from django.db.models import Q
from rest_framework.permissions import IsAuthenticated
from authentication.models import User
from users.utils import send_notification
from django.utils import timezone


class PlayerProfileView(APIView):
    def get(self, request):
        """Get the current user's profile, creating it if it doesn't exist"""
        try:
            # Use get_or_create for the current user
            profile, created = PlayerProfile.objects.get_or_create(player=request.user)
            serializer = PlayerProfileSerializer(profile)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    def patch(self, request):
        """Update player preferences (theme, difficulty)"""
        try:
            profile, created = PlayerProfile.objects.get_or_create(player=request.user)
            serializer = PlayerProfileSerializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class PlayerDetailView(APIView):
    """View for looking up another player's profile"""
    
    def get(self, request, player_id):
        """Get another player's profile by player_id, creating it if it doesn't exist"""
        try:
            # First get the User object by ID
            user = get_object_or_404(User, id=player_id)
            
            # Then get or create their profile
            profile, created = PlayerProfile.objects.get_or_create(player=user)
            
            # Return the profile data
            serializer = PlayerProfileSerializer(profile)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
class GameListView(APIView):
    def get(self, request):
        """Get list of games for the current user"""
        try:
            games = Game.objects.filter(
                status=StatusChoices.COMPLETED
            ).filter(
                player1=request.user
            ) | Game.objects.filter(
                status=StatusChoices.COMPLETED
            ).filter(
                player2=request.user
            ).order_by('-created_at')[:10]  # Get last 10 games
            
            serializer = GameListSerializer(games, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class GameDetailView(APIView):
    def get(self, request, game_id):
        """Get details for a specific game"""
        try:
            game = get_object_or_404(Game, id=game_id)
            
            # Only allow the players of the game to view it
            if request.user != game.player1 and request.user != game.player2:
                return Response({"error": "You are not a participant in this game"}, 
                               status=status.HTTP_403_FORBIDDEN)
                
            serializer = GameDetailSerializer(game)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class LeaderboardView(APIView):
    def get(self, request):
        """Get top players by wins"""
        try:
            # Get top 10 players by win count
            top_players = PlayerProfile.objects.filter(
                matches_played__gt=0
            ).order_by('-matches_won')[:10]
            
            serializer = PlayerProfileSerializer(top_players, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        

class GameStateView(APIView):
    """API endpoint to get the current state of a game"""
    
    def get(self, request, game_id):
        """Get the current state of a running game"""
        try:
            game = get_object_or_404(Game, id=game_id)
            
            # Only allow the players of the game to view it
            if request.user != game.player1 and request.user != game.player2:
                return Response({"error": "You are not a participant in this game"}, 
                               status=status.HTTP_403_FORBIDDEN)
            
            # Check if game is active in memory (imported from consumers)
            from .consumers import active_games
            
            if game_id not in active_games:
                return Response({"error": "Game is not currently active"}, 
                               status=status.HTTP_404_NOT_FOUND)
            
            # Return a simplified version of the game state
            game_state = active_games[game_id]
            simplified_state = {
                "ball_position": [game_state["ball"]["x"], game_state["ball"]["y"]],
                "left_paddle_position": game_state["left_paddle"]["y"],
                "right_paddle_position": game_state["right_paddle"]["y"],
                "scores": {
                    "left": game_state["left_paddle"]["score"],
                    "right": game_state["right_paddle"]["score"]
                },
                "match_wins": game_state["match_wins"],
                "current_match": game_state["current_match"],
                "status": game_state["game_status"]
            }
            
            return Response(simplified_state)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class ActiveGamesView(APIView):
    """API endpoint to list active games"""
    
    def get(self, request):
        """List all active games the user is participating in"""
        try:
            # Import active games from consumers
            from .consumers import active_games
            
            # Filter games where user is a participant
            user_games = []
            for game_id, game_state in active_games.items():
                if (str(game_state["players"]["player1"]["id"]) == str(request.user.id) or
                    str(game_state["players"]["player2"]["id"]) == str(request.user.id)):
                    
                    # Get database game object for additional info
                    try:
                        game = Game.objects.get(id=game_id)
                        
                        # Create a summary of the game
                        game_summary = {
                            "id": game_id,
                            "opponent": {
                                "username": game.player2.username if request.user.id == game.player1_id else game.player1.username,
                                "avatar": game.player2.avatar if request.user.id == game.player1_id else game.player1.avatar
                            },
                            "status": game_state["game_status"],
                            "current_match": game_state["current_match"],
                            "match_wins": game_state["match_wins"],
                            "theme": game_state["theme"],
                            "difficulty": game_state["difficulty"],
                            "created_at": game.created_at
                        }
                        user_games.append(game_summary)
                    except Game.DoesNotExist:
                        # Skip if game doesn't exist in database
                        pass
            
            return Response(user_games)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
class UserPreferencesView(APIView):
    permission_classes = [IsAuthenticated]
    """API endpoint for managing user preferences"""
    
    def get(self, request):
        """Get user preferences only"""
        try:
            profile, created = PlayerProfile.objects.get_or_create(player=request.user)
            return Response({
                'theme': profile.theme,
                'difficulty': profile.difficulty
            })
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
    def put(self, request):
        """Update user preferences only"""
        try:
            profile, created = PlayerProfile.objects.get_or_create(player=request.user)
            
            # Get theme and difficulty from request data
            theme = request.data.get('theme', profile.theme)
            difficulty = request.data.get('difficulty', profile.difficulty)
            
            # Validate theme
            valid_themes = [choice[0] for choice in PlayerProfile.THEME_CHOICES]
            if theme not in valid_themes:
                return Response(
                    {"error": f"Invalid theme. Choose from {valid_themes}"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validate difficulty
            valid_difficulties = [choice[0] for choice in PlayerProfile.DIFFICULTY_CHOICES]
            if difficulty not in valid_difficulties:
                return Response(
                    {"error": f"Invalid difficulty. Choose from {valid_difficulties}"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Update profile
            profile.theme = theme
            profile.difficulty = difficulty
            profile.save()
            
            return Response({
                'theme': theme,
                'difficulty': difficulty
            })
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


try:
    from .game_logic import active_games
except ImportError:
    # Define a fallback empty dictionary if import fails
    active_games = {}

class PlayerGameStatusView(APIView):
    permission_classes = [IsAuthenticated]
    """API endpoint to check if a player is already in an active game"""
    
    def get(self, request):
        """Check if the current user is in an active game"""
        if not request.user.is_authenticated:
            return Response({"active_game": False})
        
        # First check database for not-completed games
        active_game = Game.objects.filter(
            Q(status__in=['waiting', 'in_progress', 'paused']),
            Q(player1=request.user) | Q(player2=request.user)
        ).first()
        
        if active_game:
            # User is in an active game
            return Response({
                "active_game": True,
                "game_id": str(active_game.id),
                "player1": active_game.player1.username,
                "player2": active_game.player2.username if active_game.player2 else None,
                "status": active_game.status
            })
            
        # User is not in an active game
        return Response({"active_game": False})


class GameHistoryView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, player_id=None):
        # If no player_id is provided, use the authenticated user's ID
        user_id = request.user.id
        target_player_id = player_id if player_id is not None else user_id
        
        # Check if the requested player_id belongs to the authenticated user or if it's another player
        if user_id != target_player_id:
            # You could add permission check here if needed
            pass
        
        # Get all completed games where the player was either player1 or player2
        games = Game.objects.filter(
            (Q(player1_id=target_player_id) | Q(player2_id=target_player_id)) &
            Q(status=StatusChoices.COMPLETED)
        ).order_by('-completed_at')
        
        # Serialize the data with the appropriate context
        serializer = GameHistorySerializer(
            games, 
            many=True,
            context={'request_user_id': target_player_id}
        )
        
        return Response(serializer.data, status=status.HTTP_200_OK)
    

class GameInviteView(APIView):
    def post(self, request):
        """Create a game invitation"""
        
        # Get the target player's profile
        receiver_username = request.data.get('username')
        
        if not receiver_username:
            return Response({"error": "Username is required"}, 
                          status=status.HTTP_400_BAD_REQUEST)
            
        try:
            # Get the user first
            try:
                receiver_user = User.objects.get(username=receiver_username)
            except User.DoesNotExist:
                return Response({"error": f"User '{receiver_username}' not found"}, 
                              status=status.HTTP_404_NOT_FOUND)
            
            # Get or create the player profile for the receiver
            receiver_profile, created = PlayerProfile.objects.get_or_create(player=receiver_user)
                
            # Get sender's profile
            try:
                sender_profile, created = PlayerProfile.objects.get_or_create(player=request.user)
            except Exception as profile_error:
                return Response(
                    {"error": f"Could not get or create profile for sender: {str(profile_error)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if sender and receiver are the same
            if sender_profile.player == receiver_profile.player:
                return Response({"error": "You cannot invite yourself"}, 
                              status=status.HTTP_400_BAD_REQUEST)
            
            # Generate a unique invitation code
            invitation_code = str(uuid.uuid4())[:8]
            
            # Create the invitation
            try:
                invite = GameInvite.objects.create(
                    sender=sender_profile,
                    receiver=receiver_profile,
                    invitation_code=invitation_code,
                    status=StatusChoices.PENDING
                )
            except Exception as invite_error:
                return Response(
                    {"error": f"Could not create invitation: {str(invite_error)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Send notification to receiver
            try:
                send_notification(
                    username=receiver_username,
                    notification_type='game_invite',
                    message=f"{request.user.username} invited you to play Pong",
                    data={
                        'invitation_code': invitation_code,
                        'sender_username': request.user.username,
                        'sender_avatar': request.user.avatar
                    }
                )
            except Exception as notify_error:
                pass
            
            serializer = GameInviteSerializer(invite)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({"error": f"Unexpected error: {str(e)}"}, 
                          status=status.HTTP_400_BAD_REQUEST)


class GameInviteResponseView(APIView):
    def post(self, request, invitation_code):
        """Accept or decline a game invitation with improved redirection and synchronization"""
        try:
            from users.utils import send_notification
            
            
            # Find the invitation regardless of status first
            try:
                invite = GameInvite.objects.get(invitation_code=invitation_code)
                
                # Check if invitation is already processed
                if invite.status != StatusChoices.PENDING:
                    # If already accepted, return the game ID so the user can join
                    if invite.status == StatusChoices.ACCEPTED and invite.resulting_game:
                        return Response({
                            "message": "Invitation was already accepted",
                            "game_id": str(invite.resulting_game.id)
                        }, status=status.HTTP_200_OK)
                    else:
                        return Response({
                            "message": f"Invitation has already been {invite.status}",
                            "status": invite.status
                        }, status=status.HTTP_200_OK)
            except GameInvite.DoesNotExist:
                return Response({
                    "error": "Invalid invitation code"
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Check if the current user is the recipient
            if invite.receiver.player != request.user:
                return Response({
                    "error": "This invitation is not for you"
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Get the action
            action = request.data.get('action')
            
            if action == 'accept':
                # Create the game directly
                from users.models import Notification
                try:
                    game = Game.objects.create(
                        player1=invite.sender.player,
                        player2=invite.receiver.player,
                        status=StatusChoices.WAITING,
                        difficulty=invite.sender.difficulty
                    )
                    notif = Notification.objects.get(
                        notification_type='game_invite',
                        data__invitation_code=invitation_code
                    )
                    notif.is_read = True
                    notif.save()
                    # Start the game immediately to avoid matchmaking flow
                    # game.status = StatusChoices.WAITING
                    # game.started_at = timezone.now()
                    # game.save()

                    # Update the invitation
                    invite.status = StatusChoices.ACCEPTED
                    invite.accepted_at = timezone.now()
                    invite.resulting_game = game
                    invite.save()
                    
                    # Generate a connection token or identifier for synchronization
                    connection_token = str(uuid.uuid4())[:8]
                    
                    # Send notification to sender with enhanced synchronization data
                    try:
                        send_notification(
                            username=invite.sender.player.username,
                            notification_type='game_invite_accepted',
                            message=f"{request.user.username} accepted your game invitation",
                            data={
                                'game_id': str(game.id),
                                'player1_username': invite.sender.player.username,
                                'player2_username': request.user.username,
                                'player1_id': invite.sender.player.id,
                                'player2_id': request.user.id,
                                'join_url': f"/game/remote?gameId={game.id}"
                            }
                        )
                    except Exception as notification_error:
                        pass
                    
                    # Return with the same synchronization data for the recipient
                    return Response({
                        "message": "Invitation accepted",
                        "game_id": str(game.id),
                        "connection_token": connection_token,
                        "game_ready": True,
                        "timestamp": timezone.now().timestamp()
                    }, status=status.HTTP_200_OK)
                except Exception as e:
                    return Response({
                        "error": f"Could not create game: {str(e)}"
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            elif action == 'decline':
                invite.status = StatusChoices.DECLINED
                invite.declined_at = timezone.now()
                invite.save()
                
                # Send notification to sender
                try:
                    send_notification(
                        username=invite.sender.player.username,
                        notification_type='game_invite_declined',
                        message=f"{request.user.username} declined your game invitation",
                        data={
                            'invitation_code': invitation_code
                        }
                    )
                except Exception as notification_error:
                    pass
                
                return Response({
                    "message": "Invitation declined"
                }, status=status.HTTP_200_OK)
            
            else:
                return Response({
                    "error": "Invalid action. Use 'accept' or 'decline'"
                }, status=status.HTTP_400_BAD_REQUEST)
        
        except Exception as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)