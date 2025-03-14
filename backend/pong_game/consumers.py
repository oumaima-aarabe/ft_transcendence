import json
import asyncio
import time
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async, transaction
from django.utils import timezone
from .models import Game, Match, MatchmakingQueue, User
from .game_logic import PongGameLogic


class MatchmakingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Get user ID from URL
            printf("User not found")
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.user = await self.get_user()
        
        if not self.user:
            # Reject connection if user not found
            await self.close()
            return
        
        # Accept the WebSocket connection
        await self.accept()
        
        # Send connection confirmation
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': 'Connected to matchmaking server'
        }))
        
        # Check if user is already in queue
        is_in_queue = await self.check_if_in_queue()
        if is_in_queue:
            # If already in queue, send confirmation
            await self.send(text_data=json.dumps({
                'type': 'matchmaking_joined',
                'message': 'Already in matchmaking queue'
            }))
    
    async def disconnect(self, close_code):
        # Remove user from matchmaking queue when WebSocket disconnects
        await self.leave_matchmaking()
    
    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'join_matchmaking':
                # Get preferences
                preferences = data.get('preferences', {})
                theme = preferences.get('theme', 'water')
                difficulty = preferences.get('difficulty', 'medium')
                
                # Add user to matchmaking queue
                await self.join_matchmaking(theme, difficulty)
                
                # Send confirmation
                await self.send(text_data=json.dumps({
                    'type': 'matchmaking_joined',
                    'message': 'Joined matchmaking queue'
                }))
                
                # Try to find a match immediately
                match_found = await self.find_match()
                
                # If no match found immediately, start checking periodically
                if not match_found:
                    self.match_checking_task = asyncio.create_task(self.check_for_matches_periodically())
            
            elif message_type == 'leave_matchmaking':
                # Remove user from matchmaking queue
                await self.leave_matchmaking()
                
                # Cancel periodic checking if active
                if hasattr(self, 'match_checking_task'):
                    self.match_checking_task.cancel()
                    try:
                        await self.match_checking_task
                    except asyncio.CancelledError:
                        pass
        
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid message format'
            }))
        except Exception as e:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': f'Error: {str(e)}'
            }))
    
    @database_sync_to_async
    def get_user(self):
        try:
            return User.objects.get(id=self.user_id)
        except User.DoesNotExist:
            return None
    
    @database_sync_to_async
    def check_if_in_queue(self):
        return MatchmakingQueue.objects.filter(user=self.user, is_active=True).exists()
    
    @database_sync_to_async
    def join_matchmaking(self, theme, difficulty):
        # First, deactivate any existing entries
        MatchmakingQueue.objects.filter(user=self.user, is_active=True).update(is_active=False)
        
        # Create new queue entry
        MatchmakingQueue.objects.create(
            user=self.user,
            theme_preference=theme,
            difficulty_preference=difficulty,
            is_active=True,
            connection_id=self.channel_name  # Store WebSocket connection ID
        )
    
    @database_sync_to_async
    def leave_matchmaking(self):
        # Mark user's queue entries as inactive
        MatchmakingQueue.objects.filter(user=self.user, is_active=True).update(is_active=False)
    
    @database_sync_to_async
    def find_match(self):
        """Look for another player in the queue with similar preferences"""
        with transaction.atomic():
            # Get user's queue entry
            my_entry = MatchmakingQueue.objects.filter(user=self.user, is_active=True).first()
            if not my_entry:
                return False
            
            # Find another player with matching preferences
            opponent_entry = MatchmakingQueue.objects.filter(
                is_active=True,
                theme_preference=my_entry.theme_preference,
                difficulty_preference=my_entry.difficulty_preference
            ).exclude(user=self.user).order_by('joined_at').first()
            
            if opponent_entry:
                # Create a new game
                game = Game.objects.create(
                    player1=self.user,
                    player2=opponent_entry.user,
                    theme=my_entry.theme_preference,
                    difficulty=my_entry.difficulty_preference,
                    status='in_progress'
                )
                
                # Create first match
                Match.objects.create(
                    game=game,
                    match_number=1,
                    status='in_progress'
                )
                
                # Mark both queue entries as inactive
                my_entry.is_active = False
                my_entry.save()
                
                opponent_entry.is_active = False
                opponent_entry.save()
                
                # Get connection ID for opponent
                opponent_channel_name = opponent_entry.connection_id
                
                # Return match found with details
                return {
                    'found': True,
                    'game_id': str(game.id),
                    'opponent_channel': opponent_channel_name,
                    'players': {
                        'player1': {
                            'id': str(self.user.id),
                            'username': self.user.username,
                            'avatar': self.user.avatar if hasattr(self.user, 'avatar') else None
                        },
                        'player2': {
                            'id': str(opponent_entry.user.id),
                            'username': opponent_entry.user.username,
                            'avatar': opponent_entry.user.avatar if hasattr(opponent_entry.user, 'avatar') else None
                        }
                    }
                }
            
            return False
    
    async def check_for_matches_periodically(self):
        """Periodically check for matches"""
        try:
            # Check every 3 seconds
            while True:
                # Try to find a match
                match_result = await self.find_match()
                
                if match_result and match_result.get('found'):
                    # Match found, notify both players
                    
                    # Notify current user
                    await self.send(text_data=json.dumps({
                        'type': 'game_created',
                        'game_id': match_result['game_id'],
                        'players': match_result['players']
                    }))
                    
                    # Notify opponent
                    opponent_channel = match_result['opponent_channel']
                    if opponent_channel:
                        await self.channel_layer.send(
                            opponent_channel,
                            {
                                'type': 'game_created_notification',
                                'game_id': match_result['game_id'],
                                'players': match_result['players']
                            }
                        )
                    
                    # Stop checking for matches
                    break
                
                # Wait before checking again
                await asyncio.sleep(3)
        
        except asyncio.CancelledError:
            # Task was cancelled, clean up
            pass
    
    async def game_created_notification(self, event):
        """Handle notification when a game is created"""
        # Forward the game creation notification to the WebSocket
        await self.send(text_data=json.dumps({
            'type': 'game_created',
            'game_id': event['game_id'],
            'players': event['players']
        }))



class PongGameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.game_id = self.scope['url_route']['kwargs']['game_id']
        self.game_group_name = f'game_{self.game_id}'
        self.user = self.scope['user']
        
        # Join game group
        await self.channel_layer.group_add(
            self.game_group_name,
            self.channel_name
        )
        
        # Accept the connection
        await self.accept()
        
        # Add player to game if possible
        player_role = await self.join_game()
        
        if not player_role:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Unable to join game. It may be full or not exist.'
            }))
            await self.close()
            return
        
        # Store player role
        self.player_role = player_role
        
        # Set up game instance if both players are connected
        game_info = await self.get_game_info()
        if game_info['player1'] and game_info['player2']:
            # Create game logic instance if not already in channel layer
            if not hasattr(self, 'game_logic'):
                # Initialize game logic
                self.game_logic = PongGameLogic(difficulty=game_info['difficulty'])
                
                # Start current match if needed
                current_match = await self.get_or_create_current_match()
                
                # Send game ready event
                await self.channel_layer.group_send(
                    self.game_group_name,
                    {
                        'type': 'game_event',
                        'event_type': 'game_ready',
                        'data': {
                            'game_id': self.game_id,
                            'match_number': current_match['match_number'],
                            'player1': game_info['player1_username'],
                            'player2': game_info['player2_username'],
                            'theme': game_info['theme'],
                            'difficulty': game_info['difficulty']
                        }
                    }
                )
                
                # Start game loop
                asyncio.create_task(self.game_loop())

    async def disconnect(self, close_code):
        # Cancel game loop if it's running
        if hasattr(self, 'game_task') and self.game_task is not None:
            self.game_task.cancel()
        
        # Leave game group
        await self.channel_layer.group_discard(
            self.game_group_name,
            self.channel_name
        )
        
        # Handle player disconnection
        await self.handle_player_disconnect()

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')
        
        if message_type == 'paddle_move':
            # Handle paddle movement
            y_position = data.get('y', 0)
            
            # Pass to game logic if it exists
            if hasattr(self, 'game_logic'):
                self.game_logic.move_paddle(self.player_role, y_position)
        
        elif message_type == 'game_action':
            # Handle game actions (start, pause, resume)
            action = data.get('action')
            
            if hasattr(self, 'game_logic'):
                if action == 'start':
                    self.game_logic.start_game()
                elif action == 'pause':
                    self.game_logic.pause_game()
                elif action == 'resume':
                    self.game_logic.resume_game()
                elif action == 'new_match':
                    await self.start_new_match()
                
                # Broadcast game state after action
                await self.channel_layer.group_send(
                    self.game_group_name,
                    {
                        'type': 'game_update',
                        'state': self.game_logic.get_state()
                    }
                )

    async def game_update(self, event):
        # Send game state update to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'game_state',
            'state': event['state']
        }))

    async def game_event(self, event):
        # Send game events like score, match end, etc.
        await self.send(text_data=json.dumps({
            'type': 'game_event',
            'event_type': event['event_type'],
            'data': event.get('data', {})
        }))
    
    @database_sync_to_async
    def join_game(self):
        """Add the user to the game as a player if possible"""
        try:
            game = Game.objects.get(id=self.game_id)
            
            if game.player1 == self.user:
                return 'player1'
            elif game.player2 == self.user:
                return 'player2'
            elif game.player2 is None:
                game.player2 = self.user
                game.status = 'in_progress'
                game.save()
                return 'player2'
            else:
                # Game is full with other players
                return None
        except Game.DoesNotExist:
            return None
    
    @database_sync_to_async
    def get_game_info(self):
        """Get basic game information"""
        game = Game.objects.get(id=self.game_id)
        return {
            'player1': game.player1_id,
            'player2': game.player2_id,
            'player1_username': game.player1.username if game.player1 else None,
            'player2_username': game.player2.username if game.player2 else None,
            'theme': game.theme,
            'difficulty': game.difficulty,
            'status': game.status
        }
    
    @database_sync_to_async
    def get_or_create_current_match(self):
        """Get the current match or create a new one if needed"""
        game = Game.objects.get(id=self.game_id)
        
        # Check for an in-progress match
        current_match = Match.objects.filter(
            game=game, 
            status='in_progress'
        ).order_by('-match_number').first()
        
        if not current_match:
            # Get the highest match number
            last_match = Match.objects.filter(game=game).order_by('-match_number').first()
            match_number = 1 if not last_match else last_match.match_number + 1
            
            # Create a new match
            current_match = Match.objects.create(
                game=game,
                match_number=match_number,
                status='in_progress'
            )
        
        return {
            'id': current_match.id,
            'match_number': current_match.match_number,
            'score_player1': current_match.score_player1,
            'score_player2': current_match.score_player2
        }
    
    @database_sync_to_async
    def complete_match(self, winner):
        """Record the completion of a match"""
        game = Game.objects.get(id=self.game_id)
        
        # Get current match
        current_match = Match.objects.filter(
            game=game, 
            status='in_progress'
        ).order_by('-match_number').first()
        
        if current_match:
            # Update match with final scores
            current_match.score_player1 = self.game_logic.left_paddle['score']
            current_match.score_player2 = self.game_logic.right_paddle['score']
            current_match.winner = winner
            current_match.status = 'completed'
            current_match.completed_at = timezone.now()
            current_match.save()
            
            # Update game with match result
            if winner == 'player1':
                game.final_score_player1 += 1
            else:
                game.final_score_player2 += 1
            
            # Check if game is complete
            if game.final_score_player1 >= 3 or game.final_score_player2 >= 3:
                game.status = 'completed'
                game.winner = game.player1 if game.final_score_player1 >= 3 else game.player2
            
            game.save()
            
            return {
                'match_id': current_match.id,
                'game_complete': game.status == 'completed',
                'game_winner': game.winner.username if game.status == 'completed' else None,
                'player1_score': game.final_score_player1,
                'player2_score': game.final_score_player2
            }
        
        return None
    
    @database_sync_to_async
    def start_new_match(self):
        """Start a new match after one is completed"""
        # Reset game logic for new match
        if hasattr(self, 'game_logic'):
            self.game_logic.reset_for_new_match()
        
        # Create a new match in the database
        match_info = await self.get_or_create_current_match()
        
        # Broadcast new match event
        await self.channel_layer.group_send(
            self.game_group_name,
            {
                'type': 'game_event',
                'event_type': 'new_match',
                'data': {
                    'match_number': match_info['match_number']
                }
            }
        )
    
    @database_sync_to_async
    def handle_player_disconnect(self):
        """Handle a player disconnecting from the game"""
        try:
            game = Game.objects.get(id=self.game_id)
            
            # If game is in progress, the disconnecting player forfeits
            if game.status == 'in_progress' and hasattr(self, 'player_role'):
                # Get current match
                current_match = Match.objects.filter(
                    game=game, 
                    status='in_progress'
                ).order_by('-match_number').first()
                
                if current_match:
                    # The other player wins the match
                    winner = 'player2' if self.player_role == 'player1' else 'player1'
                    
                    # Set scores to make it clear it was a forfeit
                    if winner == 'player1':
                        current_match.score_player1 = self.POINTS_TO_WIN_MATCH
                        current_match.score_player2 = 0
                    else:
                        current_match.score_player1 = 0
                        current_match.score_player2 = self.POINTS_TO_WIN_MATCH
                    
                    current_match.winner = winner
                    current_match.status = 'completed'
                    current_match.completed_at = timezone.now()
                    current_match.save()
                
                # The other player wins the game
                if self.player_role == 'player1':
                    game.winner = game.player2
                    game.final_score_player1 = 0
                    game.final_score_player2 = self.MATCHES_TO_WIN_GAME
                else:
                    game.winner = game.player1
                    game.final_score_player1 = self.MATCHES_TO_WIN_GAME
                    game.final_score_player2 = 0
                
                game.status = 'completed'
                game.save()
                
                # Notify remaining player
                disconnected_player = game.player1.username if self.player_role == 'player1' else game.player2.username
                
                await self.channel_layer.group_send(
                    self.game_group_name,
                    {
                        'type': 'game_event',
                        'event_type': 'player_disconnected',
                        'data': {
                            'player': self.player_role,
                            'player_name': disconnected_player,
                            'game_result': 'forfeit'
                        }
                    }
                )
        except Game.DoesNotExist:
            pass
    
    async def game_loop(self):
        """Main game loop that runs on the server"""
        # Set frame rate (updates per second)
        fps = 60
        frame_time = 1 / fps
        
        try:
            while True:
                # Process game logic
                events = self.game_logic.update()
                
                # Send state update to all clients
                await self.channel_layer.group_send(
                    self.game_group_name,
                    {
                        'type': 'game_update',
                        'state': self.game_logic.get_state()
                    }
                )
                
                # Handle events
                for event in events:
                    if event['type'] == 'match_over':
                        # Record match completion in database
                        match_result = await self.complete_match(event['winner'])
                        
                        # Add additional data to event
                        event['match_result'] = match_result
                        
                        # Send event to clients
                        await self.channel_layer.group_send(
                            self.game_group_name,
                            {
                                'type': 'game_event',
                                'event_type': 'match_over',
                                'data': event
                            }
                        )
                    else:
                        # Send other events to clients
                        await self.channel_layer.group_send(
                            self.game_group_name,
                            {
                                'type': 'game_event',
                                'event_type': event['type'],
                                'data': event
                            }
                        )
                
                # Wait for next frame
                await asyncio.sleep(frame_time)
        except asyncio.CancelledError:
            # Clean shutdown
            pass
        except Exception as e:
            # Log any errors
            print(f"Error in game loop: {e}")