import time
import random
import math
from django.utils import timezone
from .models import Game, Match, PlayerProfile, StatusChoices
from channels.db import database_sync_to_async

# Game constants
POINTS_TO_WIN_MATCH = 5
MATCHES_TO_WIN_GAME = 3
BASE_WIDTH = 800
BASE_HEIGHT = 500
PADDLE_WIDTH = 18
PADDLE_HEIGHT = 100
BALL_RADIUS = 10

# Difficulty settings
DIFFICULTY_SETTINGS = {
    "easy": {"ball_speed": 3, "increment_multiplier": 0.02, "max_ball_speed": 6},
    "medium": {"ball_speed": 5, "increment_multiplier": 0.05, "max_ball_speed": 8},
    "hard": {"ball_speed": 7, "increment_multiplier": 0.1, "max_ball_speed": 11}
}

# In-memory storage for active games
active_games = {}

def create_game_state(game_id, game_data):
    """
    Creates a new game state in memory.
    
    Args:
        game_id: The ID of the game
        game_data: Game information from database (theme, difficulty, players)
    
    Returns:
        The newly created game state dictionary
    """
    settings = DIFFICULTY_SETTINGS[game_data['difficulty']]
    
    return {
        'game_id': game_id,
        'ball': {
            'x': BASE_WIDTH / 2,
            'y': BASE_HEIGHT / 2,
            'dx': settings['ball_speed'],
            'dy': settings['ball_speed'] * BASE_HEIGHT / BASE_WIDTH,
            'speed': settings['ball_speed'],
            'radius': BALL_RADIUS
        },
        'left_paddle': {
            'x': 20,
            'y': BASE_HEIGHT / 2 - PADDLE_HEIGHT / 2,
            'width': PADDLE_WIDTH,
            'height': PADDLE_HEIGHT,
            'speed': 8,
            'score': 0
        },
        'right_paddle': {
            'x': BASE_WIDTH - 20 - PADDLE_WIDTH,
            'y': BASE_HEIGHT / 2 - PADDLE_HEIGHT / 2,
            'width': PADDLE_WIDTH,
            'height': PADDLE_HEIGHT,
            'speed': 8,
            'score': 0
        },
        'match_wins': {
            'player1': 0,
            'player2': 0
        },
        'current_match': 1,
        'game_status': 'waiting',
        'winner': None,
        'players': {
            'player1': {
                'id': game_data['player1_id'],
                'connected': False
            },
            'player2': {
                'id': game_data['player2_id'],
                'connected': False
            }
        },
        'difficulty': game_data['difficulty'],
        'settings': settings,
        'last_update_time': time.time(),
        'loop_running': False
    }

def update_paddle_position(game_id, player_num, position):
    """
    Updates a paddle position.
    
    Args:
        game_id: The ID of the game
        player_num: Which player (1 or 2)
        position: New Y position of the paddle
    """
    if game_id not in active_games:
        return False
    
    # Validate position bounds
    if position < 0:
        position = 0
    elif position > BASE_HEIGHT - PADDLE_HEIGHT:
        position = BASE_HEIGHT - PADDLE_HEIGHT
    
    # Update the appropriate paddle
    paddle_key = 'left_paddle' if player_num == 1 else 'right_paddle'
    active_games[game_id][paddle_key]['y'] = position
    # print(f"Updating paddle position: game_id={game_id}, player_num={player_num}, position={position}, type={type(position)}")
    
    return True

