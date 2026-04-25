from sqlalchemy.orm import Session
from ..models.task import Task
from ..schemas.task import TaskCreate
from typing import List, Optional, Tuple
class TaskRepository:
    def __init__(self, db: Session):
        self.db = db
    def get_all(self, page: int, page_size: int, status: Optional[str] = None) -> Tuple[List[Task], int]:
        query = self.db.query(Task)
        if status:
            query = query.filter(Task.status == status)
        total = query.count()
        skip = (page - 1) * page_size
        items = query.offset(skip).limit(page_size).all()
        return items, total
    def get_by_id(self, task_id: int) -> Optional[Task]:
        return self.db.query(Task).filter(Task.id == task_id).first()
    def create(self, task_data: TaskCreate) -> Task:
        db_task = Task(**task_data.model_dump())
        self.db.add(db_task)
        self.db.commit()
        self.db.refresh(db_task)
        return db_task
    def update(self, task_id: int, task_data: TaskCreate) -> Optional[Task]:
        db_task = self.get_by_id(task_id)
        if not db_task:
            return None
        for key, value in task_data.model_dump().items():
            setattr(db_task, key, value)
        self.db.commit()
        self.db.refresh(db_task)
        return db_task
    def delete(self, task_id: int) -> bool:
        db_task = self.get_by_id(task_id)
        if not db_task:
            return False
        self.db.delete(db_task)
        self.db.commit()
        return True
