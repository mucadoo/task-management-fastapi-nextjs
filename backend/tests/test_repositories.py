import pytest
import uuid
from app.repositories.user_repository import UserRepository
from app.repositories.auth_repository import AuthRepository
from app.repositories.task_repository import TaskRepository
from app.models.auth import RefreshToken
from app.models.task import Task
from datetime import datetime, timedelta, timezone

@pytest.fixture
def user_repo(db):
    return UserRepository(db)

@pytest.fixture
def auth_repo(db):
    return AuthRepository(db)

@pytest.fixture
def task_repo(db):
    return TaskRepository(db)

def test_base_repository_get_multi(db, user_repo):
    user_repo.create({"email": "m1@e.com", "username": "m1", "hashed_password": "h"})
    user_repo.create({"email": "m2@e.com", "username": "m2", "hashed_password": "h"})
    db.commit()
    
    items = user_repo.get_multi(limit=1)
    assert len(items) == 1

def test_base_repository_get_multi_scoped(db, task_repo):
    uid = uuid.uuid4()
    task_repo.create({"title": "t1", "owner_id": uid})
    task_repo.create({"title": "t2", "owner_id": uid})
    db.commit()
    
    items = task_repo.get_multi_scoped(uid, limit=1)
    assert len(items) == 1

def test_base_repository_delete(db, user_repo):
    user = user_repo.create({"email": "d@e.com", "username": "d", "hashed_password": "h"})
    db.commit()
    
    assert user_repo.delete(user.id) is True
    assert user_repo.delete(uuid.uuid4()) is False

def test_base_repository_apply_sorting_fallback(db, task_repo):
    query = db.query(Task)
    sorted_query = task_repo.apply_sorting(query, "invalid_col", "asc")
    assert "ORDER BY tasks.id ASC" in str(sorted_query)

def test_auth_repository_revoke_token_not_found(auth_repo):
    auth_repo.revoke_token(uuid.uuid4())

def test_auth_repository_cleanup_expired(db, auth_repo):
    uid = uuid.uuid4()
    auth_repo.create_token(uid, "t1", datetime.now(timezone.utc) + timedelta(days=1))
    auth_repo.create_token(uid, "t2", datetime.now(timezone.utc) - timedelta(days=1))
    db.commit()
    
    auth_repo.cleanup_expired_tokens()
    db.commit()
    
    tokens = db.query(RefreshToken).all()
    assert len(tokens) == 1
    assert tokens[0].token == "t1"

def test_task_repository_edge_cases(db, task_repo):
    pass