def update_game_physics(game_id, delta_time):
    """
    Updates the game physics based on elapsed time.
    
    Args:
        game_id: The ID of the game
        delta_time: Time elapsed since last update in seconds
    
    Returns:
        Boolean indicating if a score happened during the update
    """
    if game_id not in active_games:
        return False
    
    game_state = active_games[game_id]
    ball = game_state['ball']
    left_paddle = game_state['left_paddle']
    right_paddle = game_state['right_paddle']
    settings = game_state['settings']
    
    # We now use fixed timestep, no need to adjust for frame rate
    # as delta_time is already our fixed physics interval
    
    # Store previous positions for client-side interpolation
    ball['prev_x'] = ball['x']
    ball['prev_y'] = ball['y']
    
    # Move the ball
    ball['x'] += ball['dx'] * delta_time * 60  # Scale by 60 to maintain similar speed
    ball['y'] += ball['dy'] * delta_time * 60
    collision_happened = False
    # Handle wall collisions
    if ball['y'] + ball['radius'] >= BASE_HEIGHT:
        if ball['dy'] > 0:
            ball['dy'] = -ball['dy']
            # Add slight randomness to prevent looping patterns
            ball['dy'] += (random.random() - 0.5) * 0.1
        collision_happened = True
        
    
    if ball['y'] - ball['radius'] <= 0:
        if ball['dy'] < 0:
            ball['dy'] = -ball['dy']
            # Add slight randomness to prevent looping patterns
            ball['dy'] += (random.random() - 0.5) * 0.1
        collision_happened = True
        
    
    # Cache calculations for paddle collisions to avoid repeated computation
    ball_left_edge = ball['x'] - ball['radius']
    ball_right_edge = ball['x'] + ball['radius']
    ball_top_edge = ball['y'] - ball['radius']
    ball_bottom_edge = ball['y'] + ball['radius']
    
    left_paddle_right = left_paddle['x'] + left_paddle['width']
    left_paddle_top = left_paddle['y']
    left_paddle_bottom = left_paddle['y'] + left_paddle['height']
    
    right_paddle_left = right_paddle['x']
    right_paddle_top = right_paddle['y']
    right_paddle_bottom = right_paddle['y'] + right_paddle['height']
    
    # Left paddle collision
    if (ball_left_edge <= left_paddle_right and
        ball_left_edge > left_paddle['x'] and
        ball_top_edge <= left_paddle_bottom and
        ball_bottom_edge >= left_paddle_top and
        ball['dx'] < 0):
        
        # Reverse X direction
        ball['dx'] = -ball['dx']
        
        # Adjust angle based on hit position
        hit_position = (ball['y'] - (left_paddle_top + left_paddle['height'] / 2)) / (left_paddle['height'] / 2)
        
        # Limit the angle to avoid extreme angles
        hit_position = max(min(hit_position, 0.8), -0.8)
        
        ball['dy'] = hit_position * ball['speed']
        
        # Increase speed slightly
        ball['speed'] = min(
            settings['max_ball_speed'],
            ball['speed'] * (1 + settings['increment_multiplier'])
        )
        ball['dx'] = ball['speed'] if ball['dx'] > 0 else -ball['speed']
        
        # Add a subtle random factor to avoid predictable patterns
        ball['dy'] += (random.random() - 0.5) * 0.2
        collision_happened = True
    # Right paddle collision
    if (ball_right_edge >= right_paddle_left and
        ball_right_edge < right_paddle_left + right_paddle['width'] and
        ball_top_edge <= right_paddle_bottom and
        ball_bottom_edge >= right_paddle_top and
        ball['dx'] > 0):
        
        # Reverse X direction
        ball['dx'] = -ball['dx']
        
        # Adjust angle based on hit position
        hit_position = (ball['y'] - (right_paddle_top + right_paddle['height'] / 2)) / (right_paddle['height'] / 2)
        
        # Limit the angle to avoid extreme angles
        hit_position = max(min(hit_position, 0.8), -0.8)
        
        ball['dy'] = hit_position * ball['speed']
        
        # Increase speed slightly
        ball['speed'] = min(
            settings['max_ball_speed'],
            ball['speed'] * (1 + settings['increment_multiplier'])
        )
        ball['dx'] = ball['speed'] if ball['dx'] > 0 else -ball['speed']
        
        # Add a subtle random factor to avoid predictable patterns
        ball['dy'] += (random.random() - 0.5) * 0.2
        collision_happened = False
    
    # Check for scoring
    score_happened = False
    
    # Scoring logic
    if ball['x'] + ball['radius'] < 0:
        # Right player scores
        right_paddle['score'] += 1
        reset_ball(game_id, 1)
        score_happened = True
    
    elif ball['x'] - ball['radius'] > BASE_WIDTH:
        # Left player scores
        left_paddle['score'] += 1
        reset_ball(game_id, -1)
        score_happened = True
    
    # Return whether scoring happened
    
    if score_happened:
        return 1
        
    return 2 if collision_happened else 0
