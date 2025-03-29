#!/bin/bash

set -xe

echo "Running Django migrations"
python manage.py makemigrations
python manage.py migrate --noinput

echo "Starting Django server"
# python manage.py runserver
# exec "$@"
exec daphne -p 8000 -b 0.0.0.0 backend.asgi:application
