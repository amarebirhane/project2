from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class AttachmentBase(BaseModel):
    task_id: UUID
    file_name: str
    file_type: str
    file_size: int

class AttachmentCreate(AttachmentBase):
    file_path: str

class AttachmentResponse(AttachmentBase):
    id: UUID
    file_path: str
    uploaded_at: datetime

    model_config = ConfigDict(from_attributes=True)
