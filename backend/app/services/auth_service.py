from datetime import timedelta
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.core.config import settings
from app.crud.user_crud import get_user_by_email, get_user_by_username, create_user, update_user
from app.schemas.user_schema import UserCreate, UserUpdate
from app.utils.token import create_access_token
from app.utils.hash import verify_password
from app.services.audit_service import audit_service
import pyotp

class AuthService:
    @staticmethod
    def register_new_user(db: Session, user_in: UserCreate):
        """
        Creates a new user account in the system.
        
        Args:
            db: Database session
            user_in: Schema containing user registration details
            
        Returns:
            The newly created User model instance
            
        Raises:
            HTTPException: If a user with the same email already exists
        """
        user = get_user_by_email(db, email=user_in.email)
        if user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email already exists.",
            )
        new_user = create_user(db, user=user_in, role="user")
        audit_service.log(db, user_id=new_user.id, username=new_user.username, action="register", target_type="user", target_id=str(new_user.id))
        return new_user


    @staticmethod
    def authenticate_user(db: Session, identifier: str, password: str):
        """
        Authenticates a user using email or username and password.
        
        Args:
            db: Database session
            identifier: Either the user's email or username
            password: The plain text password to verify
            
        Returns:
            The User model instance if authentication succeeds, None otherwise
            
        Raises:
            HTTPException: If the account is found but inactive
        """
        # Try email first
        user = get_user_by_email(db, email=identifier)
        if not user:
            # Try username
            user = get_user_by_username(db, username=identifier)
            
        if not user or not verify_password(password, user.hashed_password):
            audit_service.log(db, username=identifier, action="login_failed", details={"reason": "invalid_credentials"})
            return None
        
        if user.is_active is False:
            audit_service.log(db, user_id=user.id, username=user.username, action="login_denied", details={"reason": "account_inactive"})
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is inactive")

        return user

    @staticmethod
    def verify_2fa(user, code: str):
        """
        Verifies a Time-based One-Time Password (TOTP).
        
        Args:
            user: The User model instance
            code: The 6-digit TOTP code provided by the user
            
        Returns:
            True if the code is valid, False otherwise
        """
        if not user.two_factor_secret:
            return False
        totp = pyotp.TOTP(user.two_factor_secret)
        return totp.verify(code)

    @staticmethod
    def setup_2fa(db: Session, user):
        """
        Generates a new TOTP secret for a user and stores it.
        
        Args:
            db: Database session
            user: The User model instance
            
        Returns:
            The generated random base32 secret
        """
        secret = pyotp.random_base32()
        user.two_factor_secret = secret
        db.commit()
        return secret

    @staticmethod
    def change_password(db: Session, user, old_password: str, new_password: str):
        """
        Updates a user's password after verifying the old one.
        
        Args:
            db: Database session
            user: The User model instance
            old_password: The user's current original password
            new_password: The new password to be hashed and stored
            
        Returns:
            True if the password was successfully updated
            
        Raises:
            HTTPException: If the old password verification fails
        """
        if not verify_password(old_password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect old password",
            )
        update_user(db, db_user=user, user_in=UserUpdate(password=new_password))
        return True

    @staticmethod
    def create_password_reset_token(email: str):
        """
        Creates a time-limited token for resetting a password.
        
        Args:
            email: The email address associated with the account
            
        Returns:
            A JWT token valid for 1 hour
        """
        # In a real app, this would be a specific token with shorter expiry
        # For now, we reuse the same logic
        return create_access_token(subject=email, expires_delta=timedelta(hours=1))

    @staticmethod
    def reset_password(db: Session, token: str, new_password: str):
        """
        Resets a user's password using a reset token.
        
        Args:
            db: Database session
            token: The JWT reset token
            new_password: The new password to be set
            
        Returns:
            True if the password was successfully reset
            
        Raises:
            HTTPException: If the token is invalid, expired, or the user doesn't exist
        """
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
        """
        Generates a new access token for a user after successful login.
        
        Args:
            user_id: The unique identifier of the user
            
        Returns:
            A dictionary containing the access token and token type
        """
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        return {
            "access_token": create_access_token(
                user_id, expires_delta=access_token_expires
            ),
            "token_type": "bearer",
        }

auth_service = AuthService()
