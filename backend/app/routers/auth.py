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
    hashed = auth_service.hash_password(user_data.password)
    user = user_service.register_user(
        user_data.email, hashed, user_data.name, user_data.username
    )
    return auth_service.create_user_tokens(user, auth_repo)


@router.post("/login", response_model=TokenResponse)
def login(
    login_data: LoginRequest,
    user_service: UserServ,
    auth_repo: AuthRepo,
    auth_service: AuthServ,
):
    user = user_service.get_user_by_email_or_username(login_data.identifier)
    if not user or not auth_service.verify_password(
        login_data.password, user.hashed_password
    ):
        raise UnauthorizedError("errors.invalid_credentials")
    return auth_service.create_user_tokens(user, auth_repo)


@router.post("/refresh", response_model=TokenResponse)
def refresh(
    refresh_data: RefreshRequest,
    user_service: UserServ,
    auth_repo: AuthRepo,
    auth_service: AuthServ,
):
    db_token = auth_repo.get_refresh_token(refresh_data.refresh_token)
    if (
        not db_token
        or db_token.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc)
    ):
        raise UnauthorizedError("errors.expired_refresh_token")
    user = user_service.get_user_by_id(db_token.user_id)
    if not user:
        raise UnauthorizedError("errors.user_not_found")
    auth_repo.revoke_token(db_token.id)
    auth_repo.db.commit()
    return auth_service.create_user_tokens(user, auth_repo)


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
        if not user_update.current_password:
            raise AppError("errors.password_required_new", code="BAD_REQUEST")
        if not auth_service.verify_password(
            user_update.current_password, current_user.hashed_password
        ):
            raise UnauthorizedError("errors.incorrect_password")
        
        update_data["hashed_password"] = auth_service.hash_password(update_data.pop("password"))
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
