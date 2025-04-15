import json
import asyncio
import time
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from .models import Game
from . import game_logic

class GameConsumer(AsyncJsonWebsocketConsumer):
    """
    WebSocket consumer for handling Pong game sessions.
    This consumer handles the communication aspects while delegating game logic
    to the game_logic module.
    """
    
    async def connect(self):
        """Handle WebSocket connection and authentication with improved waiting logic"""
        # Get game ID from URL route
        self.game_id = self.scope['url_route']['kwargs']['game_id']
        self.game_group = f"game_{self.game_id}"
        
        # Get user from scope
        self.user_id = self.scope.get('user_id')
        
        if not self.user_id:
            await self.close(code=4001)
            return
        # Get game from database
        self.game = await self.get_game(self.game_id)
        if not self.game:
            await self.close(code=4004)
            return
        
        # Determine if user is player1 or player2
        if str(self.user_id) == str(self.game['player1_id']):
            self.player_num = 1
        elif str(self.user_id) == str(self.game['player2_id']):
            self.player_num = 2
        else:
            await self.close(code=4003)
            return
        
        # Initialize game state if not exists
        if self.game_id not in game_logic.active_games:
            await self.initialize_game_state()
        
        # Join game group
        await self.channel_layer.group_add(
            self.game_group,
            self.channel_name
        )
        
        # Store connection time to handle waiting period
        self.connection_time = time.time()
        
        # Mark player as connected
        connection_info = game_logic.set_player_connection(self.game_id, self.player_num, True)
        
        # Accept connection
        await self.accept()
        
        # Send initial state and connection confirmation
        await self.send_json({
            'type': 'connection_established',
            'player_number': self.player_num,
            'game_id': self.game_id
        })
        state_to_send = game_logic.active_games[self.game_id]
        await self.send_json({
            'type': 'game_state',
            'state': state_to_send
        })
        
        # Notify other player about connection
        await self.channel_layer.group_send(
            self.game_group,
            {
                'type': 'player_status',
                'player': self.player_num,
                'connected': True
            }
        )
        
        # If connection changed game status, notify both players
        if connection_info and connection_info.get('status_changed', False):
            await self.channel_layer.group_send(
                self.game_group,
                {
                    'type': 'game_status_changed',
                    'status': connection_info.get('new_status', 'waiting')
                }
            )
        
        # Check if both players are connected
        if connection_info and connection_info.get('both_connected', False):
            # Both players are connected, we can start the game
            if (game_logic.active_games[self.game_id]['game_status'] == 'menu' and
                not game_logic.active_games[self.game_id].get('loop_running', False)):
                
                game_logic.active_games[self.game_id]['loop_running'] = True
                asyncio.create_task(self.game_loop())
            
            # Update game status in database
            await self.update_game_status('in_progress')
        else:
            # Only one player is connected, start waiting for other player
            # Create a task to wait for other player (60 seconds timeout)
            self.wait_for_opponent_task = asyncio.create_task(self.wait_for_opponent(10))

    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        if hasattr(self, 'game_id') and self.game_id in game_logic.active_games:
            # Mark player as disconnected
            connection_info = game_logic.set_player_connection(self.game_id, self.player_num, False)
            
            # Force disconnect the other player too
            await self.channel_layer.group_send(
                self.game_group,
                {
                    'type': 'force_disconnect',
                    'reason': f'Player {self.player_num} disconnected'
                }
            )
            
            # Set game as completed and save results immediately
            if game_logic.active_games[self.game_id]['game_status'] != 'gameOver':
                game_logic.active_games[self.game_id]['game_status'] = 'gameOver'
                # Save the game results with the current state
                await game_logic.save_game_results(self.game_id)
                await game_logic.update_player_profiles(self.game_id)
            
            # Leave game group
            await self.channel_layer.group_discard(
                self.game_group,
                self.channel_name
            )
            
            # Clean up game state if both players are disconnected
            if not connection_info['any_connected']:
                if self.game_id in game_logic.active_games:
                    del game_logic.active_games[self.game_id]

    async def force_disconnect(self, event):
        """Force client to disconnect"""
        await self.update_game_status('cancelled')
        await self.send_json({
            'type': 'force_disconnect',
            'reason': event.get('reason', 'Other player disconnected')
        })
        await self.save_cancelled_game()
        # Close the WebSocket connection
        await self.close(code=4000)
        
    async def player_status(self, event):
        """Send player connection status and handle forced disconnections"""
        await self.send_json(event)
        
        # If this is a forced disconnect notification, close the connection
        if event.get('force_disconnect', False):
            await self.close(code=4002)  # Use a specific code for forced disconnection
            
    async def wait_for_opponent(self, wait_seconds):
        """Wait for the other player to connect before timing out"""
        try:
            # Wait a bit for opponent to join
            for i in range(wait_seconds):
                # Check every second if both players are connected
                if game_logic.are_both_players_connected(self.game_id):
                    
                    # If game was waiting, update to menu or playing state
                    if game_logic.active_games[self.game_id]['game_status'] == 'waiting':
                        game_logic.active_games[self.game_id]['game_status'] = 'menu'
                        
                        # Notify players of status change
                        await self.channel_layer.group_send(
                            self.game_group,
                            {
                                'type': 'game_status_changed',
                                'status': 'menu'
                            }
                        )
                    
                    # Start game loop if not already running
                    if not game_logic.active_games[self.game_id].get('loop_running', False):
                        game_logic.active_games[self.game_id]['loop_running'] = True
                        asyncio.create_task(self.game_loop())
                        
                    # Update database status
                    await self.update_game_status('in_progress')
                    return
                    
                # Send periodic updates to keep the client informed
                if i % 5 == 0:  # Send status update every 5 seconds
                    await self.send_json({
                        'type': 'waiting_for_opponent',
                        'seconds_elapsed': i,
                        'seconds_remaining': wait_seconds - i,
                        'message': "Waiting for opponent to connect..."
                    })
                    
                await asyncio.sleep(1)
                
            # If we got here, timeout occurred
            await self.send_json({
                'type': 'timeout',
                'message': 'Opponent did not connect in time'
            })
            
            # Update game status in database
            await self.update_game_status('cancelled')
            
            # Force disconnect
            await self.close(code=4000)
            
        except asyncio.CancelledError:
            # Task was cancelled (probably because opponent connected)
            pass

    async def receive_json(self, content):
        """Handle messages from client"""
        try:
            message_type = content.get('type', '')
            
            if message_type == 'paddle_move':
                # Update paddle position
                position = content.get('position', None)
                if position is not None:
                    game_logic.update_paddle_position(self.game_id, self.player_num, position)
            
            elif message_type == 'start_game':
                # Start the game if it's currently in menu state
                if self.game_id in game_logic.active_games:
                    current_status = game_logic.active_games[self.game_id]['game_status']
                    if current_status == 'menu':
                        # Change status to playing
                        new_status = game_logic.set_game_status(self.game_id, 'playing')
                        # Notify all players about status change
                        await self.channel_layer.group_send(
                            self.game_group,
                            {
                                'type': 'game_status_changed',
                                'status': new_status
                            }
                        )
            
            elif message_type == 'next_match':
                # Start next match if current match is over
                if self.game_id in game_logic.active_games:
                    current_status = game_logic.active_games[self.game_id]['game_status']
                    if current_status == 'matchOver':
                        # Reset for new match
                        game_logic.reset_for_new_match(self.game_id)
                        
                        # Notify players of game state
                        await self.channel_layer.group_send(
                            self.game_group,
                            {
                                'type': 'game_state',
                                'state': game_logic.active_games[self.game_id]
                            }
                        )
                        
                        # Set status to playing
                        new_status = game_logic.set_game_status(self.game_id, 'playing')
                        
                        # Notify of status change
                        await self.channel_layer.group_send(
                            self.game_group,
                            {
                                'type': 'game_status_changed',
                                'status': new_status
                            }
                        )
            elif message_type == 'ping':
                await self.send_json({
                    'type': 'pong'
                })
        
        except Exception as e:
            pass
    
    async def game_loop(self):
        """Main game loop running on the server with optimized performance"""
        try:
            # Constants for frame rates and thresholds
            PHYSICS_RATE = 240  # Hz
            BROADCAST_RATE = 60  # Hz
            MAX_FRAME_TIME = 0.25  # seconds
            INACTIVE_TIMEOUT = 300  # seconds (5 minutes)
            
            # Calculate intervals once
            physics_update_interval = 1 / PHYSICS_RATE
            broadcast_interval = 1 / BROADCAST_RATE
            
            # Timing variables
            last_state_broadcast_time = time.time()
            physics_update_accumulator = 0
            last_activity_time = time.time()
            
            while self.game_id in game_logic.active_games:
                # Get current time for this frame
                current_time = time.time()
                frame_time = current_time - game_logic.active_games[self.game_id]['last_update_time']
                game_logic.active_games[self.game_id]['last_update_time'] = current_time
                
                # Cap delta time to prevent spiral of death with big lag spikes
                if frame_time > MAX_FRAME_TIME:
                    frame_time = MAX_FRAME_TIME
                
                game_state = game_logic.active_games[self.game_id]
                
                # Check for inactivity timeout
                if (current_time - last_activity_time > INACTIVE_TIMEOUT and 
                    not game_logic.is_any_player_connected(self.game_id)):
                    
                    # Clean up the game
                    await game_logic.save_game_results(self.game_id)
                    await game_logic.update_player_profiles(self.game_id)
                    del game_logic.active_games[self.game_id]
                    break
                
                # Only update if game is in playing state
                if game_state['game_status'] == 'playing':
                    # Reset inactivity timer when game is active
                    last_activity_time = current_time
                    
                    # Accumulate time for physics updates
                    physics_update_accumulator += frame_time
                    
                    # Run multiple physics updates if needed to catch up
                    score_happened = False
                    collision_happened = False
                    update_count = 0
                    max_updates_per_frame = 5  # Limit updates to prevent CPU spikes
                    
                    while physics_update_accumulator >= physics_update_interval and update_count < max_updates_per_frame:
                        # Update game physics with fixed timestep
                        score_update = game_logic.update_game_physics(self.game_id, physics_update_interval)
                        if score_update == 1:
                            score_happened = True
                        elif score_update == 2:
                            collision_happened = True
                        physics_update_accumulator -= physics_update_interval
                        update_count += 1
                    
                    # If we couldn't process all accumulated time, discard the excess
                    # to prevent spiraling when CPU can't keep up
                    if update_count >= max_updates_per_frame and physics_update_accumulator > physics_update_interval:
                        physics_update_accumulator = physics_update_interval
                    
                    # If a score happened, check if match ended
                    if score_happened:
                        match_ended = game_logic.check_match_end(self.game_id)
                        
                        # If match ended, notify players of new status immediately
                        if match_ended:
                            # Update activity time on match end
                            last_activity_time = current_time
                            
                            await self.channel_layer.group_send(
                                self.game_group,
                                {
                                    'type': 'game_status_changed',
                                    'status': game_logic.active_games[self.game_id]['game_status'],
                                    'winner': game_logic.active_games[self.game_id]['winner']
                                })
                            
                            # Ensure we broadcast the final state
                            await self.channel_layer.group_send(
                                self.game_group,
                                {
                                    'type': 'game_state',
                                    'state': game_logic.active_games[self.game_id]
                                }
                            )
                            if game_logic.active_games[self.game_id]['game_status'] == 'gameOver':
                                await game_logic.save_game_results(self.game_id)
                                await game_logic.update_player_profiles(self.game_id)
                                
                                # Force both players to disconnect since game is over
                                await self.channel_layer.group_send(
                                    self.game_group,
                                    {
                                        'type': 'game_completed',
                                        'winner': game_logic.active_games[self.game_id]['winner'],
                                        'final_state': game_logic.active_games[self.game_id]
                                    }
                                )
                    # Broadcast state at controlled intervals to avoid network congestion
                    time_since_last_broadcast = current_time - last_state_broadcast_time
                    if time_since_last_broadcast >= broadcast_interval:
                        # Add prediction data for smooth client-side interpolation
                        game_state = game_logic.active_games[self.game_id].copy()
                        game_state['broadcast_time'] = current_time
                        game_state['physics_interval'] = physics_update_interval
                        
                        await self.channel_layer.group_send(
                            self.game_group,
                            {
                                'type': 'game_state',
                                'state': game_state
                            }
                        )
                        last_state_broadcast_time = current_time
                
                # Sleep adaptively to maintain target frame rate
                target_frame_time = min(physics_update_interval, broadcast_interval) / 2
                elapsed = time.time() - current_time
                sleep_time = max(0, target_frame_time - elapsed)
                
                # Only sleep if we have meaningful time to wait
                if sleep_time > 0.001:
                    await asyncio.sleep(sleep_time)
                else:
                    # Yield control briefly if we're CPU-bound
                    await asyncio.sleep(0)
                
                # Check if game status changed while we were processing
                if self.game_id in game_logic.active_games:
                    new_state = game_logic.active_games[self.game_id]
                    
                    # Update activity timestamp for non-playing states
                    if new_state['game_status'] != 'playing':
                        # If game was just paused or a match ended, update the activity time
                        # so we don't time out immediately
                        last_activity_time = current_time
        
        except asyncio.CancelledError:
            raise
        except Exception as e:
            pass
        finally:
            # Mark loop as not running
            if self.game_id in game_logic.active_games:
                game_logic.active_games[self.game_id]['loop_running'] = False
    
    # Message handlers
    
    async def game_state(self, event):
        """Send game state to client"""
        await self.send_json(event)
    
    async def paddle_position(self, event):
        """Send paddle position update"""
        await self.send_json(event)
    
    async def game_status_changed(self, event):
        """Send game status update"""
        await self.send_json(event)
    
    async def player_status(self, event):
        """Send player connection status"""
        await self.send_json(event)
        if event.get('player') != self.player_num and event.get('connected', False):
            if hasattr(self, 'wait_for_opponent_task') and not self.wait_for_opponent_task.done():
                self.wait_for_opponent_task.cancel()

    async def game_completed(self, event):
        """Handle game completion and prepare for socket closure"""
        await self.send_json({
            'type': 'game_completed',
            'winner': event['winner'],
            'final_state': event['final_state']
        })
        await asyncio.sleep(2)
        # Close the connection
        await self.close(code=1000)  # Normal closure

        
    @database_sync_to_async
    def get_game(self, game_id):
        """Get game from database"""
        try:
            game = Game.objects.get(id=game_id)
            return {
                'id': game.id,
                'player1_id': game.player1_id,
                'player2_id': game.player2_id,
                'status': game.status,
                'difficulty': game.difficulty
            }
        except Game.DoesNotExist:
            return None
    
    @database_sync_to_async
    def initialize_game_state(self):
        """Create initial game state in memory"""
        if self.game_id in game_logic.active_games:
            return
        
        # Get game from database and create state
        game_logic.active_games[self.game_id] = game_logic.create_game_state(
            self.game_id, 
            self.game
        )
    @database_sync_to_async
    def save_cancelled_game(self):
        """Save game as cancelled in the database"""
        try:
            game = Game.objects.get(id=self.game_id)
            # new status for cancelled games in your StatusChoices class
            game.status = 'cancelled'
            game.save()
            return True
        except Game.DoesNotExist:
            return False

    @database_sync_to_async
    def update_game_status(self, status):
        """Update the game status in the database"""
        try:
            game = Game.objects.get(id=self.game_id)
            game.status = status
            
            # If game is starting, set started_at timestamp
            if status == 'in_progress' and not game.started_at:
                game.started_at = timezone.now()
                
            # If game is completing or cancelling, set completed_at timestamp
            if status in ['completed', 'cancelled'] and not game.completed_at:
                game.completed_at = timezone.now()
                
            game.save()
            return True
        except Game.DoesNotExist:
            return False