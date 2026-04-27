from fastapi import APIRouter, status, Query, Depends
from fastapi.security import OAuth2PasswordRequestForm
from typing import Annotated
from ..schemas.user import (
    UserCreate,
    UserUpdate,
    UserResponse,
    TokenResponse,
    RefreshRequest,
    LoginRequest,
)
from ..dependencies import CurrentUser, AuthServ, UserServ

router = APIRouter()

@router.post(
    "/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED
)
def register(
    user_data: UserCreate,
    auth_service: AuthServ,
):
    return auth_service.register(
        user_data.email,
        user_data.password,
        user_data.name,
        user_data.username,
    )


@router.post("/login", response_model=TokenResponse)
def login(
    login_data: LoginRequest,
    auth_service: AuthServ,
):
    return auth_service.login(
        login_data.identifier, login_data.password
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh(
    refresh_data: RefreshRequest,
    auth_service: AuthServ,
):
    return auth_service.refresh_tokens(
        refresh_data.refresh_token
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: CurrentUser):
    return current_user


@router.patch("/me", response_model=UserResponse)
def update_me(
    user_update: UserUpdate,
    current_user: CurrentUser,
    auth_service: AuthServ,
):
    return auth_service.update_user_profile(current_user, user_update)


@router.get("/check-username")
def check_username(
    username: Annotated[str, Query()], user_service: UserServ
):
    return {"available": user_service.is_username_available(username)}


@router.get("/check-email")
def check_email(
    email: Annotated[str, Query()], user_service: UserServ
):
    return {"available": user_service.is_email_available(email)}
