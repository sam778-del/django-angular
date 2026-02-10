.PHONY: help setup ssl start stop restart logs clean backup

help:
	@echo "Production Deployment Commands:"
	@echo ""
	@echo "Initial Setup:"
	@echo "  make setup        - Create directories and copy configs"
	@echo "  make ssl          - Initialize SSL certificates"
	@echo "  make start        - Start all services"
	@echo ""
	@echo "Management:"
	@echo "  make stop         - Stop all services"
	@echo "  make restart      - Restart all services"
	@echo "  make logs         - View all logs (SERVICE=name for specific)"
	@echo "  make status       - Check service status"
	@echo ""
	@echo "Maintenance:"
	@echo "  make backup       - Backup database"
	@echo "  make restore      - Restore database from backup"
	@echo "  make update       - Update and rebuild services"
	@echo "  make clean        - Stop and remove all containers/volumes"
	@echo ""
	@echo "SSL:"
	@echo "  make ssl-renew    - Manually renew SSL certificates"
	@echo "  make ssl-check    - Check certificate expiry"
	@echo ""
	@echo "Django:"
	@echo "  make migrate      - Run database migrations"
	@echo "  make collectstatic - Collect static files"
	@echo "  make createsuperuser - Create Django superuser"
	@echo "  make shell        - Open Django shell"

setup:
	@echo "Creating directory structure..."
	mkdir -p nginx/conf.d
	mkdir -p certbot/conf
	mkdir -p certbot/www
	mkdir -p backups
	@echo "Copying nginx configurations..."
	cp nginx.conf nginx/nginx.conf
	cp backend.conf nginx/conf.d/backend.conf
	cp frontend.conf nginx/conf.d/frontend.conf
	cp keycloak.conf nginx/conf.d/keycloak.conf
	@echo "Setup complete! Next steps:"
	@echo "1. cp .env.example .env"
	@echo "2. Edit .env with your settings"
	@echo "3. make ssl"
	@echo "4. make start"

ssl:
	@echo "Initializing SSL certificates..."
	chmod +x init-letsencrypt.sh
	./init-letsencrypt.sh

start:
	@echo "Starting all services..."
	docker-compose up -d

stop:
	@echo "Stopping all services..."
	docker-compose down

restart:
	@echo "Restarting all services..."
	docker-compose restart

logs:
ifdef SERVICE
	docker-compose logs -f $(SERVICE)
else
	docker-compose logs -f
endif

status:
	docker-compose ps

backup:
	@echo "Creating database backup..."
	@mkdir -p backups
	docker-compose exec -T postgres pg_dump -U postgres prisco_db | gzip > backups/db_$(shell date +%Y%m%d_%H%M%S).sql.gz
	@echo "Backup created in backups/"

restore:
	@echo "Available backups:"
	@ls -lh backups/
	@read -p "Enter backup filename to restore: " backup; \
	gunzip < backups/$$backup | docker-compose exec -T postgres psql -U postgres prisco_db

update:
	@echo "Updating services..."
	git pull
	docker-compose pull
	docker-compose up -d --build
	docker-compose exec backend python manage.py migrate
	docker-compose exec backend python manage.py collectstatic --noinput
	@echo "Update complete!"

clean:
	@echo "WARNING: This will remove all containers and volumes!"
	@read -p "Are you sure? [y/N] " confirm; \
	if [ "$$confirm" = "y" ]; then \
		docker-compose down -v; \
		echo "Cleanup complete!"; \
	else \
		echo "Cancelled."; \
	fi

ssl-renew:
	@echo "Renewing SSL certificates..."
	docker-compose run --rm certbot renew
	docker-compose exec nginx nginx -s reload
	@echo "Certificates renewed!"

ssl-check:
	docker-compose run --rm certbot certificates

migrate:
	docker-compose exec backend python manage.py migrate

collectstatic:
	docker-compose exec backend python manage.py collectstatic --noinput

createsuperuser:
	docker-compose exec backend python manage.py createsuperuser

shell:
	docker-compose exec backend python manage.py shell

psql:
	docker-compose exec postgres psql -U postgres -d prisco_db

nginx-reload:
	docker-compose exec nginx nginx -s reload

nginx-test:
	docker-compose exec nginx nginx -t
