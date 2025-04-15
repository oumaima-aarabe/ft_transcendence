run:
	python3 manage.py runserver

daphne:
	daphne backend.asgi:application -b 0.0.0.0 -p 8000

migrate:
	python3 manage.py makemigrations && python3 manage.py migrate

prod:
	python3 manage.py runserver 0.0.0.0:8000

fullmigrate : clean
	python3 manage.py makemigrations users authentication friends chat
	python3 manage.py migrate

clean:
	find . -path "*/__pycache__/*" -delete
	find . -name "__pycache__" -type d -empty -delete
	find . -path "*/migrations/*.pyc"  -delete
	find . -path "*/migrations/*.py" ! -name "__init__.py" -delete