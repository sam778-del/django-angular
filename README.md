# Prisco Production Deployment with SSL

Complete production-ready Docker deployment with SSL certificates for:
- **Backend API**: https://fullapi.analist24.it.com
- **Frontend**: https://angular.analist24.it.com
- **Keycloak**: https://keycloak.analist24.it.com

## Prerequisites

1. **Domain DNS Records** - Point all domains to your server IP:
   ```
   A     fullapi.analist24.it.com    -> YOUR_SERVER_IP
   A     angular.analist24.it.com    -> YOUR_SERVER_IP
   A     keycloak.analist24.it.com   -> YOUR_SERVER_IP
   ```

2. **Server Requirements**:
   - Ubuntu 20.04+ or similar Linux distribution
   - Docker 20.10+
   - Docker Compose 2.0+
   - Ports 80, 443 open in firewall

## Directory Structure

```
.
├── backend/
│   ├── Dockerfile
│   └── ... (Django project)
├── frontend/
│   ├── Dockerfile
│   └── ... (Angular project)
├── nginx/
│   ├── nginx.conf
│   └── conf.d/
│       ├── backend.conf
│       ├── frontend.conf
│       └── keycloak.conf
├── certbot/
│   ├── conf/
│   └── www/
├── docker-compose.yml
├── init-letsencrypt.sh
└── .env
```

## Installation Steps

### 1. Setup Environment

```bash
cp .env.example .env
nano .env
```

Update the following variables:
- `DB_PASS` - Strong database password
- `SECRET_KEY` - Generate with: `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`
- `KEYCLOAK_ADMIN_PASSWORD` - Strong admin password
- `SSL_EMAIL` - Your email for Let's Encrypt notifications

### 2. Create Directory Structure

```bash
mkdir -p nginx/conf.d
mkdir -p certbot/conf
mkdir -p certbot/www

# Copy nginx configurations
cp nginx.conf nginx/nginx.conf
cp backend.conf nginx/conf.d/backend.conf
cp frontend.conf nginx/conf.d/frontend.conf
cp keycloak.conf nginx/conf.d/keycloak.conf
```

### 3. Initial SSL Certificate Setup

```bash
chmod +x init-letsencrypt.sh
./init-letsencrypt.sh
```

This script will:
- Download recommended TLS parameters
- Create temporary certificates
- Request real certificates from Let's Encrypt
- Automatically renew certificates every 12 hours

### 4. Start All Services

```bash
docker-compose up -d
```

### 5. Configure Keycloak

1. Access Keycloak Admin Console: https://keycloak.analist24.it.com/admin
2. Login with credentials from `.env` (KEYCLOAK_ADMIN_USERNAME/PASSWORD)
3. Create realm: `web-realm`
4. Create backend client:
   - Client ID: `django-backend`
   - Client authentication: ON
   - Valid redirect URIs: `https://fullapi.analist24.it.com/*`
   - Web origins: `https://fullapi.analist24.it.com`
5. Create frontend client:
   - Client ID: `angular-frontend`
   - Client authentication: OFF
   - Valid redirect URIs: `https://angular.analist24.it.com/*`
   - Web origins: `https://angular.analist24.it.com`
6. Get public key:
   - Realm Settings → Keys → RS256 → Public key
   - Add to `.env` as `KEYCLOAK_PUBLIC_KEY`
7. Get backend client secret:
   - Clients → django-backend → Credentials tab
   - Add to `.env` as `KEYCLOAK_CLIENT_SECRET`

### 6. Update Environment and Restart

```bash
nano .env  # Add KEYCLOAK_PUBLIC_KEY and KEYCLOAK_CLIENT_SECRET
docker-compose down
docker-compose up -d
```

## Service URLs

- **Frontend**: https://angular.analist24.it.com
- **Backend API**: https://fullapi.analist24.it.com/api
- **Backend Admin**: https://fullapi.analist24.it.com/admin
- **Keycloak**: https://keycloak.analist24.it.com
- **API Docs**: https://fullapi.analist24.it.com/api/schema/swagger-ui/

