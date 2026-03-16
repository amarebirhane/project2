from typing import Optional, Any
from datetime import datetime
from pydantic import BaseModel, UUID4

class AuditLogBase(BaseModel):
    action: str = Field(..., description="The specific action performed (e.g., login, create_task)")
    target_type: Optional[str] = Field(None, description="The type of object affected by the action")
    target_id: Optional[str] = Field(None, description="The unique ID of the affected object")
    details: Optional[dict] = Field(None, description="Additional context or metadata about the action")
    ip_address: Optional[str] = Field(None, description="The IP address from which the action originated")

class AuditLogCreate(AuditLogBase):
    user_id: Optional[UUID4] = None
    username: Optional[str] = None

class AuditLogResponse(AuditLogBase):
    id: UUID4 = Field(..., description="Unique persistent identifier for the audit log entry")
    user_id: Optional[UUID4] = Field(None, description="The ID of the user who performed the action")
    username: Optional[str] = Field(None, description="The username of the actor")
    created_at: datetime = Field(..., description="Timestamp of when the event was logged")

    class Config:
        from_attributes = True
