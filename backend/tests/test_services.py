import pytest
import uuid
from app.services.user_service import UserService
from app.services.auth_service import AuthService
from app.repositories.user_repository import UserRepository
from app.repositories.auth_repository import AuthRepository
from app.exceptions import NotFoundError, ConflictError, BusinessError, UnauthorizedError, AppError
from app.models.user import User

@pytest.fixture
def user_service(db):
    repo = UserRepository(db)
    return UserService(repo)

@pytest.fixture
def auth_service(db, user_service):
    user_repo = UserRepository(db)
    auth_repo = AuthRepository(db)
    return AuthService(
        secret="testsecret",
        expire_minutes=60,
        refresh_expire_days=7,
        user_repo=user_repo,
        auth_repo=auth_repo,
        user_service=user_service
    )

def test_user_service_get_by_id_not_found(user_service):
    with pytest.raises(NotFoundError):
        user_service.get_user_by_id(uuid.uuid4())

def test_user_service_get_by_email(db, user_service):
    email = "service@example.com"
    user = User(email=email, hashed_password="hashed", username="serviceuser")
    db.add(user)
    db.commit()
    
    found = user_service.get_user_by_email(email)
    assert found.id == user.id
    
    not_found = user_service.get_user_by_email("wrong@example.com")
    assert not_found is None

def test_user_service_get_by_username(db, user_service):
    username = "serviceuser2"
    user = User(email="service2@example.com", hashed_password="hashed", username=username)
    db.add(user)
    db.commit()
    
    found = user_service.get_user_by_username(username)
    assert found.id == user.id

def test_user_service_get_by_email_or_username(db, user_service):
    user = user_service.register_user("both@example.com", "hashed", username="bothuser")
    
    found1 = user_service.get_user_by_email_or_username("both@example.com")
    assert found1.id == user.id
    
    found2 = user_service.get_user_by_email_or_username("bothuser")
    assert found2.id == user.id

def test_user_service_register_user_duplicate_email(db, user_service):
    email = "dup@example.com"
    user_service.register_user(email, "hashed", username="user1")
    with pytest.raises(ConflictError):
        user_service.register_user(email, "hashed", username="user2")

def test_user_service_register_user_duplicate_username(db, user_service):
    username = "dupuser"
    user_service.register_user("email1@example.com", "hashed", username=username)
    with pytest.raises(ConflictError):
        user_service.register_user("email2@example.com", "hashed", username=username)

def test_user_service_register_user_missing_username(user_service):
    with pytest.raises(BusinessError):
        user_service.register_user("email@example.com", "hashed", username="")

def test_user_service_update_profile_duplicate_email(db, user_service):
    user1 = user_service.register_user("u1@example.com", "hashed", username="u1")
    user_service.register_user("u2@example.com", "hashed", username="u2")
    
    with pytest.raises(ConflictError):
        user_service.update_user_profile(user1, {"email": "u2@example.com"})

def test_user_service_update_profile_duplicate_username(db, user_service):
    user1 = user_service.register_user("u1@example.com", "hashed", username="u1")
    user_service.register_user("u2@example.com", "hashed", username="u2")
    
    with pytest.raises(ConflictError):
        user_service.update_user_profile(user1, {"username": "u2"})

def test_user_service_update_profile_invalid_username(db, user_service):
    user1 = user_service.register_user("u1@example.com", "hashed", username="u1")
    with pytest.raises(BusinessError):
        user_service.update_user_profile(user1, {"username": " "})

def test_user_service_availability_checks(db, user_service):
    user_service.register_user("avail@example.com", "hashed", username="availuser")
    assert user_service.is_username_available("availuser") is False
    assert user_service.is_username_available("other") is True
    assert user_service.is_email_available("avail@example.com") is False
    assert user_service.is_email_available("other@example.com") is True

def test_auth_service_decode_token_invalid(auth_service):
    assert auth_service.decode_token("invalid-token") is None

def test_auth_service_register_no_user_service(db):
    service = AuthService("s", 1, 1, UserRepository(db), AuthRepository(db), None)
    with pytest.raises(AppError):
        service.register("e", "p", "n", "u")

def test_auth_service_update_profile_no_user_service(db):
    service = AuthService("s", 1, 1, UserRepository(db), AuthRepository(db), None)
    user = User(email="e", hashed_password="h", username="u")
    from unittest.mock import MagicMock
    with pytest.raises(AppError):
        service.update_user_profile(user, MagicMock())

def test_auth_service_refresh_token_expired_or_invalid(auth_service):
    with pytest.raises(UnauthorizedError):
        auth_service.refresh_tokens("non-existent")

def test_auth_service_prepare_password_update_no_current(auth_service):
    user = User(email="e", hashed_password="h", username="u")
    with pytest.raises(AppError):
        auth_service.prepare_password_update(user, "new", None)

def test_auth_service_prepare_password_update_incorrect_current(auth_service):
    hashed = auth_service.hash_password("correct")
    user = User(email="e", hashed_password=hashed, username="u")
    with pytest.raises(BusinessError):
        auth_service.prepare_password_update(user, "new", "incorrect")

def test_base_service_unused_methods(db, user_service):
    from pydantic import BaseModel
    class MockSchema(BaseModel):
        email: str
        username: str
        hashed_password: str
    
    data = MockSchema(email="base@example.com", username="baseuser", hashed_password="h")
    user = user_service.create_resource_with_commit(data)
    assert user.email == "base@example.com"
    
    updated = user_service.update_resource_with_commit(user.id, {"username": "newbase"})
    assert updated.username == "newbase"
    
    user_service.delete_resource_with_commit(user.id)
    with pytest.raises(NotFoundError):
        user_service.get_user_by_id(user.id)

def test_get_db():
    from app.database import get_db
    from sqlalchemy.orm import Session
    db_gen = get_db()
    db = next(db_gen)
    assert isinstance(db, Session)
    try:
        next(db_gen)
    except StopIteration:
        pass

def test_auth_service_register_duplicate_username(db, auth_service):
    auth_service.register("u1@example.com", "p", "n", "user1")
    with pytest.raises(ConflictError):
        auth_service.register("u2@example.com", "p", "n", "user1")

def test_auth_service_refresh_token_user_not_found(db, auth_service):
    reg = auth_service.register("delete@example.com", "p", "n", "deleteuser")
    token = reg["refresh_token"]
    
    user = db.query(User).filter(User.username == "deleteuser").first()
    db.delete(user)
    db.commit()
    
    with pytest.raises(UnauthorizedError):
        auth_service.refresh_tokens(token)

def test_get_current_user_edge_cases(auth_service, db):
    from app.dependencies import get_current_user
    from app.repositories.user_repository import UserRepository
    
    repo = UserRepository(db)
    
    token = auth_service.create_access_token({"not-sub": "1"})
    with pytest.raises(UnauthorizedError):
        get_current_user(token, repo, auth_service)
        
    token = auth_service.create_access_token({"sub": "not-a-uuid"})
    with pytest.raises(UnauthorizedError):
        get_current_user(token, repo, auth_service)

    token = auth_service.create_access_token({"sub": str(uuid.uuid4())})
    with pytest.raises(UnauthorizedError):
        get_current_user(token, repo, auth_service)
