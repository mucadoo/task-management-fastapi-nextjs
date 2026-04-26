import uuid
from typing import Optional
from ..repositories.task_repository import TaskRepository
from ..models.task import Task, TaskStatus

class TaskService:
    def __init__(self, task_repo: TaskRepository):
        self.task_repo = task_repo

    def toggle_task(self, user_id: uuid.UUID, task_id: uuid.UUID) -> Optional[Task]:
        task = self.task_repo.get_by_id(user_id, task_id)
        if not task:
            return None

        new_status = (
            TaskStatus.PENDING
            if task.status == TaskStatus.COMPLETED
            else TaskStatus.COMPLETED
        )
        
        # We can use the repository's update method or direct attribute access if we have the object
        # Direct access is fine here since we have the task object and the repo has a session
        task.status = new_status
        self.task_repo.db.commit()
        self.task_repo.db.refresh(task)
        return task
