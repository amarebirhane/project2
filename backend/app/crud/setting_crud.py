from sqlalchemy.orm import Session
from app.models.setting import Setting
from app.schemas.setting_schema import SettingCreate, SettingUpdate

def get_setting(db: Session, key: str):
    return db.query(Setting).filter(Setting.key == key).first()

def get_settings(db: Session, skip: int = 0, limit: int = 100, public_only: bool = False):
    query = db.query(Setting)
    if public_only:
        query = query.filter(Setting.is_public == True)
    return query.offset(skip).limit(limit).all()

def create_setting(db: Session, setting_in: SettingCreate):
    db_setting = Setting(
        key=setting_in.key,
        value=setting_in.value,
        description=setting_in.description,
        is_public=setting_in.is_public
    )
    db.add(db_setting)
    db.commit()
    db.refresh(db_setting)
    return db_setting

def update_setting(db: Session, db_setting: Setting, setting_in: SettingUpdate):
    update_data = setting_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_setting, field, value)
    db.commit()
    db.refresh(db_setting)
    return db_setting

def delete_setting(db: Session, db_setting: Setting):
    db.delete(db_setting)
    db.commit()
    return True
