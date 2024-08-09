# ft_transcendence

###  Project Structure

```
ft_transcendence/
├── backend/
│   ├── services/
│   │   ├── authentication/
│   │   │   ├── src/
│   │   │   │   ├── apps.py            # Django app configuration
│   │   │   │   ├── views.py           # API views for authentication
│   │   │   │   ├── models.py          # Models for user and authentication data
│   │   │   │   └── serializers.py     # Serializers for API responses
│   │   │   ├── Dockerfile             # Dockerfile for the authentication service
│   │   │   ├── urls.py                # URL routing for authentication APIs
│   │   │   └── requirements.txt       # Python dependencies for the authentication service
│   │   │
│   │   ├── tournaments/
│   │   │   ├── src/
│   │   │   │   ├── apps.py            # Django app configuration
│   │   │   │   ├── views.py           # API views for tournament management
│   │   │   │   ├── models.py          # Models for tournament data
│   │   │   │   └── serializers.py     # Serializers for API responses
│   │   │   ├── Dockerfile             # Dockerfile for the tournaments service
│   │   │   ├── urls.py                # URL routing for tournament APIs
│   │   │   └── requirements.txt       # Python dependencies for the tournaments service
│   │   │
│   │   ├── game/
│   │   │   ├── src/
│   │   │   │   ├── apps.py            # Django app configuration
│   │   │   │   ├── views.py           # API views for game logic and AI opponent
│   │   │   │   ├── models.py          # Models for game data
│   │   │   │   └── serializers.py     # Serializers for API responses
│   │   │   ├── Dockerfile             # Dockerfile for the game service
│   │   │   ├── urls.py                # URL routing for game APIs
│   │   │   └── requirements.txt       # Python dependencies for the game service
│   │   │
│   │   ├── stats/
│   │   │   ├── src/
│   │   │   │   ├── apps.py            # Django app configuration
│   │   │   │   ├── views.py           # API views for user and game stats
│   │   │   │   ├── models.py          # Models for stats data
│   │   │   │   └── serializers.py     # Serializers for API responses
│   │   │   ├── Dockerfile             # Dockerfile for the stats service
│   │   │   ├── urls.py                # URL routing for stats APIs
│   │   │   └── requirements.txt       # Python dependencies for the stats service
│   │   │
│   │   ├── remote/
│   │   │   ├── src/
│   │   │   │   ├── apps.py            # Django app configuration
│   │   │   │   ├── views.py           # API views for remote authentication and players
│   │   │   │   ├── models.py          # Models for remote player data
│   │   │   │   └── serializers.py     # Serializers for API responses
│   │   │   ├── Dockerfile             # Dockerfile for the remote service
│   │   │   ├── urls.py                # URL routing for remote APIs
│   │   │   └── requirements.txt       # Python dependencies for the remote service
│   │   │
│   │   └── common/
│   │       ├── utils.py               # Common utilities shared across microservices
│   │       ├── base_models.py         # Base models for inheritance
│   │       └── base_views.py          # Base views for inheritance
│   │
│   ├── api_gateway/
│   │   ├── src/
│   │   │   ├── urls.py                # Routing to different microservices
│   │   │   └── views.py               # Gateway logic, request forwarding
│   │   ├── Dockerfile                 # Dockerfile for API gateway
│   │   └── requirements.txt           # Python dependencies for API gateway
│   │
│   └── docker-compose.yml             # Docker Compose to orchestrate microservices
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

3. **API Gateway**:
   - The `api_gateway` service serves as the entry point, routing requests to the appropriate microservices and potentially handling cross-cutting concerns like authentication and rate limiting.

4. **Communication**:
   - Microservices communicate via RESTful APIs. For more advanced use cases, you might consider adding message queues (e.g., RabbitMQ, Kafka) for asynchronous communication.
