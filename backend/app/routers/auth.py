from fastapi import APIRouter, HTTPException, status
from typing import Optional
from ..schemas.user import (
    UserCreate,
    UserUpdate,
    UserResponse,
    LoginRequest,
    TokenResponse,
    RefreshRequest,
)
from ..dependencies import CurrentUser, UserRepo, AuthRepo, AuthServ, UserServ
from datetime import datetime, timezone
from ..exceptions import UnauthorizedError, ConflictError, AppError

router = APIRouter()

@router.post(
    "/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED
)
def register(
    user_data: UserCreate,
    user_service: UserServ,
    auth_repo: AuthRepo,
    auth_service: AuthServ,
):
    return auth_service.register(
        user_data.email,
        user_data.password,
        user_data.name,
        user_data.username,
        user_service,
        auth_repo,
    )


@router.post("/login", response_model=TokenResponse)
def login(
    login_data: LoginRequest,
    user_repo: UserRepo,
    auth_repo: AuthRepo,
    auth_service: AuthServ,
):
    return auth_service.login(
        login_data.identifier, login_data.password, user_repo, auth_repo
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh(
    refresh_data: RefreshRequest,
    user_repo: UserRepo,
    auth_repo: AuthRepo,
    auth_service: AuthServ,
):
    return auth_service.refresh_tokens(
        refresh_data.refresh_token, user_repo, auth_repo
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: CurrentUser):
    return current_user


@router.patch("/me", response_model=UserResponse)
def update_me(
    user_update: UserUpdate,
    current_user: CurrentUser,
    user_service: UserServ,
    auth_service: AuthServ,
):
    update_data = user_update.model_dump(exclude_unset=True)
    
    if "password" in update_data:
        update_data["hashed_password"] = auth_service.prepare_password_update(
            current_user, update_data.pop("password"), user_update.current_password
        )
        update_data.pop("current_password", None)

    return user_service.update_user_profile(current_user, update_data)


@router.get("/check-username")
def check_username(
    username: str, user_service: UserServ
):
    return {"available": user_service.is_username_available(username)}


@router.get("/check-email")
def check_email(
    email: str, user_service: UserServ
):
    return {"available": user_service.is_email_available(email)}
