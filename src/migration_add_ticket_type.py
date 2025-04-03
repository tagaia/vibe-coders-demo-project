"""
Migration script to add the ticket_type field to existing tickets in the database.
This script adds the ticket_type field to all existing records with "Backend" as the default.
"""

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Database configuration
DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
session = SessionLocal()

def migrate():
    print("Starting migration to add ticket_type field to existing records...")
    
    # For SQLite, we need to use raw SQL to alter the table
    # First check if the column already exists
    with engine.connect() as conn:
        # Get table info
        result = conn.execute(text("PRAGMA table_info(servicefaelle)"))
        columns = [row[1] for row in result.fetchall()]
        
        # Check if ticket_type column exists
        if 'ticket_type' not in columns:
            print("Adding ticket_type column to servicefaelle table...")
            
            # Add the column to the table
            conn.execute(text("ALTER TABLE servicefaelle ADD COLUMN ticket_type VARCHAR(50) DEFAULT 'Backend' NOT NULL"))
            
            # Commit the transaction
            conn.commit()
            print("Column added successfully.")
        else:
            print("ticket_type column already exists, skipping...")
    
    print("Migration completed.")

if __name__ == "__main__":
    migrate()