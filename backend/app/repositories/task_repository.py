import uuid
from sqlalchemy.orm import Session
from .base_repository import BaseRepository
from ..models.task import Task
from ..schemas.task import TaskCreate, TaskUpdate
from typing import List, Optional, Tuple


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
    ) -> Tuple[List[Task], int]:
        query = self.db.query(Task).filter(Task.owner_id == user_id)
        query = self._apply_filters(query, status, priority, q)

        total = query.count()

        query = self._apply_sorting(query, sort_by, sort_dir)
        items = query.offset((page - 1) * page_size).limit(page_size).all()

        return items, total

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

    def _apply_sorting(self, query, sort_by, sort_dir):
        sort_col = getattr(Task, sort_by, Task.created_at)
        if sort_dir == "asc":
            return query.order_by(sort_col.asc().nulls_last())
        return query.order_by(sort_col.desc().nulls_last())

    def create_with_owner(self, user_id: uuid.UUID, task_data: TaskCreate) -> Task:
        return super().create({**task_data.model_dump(), "owner_id": user_id})

    def update_task(
        self, user_id: uuid.UUID, task_id: uuid.UUID, task_data: TaskUpdate
    ) -> Optional[Task]:
        db_task = self.get_by_id(user_id, task_id)
        if not db_task:
            return None
        return super().update(db_task, task_data.model_dump(exclude_unset=True))

    def delete_task(self, user_id: uuid.UUID, task_id: uuid.UUID) -> bool:
        return super().delete_scoped(task_id, user_id)
