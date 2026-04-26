from typing import Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from .database import get_db
from .repositories.user_repository import UserRepository
from .repositories.task_repository import TaskRepository
from .repositories.auth_repository import AuthRepository
from .services import auth_service
from .services.task_service import TaskService
from .config import get_settings
from .models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")
settings = get_settings()

# Base Database Dependency
DBSession = Annotated[Session, Depends(get_db)]

# Repository Dependencies
def get_user_repository(db: DBSession) -> UserRepository:
    return UserRepository(db)

def get_task_repository(db: DBSession) -> TaskRepository:
    return TaskRepository(db)

def get_auth_repository(db: DBSession) -> AuthRepository:
    return AuthRepository(db)

UserRepo = Annotated[UserRepository, Depends(get_user_repository)]
TaskRepo = Annotated[TaskRepository, Depends(get_task_repository)]
AuthRepo = Annotated[AuthRepository, Depends(get_auth_repository)]

# Service Dependencies
def get_task_service(repo: TaskRepo) -> TaskService:
    return TaskService(repo)

TaskServ = Annotated[TaskService, Depends(get_task_service)]

# Auth Dependencies
def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    user_repo: UserRepo,
) -> User:
    payload = auth_service.decode_token(token, settings.jwt_secret)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
        )
    user = user_repo.get_by_email(payload["sub"])
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found"
        )
    return user

CurrentUser = Annotated[User, Depends(get_current_user)]
