from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.crud.user_crud import get_users, get_user, delete_user, update_user
from app.schemas.user_schema import UserResponse, UserUpdateMe, PasswordChange, UserUpdate
from app.services.auth_service import auth_service
from app.models.user import User

router = APIRouter()

@router.get("/me", response_model=UserResponse)
def read_user_me(
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get current user.
    """
    return current_user

@router.put("/me", response_model=UserResponse)
def update_user_me(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserUpdateMe,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update own user profile.
    """
    user = update_user(db, db_user=current_user, user_in=UserUpdate(**user_in.model_dump()))
    return user

@router.patch("/me/password")
def change_password_me(
    *,
    db: Session = Depends(deps.get_db),
    password_in: PasswordChange,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Change own password.
    """
    auth_service.change_password(
        db, user=current_user, old_password=password_in.old_password, new_password=password_in.new_password
    )
    return {"msg": "Password updated successfully"}

@router.get("/", response_model=List[UserResponse])
def read_users(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_admin_user),
) -> Any:
    """
    Retrieve users. (Admin only)
    """
    users = get_users(db, skip=skip, limit=limit)
    return users

@router.get("/{user_id}", response_model=UserResponse)
def read_user_by_id(
    user_id: str,
    current_user: User = Depends(deps.get_current_active_admin_user),
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Get a specific user by id. (Admin only)
    """
    user = get_user(db, user_id=user_id)
    if user == current_user:
        return user
    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this id does not exist in the system",
        )
    return user

@router.delete("/{user_id}", response_model=UserResponse)
def delete_user_route(
    user_id: str,
    current_user: User = Depends(deps.get_current_active_admin_user),
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Delete a user. (Admin only)
    """
    user = get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    delete_user(db, user)
    return user
