build:
	docker-compose up --build -d
rebuild:
	docker-compose down --remove-orphans
	docker-compose up --build -d
