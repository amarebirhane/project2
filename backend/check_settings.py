import sys
import os

# Add the current directory to sys.path
sys.path.append(os.getcwd())

from app.core.config import settings

print(f"PROJECT_NAME: {settings.PROJECT_NAME}")
print(f"FIRST_SUPERUSER: {settings.FIRST_SUPERUSER}")
print(f"FIRST_SUPERUSER_USERNAME: {settings.FIRST_SUPERUSER_USERNAME}")
print(f"FIRST_SUPERUSER_PASSWORD: {settings.FIRST_SUPERUSER_PASSWORD}")
print(f"SQLALCHEMY_DATABASE_URI: {settings.SQLALCHEMY_DATABASE_URI}")