## SSL Certificate Management

### Auto-Renewal

Certbot automatically renews certificates every 12 hours. No manual intervention needed.

### Manual Renewal

```bash
docker-compose run --rm certbot renew
docker-compose exec nginx nginx -s reload
```

### Check Certificate Expiry

```bash
docker-compose run --rm certbot certificates
```

## Monitoring & Logs

```bash
# View all logs
docker-compose logs -f

# View specific service
docker-compose logs -f backend
docker-compose logs -f nginx
docker-compose logs -f keycloak

# Check service health
docker-compose ps
```

## Useful Commands

### Restart Services
```bash
docker-compose restart
```

### Update Services
```bash
docker-compose pull
docker-compose up -d --build
```

### Database Backup
```bash
docker-compose exec postgres pg_dump -U postgres prisco_db > backup.sql
```

### Database Restore
```bash
cat backup.sql | docker-compose exec -T postgres psql -U postgres prisco_db
```

### Access Django Shell
```bash
docker-compose exec backend python manage.py shell
```

### Create Django Superuser
```bash
docker-compose exec backend python manage.py createsuperuser
```

## Security Checklist

- [x] SSL/TLS enabled (Let's Encrypt)
- [x] HTTPS redirect enabled
- [x] HSTS headers configured
- [x] Strong database passwords
- [x] Django SECRET_KEY generated
- [x] DEBUG=False in production
- [x] CORS properly configured
- [x] Client max body size limited
- [x] Security headers (X-Frame-Options, etc.)

## Troubleshooting

### SSL Certificate Issues

**Problem**: Certificate request fails
```bash
# Check DNS propagation
dig fullapi.analist24.it.com
dig angular.analist24.it.com
dig keycloak.analist24.it.com

# Test with staging (remove --staging flag when working)
# Edit init-letsencrypt.sh, set staging=1
```

**Problem**: Certificate expired
```bash
docker-compose run --rm certbot renew --force-renewal
docker-compose exec nginx nginx -s reload
```

### Keycloak Connection Issues

**Problem**: Backend can't connect to Keycloak
```bash
# Check Keycloak is running
docker-compose ps keycloak

# Check logs
docker-compose logs keycloak

# Verify network
docker-compose exec backend ping keycloak
```

### CORS Issues

**Problem**: Frontend can't access backend
```bash
# Check CORS settings in .env
CORS_ALLOWED_ORIGINS=https://angular.analist24.it.com

# Restart backend
docker-compose restart backend
```

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Test connection
docker-compose exec backend python manage.py dbshell
```

## Performance Optimization

### Enable HTTP/2
Already enabled in nginx configuration.

### Enable Gzip Compression
Already enabled in nginx configuration.

### Database Connection Pooling
Configure in Django settings:
```python
DATABASES = {
    'default': {
        'CONN_MAX_AGE': 600,
        'OPTIONS': {
            'connect_timeout': 10,
        }
    }
}
```

### Static File Caching
Static files already configured with 30-day cache.

## Backup Strategy

### Automated Backups

Create a backup script:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T postgres pg_dump -U postgres prisco_db | gzip > backups/db_$DATE.sql.gz
find backups/ -name "db_*.sql.gz" -mtime +7 -delete
```

Schedule with cron:
```bash
0 2 * * * /path/to/backup.sh
```

## Monitoring

### Health Checks

All services have health checks configured in docker-compose.yml.

Check status:
```bash
docker-compose ps
```

### Resource Usage

```bash
docker stats
```

### Nginx Access Logs

```bash
docker-compose exec nginx tail -f /var/log/nginx/access.log
```

## Updating

### Update Docker Images

```bash
docker-compose pull
docker-compose up -d
```

### Update Application Code

```bash
git pull
docker-compose up -d --build
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py collectstatic --noinput
```

## Support

For issues or questions:
1. Check logs: `docker-compose logs -f [service]`
2. Verify environment variables in `.env`
3. Check DNS configuration
4. Verify SSL certificates: `docker-compose run --rm certbot certificates`
