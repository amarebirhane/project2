from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api import deps
from app.services.auth_service import auth_service
from app.schemas.user_schema import UserCreate, UserResponse, PasswordResetRequest, PasswordReset

router = APIRouter()

@router.post("/register", response_model=UserResponse)
def register(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserCreate,
) -> Any:
    """
    Create new user.
    """
    return auth_service.register_new_user(db, user_in)

@router.post("/login")
def login(
    db: Session = Depends(deps.get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = auth_service.authenticate_user(
        db, identifier=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Incorrect email/username or password"
        )
    
    return auth_service.create_login_token(str(user.id))

@router.post("/password-reset/request")
def request_password_reset(
    data: PasswordResetRequest
) -> Any:
    """
    Generate a password reset token. In a real app, this would be emailed.
    """
    token = auth_service.create_password_reset_token(data.email)
    return {"msg": "Password reset token generated", "token": token}

@router.post("/password-reset/reset")
def reset_password(
    data: PasswordReset,
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Reset password using a token.
    """
    auth_service.reset_password(db, token=data.token, new_password=data.new_password)
    return {"msg": "Password updated successfully"}
