all:
	docker-compose up -d

clean:
	docker system prune -af
	docker volume prune -f
	docker image prune -af
	docker network prune -f
	docker container prune -f
	docker builder prune -f
	rm -rf frontend/node_modules
	rm -rf frontend/package-lock.json

down:
	docker-compose down

reload: down clean all

re: down all