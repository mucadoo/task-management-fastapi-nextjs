from fastapi.testclient import TestClient


def test_get_me(client: TestClient, auth_headers: dict):
    response = client.get("/api/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert "name" in data


def test_update_me_name(client: TestClient, auth_headers: dict):
    response = client.patch(
        "/api/auth/me", json={"name": "New Name"}, headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "New Name"


def test_update_me_email(client: TestClient, auth_headers: dict):
    new_email = "updated@example.com"
    response = client.patch(
        "/api/auth/me", json={"email": new_email}, headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == new_email


def test_update_me_password(client: TestClient, auth_headers: dict):
    new_password = "newpassword123"
    response = client.patch(
        "/api/auth/me",
        json={"password": new_password, "current_password": "password123"},
        headers=auth_headers,
    )
    assert response.status_code == 200

    # Try to login with new password
    login_response = client.post(
        "/api/auth/login",
        json={"identifier": "test@example.com", "password": new_password},
    )
    assert login_response.status_code == 200
