from typing import Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api import deps
from app.services.task_service import task_service
from app.schemas.category_schema import CategoryResponse, CategoryCreate
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[CategoryResponse])
def read_categories(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve categories.
    """
    return task_service.get_categories_for_user(db, user=current_user, skip=skip, limit=limit)

@router.post("/", response_model=CategoryResponse)
def create_category(
    *,
    db: Session = Depends(deps.get_db),
    category_in: CategoryCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new category.
    """
    return task_service.create_category(db, user=current_user, cat_in=category_in)

@router.delete("/{id}", response_model=CategoryResponse)
def delete_category(
    *,
    db: Session = Depends(deps.get_db),
    id: str,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete a category.
    """
    task_service.delete_category_securely(db, user=current_user, cat_id=id)
    return {"message": "Category deleted successfully"}
