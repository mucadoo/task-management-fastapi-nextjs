import uuid
from sqlalchemy.orm import Session
from .base_repository import BaseRepository
from ..models.task import Task
from ..schemas.task import TaskCreate, TaskUpdate
from typing import Optional


class TaskRepository(BaseRepository[Task]):
    def __init__(self, db: Session):
        super().__init__(Task, db)

    def get_by_id(self, user_id: uuid.UUID, task_id: uuid.UUID) -> Optional[Task]:
        return super().get_by_id_scoped(task_id, user_id)

    def get_all(
        self,
        user_id: uuid.UUID,
        page: int,
        page_size: int,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        q: Optional[str] = None,
        sort_by: str = "created_at",
        sort_dir: str = "desc",
    ) -> dict:
        query = self.db.query(Task).filter(Task.owner_id == user_id)
        query = self._apply_filters(query, status, priority, q)
        query = self.apply_sorting(query, sort_by, sort_dir)

        return self.paginate(query, page, page_size)

    def _apply_filters(self, query, status, priority, q):
        if status:
            query = query.filter(Task.status == status)
        if priority:
            query = query.filter(Task.priority == priority)
        if q:
            search = f"%{q}%"
            query = query.filter(
                Task.title.ilike(search) | Task.description.ilike(search)
            )
        return query

    def create_with_owner(self, user_id: uuid.UUID, task_data: TaskCreate) -> Task:
        return super().create_with_owner(user_id, task_data)

    def update_task(
        self, user_id: uuid.UUID, task_id: uuid.UUID, task_data: TaskUpdate
    ) -> Optional[Task]:
        return super().update_scoped(task_id, user_id, task_data)

    def delete_task(self, user_id: uuid.UUID, task_id: uuid.UUID) -> bool:
        return super().delete_scoped(task_id, user_id)
