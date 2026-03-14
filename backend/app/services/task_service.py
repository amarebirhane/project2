from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from uuid import UUID

from app.models.user import User
from app.models.task import Task
from app.models.category import Category
from app.crud import task_crud, category_crud
from app.schemas.task_schema import TaskCreate, TaskUpdate
from app.schemas.category_schema import CategoryCreate, CategoryUpdate

class TaskService:
    @staticmethod
    def get_tasks_for_user(db: Session, user: User, skip: int = 0, limit: int = 100):
        if user.role in ["admin", "manager"]:
            return task_crud.get_tasks(db, skip=skip, limit=limit)
        return task_crud.get_user_tasks(db, user_id=str(user.id), skip=skip, limit=limit)

    @staticmethod
    def create_task(db: Session, user: User, task_in: TaskCreate):
        return task_crud.create_user_task(db, task=task_in, user_id=str(user.id))

    @staticmethod
    def update_task_securely(db: Session, user: User, task_id: str, task_in: TaskUpdate):
        db_task = task_crud.get_task(db, task_id=task_id)
        if not db_task:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
        
        # Admin/Manager can update any task, User can only update their own
        if user.role not in ["admin", "manager"] and db_task.user_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="Not enough permissions to update this task"
            )
        
        return task_crud.update_task(db, db_task=db_task, task_in=task_in)

    @staticmethod
    def delete_task_securely(db: Session, user: User, task_id: str):
        db_task = task_crud.get_task(db, task_id=task_id)
        if not db_task:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
        
        # Admin can delete any task, Users delete their own. Manager might delete team tasks too.
        if user.role != "admin" and db_task.user_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="Not enough permissions to delete this task"
            )
            
        return task_crud.delete_task(db, db_task=db_task)

    @staticmethod
    def get_categories_for_user(db: Session, user: User, skip: int = 0, limit: int = 100):
        if user.role in ["admin", "manager"]:
            return category_crud.get_categories(db, skip=skip, limit=limit)
        return category_crud.get_user_categories(db, user_id=str(user.id), skip=skip, limit=limit)

    @staticmethod
    def create_category(db: Session, user: User, cat_in: CategoryCreate):
        return category_crud.create_user_category(db, category=cat_in, user_id=str(user.id))

    @staticmethod
    def delete_category_securely(db: Session, user: User, cat_id: str):
        db_cat = category_crud.get_category(db, category_id=cat_id)
        if not db_cat:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
            
        if user.role != "admin" and db_cat.user_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="Not enough permissions to delete this category"
            )
        return category_crud.delete_category(db, db_category=db_cat)

task_service = TaskService()
