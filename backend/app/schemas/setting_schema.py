from pydantic import BaseModel
from typing import Optional

class SettingBase(BaseModel):
    key: str
    value: str
    description: Optional[str] = None
    is_public: bool = False

class SettingCreate(SettingBase):
    pass

class SettingUpdate(BaseModel):
    value: Optional[str] = None
    description: Optional[str] = None
    is_public: Optional[bool] = None

class SettingResponse(SettingBase):
    class Config:
        from_attributes = True
