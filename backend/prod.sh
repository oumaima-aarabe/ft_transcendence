#!/bin/bash

set -xe

echo "Running Django migrations"
python manage.py makemigrations
python manage.py migrate

echo "Starting Django server"

exec daphne -p 8000 -b 0.0.0.0 backend.asgi:application
