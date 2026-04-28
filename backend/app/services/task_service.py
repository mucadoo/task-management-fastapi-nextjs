import uuid
from typing import Optional
from ..repositories.task_repository import TaskRepository
from ..models.task import Task, TaskStatus
from ..schemas.task import TaskCreate, TaskUpdate

from .base_service import BaseService

class TaskService(BaseService[Task, TaskRepository]):
    def __init__(self, task_repo: TaskRepository):
        super().__init__(task_repo, "task")

    def get_tasks(
        self,
        user_id: uuid.UUID,
        page: int,
        page_size: int,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        q: Optional[str] = None,
        sort_by: str = "created_at",
        sort_dir: str = "desc",
    ):
        return self.repository.get_all(
            user_id=user_id,
            page=page,
            page_size=page_size,
            status=status,
            priority=priority,
            q=q,
            sort_by=sort_by,
            sort_dir=sort_dir,
        )

    def get_task(self, user_id: uuid.UUID, task_id: uuid.UUID) -> Task:
        return self.get_or_404(user_id, task_id)

    def create_task(self, user_id: uuid.UUID, task_data: TaskCreate) -> Task:
        return self.create_with_commit(user_id, task_data)

    def update_task(
        self, user_id: uuid.UUID, task_id: uuid.UUID, task_data: TaskUpdate
    ) -> Task:
        return self.update_with_commit(user_id, task_id, task_data)

    def delete_task(self, user_id: uuid.UUID, task_id: uuid.UUID) -> bool:
        return self.delete_with_commit(user_id, task_id)

    def update_task_status(
        self, user_id: uuid.UUID, task_id: uuid.UUID, new_status: TaskStatus
    ) -> Task:
        task = self.get_or_404(user_id, task_id)
        task.status = new_status
        return self.repository.commit_and_refresh(task)
