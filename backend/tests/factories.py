import uuid
from typing import Any, Dict, Optional
from sqlalchemy.orm import Session
from app.models.task import Task, TaskStatus, TaskPriority
from app.models.user import User
from app.services.security import get_password_hash

class TestDataFactory:
    @staticmethod
    def create_user(
        db: Session,
        email: str = "test@example.com",
        username: str = "testuser",
        password: str = "password123",
        full_name: str = "Test User"
    ) -> User:
        user = User(
            email=email,
            username=username,
            hashed_password=get_password_hash(password),
            full_name=full_name,
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def create_task(
        db: Session,
        owner_id: uuid.UUID,
        title: str = "Sample Task",
        description: str = "Sample Description",
        status: TaskStatus = TaskStatus.PENDING,
        priority: TaskPriority = TaskPriority.MEDIUM,
        due_date: Optional[Any] = None
    ) -> Task:
        task = Task(
            title=title,
            description=description,
            status=status,
            priority=priority,
            owner_id=owner_id,
            due_date=due_date
        )
        db.add(task)
        db.commit()
        db.refresh(task)
        return task
