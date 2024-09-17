# ft_transcendence

###  Project Structure

```
ft_transcendence/
├── services/                              # Directory for all microservices
│   ├── auth/                              # User management and authentication service
│   │   ├── Dockerfile
│   │   ├── requirements.txt
│   │   ├── manage.py
│   │   ├── auth/                         # Django app for authentication
│   │   └── ...
│   ├── users/                             # User profiles and management service
│   │   ├── Dockerfile
│   │   ├── requirements.txt
│   │   ├── manage.py
│   │   ├── users/                        # Django app for user profiles
│   │   └── ...
│   ├── game/                              # Game logic and matchmaking service
│   │   ├── Dockerfile
│   │   ├── requirements.txt
│   │   ├── manage.py
│   │   ├── game/                         # Django app for game logic
│   │   └── ...
│   ├── tournament/                       # Tournament management service
│   │   ├── Dockerfile
│   │   ├── requirements.txt
│   │   ├── manage.py
│   │   ├── tournament/                   # Django app for tournaments
│   │   └── ...
│   ├── settings/                         # Service for managing application settings
│   │   ├── Dockerfile
│   │   ├── requirements.txt
│   │   ├── manage.py
│   │   ├── settings/                     # Django app for settings
│   │   └── ...
│   ├── stats/                            # Service for user and game statistics
│   │   ├── Dockerfile
│   │   ├── requirements.txt
│   │   ├── manage.py
│   │   ├── stats/                        # Django app for statistics
│   │   └── ...
│   ├── frontend/                         # Next.js frontend application
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── next.config.js
│   │   └── ...
│   ├── elk/                              # ELK stack configuration
│   │   ├── docker-compose.yml
│   │   ├── elasticsearch/
│   │   ├── logstash/
│   │   └── kibana/
│   ├── monitoring/                       # Monitoring system configuration
│   │   ├── docker-compose.yml
│   │   ├── prometheus/
│   │   └── grafana/
├── docker-compose.yml                    # Compose file for all services
├── .env                                  # Environment variables
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── Dockerfile
│
├── database/
│   ├── init.sql
│   └── Dockerfile
│
├── nginx/
│   ├── nginx.conf
│   └── Dockerfile
└── README.md
```

### Key Points

1. **Microservices**:
   - Each microservice (e.g., `authentication`, `tournaments`, `game`, `stats`, `remote`) is isolated in its own directory with a clear responsibility.
   - Each service has its own `Dockerfile`, `requirements.txt`, and Django app structure (`views.py`, `models.py`, etc.).

2. **Common Components**:
   - Shared logic, utilities, and base models or views are housed in the `common` directory to promote DRY (Don't Repeat Yourself) principles.
  





```mermaid
erDiagram
    USER ||--o| RANKING : has
    USER ||--o| PROFILE : has
    USER ||--o| USER_STATS : has
    USER ||--o{ USER_ACHIEVEMENT : earns
    USER ||--o{ FRIENDSHIP : has
    USER ||--o{ MESSAGE : sends
    USER ||--o{ MESSAGE : receives
    USER ||--o{ GAME : plays_as_player1
    USER ||--o{ GAME : plays_as_player2
    USER ||--o{ GAME : wins
    USER ||--o{ TOURNAMENT_PARTICIPANT : participates
    ACHIEVEMENT ||--o{ USER_ACHIEVEMENT : awarded_to
    TOURNAMENT ||--o{ TOURNAMENT_PARTICIPANT : includes

    USER {
        int id PK
        string username
        string email
        string password
        string state
        string avatar
        int level
        boolean two_factor_enabled
    }

    RANKING {
        int id PK
        int user_id FK
        int points
        int rank
        datetime last_updated
    }

    PROFILE {
        int id PK
        int user_id FK
        string preferred_paddle
        string playing_style
    }

    USER_STATS {
        int id PK
        int user_id FK
        int games_played
        int games_won
        int games_lost
        int tournaments_participated
        int tournaments_won
    }

    ACHIEVEMENT {
        int id PK
        string name
        string description
        string icon
    }

    USER_ACHIEVEMENT {
        int id PK
        int user_id FK
        int achievement_id FK
        datetime date_earned
    }

    FRIENDSHIP {
        int id PK
        int user_id FK
        int friend_id FK
        datetime created_at
        string status
    }

    MESSAGE {
        int id PK
        int sender_id FK
        int receiver_id FK
        text content
        datetime timestamp
        boolean is_read
    }

    GAME {
        int id PK
        int player1_id FK
        int player2_id FK
        int winner_id FK
        datetime start_time
        datetime end_time
        int player1_score
        int player2_score
    }

    TOURNAMENT {
        int id PK
        string name
        datetime start_date
        datetime end_date
        int max_participants
    }

    TOURNAMENT_PARTICIPANT {
        int id PK
        int tournament_id FK
        int user_id FK
        string nickname
        datetime joined_at
    }
```

4. **API Gateway**:
   - The `api_gateway` service serves as the entry point, routing requests to the appropriate microservices and potentially handling cross-cutting concerns like authentication and rate limiting.

5. **Communication**:
   - Microservices communicate via RESTful APIs. For more advanced use cases, you might consider adding message queues (e.g., RabbitMQ, Kafka) for asynchronous communication.
