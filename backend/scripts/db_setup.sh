#!/bin/bash
set -e

echo "=== Database Setup Script ==="

echo "Making migrations..."
python manage.py makemigrations

echo "Running migrations..."
python manage.py migrate

echo "Creating superuser..."
python manage.py create_superuser

echo "=== Setup Complete ==="
