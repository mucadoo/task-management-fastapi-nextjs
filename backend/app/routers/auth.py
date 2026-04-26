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
from ..dependencies import CurrentUser, UserRepo, AuthRepo, AuthServ
from datetime import datetime, timezone

router = APIRouter()

@router.post(
    "/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED
)
def register(
    user_data: UserCreate,
    user_repo: UserRepo,
    auth_repo: AuthRepo,
    auth_service: AuthServ,
):
    if user_repo.get_by_email(user_data.email):
        raise HTTPException(status_code=409, detail="Email already registered")
    if user_data.username and user_repo.get_by_username(user_data.username):
        raise HTTPException(status_code=409, detail="Username already taken")
    hashed = auth_service.hash_password(user_data.password)
    user = user_repo.create_user(
        user_data.email, hashed, user_data.name, user_data.username
    )
    user_repo.db.commit()
    return auth_service.create_user_tokens(user, auth_repo)


@router.post("/login", response_model=TokenResponse)
def login(
    login_data: LoginRequest,
    user_repo: UserRepo,
    auth_repo: AuthRepo,
    auth_service: AuthServ,
):
    user = user_repo.get_by_email_or_username(login_data.identifier)
    if not user or not auth_service.verify_password(
        login_data.password, user.hashed_password
    ):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return auth_service.create_user_tokens(user, auth_repo)


@router.post("/refresh", response_model=TokenResponse)
def refresh(
    refresh_data: RefreshRequest,
    user_repo: UserRepo,
    auth_repo: AuthRepo,
    auth_service: AuthServ,
):
    db_token = auth_repo.get_refresh_token(refresh_data.refresh_token)
    if (
        not db_token
        or db_token.revoked
        or db_token.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc)
    ):
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")
    user = user_repo.get_by_id(db_token.user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
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
    user_repo: UserRepo,
    auth_service: AuthServ,
):
    update_data = user_update.model_dump(exclude_unset=True)
    
    if "password" in update_data:
        if not user_update.current_password:
            raise HTTPException(
                status_code=400,
                detail="Current password is required to set a new password",
            )
        if not auth_service.verify_password(
            user_update.current_password, current_user.hashed_password
        ):
            raise HTTPException(status_code=401, detail="Incorrect current password")
        
        update_data["hashed_password"] = auth_service.hash_password(update_data.pop("password"))
        update_data.pop("current_password", None)

    if user_update.email and user_update.email != current_user.email:
        if user_repo.get_by_email(user_update.email):
            raise HTTPException(status_code=409, detail="Email already registered")
            
    if user_update.username and user_update.username != current_user.username:
        if user_repo.get_by_username(user_update.username):
            raise HTTPException(status_code=409, detail="Username already taken")
            
    updated_user = user_repo.update_user(current_user, update_data)
    user_repo.db.commit()
    return updated_user


@router.get("/check-username")
def check_username(
    username: str, user_repo: UserRepo
):
    username = username.lower()
    user = user_repo.get_by_username(username)
    return {"available": user is None}


@router.get("/check-email")
def check_email(
    email: str, user_repo: UserRepo
):
    email = email.lower()
    user = user_repo.get_by_email(email)
    return {"available": user is None}
