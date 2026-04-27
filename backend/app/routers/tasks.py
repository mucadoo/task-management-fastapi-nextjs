from fastapi import APIRouter, Depends, HTTPException, status, Query, Path
from typing import Optional, Annotated
import uuid
from ..dependencies import CurrentUser, TaskServ
from ..schemas.task import TaskCreate, TaskUpdate, TaskResponse, TaskListResponse
from ..schemas.task_filters import TaskFilterParams
from ..models.task import TaskStatus, TaskPriority
from ..exceptions import NotFoundError

router = APIRouter()


@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task: TaskCreate,
    current_user: CurrentUser,
    service: TaskServ,
):
    return service.create_task(current_user.id, task)


@router.get("/", response_model=TaskListResponse)
def read_tasks(
    current_user: CurrentUser,
    service: TaskServ,
    filters: Annotated[TaskFilterParams, Depends()],
):
    return service.get_tasks(
        user_id=current_user.id,
        page=filters.page,
        page_size=filters.page_size,
        status=filters.status.value if filters.status else None,
        priority=filters.priority.value if filters.priority else None,
        q=filters.q,
        sort_by=filters.sort_by.value,
        sort_dir=filters.sort_dir.value,
    )


@router.get("/{task_id}", response_model=TaskResponse)
def read_task(
    task_id: Annotated[uuid.UUID, Path()],
    current_user: CurrentUser,
    service: TaskServ,
):
    return service.get_task(current_user.id, task_id)


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: Annotated[uuid.UUID, Path()],
    task: TaskUpdate,
    current_user: CurrentUser,
    service: TaskServ,
):
    return service.update_task(current_user.id, task_id, task)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: Annotated[uuid.UUID, Path()],
    current_user: CurrentUser,
    service: TaskServ,
):
    service.delete_task(current_user.id, task_id)
    return None


@router.post("/{task_id}/toggle", response_model=TaskResponse)
def toggle_task(
    task_id: Annotated[uuid.UUID, Path()],
    current_user: CurrentUser,
    service: TaskServ,
):
    return service.toggle_task(current_user.id, task_id)
