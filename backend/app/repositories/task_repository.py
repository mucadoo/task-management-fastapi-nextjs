import uuid
from sqlalchemy.orm import Session
from ..models.task import Task, TaskStatus
from ..schemas.task import TaskCreate
from typing import List, Optional, Tuple


class TaskRepository:
    def __init__(self, db: Session):
        self.db = db

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
        if status:
            query = query.filter(Task.status == status)
        if priority:
            query = query.filter(Task.priority == priority)
        if q:
            search = f"%{q}%"
            query = query.filter(
                Task.title.ilike(search) | Task.description.ilike(search)
            )
        total = query.count()
        skip = (page - 1) * page_size
        sort_col = getattr(Task, sort_by, Task.created_at)
        if sort_dir == "asc":
            query = query.order_by(sort_col.asc().nulls_last())
        else:
            query = query.order_by(sort_col.desc().nulls_last())
        items = query.offset(skip).limit(page_size).all()
        return items, total

    def get_by_id(self, user_id: uuid.UUID, task_id: uuid.UUID) -> Optional[Task]:
        return (
            self.db.query(Task)
            .filter(Task.id == task_id, Task.owner_id == user_id)
            .first()
        )

    def create(self, user_id: uuid.UUID, task_data: TaskCreate) -> Task:
        db_task = Task(**task_data.model_dump(), owner_id=user_id)
        self.db.add(db_task)
        self.db.commit()
        self.db.refresh(db_task)
        return db_task

    def update(
        self, user_id: uuid.UUID, task_id: uuid.UUID, task_data: TaskCreate
    ) -> Optional[Task]:
        db_task = self.get_by_id(user_id, task_id)
        if not db_task:
            return None
        for key, value in task_data.model_dump().items():
            setattr(db_task, key, value)
        self.db.commit()
        self.db.refresh(db_task)
        return db_task

    def delete(self, user_id: uuid.UUID, task_id: uuid.UUID) -> bool:
        db_task = self.get_by_id(user_id, task_id)
        if not db_task:
            return False
        self.db.delete(db_task)
        self.db.commit()
        return True

    def toggle(self, user_id: uuid.UUID, task_id: uuid.UUID) -> Optional[Task]:
        db_task = self.get_by_id(user_id, task_id)
        if not db_task:
            return None

        db_task.status = (
            TaskStatus.PENDING
            if db_task.status == TaskStatus.COMPLETED
            else TaskStatus.COMPLETED
        )

        self.db.commit()
        self.db.refresh(db_task)
        return db_task
