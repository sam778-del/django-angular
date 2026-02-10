#!/bin/bash
set -e

echo "=== First Time Setup ==="

echo "Installing dependencies..."
pip install -r requirements.txt

echo "Making migrations..."
python manage.py makemigrations

echo "Running migrations..."
python manage.py migrate

echo "Creating superuser..."
python manage.py create_superuser

echo "Seeding demo data..."
python manage.py seed_demo

echo "=== Setup Complete ==="
echo ""
echo "Demo users created:"
echo "  Admin:    demo_admin@example.com / DemoAdmin123!"
echo "  Operator: demo_operator@example.com / DemoOperator123!"
echo "  Viewer:   demo_viewer@example.com / DemoViewer123!"