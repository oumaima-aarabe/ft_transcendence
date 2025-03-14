import random
import time

class PongGameLogic:
    """Handles the core game physics and logic"""
    
    # Constants matching frontend
    BASE_WIDTH = 800
    BASE_HEIGHT = 500
    PADDLE_WIDTH = 18
    PADDLE_HEIGHT = 100
    BALL_RADIUS = 10
    POINTS_TO_WIN_MATCH = 5
    MATCHES_TO_WIN_GAME = 3
    
    # Difficulty settings
    DIFFICULTY_SETTINGS = {
        'easy': {
            'ball_speed': 3,
            'increment_multiplier': 0.02,
            'max_ball_speed': 6,
        },
        'medium': {
            'ball_speed': 5,
            'increment_multiplier': 0.05,
            'max_ball_speed': 8,
        },
        'hard': {
            'ball_speed': 7,
            'increment_multiplier': 0.1,
            'max_ball_speed': 11,
        }
    }
    
    def __init__(self, difficulty='medium'):
        # Initialize game state in memory
        self.difficulty = difficulty
        settings = self.DIFFICULTY_SETTINGS[difficulty]
        
        # Initialize ball
        self.ball = {
            'x': self.BASE_WIDTH / 2,
            'y': self.BASE_HEIGHT / 2,
            'dx': settings['ball_speed'],
            'dy': settings['ball_speed'] * 8/5,
            'speed': settings['ball_speed'],
            'radius': self.BALL_RADIUS
        }
        
        # Initialize paddles
        self.left_paddle = {
            'x': 20,
            'y': self.BASE_HEIGHT / 2 - self.PADDLE_HEIGHT / 2,
            'width': self.PADDLE_WIDTH,
            'height': self.PADDLE_HEIGHT,
            'speed': 8,
            'score': 0
        }
        
        self.right_paddle = {
            'x': self.BASE_WIDTH - 20 - self.PADDLE_WIDTH,
            'y': self.BASE_HEIGHT / 2 - self.PADDLE_HEIGHT / 2,
            'width': self.PADDLE_WIDTH,
            'height': self.PADDLE_HEIGHT,
            'speed': 8,
            'score': 0
        }
        
        # Game state
        self.game_status = 'menu'  # menu, playing, paused, matchOver, gameOver
        self.match_winner = None
        self.last_update_time = time.time()
    
    def get_state(self):
        """Return the current game state as a dictionary"""
        return {
            'ball': self.ball,
            'left_paddle': self.left_paddle,
            'right_paddle': self.right_paddle,
            'game_status': self.game_status,
            'match_winner': self.match_winner
        }
    
    def update(self):
        """Update game state based on physics and return any events"""
        events = []
        
        # Skip update if game is not in playing state
        if self.game_status != 'playing':
            return events
        
        # Calculate elapsed time since last update
        current_time = time.time()
        delta_time = current_time - self.last_update_time
        self.last_update_time = current_time
        
        # Extract necessary data
        ball = self.ball
        left_paddle = self.left_paddle
        right_paddle = self.right_paddle
        settings = self.DIFFICULTY_SETTINGS[self.difficulty]
        
        # Update ball position
        ball['x'] += ball['dx']
        ball['y'] += ball['dy']
        
        # Ball collision with top and bottom walls
        if ball['y'] - ball['radius'] <= 0 or ball['y'] + ball['radius'] >= self.BASE_HEIGHT:
            ball['dy'] = -ball['dy']
        
        # Ball collision with left paddle
        if (
            ball['x'] - ball['radius'] <= left_paddle['x'] + left_paddle['width'] and
            ball['y'] >= left_paddle['y'] and
            ball['y'] <= left_paddle['y'] + left_paddle['height'] and
            ball['dx'] < 0
        ):
            # Reverse x direction
            ball['dx'] = -ball['dx']
            
            # Adjust angle based on where ball hits paddle
            hit_position = (ball['y'] - (left_paddle['y'] + left_paddle['height'] / 2)) / (left_paddle['height'] / 2)
            ball['dy'] = hit_position * ball['speed']
            
            # Increase speed slightly
            ball['speed'] = min(
                settings['max_ball_speed'],
                ball['speed'] * (1 + settings['increment_multiplier'])
            )
            ball['dx'] = ball['speed'] if ball['dx'] > 0 else -ball['speed']
            
            # Add paddle hit event
            events.append({
                'type': 'paddle_hit',
                'paddle': 'left',
                'position': hit_position
            })
        
        # Ball collision with right paddle
        if (
            ball['x'] + ball['radius'] >= right_paddle['x'] and
            ball['y'] >= right_paddle['y'] and
            ball['y'] <= right_paddle['y'] + right_paddle['height'] and
            ball['dx'] > 0
        ):
            # Reverse x direction
            ball['dx'] = -ball['dx']
            
            # Adjust angle based on where ball hits paddle
            hit_position = (ball['y'] - (right_paddle['y'] + right_paddle['height'] / 2)) / (right_paddle['height'] / 2)
            ball['dy'] = hit_position * ball['speed']
            
            # Increase speed slightly
            ball['speed'] = min(
                settings['max_ball_speed'],
                ball['speed'] * (1 + settings['increment_multiplier'])
            )
            ball['dx'] = ball['speed'] if ball['dx'] > 0 else -ball['speed']
            
            # Add paddle hit event
            events.append({
                'type': 'paddle_hit',
                'paddle': 'right',
                'position': hit_position
            })
        
        # Score points when ball passes a paddle
        if ball['x'] + ball['radius'] < 0:
            # Right player scores
            right_paddle['score'] += 1
            
            # Reset ball
            self._reset_ball(1)
            
            # Add score event
            events.append({
                'type': 'score',
                'player': 'player2',
                'score': right_paddle['score']
            })
        elif ball['x'] - ball['radius'] > self.BASE_WIDTH:
            # Left player scores
            left_paddle['score'] += 1
            
            # Reset ball
            self._reset_ball(-1)
            
            # Add score event
            events.append({
                'type': 'score',
                'player': 'player1',
                'score': left_paddle['score']
            })
        
        # Check for match win condition
        if left_paddle['score'] >= self.POINTS_TO_WIN_MATCH:
            self.game_status = 'matchOver'
            self.match_winner = 'player1'
            
            events.append({
                'type': 'match_over',
                'winner': 'player1'
            })
        elif right_paddle['score'] >= self.POINTS_TO_WIN_MATCH:
            self.game_status = 'matchOver'
            self.match_winner = 'player2'
            
            events.append({
                'type': 'match_over',
                'winner': 'player2'
            })
        
        return events
    
    def _reset_ball(self, direction):
        """Reset ball position and speed after scoring"""
        settings = self.DIFFICULTY_SETTINGS[self.difficulty]
        
        self.ball['x'] = self.BASE_WIDTH / 2
        self.ball['y'] = self.BASE_HEIGHT / 2
        self.ball['speed'] = settings['ball_speed']
        self.ball['dx'] = direction * settings['ball_speed']
        self.ball['dy'] = ((random.random() * 2 - 1) * settings['ball_speed']) / 2
    
    def move_paddle(self, player, position_y):
        """Move paddle to a specific y position"""
        if player == 'player1':
            self.left_paddle['y'] = max(0, min(self.BASE_HEIGHT - self.PADDLE_HEIGHT, position_y))
        else:
            self.right_paddle['y'] = max(0, min(self.BASE_HEIGHT - self.PADDLE_HEIGHT, position_y))
    
    def start_game(self):
        """Start the game"""
        self.game_status = 'playing'
    
    def pause_game(self):
        """Pause the game"""
        if self.game_status == 'playing':
            self.game_status = 'paused'
    
    def resume_game(self):
        """Resume the game"""
        if self.game_status == 'paused':
            self.game_status = 'playing'
    
    def reset_for_new_match(self):
        """Reset the game for a new match"""
        settings = self.DIFFICULTY_SETTINGS[self.difficulty]
        
        # Reset ball
        self.ball['x'] = self.BASE_WIDTH / 2
        self.ball['y'] = self.BASE_HEIGHT / 2
        self.ball['dx'] = settings['ball_speed']
        self.ball['dy'] = settings['ball_speed'] * 0.5
        self.ball['speed'] = settings['ball_speed']
        
        # Reset paddles
        self.left_paddle['y'] = self.BASE_HEIGHT / 2 - self.PADDLE_HEIGHT / 2
        self.right_paddle['y'] = self.BASE_HEIGHT / 2 - self.PADDLE_HEIGHT / 2
        self.left_paddle['score'] = 0
        self.right_paddle['score'] = 0
        
        # Reset game status
        self.game_status = 'menu'
        self.match_winner = None