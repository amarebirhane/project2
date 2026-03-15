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
    def get_tasks_for_user(db: Session, user: User, skip: int = 0, limit: int = 100, search: Optional[str] = None):
        """
        Retrieves a list of tasks accessible to the given user.
        Admin/Managers see all tasks; normal users only see their own.
        
        Args:
            db: Database session
            user: The authenticated User model instance
            skip: Number of records to bypass for pagination
            limit: Maximum number of records to return
            search: Optional text string for filtering tasks by title
            
        Returns:
            A list of Task model instances
        """
        if user.role in ["admin", "manager"]:
            return task_crud.get_tasks(db, skip=skip, limit=limit, search=search)
        return task_crud.get_user_tasks(db, user_id=str(user.id), skip=skip, limit=limit, search=search)

    @staticmethod
    def create_task(db: Session, user: User, task_in: TaskCreate):
        """
        Creates a new task owned by the specified user.
        
        Args:
            db: Database session
            user: The User model instance who will own the task
            task_in: Schema containing task creation details
            
        Returns:
            The newly created Task model instance
        """
        return task_crud.create_user_task(db, task=task_in, user_id=str(user.id))

    @staticmethod
    def update_task_securely(db: Session, user: User, task_id: str, task_in: TaskUpdate):
        """
        Updates a task after verifying that the user has sufficient permissions.
        
        Args:
            db: Database session
            user: The authenticated User model instance
            task_id: The UUID of the task to update
            task_in: Schema containing updated task fields
            
        Returns:
            The updated Task model instance
            
        Raises:
            HTTPException: If task not found or user lacks update permissions
        """
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
        """
        Deletes a task after verifying user permissions.
        
        Args:
            db: Database session
            user: The authenticated User model instance
            task_id: The UUID of the task to delete
            
        Returns:
            The deleted Task model instance
            
        Raises:
            HTTPException: If task not found or user lacks delete permissions
        """
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
        """
        Retrieves categories accessible to the user.
        
        Args:
            db: Database session
            user: User model instance
            skip: Pagination offset
            limit: Record limit
            
        Returns:
            A list of Category model instances
        """
        if user.role in ["admin", "manager"]:
            return category_crud.get_categories(db, skip=skip, limit=limit)
        return category_crud.get_user_categories(db, user_id=str(user.id), skip=skip, limit=limit)

    @staticmethod
    def create_category(db: Session, user: User, cat_in: CategoryCreate):
        """
        Creates a new task category for the user.
        
        Args:
            db: Database session
            user: Owner User model instance
            cat_in: Schema for category creation
            
        Returns:
            The newly created Category instance
        """
        return category_crud.create_user_category(db, category=cat_in, user_id=str(user.id))

    @staticmethod
    def delete_category_securely(db: Session, user: User, cat_id: str):
        """
        Deletes a category after permission check.
        
        Args:
            db: Database session
            user: Authenticated User model instance
            cat_id: UUID of the category to delete
            
        Returns:
            The deleted Category instance
            
        Raises:
            HTTPException: If category not found or unauthorized
        """
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
