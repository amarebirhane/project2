from datetime import timedelta
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.core.config import settings
from app.crud.user_crud import get_user_by_email, create_user
from app.schemas.user_schema import UserCreate
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
        return create_user(db, user=user_in)

    @staticmethod
    def authenticate_user(db: Session, email: str, password: str):
        user = get_user_by_email(db, email=email)
        if not user or not verify_password(password, user.hashed_password):
            return None
        return user

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
