#!/bin/bash

set -xe

echo "Running Django migrations"
python manage.py makemigrations
python manage.py migrate --noinput

echo "Starting Django server"
# python manage.py runserver
exec "$@"