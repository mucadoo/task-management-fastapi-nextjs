import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base, get_db
from app.models.user import User
from .factories import TestDataFactory

TEST_DATABASE_URL = "sqlite:///./test.db"
test_engine = create_engine(
    TEST_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="function")
def db():
    Base.metadata.create_all(bind=test_engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(scope="function")
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def auth_headers(client, db):
    email = "test@example.com"
    password = "password123"
    TestDataFactory.create_user(db, email=email, password=password)
    response = client.post(
        "/api/v1/auth/login", json={"identifier": email, "password": password}
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def second_user_auth_headers(client, db):
    email = "second@example.com"
    password = "password123"
    TestDataFactory.create_user(db, email=email, password=password, username="seconduser")
    response = client.post(
        "/api/v1/auth/login", json={"identifier": email, "password": password}
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def sample_task(client, db, auth_headers):
    
    user = db.query(User).filter(User.email == "test@example.com").first()
    task = TestDataFactory.create_task(db, owner_id=user.id)
    
    return {
        "id": str(task.id),
        "title": task.title,
        "description": task.description,
        "status": task.status.value,
        "priority": task.priority.value,
        "due_date": task.due_date.isoformat() if task.due_date else None,
        "due_date_has_time": task.due_date_has_time,
        "created_at": task.created_at.isoformat(),
        "updated_at": task.updated_at.isoformat()
    }
