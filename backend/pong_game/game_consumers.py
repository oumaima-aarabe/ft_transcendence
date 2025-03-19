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
        """Handle WebSocket connection and authentication"""
        # Get game ID from URL route
        self.game_id = self.scope['url_route']['kwargs']['game_id']
        self.game_group = f"game_{self.game_id}"
        
        # Get user from scope
        self.user_id = self.scope.get('user_id')
        
        if not self.user_id:
            print("User not authenticated")
            await self.close(code=4001)
            return
        
        # Get game from database
        self.game = await self.get_game(self.game_id)
        if not self.game:
            print(f"Game {self.game_id} not found")
            await self.close(code=4004)
            return
        
        # Determine if user is player1 or player2
        if str(self.user_id) == str(self.game['player1_id']):
            self.player_num = 1
        elif str(self.user_id) == str(self.game['player2_id']):
            self.player_num = 2
        else:
            print(f"User {self.user_id} is not a player in game {self.game_id}")
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
        
        await self.send_json({
            'type': 'game_state',
            'state': game_logic.active_games[self.game_id]
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
        if connection_info and connection_info['status_changed']:
            await self.channel_layer.group_send(
                self.game_group,
                {
                    'type': 'game_status_changed',
                    'status': connection_info['new_status']
                }
            )
        
        # If both players connected, start game loop if not already running
        if connection_info and connection_info['both_connected']:
            if (game_logic.active_games[self.game_id]['game_status'] == 'menu' and
                not game_logic.active_games[self.game_id].get('loop_running', False)):
                
                game_logic.active_games[self.game_id]['loop_running'] = True
                asyncio.create_task(self.game_loop())
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        if hasattr(self, 'game_id') and self.game_id in game_logic.active_games:
            # Mark player as disconnected
            connection_info = game_logic.set_player_connection(self.game_id, self.player_num, False)
            
            # Notify other player
            await self.channel_layer.group_send(
                self.game_group,
                {
                    'type': 'player_status',
                    'player': self.player_num,
                    'connected': False
                }
            )
            
            # If connection changed game status, notify both players
            if connection_info and connection_info['status_changed']:
                await self.channel_layer.group_send(
                    self.game_group,
                    {
                        'type': 'game_status_changed',
                        'status': connection_info['new_status'],
                        'reason': f'Player {self.player_num} disconnected'
                    }
                )
            
            # Leave game group
            await self.channel_layer.group_discard(
                self.game_group,
                self.channel_name
            )
            
            # If both players disconnected and game is over, save results and clean up
            if connection_info and not connection_info['any_connected']:
                game_status = game_logic.active_games[self.game_id]['game_status']
                if game_status in ['gameOver', 'matchOver']:
                    # Save results
                    await game_logic.save_game_results(self.game_id)
                    
                    # Clean up
                    del game_logic.active_games[self.game_id]
    
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
            
            elif message_type == 'toggle_pause':
                # Toggle pause state
                if self.game_id in game_logic.active_games:
                    current_status = game_logic.active_games[self.game_id]['game_status']
                    if current_status == 'playing':
                        new_status = game_logic.set_game_status(self.game_id, 'paused')
                    elif current_status == 'paused':
                        new_status = game_logic.set_game_status(self.game_id, 'playing')
                    else:
                        return
                    
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
            
            elif message_type == 'restart_game':
                # Restart the game if it's over
                if self.game_id in game_logic.active_games:
                    current_status = game_logic.active_games[self.game_id]['game_status']
                    if current_status == 'gameOver':
                        # Reset the game
                        game_logic.reset_game(self.game_id)
                        
                        # Notify players of game state
                        await self.channel_layer.group_send(
                            self.game_group,
                            {
                                'type': 'game_state',
                                'state': game_logic.active_games[self.game_id]
                            }
                        )
                        
                        # Set status to menu
                        new_status = game_logic.set_game_status(self.game_id, 'menu')
                        
                        # Notify of status change
                        await self.channel_layer.group_send(
                            self.game_group,
                            {
                                'type': 'game_status_changed',
                                'status': new_status
                            }
                        )
            
            elif message_type == 'ping':
                # Respond immediately with pong
                await self.send_json({
                    'type': 'pong'
                })
        
        except Exception as e:
            print(f"Error processing message: {str(e)}")
    
    async def game_loop(self):
        """Main game loop running on the server"""
        try:
            last_state_broadcast_time = time.time()
            state_broadcast_interval = 1/120  # Send game state 120 times per second
            physics_update_accumulator = 0
            physics_update_interval = 1/240  # Run physics at 240Hz for smooth calculations
            
            while self.game_id in game_logic.active_games:
                # Get current time for this frame
                current_time = time.time()
                frame_time = current_time - game_logic.active_games[self.game_id]['last_update_time']
                game_logic.active_games[self.game_id]['last_update_time'] = current_time
                
                # Cap delta time to prevent spiral of death with big lag spikes
                if frame_time > 0.25:
                    frame_time = 0.25
                
                # Only update if game is playing
                if game_logic.active_games[self.game_id]['game_status'] == 'playing':
                    # Accumulate time for physics updates
                    physics_update_accumulator += frame_time
                    
                    # Run multiple physics updates if needed to catch up
                    score_happened = False
                    while physics_update_accumulator >= physics_update_interval:
                        # Update game physics with fixed timestep
                        score_update = game_logic.update_game_physics(self.game_id, physics_update_interval)
                        if score_update:
                            score_happened = True
                        physics_update_accumulator -= physics_update_interval
                    
                    # If a score happened, check if match ended
                    if score_happened:
                        match_ended = game_logic.check_match_end(self.game_id)
                        
                        # If match ended, notify players of new status immediately
                        if match_ended:
                            await self.channel_layer.group_send(
                                self.game_group,
                                {
                                    'type': 'game_status_changed',
                                    'status': game_logic.active_games[self.game_id]['game_status'],
                                    'winner': game_logic.active_games[self.game_id]['winner']
                                })
                    
                    # Broadcast state at controlled intervals to avoid network congestion
                    time_since_last_broadcast = current_time - last_state_broadcast_time
                    if time_since_last_broadcast >= state_broadcast_interval:
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
                
                # Sleep just enough to hit target frame rate without overloading CPU
                sleep_time = max(0, physics_update_interval - (time.time() - current_time))
                await asyncio.sleep(sleep_time)
                
                # Check if game is over and no players are connected
                if self.game_id in game_logic.active_games:  # Double-check in case it was deleted
                    if not game_logic.is_any_player_connected(self.game_id):
                        game_status = game_logic.active_games[self.game_id]['game_status']
                        if game_status in ['gameOver', 'matchOver']:
                            # Save results
                            await game_logic.save_game_results(self.game_id)
                            
                            # Clean up
                            del game_logic.active_games[self.game_id]
                            break
        
        except Exception as e:
            print(f"Error in game loop: {str(e)}")
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
    
    # Database methods
    
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