from typing import Any, List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api import deps
from app.services.task_service import task_service
from app.schemas.task_schema import TaskResponse, TaskCreate, TaskUpdate
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[TaskResponse], summary="Retrieve user's tasks")
def read_tasks(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve tasks.
    """
    return task_service.get_tasks_for_user(db, user=current_user, skip=skip, limit=limit, search=search)

@router.post("/", response_model=TaskResponse, summary="Create a new task")
def create_task(
    *,
    db: Session = Depends(deps.get_db),
    task_in: TaskCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new task.
    """
    return task_service.create_task(db, user=current_user, task_in=task_in)

@router.put("/{id}", response_model=TaskResponse, summary="Update an existing task")
def update_task(
    *,
    db: Session = Depends(deps.get_db),
    id: str,
    task_in: TaskUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update a task.
    """
    return task_service.update_task_securely(db, user=current_user, task_id=id, task_in=task_in)

@router.delete("/{id}", summary="Delete a task permanently")
def delete_task(
    *,
    db: Session = Depends(deps.get_db),
    id: str,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete a task.
    """
    task_service.delete_task_securely(db, user=current_user, task_id=id)
    return {"message": "Task deleted successfully"}