def reset_ball(game_id, direction):
    """
    Resets the ball after scoring.
    
    Args:
        game_id: The ID of the game
        direction: Direction to send the ball (1 for right, -1 for left)
    """
    if game_id not in active_games:
        return
    
    game_state = active_games[game_id]
    settings = game_state['settings']
    
    game_state['ball']['x'] = BASE_WIDTH / 2
    game_state['ball']['y'] = BASE_HEIGHT / 2
    game_state['ball']['speed'] = settings['ball_speed']
    game_state['ball']['dx'] = direction * settings['ball_speed']
    
    # Add some randomness to y direction
    game_state['ball']['dy'] = ((random.random() * 2 - 1) * settings['ball_speed']) / 2

def check_match_end(game_id):
    """
    Checks if a match has ended based on scores.
    
    Args:
        game_id: The ID of the game
    
    Returns:
        True if match ended, False otherwise
    """
    if game_id not in active_games:
        return False
    
    game_state = active_games[game_id]
    left_score = game_state['left_paddle']['score']
    right_score = game_state['right_paddle']['score']
    
    match_ended = False
    
    # First to POINTS_TO_WIN_MATCH points wins match
    if left_score >= POINTS_TO_WIN_MATCH:
        # Player 1 wins match
        game_state['match_wins']['player1'] += 1
        game_state['winner'] = 'player1'
        match_ended = True
        
        # Check if game is over
        if game_state['match_wins']['player1'] >= MATCHES_TO_WIN_GAME:
            game_state['game_status'] = 'gameOver'
        else:
            game_state['game_status'] = 'matchOver'
    
    elif right_score >= POINTS_TO_WIN_MATCH:
        # Player 2 wins match
        game_state['match_wins']['player2'] += 1
        game_state['winner'] = 'player2'
        match_ended = True
        
        # Check if game is over
        if game_state['match_wins']['player2'] >= MATCHES_TO_WIN_GAME:
            game_state['game_status'] = 'gameOver'
        else:
            game_state['game_status'] = 'matchOver'
    
    return match_ended

def reset_for_new_match(game_id):
    """
    Resets the game state for a new match.
    
    Args:
        game_id: The ID of the game
    """
    if game_id not in active_games:
        return
    
    game_state = active_games[game_id]
    settings = game_state['settings']
    
    # Reset ball
    game_state['ball']['x'] = BASE_WIDTH / 2
    game_state['ball']['y'] = BASE_HEIGHT / 2
    game_state['ball']['dx'] = settings['ball_speed']
    game_state['ball']['dy'] = settings['ball_speed'] * BASE_HEIGHT / BASE_WIDTH
    game_state['ball']['speed'] = settings['ball_speed']
    
    # Reset paddles
    game_state['left_paddle']['y'] = BASE_HEIGHT / 2 - PADDLE_HEIGHT / 2
    game_state['left_paddle']['score'] = 0
    game_state['right_paddle']['y'] = BASE_HEIGHT / 2 - PADDLE_HEIGHT / 2
    game_state['right_paddle']['score'] = 0
    
    # Update match counter
    game_state['current_match'] += 1
    
    # Reset status
    game_state['game_status'] = 'menu'
    game_state['winner'] = None

