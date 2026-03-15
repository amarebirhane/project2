from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.task import Task
from app.schemas.task_schema import TaskCreate, TaskUpdate

def get_tasks(db: Session, skip: int = 0, limit: int = 100, search: Optional[str] = None):
    query = db.query(Task)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(or_(Task.title.ilike(search_filter), Task.description.ilike(search_filter)))
    return query.offset(skip).limit(limit).all()

def get_user_tasks(db: Session, user_id: str, skip: int = 0, limit: int = 100, search: Optional[str] = None):
    query = db.query(Task).filter(Task.user_id == user_id)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(or_(Task.title.ilike(search_filter), Task.description.ilike(search_filter)))
    return query.offset(skip).limit(limit).all()

def create_user_task(db: Session, task: TaskCreate, user_id: str):
    db_task = Task(**task.model_dump(), user_id=user_id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

def update_task(db: Session, db_task: Task, task_in: TaskUpdate):
    update_data = task_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_task, field, value)
    db.commit()
    db.refresh(db_task)
    return db_task

def delete_task(db: Session, db_task: Task):
    db.delete(db_task)
    db.commit()
    return True
