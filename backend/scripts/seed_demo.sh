#!/bin/bash
set -e

echo "=== Seed Demo Data ==="

python manage.py seed_demo "$@"

echo "=== Seeding Complete ==="
