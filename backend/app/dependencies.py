from typing import Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from .database import get_db
from .repositories.user_repository import UserRepository
from .repositories.task_repository import TaskRepository
from .repositories.auth_repository import AuthRepository
from .services.auth_service import AuthService
from .services.user_service import UserService
from .services.task_service import TaskService
from .config import get_settings
from .models.user import User
from .exceptions import UnauthorizedError

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")
settings = get_settings()


DBSession = Annotated[Session, Depends(get_db)]


def get_user_repository(db: DBSession) -> UserRepository:
    return UserRepository(db)

def get_task_repository(db: DBSession) -> TaskRepository:
    return TaskRepository(db)

def get_auth_repository(db: DBSession) -> AuthRepository:
    return AuthRepository(db)

UserRepo = Annotated[UserRepository, Depends(get_user_repository)]
TaskRepo = Annotated[TaskRepository, Depends(get_task_repository)]
AuthRepo = Annotated[AuthRepository, Depends(get_auth_repository)]


def get_user_service(repo: UserRepo) -> UserService:
    return UserService(repo)

UserServ = Annotated[UserService, Depends(get_user_service)]

def get_task_service(repo: TaskRepo) -> TaskService:
    return TaskService(repo)

TaskServ = Annotated[TaskService, Depends(get_task_service)]

def get_auth_service(
    user_repo: UserRepo,
    auth_repo: AuthRepo,
    user_service: UserServ,
) -> AuthService:
    return AuthService(
        secret=settings.jwt_secret,
        expire_minutes=settings.jwt_expire_minutes,
        refresh_expire_days=settings.jwt_refresh_expire_days,
        user_repo=user_repo,
        auth_repo=auth_repo,
        user_service=user_service,
    )

AuthServ = Annotated[AuthService, Depends(get_auth_service)]


def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    user_repo: UserRepo,
    auth_service: AuthServ,
) -> User:
    payload = auth_service.decode_token(token)
    if not payload or "sub" not in payload:
        raise UnauthorizedError("errors.invalid_token")
    user = user_repo.get_by_email(payload["sub"])
    if not user:
        raise UnauthorizedError("errors.user_not_found")
    return user

CurrentUser = Annotated[User, Depends(get_current_user)]
