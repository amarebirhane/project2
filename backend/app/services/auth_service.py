from datetime import timedelta
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.core.config import settings
from app.crud.user_crud import get_user_by_email, get_user_by_username, create_user, update_user
from app.schemas.user_schema import UserCreate, UserUpdate
from app.utils.token import create_access_token
from app.utils.hash import verify_password

class AuthService:
    @staticmethod
    def register_new_user(db: Session, user_in: UserCreate):
        user = get_user_by_email(db, email=user_in.email)
        if user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email already exists.",
            )
        return create_user(db, user=user_in, role="user")


    @staticmethod
    def authenticate_user(db: Session, identifier: str, password: str):
        # Try email first
        user = get_user_by_email(db, email=identifier)
        if not user:
            # Try username
            user = get_user_by_username(db, username=identifier)
            
        if not user or not verify_password(password, user.hashed_password):
            return None
        return user

    @staticmethod
    def change_password(db: Session, user, old_password: str, new_password: str):
        if not verify_password(old_password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect old password",
            )
        update_user(db, db_user=user, user_in=UserUpdate(password=new_password))
        return True

    @staticmethod
    def create_password_reset_token(email: str):
        # In a real app, this would be a specific token with shorter expiry
        # For now, we reuse the same logic
        return create_access_token(subject=email, expires_delta=timedelta(hours=1))

    @staticmethod
    def reset_password(db: Session, token: str, new_password: str):
        try:
            from jose import jwt
            payload = jwt.decode(
                token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
            )
            email: str = payload.get("sub")
            if email is None:
                raise HTTPException(status_code=400, detail="Invalid token")
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid or expired token")
            
        user = get_user_by_email(db, email=email)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        update_user(db, db_user=user, user_in=UserUpdate(password=new_password))
        return True

    @staticmethod
    def create_login_token(user_id: str):
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        return {
            "access_token": create_access_token(
                user_id, expires_delta=access_token_expires
            ),
            "token_type": "bearer",
        }

auth_service = AuthService()
