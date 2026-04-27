import uuid
from typing import Optional
from ..repositories.task_repository import TaskRepository
from ..models.task import Task, TaskStatus
from ..schemas.task import TaskCreate, TaskUpdate
from ..exceptions import NotFoundError

class TaskService:
    def __init__(self, task_repo: TaskRepository):
        self.task_repo = task_repo

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
        return self.task_repo.get_all(
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
        task = self.task_repo.get_by_id(user_id, task_id)
        if not task:
            raise NotFoundError("errors.task_not_found")
        return task

    def create_task(self, user_id: uuid.UUID, task_data: TaskCreate) -> Task:
        task = self.task_repo.create_with_owner(user_id, task_data)
        return self.task_repo.commit_and_refresh(task)

    def update_task(
        self, user_id: uuid.UUID, task_id: uuid.UUID, task_data: TaskUpdate
    ) -> Task:
        task = self.task_repo.update_task(user_id, task_id, task_data)
        if not task:
            raise NotFoundError("errors.task_not_found")
        return self.task_repo.commit_and_refresh(task)

    def delete_task(self, user_id: uuid.UUID, task_id: uuid.UUID) -> bool:
        success = self.task_repo.delete_task(user_id, task_id)
        if not success:
            raise NotFoundError("errors.task_not_found")
        self.task_repo.commit()
        return True

    def toggle_task(self, user_id: uuid.UUID, task_id: uuid.UUID) -> Task:
        task = self.task_repo.get_by_id(user_id, task_id)
        if not task:
            raise NotFoundError("errors.task_not_found")

        new_status = (
            TaskStatus.PENDING
            if task.status == TaskStatus.COMPLETED
            else TaskStatus.COMPLETED
        )
        
        task.status = new_status
        return self.task_repo.commit_and_refresh(task)