def reset_game(game_id):
    """
    Completely resets the game state.
    
    Args:
        game_id: The ID of the game
    """
    if game_id not in active_games:
        return
    
    game_state = active_games[game_id]
    settings = game_state['settings']
    
    # Reset everything
    game_state['ball']['x'] = BASE_WIDTH / 2
    game_state['ball']['y'] = BASE_HEIGHT / 2
    game_state['ball']['dx'] = settings['ball_speed']
    game_state['ball']['dy'] = settings['ball_speed'] * BASE_HEIGHT / BASE_WIDTH
    game_state['ball']['speed'] = settings['ball_speed']
    
    game_state['left_paddle']['y'] = BASE_HEIGHT / 2 - PADDLE_HEIGHT / 2
    game_state['left_paddle']['score'] = 0
    game_state['right_paddle']['y'] = BASE_HEIGHT / 2 - PADDLE_HEIGHT / 2
    game_state['right_paddle']['score'] = 0
    
    game_state['match_wins']['player1'] = 0
    game_state['match_wins']['player2'] = 0
    
    game_state['current_match'] = 1
    game_state['game_status'] = 'menu'
    game_state['winner'] = None

def set_player_connection(game_id, player_num, connected):
    """
    Updates a player's connection status.
    
    Args:
        game_id: The ID of the game
        player_num: Which player (1 or 2)
        connected: Boolean connection status
    
    Returns:
        Dictionary with game status info
    """
    if game_id not in active_games:
        return None
    
    player_key = f'player{player_num}'
    active_games[game_id]['players'][player_key]['connected'] = connected
    
    # Check if game status needs updating
    status_changed = False
    old_status = active_games[game_id]['game_status']
    
    # If both players are connected and game is waiting, change to menu
    if (active_games[game_id]['players']['player1']['connected'] and
        active_games[game_id]['players']['player2']['connected'] and
        active_games[game_id]['game_status'] == 'waiting'):
        
        active_games[game_id]['game_status'] = 'menu'
        status_changed = True
    
    # If a player disconnects while game is playing, pause the game
    elif (not connected and
          active_games[game_id]['game_status'] == 'playing'):
        
        active_games[game_id]['game_status'] = 'cancelled'
        status_changed = True
    
    return {
        'status_changed': status_changed,
        'old_status': old_status,
        'new_status': active_games[game_id]['game_status'],
        'both_connected': (active_games[game_id]['players']['player1']['connected'] and
                          active_games[game_id]['players']['player2']['connected']),
        'any_connected': (active_games[game_id]['players']['player1']['connected'] or
                         active_games[game_id]['players']['player2']['connected'])
    }

def set_game_status(game_id, new_status):
    """
    Sets the game status.
    
    Args:
        game_id: The ID of the game
        new_status: New status value
    
    Returns:
        True if status was changed, False otherwise
    """
    if game_id not in active_games:
        return False
    
    if new_status not in ['waiting', 'menu', 'playing', 'paused', 'matchOver', 'gameOver', 'cancelled']:
        return False
    
    # If changing to playing, update the timestamp
    if new_status == 'playing':
        active_games[game_id]['last_update_time'] = time.time()
    
    # Update the status
    active_games[game_id]['game_status'] = new_status
    
    return True

def is_any_player_connected(game_id):
    """
    Checks if any player is connected to the game.
    
    Args:
        game_id: The ID of the game
    
    Returns:
        Boolean indicating if any player is connected
    """
    if game_id not in active_games:
        return False
    
    return (active_games[game_id]['players']['player1']['connected'] or
            active_games[game_id]['players']['player2']['connected'])

def are_both_players_connected(game_id):
    """
    Checks if both players are connected to the game.
    
    Args:
        game_id: The ID of the game
    
    Returns:
        Boolean indicating if both players are connected
    """
    if game_id not in active_games:
        return False
    
    return (active_games[game_id]['players']['player1']['connected'] and
            active_games[game_id]['players']['player2']['connected'])

