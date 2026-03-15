from typing import Optional, Any
from datetime import datetime
from pydantic import BaseModel, UUID4

class AuditLogBase(BaseModel):
    action: str
    target_type: Optional[str] = None
    target_id: Optional[str] = None
    details: Optional[dict] = None
    ip_address: Optional[str] = None

class AuditLogCreate(AuditLogBase):
    user_id: Optional[UUID4] = None
    username: Optional[str] = None

class AuditLogResponse(AuditLogBase):
    id: UUID4
    user_id: Optional[UUID4] = None
    username: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
