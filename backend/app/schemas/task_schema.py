from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional
from app.schemas.category_schema import CategoryResponse

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str
    status: str = "pending"
    deadline: Optional[datetime] = None
    category_id: Optional[UUID] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    deadline: Optional[datetime] = None
    category_id: Optional[UUID] = None

class TaskResponse(TaskBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    category: Optional[CategoryResponse] = None

    class Config:
        from_attributes = True
