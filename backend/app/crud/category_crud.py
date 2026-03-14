from sqlalchemy.orm import Session
from app.models.category import Category
from app.schemas.category_schema import CategoryCreate, CategoryUpdate

def get_categories(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Category).offset(skip).limit(limit).all()

def get_category(db: Session, category_id: str):
    return db.query(Category).filter(Category.id == category_id).first()

def get_user_categories(db: Session, user_id: str, skip: int = 0, limit: int = 100):
    return db.query(Category).filter(Category.user_id == user_id).offset(skip).limit(limit).all()

def create_user_category(db: Session, category: CategoryCreate, user_id: str):
    db_category = Category(**category.model_dump(), user_id=user_id)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

def update_category(db: Session, db_category: Category, category_in: CategoryUpdate):
    for field, value in category_in.model_dump(exclude_unset=True).items():
        setattr(db_category, field, value)
    db.commit()
    db.refresh(db_category)
    return db_category

def delete_category(db: Session, db_category: Category):
    db.delete(db_category)
    db.commit()
    return True
