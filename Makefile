.PHONY: dev down test migrate logs shell-be shell-fe build
dev:
	docker compose up --build
down:
	docker compose down
test:
	docker compose run --rm backend pytest --cov=app tests/ -v
migrate:
	docker compose run --rm backend alembic upgrade head
logs:
	docker compose logs -f
shell-be:
	docker compose exec backend bash
shell-fe:
	docker compose exec frontend sh
build:
	docker compose build
