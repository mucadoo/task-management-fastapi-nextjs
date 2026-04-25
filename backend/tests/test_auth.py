import pytest
def test_register_success(client):
    response = client.post(
        "/api/auth/register",
        json={"email": "newuser@example.com", "password": "password123"}
    )
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["email"] == "newuser@example.com"
    assert "password" not in data
def test_register_duplicate_email(client):
    email = "duplicate@example.com"
    client.post(
        "/api/auth/register",
        json={"email": email, "password": "password123"}
    )
    response = client.post(
        "/api/auth/register",
        json={"email": email, "password": "password123"}
    )
    assert response.status_code == 409
def test_register_short_password(client):
    response = client.post(
        "/api/auth/register",
        json={"email": "short@example.com", "password": "short"}
    )
    assert response.status_code == 422
def test_register_invalid_email(client):
    response = client.post(
        "/api/auth/register",
        json={"email": "not-an-email", "password": "password123"}
    )
    assert response.status_code == 422
def test_login_success(client):
    email = "login@example.com"
    password = "password123"
    client.post(
        "/api/auth/register",
        json={"email": email, "password": password}
    )
    response = client.post(
        "/api/auth/login",
        json={"email": email, "password": password}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
def test_login_wrong_password(client):
    email = "wrongpass@example.com"
    password = "password123"
    client.post(
        "/api/auth/register",
        json={"email": email, "password": password}
    )
    response = client.post(
        "/api/auth/login",
        json={"email": email, "password": "wrongpassword"}
    )
    assert response.status_code == 401
def test_login_nonexistent_user(client):
    response = client.post(
        "/api/auth/login",
        json={"email": "nonexistent@example.com", "password": "password123"}
    )
    assert response.status_code == 401
