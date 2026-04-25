from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from ..database import get_db
from ..repositories.task_repository import TaskRepository
from ..schemas.task import TaskCreate, TaskResponse, TaskListResponse
from ..models.task import TaskStatus
from ..dependencies import get_current_user
from ..models.user import User
router = APIRouter()
@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(task: TaskCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    repo = TaskRepository(db)
    return repo.create(task)
@router.get("/", response_model=TaskListResponse)
def read_tasks(
    status: Optional[TaskStatus] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    repo = TaskRepository(db)
    items, total = repo.get_all(page=page, page_size=page_size, status=status.value if status else None)
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size
    }
@router.get("/{task_id}", response_model=TaskResponse)
def read_task(task_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    repo = TaskRepository(db)
    task = repo.get_by_id(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task
@router.put("/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, task: TaskCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    repo = TaskRepository(db)
    updated = repo.update(task_id, task)
    if not updated:
        raise HTTPException(status_code=404, detail="Task not found")
    return updated
@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    repo = TaskRepository(db)
    if not repo.delete(task_id):
        raise HTTPException(status_code=404, detail="Task not found")
    return None
