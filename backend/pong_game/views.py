from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import PlayerProfile, Game, Match, GameInvite, MatchmakingQueue
from .serializers import (PlayerProfileSerializer, GameListSerializer, 
                         GameDetailSerializer, MatchSerializer,
                         GameInviteSerializer, MatchmakingQueueSerializer)
from django.shortcuts import get_object_or_404
import uuid

class PlayerProfileView(APIView):
    def get(self, request):
        """Get the current user's profile"""
        try:
            profile = get_object_or_404(PlayerProfile, player=request.user)
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

class GameInviteView(APIView):
    def post(self, request):
        """Create a game invitation"""
        try:
            # Get the target player's profile
            receiver_username = request.data.get('username')
            if not receiver_username:
                return Response({"error": "Username is required"}, 
                               status=status.HTTP_400_BAD_REQUEST)
                
            # Find the receiver
            try:
                receiver_user = User.objects.get(username=receiver_username)
                receiver_profile = PlayerProfile.objects.get(player=receiver_user)
            except (User.DoesNotExist, PlayerProfile.DoesNotExist):
                return Response({"error": "User not found"}, 
                               status=status.HTTP_404_NOT_FOUND)
                
            # Get sender's profile
            sender_profile, created = PlayerProfile.objects.get_or_create(player=request.user)
            
            # Check if sender and receiver are the same
            if sender_profile.player == receiver_profile.player:
                return Response({"error": "You cannot invite yourself"}, 
                               status=status.HTTP_400_BAD_REQUEST)
            
            # Generate a unique invitation code
            invitation_code = str(uuid.uuid4())[:8]
            
            # Create the invitation
            invite = GameInvite.objects.create(
                sender=sender_profile,
                receiver=receiver_profile,
                invitation_code=invitation_code,
                status=StatusChoices.PENDING
            )
            
            serializer = GameInviteSerializer(invite)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    def get(self, request):
        """Get all invitations for the current user"""
        try:
            profile, created = PlayerProfile.objects.get_or_create(player=request.user)
            
            # Get all pending invitations for this user
            invites = GameInvite.objects.filter(
                receiver=profile,
                status=StatusChoices.PENDING
            )
            
            serializer = GameInviteSerializer(invites, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class GameInviteResponseView(APIView):
    def post(self, request, invitation_code):
        """Accept or decline a game invitation"""
        try:
            # Find the invitation
            invite = get_object_or_404(GameInvite, 
                                      invitation_code=invitation_code,
                                      status=StatusChoices.PENDING)
            
            # Verify the current user is the receiver
            if invite.receiver.player != request.user:
                return Response({"error": "This invitation is not for you"}, 
                               status=status.HTTP_403_FORBIDDEN)
            
            # Get the response action (accept or decline)
            action = request.data.get('action')
            
            if action == 'accept':
                # Create a game for these players
                game = invite.accept()
                if game:
                    return Response({
                        "message": "Invitation accepted",
                        "game_id": game.id
                    }, status=status.HTTP_200_OK)
                else:
                    return Response({"error": "Could not accept invitation"}, 
                                   status=status.HTTP_400_BAD_REQUEST)
            
            elif action == 'decline':
                invite.decline()
                return Response({"message": "Invitation declined"}, 
                               status=status.HTTP_200_OK)
            
            else:
                return Response({"error": "Invalid action. Use 'accept' or 'decline'"}, 
                               status=status.HTTP_400_BAD_REQUEST)
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
        

