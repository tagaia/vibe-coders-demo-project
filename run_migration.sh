#!/bin/bash
echo "Running migration to add ticket_type field to existing records..."
PYTHONPATH=src pdm run python src/migration_add_ticket_type.py
echo "Migration completed!"