from fastapi import APIRouter, Depends, status, Path
from typing import Annotated
import uuid
from ..dependencies import CurrentUser, TaskServ
from ..schemas.task import TaskCreate, TaskUpdate, TaskResponse, TaskListResponse, TaskStatusUpdate
from ..schemas.task_filters import TaskFilterParams

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


@router.patch("/{task_id}/status", response_model=TaskResponse)
def update_task_status(
    task_id: Annotated[uuid.UUID, Path()],
    status_update: TaskStatusUpdate,
    current_user: CurrentUser,
    service: TaskServ,
):
    return service.update_task_status(current_user.id, task_id, status_update.status)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: Annotated[uuid.UUID, Path()],
    current_user: CurrentUser,
    service: TaskServ,
):
    service.delete_task(current_user.id, task_id)
    return None
