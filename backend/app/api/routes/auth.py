from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api import deps
from app.services.auth_service import auth_service
from app.services.audit_service import audit_service
from app.schemas.user_schema import UserCreate, UserResponse, PasswordResetRequest, PasswordReset, Token, RefreshTokenRequest
from app.core.dependencies import limiter
from app.services.email_service import email_service

router = APIRouter()

@router.post("/register", response_model=UserResponse, summary="Register a new user")
@limiter.limit("5/minute")
def register(
    request: Request,
    background_tasks: BackgroundTasks,
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserCreate,
) -> Any:
    """
    Create new user.
    """
    user = auth_service.register_new_user(db, user_in)
    
    # Send welcome email in the background
    background_tasks.add_task(
        email_service.send_email,
        to_email=user.email,
        subject="Welcome to TaskMind!",
        body=f"Hi {user.first_name}, your account has been created successfully."
    )
    
    return user

    return user

@router.post("/login", response_model=Token, summary="Login and get access token")
@limiter.limit("5/minute")
def login(
    request: Request,
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
    
    audit_service.log(db, user_id=user.id, username=user.username, action="login")
    return auth_service.create_login_token(str(user.id))

@router.post("/logout", summary="Logout current user")
def logout(
    db: Session = Depends(deps.get_db),
    current_user: Any = Depends(deps.get_current_active_user)
) -> Any:
    """
    Log out the current user.
    """
    audit_service.log(db, user_id=current_user.id, username=current_user.username, action="logout")
    return {"msg": "Logged out successfully"}

@router.post("/refresh", response_model=Token, summary="Refresh access token")
def refresh_token(
    request: Request,
    data: RefreshTokenRequest,
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Refresh access token using a valid refresh token.
    """
    return auth_service.refresh_access_token(db, refresh_token=data.refresh_token)

@router.post("/2fa/setup", summary="Setup 2FA secret")
def setup_2fa(
    db: Session = Depends(deps.get_db),
    current_user: Any = Depends(deps.get_current_active_user)
) -> Any:
    """
    Setup 2FA for the current user.
    """
    secret = auth_service.setup_2fa(db, current_user)
    # Generate provisioning URI for QR code
    from app.core.config import settings
    provisioning_uri = f"otpauth://totp/{settings.PROJECT_NAME}:{current_user.email}?secret={secret}&issuer={settings.PROJECT_NAME}"
    return {"secret": secret, "provisioning_uri": provisioning_uri}

@router.post("/2fa/verify", summary="Verify and enable 2FA")
def verify_2fa_setup(
    db: Session = Depends(deps.get_db),
    code: str = Query(...),
    current_user: Any = Depends(deps.get_current_active_user)
) -> Any:
    """
    Verify and enable 2FA.
    """
    if auth_service.verify_2fa(current_user, code):
        current_user.is_two_factor_enabled = True
        db.commit()
        audit_service.log(db, user_id=current_user.id, username=current_user.username, action="2fa_enabled")
        return {"msg": "2FA enabled successfully"}
    raise HTTPException(status_code=400, detail="Invalid 2FA code")


@router.post("/password-reset/request", summary="Request password reset token")
@limiter.limit("3/minute")
def request_password_reset(
    request: Request,
    data: PasswordResetRequest,
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Request a password reset. Returns a token. If user has 2FA enabled,
    the client must also pass the 2FA code when resetting.
    """
    from app.crud.user_crud import get_user_by_email
    user = get_user_by_email(db, email=data.email)
    token = auth_service.create_password_reset_token(data.email)
    has_2fa = user.is_two_factor_enabled if user else False
    return {"msg": "Password reset token generated", "token": token, "2fa_required": has_2fa}

@router.post("/password-reset/reset", summary="Reset password using token")
@limiter.limit("3/minute")
def reset_password(
    request: Request,
    data: PasswordReset,
    db: Session = Depends(deps.get_db),
    two_fa_code: str = Query(None, alias="code")
) -> Any:
    """
    Reset password using a token. If user has 2FA enabled, requires a valid 2FA code.
    """
    from app.crud.user_crud import get_user_by_email
    from app.utils.token import verify_reset_token
    # Decode the token to get the email so we can check 2FA status
    email = verify_reset_token(data.token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    user = get_user_by_email(db, email=email)
    if user and user.is_two_factor_enabled:
        if not two_fa_code:
            raise HTTPException(status_code=400, detail="2FA code required for password reset")
        if not auth_service.verify_2fa(user, two_fa_code):
            raise HTTPException(status_code=400, detail="Invalid 2FA code")
    auth_service.reset_password(db, token=data.token, new_password=data.new_password)
    audit_service.log(db, user_id=user.id if user else None, username=user.username if user else None, action="password_reset")
    return {"msg": "Password updated successfully"}
