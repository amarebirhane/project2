from sqlalchemy.orm import Session
from app.crud.user_crud import get_user_by_email, create_user
from app.schemas.user_schema import UserCreate
from app.models.user import User

def init_db(db: Session) -> None:
    # Check if admin exists
    admin = get_user_by_email(db, email="admin@example.com")
    if not admin:
        user_in = UserCreate(
            email="admin@example.com",
            username="admin",
            first_name="Admin",
            last_name="User",
            password="adminpassword123"
        )
        create_user(db, user=user_in, role="admin")
        print("Default admin created: admin@example.com")
    else:
        print("Default admin already exists: admin@example.com")
