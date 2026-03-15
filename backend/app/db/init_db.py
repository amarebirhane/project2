from sqlalchemy.orm import Session
from app.crud.user_crud import get_user_by_email, get_user_by_username, create_user
from app.schemas.user_schema import UserCreate
from app.models.user import User
from app.core.config import settings

def init_db(db: Session) -> None:
    # Check if admin exists by email or username
    user_by_email = get_user_by_email(db, email=settings.FIRST_SUPERUSER)
    user_by_username = get_user_by_username(db, username=settings.FIRST_SUPERUSER_USERNAME)
    
    if not user_by_email and not user_by_username:
        admin_in = UserCreate(
            email=settings.FIRST_SUPERUSER,
            username=settings.FIRST_SUPERUSER_USERNAME,
            first_name="Admin",
            last_name="User",
            password=settings.FIRST_SUPERUSER_PASSWORD,
        )
        create_user(db, admin_in, role="admin")
        print(f"Default admin created: {settings.FIRST_SUPERUSER} ({settings.FIRST_SUPERUSER_USERNAME})")
    else:
        admin = user_by_username or user_by_email
        # Update admin to match current settings
        from app.schemas.user_schema import UserUpdate
        from app.crud.user_crud import update_user
        
        update_data = UserUpdate(
            email=settings.FIRST_SUPERUSER,
            password=settings.FIRST_SUPERUSER_PASSWORD
        )
        update_user(db, db_user=admin, user_in=update_data)
        print(f"Default admin credentials synchronized for: {settings.FIRST_SUPERUSER_USERNAME}")
