.PHONY: dev down test migrate logs shell-be shell-fe build lint
dev:
	docker compose up --build
down:
	docker compose down
lint:
	cd frontend && npm run lint
	cd backend && (./venv/bin/ruff check . || ruff check . 2>/dev/null || echo "ruff not found, skipping backend lint")
	@(command -v terraform >/dev/null && cd terraform && terraform fmt -check) || echo "terraform not found, skipping terraform lint"
test:
	docker compose run --rm backend python -m pytest --cov=app tests/ -v
	docker compose run --rm frontend npm test
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
seed:
	docker compose run --rm backend python app/scripts/seed_db.py
