from pydantic import BaseModel
from uuid import UUID
from typing import Optional

class CategoryBase(BaseModel):
    name: str

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None

class CategoryResponse(CategoryBase):
    id: UUID
    user_id: UUID

    class Config:
        from_attributes = True
