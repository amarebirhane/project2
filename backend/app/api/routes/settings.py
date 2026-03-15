from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.crud.setting_crud import get_settings, get_setting, create_setting, update_setting, delete_setting
from app.schemas.setting_schema import SettingResponse, SettingCreate, SettingUpdate
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[SettingResponse])
def read_settings(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve settings. Public settings available to all users, all settings to admins.
    """
    if current_user.role == "admin":
        return get_settings(db, skip=skip, limit=limit)
    return get_settings(db, skip=skip, limit=limit, public_only=True)

@router.post("/", response_model=SettingResponse)
def create_new_setting(
    *,
    db: Session = Depends(deps.get_db),
    setting_in: SettingCreate,
    current_user: User = Depends(deps.get_current_active_admin_user),
) -> Any:
    """
    Create new setting. (Admin only)
    """
    setting = get_setting(db, key=setting_in.key)
    if setting:
        raise HTTPException(
            status_code=400,
            detail="Setting with this key already exists.",
        )
    return create_setting(db, setting_in=setting_in)

@router.put("/{key}", response_model=SettingResponse)
def update_existing_setting(
    *,
    db: Session = Depends(deps.get_db),
    key: str,
    setting_in: SettingUpdate,
    current_user: User = Depends(deps.get_current_active_admin_user),
) -> Any:
    """
    Update a setting. (Admin only)
    """
    setting = get_setting(db, key=key)
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    return update_setting(db, db_setting=setting, setting_in=setting_in)

@router.delete("/{key}", response_model=SettingResponse)
def delete_existing_setting(
    *,
    db: Session = Depends(deps.get_db),
    key: str,
    current_user: User = Depends(deps.get_current_active_admin_user),
) -> Any:
    """
    Delete a setting. (Admin only)
    """
    setting = get_setting(db, key=key)
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    delete_setting(db, setting)
    return setting
