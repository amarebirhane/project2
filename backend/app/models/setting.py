from sqlalchemy import Column, String, Boolean
from app.db.base import Base

class Setting(Base):
    __tablename__ = "settings"

    key = Column(String, primary_key=True, index=True)
    value = Column(String, nullable=False)
    description = Column(String, nullable=True)
    is_public = Column(Boolean, default=False) # Whether this setting is visible to non-admins
