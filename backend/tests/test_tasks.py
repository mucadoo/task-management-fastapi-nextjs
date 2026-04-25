import pytest
def test_create_task(client, auth_headers):
    response = client.post(
        "/api/tasks/",
        json={"title": "Test Task", "description": "Description"},
        headers=auth_headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test Task"
    assert "id" in data
    assert "status" in data
    assert "created_at" in data
def test_create_task_no_title(client, auth_headers):
    response = client.post(
        "/api/tasks/",
        json={"title": "", "description": "Description"},
        headers=auth_headers
    )
    assert response.status_code == 422
def test_create_task_no_auth(client):
    response = client.post(
        "/api/tasks/",
        json={"title": "Test Task", "description": "Description"}
    )
    assert response.status_code == 401
def test_get_tasks_empty(client, auth_headers):
    response = client.get("/api/tasks/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data == {"items": [], "total": 0, "page": 1, "page_size": 10}
def test_get_tasks_with_data(client, auth_headers):
    for i in range(3):
        client.post(
            "/api/tasks/",
            json={"title": f"Task {i}"},
            headers=auth_headers
        )
    response = client.get("/api/tasks/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 3
    assert data["total"] == 3
def test_get_task_by_id(client, auth_headers, sample_task):
    task_id = sample_task["id"]
    response = client.get(f"/api/tasks/{task_id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["id"] == task_id
def test_get_task_not_found(client, auth_headers):
    response = client.get("/api/tasks/99999", headers=auth_headers)
    assert response.status_code == 404
def test_update_task(client, auth_headers, sample_task):
    task_id = sample_task["id"]
    response = client.put(
        f"/api/tasks/{task_id}",
        json={"title": "Updated Title", "status": "completed"},
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated Title"
    assert data["status"] == "completed"
def test_update_task_invalid_status(client, auth_headers, sample_task):
    task_id = sample_task["id"]
    response = client.put(
        f"/api/tasks/{task_id}",
        json={"title": "Updated Title", "status": "invalid"},
        headers=auth_headers
    )
    assert response.status_code == 422
def test_update_task_not_found(client, auth_headers):
    response = client.put(
        "/api/tasks/99999",
        json={"title": "Updated Title", "status": "completed"},
        headers=auth_headers
    )
    assert response.status_code == 404
def test_delete_task(client, auth_headers, sample_task):
    task_id = sample_task["id"]
    response = client.delete(f"/api/tasks/{task_id}", headers=auth_headers)
    assert response.status_code == 204
    response = client.get(f"/api/tasks/{task_id}", headers=auth_headers)
    assert response.status_code == 404
def test_delete_task_not_found(client, auth_headers):
    response = client.delete("/api/tasks/99999", headers=auth_headers)
    assert response.status_code == 404
def test_filter_by_status(client, auth_headers):
    client.post("/api/tasks/", json={"title": "Pending", "status": "pending"}, headers=auth_headers)
    client.post("/api/tasks/", json={"title": "Completed", "status": "completed"}, headers=auth_headers)
    response = client.get("/api/tasks/?status=completed", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 1
    assert data["items"][0]["status"] == "completed"
def test_pagination(client, auth_headers):
    for i in range(15):
        client.post("/api/tasks/", json={"title": f"Task {i}"}, headers=auth_headers)
    response = client.get("/api/tasks/?page=2&page_size=10", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 5
    assert data["total"] == 15
    assert data["page"] == 2
