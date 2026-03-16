import sys
import os
# Add parent directory to path so we can import app
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from app.services.backup_service import backup_service
import logging

# Configure logging to see output
logging.basicConfig(level=logging.INFO)

print("Starting backup test...")
filepath = backup_service.create_backup()

if filepath and os.path.exists(filepath):
    print(f"SUCCESS: Backup created at {filepath}")
    print(f"File size: {os.path.getsize(filepath)} bytes")
else:
    print("FAILED: Backup could not be created. Check logs for details.")
