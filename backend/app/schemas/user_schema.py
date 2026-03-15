from pydantic import BaseModel, EmailStr, field_validator, Field
from uuid import UUID
from datetime import datetime
from typing import Optional
from app.utils.sanitization import sanitize_text
import re

class UserBase(BaseModel):
    email: EmailStr = Field(..., description="The unique email address of the user")
    username: str = Field(..., description="The unique username pick by the user")
    first_name: str = Field(..., description="The user's legal first name")
    last_name: str = Field(..., description="The user's legal last name")

    @field_validator('username', 'first_name', 'last_name', mode='before')
    @classmethod
    def sanitize_user_text(cls, v):
        if isinstance(v, str):
            return sanitize_text(v)
        return v

class UserCreate(UserBase):
    password: str = Field(..., description="The user's password, must meet strength requirements")

    @field_validator('password')
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not re.search(r"[A-Z]", v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r"[a-z]", v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r"\d", v):
            raise ValueError('Password must contain at least one digit')
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError('Password must contain at least one special character')
        return v

class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, description="The user's updated username")
    first_name: Optional[str] = Field(None, description="The user's updated first name")
    last_name: Optional[str] = Field(None, description="The user's updated last name")
    email: Optional[EmailStr] = Field(None, description="The user's updated email address")
    password: Optional[str] = Field(None, description="The user's updated password")
    role: Optional[str] = Field(None, description="The user's updated role (Admin only)") # Admin only should use this normally

    @field_validator('username', 'first_name', 'last_name', mode='before')
    @classmethod
    def sanitize_user_update_text(cls, v):
        if isinstance(v, str):
            return sanitize_text(v)
        return v

    @field_validator('password')
    @classmethod
    def validate_password_strength(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        return UserCreate.validate_password_strength(v)

class UserUpdateMe(BaseModel):
    username: Optional[str] = Field(None, description="The user's updated username")
    first_name: Optional[str] = Field(None, description="The user's updated first name")
    last_name: Optional[str] = Field(None, description="The user's updated last name")
    email: Optional[EmailStr] = Field(None, description="The user's updated email address")

class PasswordChange(BaseModel):
    old_password: str = Field(..., description="The user's current password")
    new_password: str = Field(..., description="The user's new password, must meet strength requirements")

    @field_validator('new_password')
    @classmethod
    def validate_new_password_strength(cls, v: str) -> str:
        return UserCreate.validate_password_strength(v)

class PasswordResetRequest(BaseModel):
    email: EmailStr = Field(..., description="The email address associated with the account to reset")

class PasswordReset(BaseModel):
    token: str = Field(..., description="The password reset token received via email")
    new_password: str = Field(..., description="The user's new password")

    @field_validator('new_password')
    @classmethod
    def validate_new_password_strength(cls, v: str) -> str:
        return UserCreate.validate_password_strength(v)

class UserResponse(UserBase):
    id: UUID = Field(..., description="The unique identifier (UUID) of the user")
    role: str = Field(..., description="The role assigned to the user (e.g., user, manager, admin)")
    is_active: Optional[bool] = Field(True, description="Whether the user account is active")
    is_two_factor_enabled: Optional[bool] = Field(False, description="Whether Two-Factor Authentication is enabled")
    created_at: datetime = Field(..., description="The date and time the user account was created")

    class Config:
        from_attributes = True