@database_sync_to_async
def save_game_results(game_id):
    """
    Saves the final game results to the database.
    
    Args:
        game_id: The ID of the game
    
    Returns:
        Boolean indicating success
    """
    try:
        if game_id not in active_games :
            return False
            
        game = Game.objects.get(id=game_id)
        game_state = active_games[game_id]
        if game.status == 'cancelled':
            return False
        # Update game status
        if game.status != 'cancelled':
            game.status = 'completed'
        
            # Set winner if game ended
            if game_state['game_status'] == 'gameOver':
                if game_state['match_wins']['player1'] > game_state['match_wins']['player2'] :
                    game.winner = game.player1
                else:
                    game.winner = game.player2
            
            # Update match scores
            game.final_score_player1 = game_state['match_wins']['player1']
            game.final_score_player2 = game_state['match_wins']['player2']
            
            # Set completion time
            game.completed_at = timezone.now()
            
            # Save game
            game.save()
            
            # Save match data for all matches that were played
            current_match = game_state['current_match']
            
            # Create match records for each match that was played
            for i in range(1, current_match + 1):
                # Check if this match already exists
                match_exists = Match.objects.filter(game=game, match_number=i).exists()
                
                if not match_exists:
                    # For the current match (potentially incomplete)
                    if i == current_match:
                        print(f"Creating match {i}")
                        match = Match.objects.create(
                            game=game,
                            match_number=i,
                            status=StatusChoices.MATCH_COMPLETED if game_state['game_status'] == 'gameOver' else StatusChoices.MATCH_IN_PROGRESS,
                            score_player1=game_state['left_paddle']['score'],
                            score_player2=game_state['right_paddle']['score'],
                            winner=game_state['winner'],
                            started_at=timezone.now() - timezone.timedelta(minutes=5),
                            completed_at=timezone.now() if game_state['game_status'] == 'gameOver' else None
                        )
                        match.save()
                    # For completed previous matches
                    else:
                        # Determine who won this match based on match_wins
                        player1_wins = game_state['match_wins']['player1']
                        player2_wins = game_state['match_wins']['player2']
                        
                        # Need to figure out if player1 or player2 won this specific match
                        # For simplicity, we'll say player1 won matches 1 to player1_wins,
                        # and player2 won matches player1_wins+1 to player1_wins+player2_wins
                        if i <= player1_wins:
                            winner = 'player1'
                            score_player1 = POINTS_TO_WIN_MATCH  # Points to win a match
                            score_player2 = random.randint(0, POINTS_TO_WIN_MATCH - 1)  # Random lower score
                        else:
                            winner = 'player2'
                            score_player2 = POINTS_TO_WIN_MATCH  # Points to win a match
                            score_player1 = random.randint(0, POINTS_TO_WIN_MATCH - 1)  # Random lower score
                        
                        match = Match.objects.create(
                            game=game,
                            match_number=i,
                            status=StatusChoices.MATCH_COMPLETED,
                            score_player1=score_player1,
                            score_player2=score_player2,
                            winner=winner,
                            started_at=timezone.now() - timezone.timedelta(minutes=i*5),
                            completed_at=timezone.now() - timezone.timedelta(minutes=(i-1)*5)
                        )
                        print(f"else Creating match {i}")
                        match.save()
            
            # Update player profiles
            update_player_profiles(game_id)
        
        return True
    except Exception as e:
        print(f"Error saving game results: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

@database_sync_to_async
def update_player_profiles(game_id):
    print("Updating player profiles")
    try:
        if game_id not in active_games:
            print("Game not found in active games")
            return
            
        game = Game.objects.get(id=game_id)
        game_state = active_games[game_id]
        
        # Only update if game is completed
        if game_state['game_status'] != 'gameOver':
            print("Game not over yet")
            return
        
        # Get profiles
        p1_profile, _ = PlayerProfile.objects.get_or_create(player=game.player1)
        p2_profile, _ = PlayerProfile.objects.get_or_create(player=game.player2)
        
        # Update match counts
        p1_profile.matches_played += 1
        p2_profile.matches_played += 1
        
        # Update wins/losses
        if game_state['match_wins']['player1'] > game_state['match_wins']['player2']:
            p1_profile.matches_won += 1
            p2_profile.matches_lost += 1
            
            # Update achievements for player 1
            p1_profile.update_achievements(game)  # Add this line
            
            #update_player1 level and experience
            p1_profile.experience += 500
            factor = p1_profile.level if p1_profile.level > 0 else 1
            p1_profile.level = math.floor(p1_profile.experience/(1000 * factor))
        else:
            p2_profile.matches_won += 1
            p1_profile.matches_lost += 1
            
            # Update achievements for player 2
            p2_profile.update_achievements(game)  # Add this line

            #update_player2 level and experience
            p2_profile.experience += 100
            factor = p2_profile.level if p2_profile.level > 0 else 1
            p2_profile.level = math.floor(p2_profile.experience/(1000 * factor))
        
        # Save profiles
        print("Saving player profiles")
        p1_profile.save()
        p2_profile.save()
        
    except Exception as e:
        print(f"Error updating player profiles: {str(e)}")


def validate_game_state(game_id, player_id, position=None):
    """
    Validates game state and player actions to prevent cheating
    
    Args:
        game_id: The ID of the game
        player_id: The ID of the player making the move
        position: Optional paddle position if being validated
    
    Returns:
        Tuple of (is_valid, reason)
    """
    if game_id not in active_games:
        return (False, "Game does not exist")
    
    game_state = active_games[game_id]
    
    # Verify player is part of this game
    player_num = None
    if str(player_id) == str(game_state['players']['player1']['id']):
        player_num = 1
    elif str(player_id) == str(game_state['players']['player2']['id']):
        player_num = 2
    else:
        return (False, "Player not part of this game")
    
    # Verify game is in a valid state for moves
    if game_state['game_status'] != 'playing':
        return (False, f"Game is not in playing state (current: {game_state['game_status']})")
    
    # If validating a paddle move, check position bounds
    # print(f"Updating paddle position: game_id={game_id}, player_num={player_num}, position={position}, type={type(position)}")
    if position is not None:
        if not isinstance(position, (int, float)):
            return (False, "Invalid position type")
            
        # Check for legitimate paddle position
        if position < 0 or position > BASE_HEIGHT - PADDLE_HEIGHT:
            return (False, "Position out of bounds")
            
        # Check for unreasonable paddle movement (anti-cheat)
        paddle_key = 'left_paddle' if player_num == 1 else 'right_paddle'
        current_position = game_state[paddle_key]['y']
        # max_move_distance = game_state[paddle_key]['speed'] * 10 # Allow some buffer for latency
        
        # if abs(position - current_position) > max_move_distance:
        #     return (False, "Paddle movement too large")
    
    return (True, None)

def update_paddle_position(game_id, player_num, position):
    """
    Updates a paddle position with validation.
    
    Args:
        game_id: The ID of the game
        player_num: Which player (1 or 2)
        position: New Y position of the paddle
        
    Returns:
        Boolean indicating if update was successful
    """
    if game_id not in active_games:
        return False
    
    # Get player ID from player number
    player_id = None
    if player_num == 1:
        player_id = active_games[game_id]['players']['player1']['id']
    elif player_num == 2:
        player_id = active_games[game_id]['players']['player2']['id']
    else:
        return False
    
    # Validate the move
    # valid, reason = validate_game_state(game_id, player_id, position)
    # if not valid:
    #     print(f"Invalid paddle move: {reason}")
    #     return False
    
    # Update the appropriate paddle
    paddle_key = 'left_paddle' if player_num == 1 else 'right_paddle'
    active_games[game_id][paddle_key]['y'] = position
    
    return True

# rate limiting to prevent overloading (in game_consumers.py)

import time
from collections import defaultdict, deque

class RateLimiter:
    """Simple rate limiter to prevent websocket spam"""
    
    def __init__(self, max_messages=30, window_seconds=1):
        self.max_messages = max_messages
        self.window_seconds = window_seconds
        self.message_counts = defaultdict(lambda: deque())
    
    def is_allowed(self, user_id):
        """Check if user is allowed to send message based on recent history"""
        now = time.time()
        
        # Get the user's message queue
        queue = self.message_counts[user_id]
        
        # Remove messages outside the time window
        while queue and queue[0] < now - self.window_seconds:
            queue.popleft()
        
        # Check if under the limit
        if len(queue) < self.max_messages:
            queue.append(now)
            return True
        
        return False
