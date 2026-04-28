import uuid


def test_create_task(client, auth_headers):
    response = client.post(
        "/api/v1/tasks/",
        json={"title": "Test Task", "description": "Description"},
        headers=auth_headers,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test Task"
    assert "id" in data
    assert "status" in data
    assert "created_at" in data


def test_create_task_no_title(client, auth_headers):
    response = client.post(
        "/api/v1/tasks/",
        json={"title": "", "description": "Description"},
        headers=auth_headers,
    )
    assert response.status_code == 422


def test_create_task_no_auth(client):
    response = client.post(
        "/api/v1/tasks/", json={"title": "Test Task", "description": "Description"}
    )
    assert response.status_code == 401


def test_get_tasks_empty(client, auth_headers):
    response = client.get("/api/v1/tasks/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data == {"items": [], "total": 0, "page": 1, "page_size": 10}


def test_get_tasks_with_data(client, auth_headers):
    for i in range(3):
        client.post("/api/v1/tasks/", json={"title": f"Task {i}"}, headers=auth_headers)
    response = client.get("/api/v1/tasks/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 3
    assert data["total"] == 3


def test_get_task_by_id(client, auth_headers, sample_task):
    task_id = sample_task["id"]
    response = client.get(f"/api/v1/tasks/{task_id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["id"] == task_id


def test_get_task_not_found(client, auth_headers):
    fake_id = str(uuid.uuid4())
    response = client.get(f"/api/v1/tasks/{fake_id}", headers=auth_headers)
    assert response.status_code == 404


def test_update_task(client, auth_headers, sample_task):
    task_id = sample_task["id"]
    response = client.put(
        f"/api/v1/tasks/{task_id}",
        json={"title": "Updated Title", "status": "completed"},
        headers=auth_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated Title"
    assert data["status"] == "completed"


def test_update_task_invalid_status(client, auth_headers, sample_task):
    task_id = sample_task["id"]
    response = client.put(
        f"/api/v1/tasks/{task_id}",
        json={"title": "Updated Title", "status": "invalid"},
        headers=auth_headers,
    )
    assert response.status_code == 422


def test_update_task_not_found(client, auth_headers):
    fake_id = str(uuid.uuid4())
    response = client.put(
        f"/api/v1/tasks/{fake_id}",
        json={"title": "Updated Title", "status": "completed"},
        headers=auth_headers,
    )
    assert response.status_code == 404


def test_delete_task(client, auth_headers, sample_task):
    task_id = sample_task["id"]
    response = client.delete(f"/api/v1/tasks/{task_id}", headers=auth_headers)
    assert response.status_code == 204
    response = client.get(f"/api/v1/tasks/{task_id}", headers=auth_headers)
    assert response.status_code == 404


def test_delete_task_not_found(client, auth_headers):
    fake_id = str(uuid.uuid4())
    response = client.delete(f"/api/v1/tasks/{fake_id}", headers=auth_headers)
    assert response.status_code == 404


def test_filter_by_status(client, auth_headers):
    client.post(
        "/api/v1/tasks/",
        json={"title": "Pending", "status": "pending"},
        headers=auth_headers,
    )
    client.post(
        "/api/v1/tasks/",
        json={"title": "Completed", "status": "completed"},
        headers=auth_headers,
    )
    response = client.get("/api/v1/tasks/?status=completed", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 1
    assert data["items"][0]["status"] == "completed"


def test_pagination(client, auth_headers):
    for i in range(15):
        client.post("/api/v1/tasks/", json={"title": f"Task {i}"}, headers=auth_headers)
    response = client.get("/api/v1/tasks/?page=2&page_size=10", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 5
    assert data["total"] == 15
    assert data["page"] == 2


def test_task_ownership_isolation(client, auth_headers, second_user_auth_headers):
    
    client.post("/api/v1/tasks/", json={"title": "User 1 Task"}, headers=auth_headers)

    
    response = client.get("/api/v1/tasks/", headers=second_user_auth_headers)
    assert response.status_code == 200
    assert response.json()["total"] == 0

    
    user1_task_response = client.post(
        "/api/v1/tasks/", json={"title": "User 1 Task"}, headers=auth_headers
    )
    task_id = user1_task_response.json()["id"]

    response = client.get(f"/api/v1/tasks/{task_id}", headers=second_user_auth_headers)
    assert response.status_code == 404

    
    response = client.put(
        f"/api/v1/tasks/{task_id}",
        json={"title": "Hacked"},
        headers=second_user_auth_headers,
    )
    assert response.status_code == 404

    
    response = client.delete(f"/api/v1/tasks/{task_id}", headers=second_user_auth_headers)
    assert response.status_code == 404

    
    response = client.patch(
        f"/api/v1/tasks/{task_id}/status",
        json={"status": "completed"},
        headers=second_user_auth_headers
    )
    assert response.status_code == 404


def test_search_tasks(client, auth_headers):
    client.post(
        "/api/v1/tasks/",
        json={"title": "Buy milk", "description": "Grocery store"},
        headers=auth_headers,
    )
    client.post(
        "/api/v1/tasks/",
        json={"title": "Clean room", "description": "Bedroom"},
        headers=auth_headers,
    )

    
    response = client.get("/api/v1/tasks/?q=milk", headers=auth_headers)
    assert response.json()["total"] == 1
    assert response.json()["items"][0]["title"] == "Buy milk"

    
    response = client.get("/api/v1/tasks/?q=Bedroom", headers=auth_headers)
    assert response.json()["total"] == 1
    assert response.json()["items"][0]["title"] == "Clean room"


def test_filter_by_priority(client, auth_headers):
    client.post(
        "/api/v1/tasks/",
        json={"title": "Low Task", "priority": "low"},
        headers=auth_headers,
    )
    client.post(
        "/api/v1/tasks/",
        json={"title": "High Task", "priority": "high"},
        headers=auth_headers,
    )

    response = client.get("/api/v1/tasks/?priority=high", headers=auth_headers)
    assert response.json()["total"] == 1
    assert response.json()["items"][0]["title"] == "High Task"


def test_toggle_task_status(client, auth_headers):
    create_response = client.post(
        "/api/v1/tasks/", json={"title": "Toggle me"}, headers=auth_headers
    )
    task_id = create_response.json()["id"]
    assert create_response.json()["status"] == "pending"

    
    toggle_response = client.patch(f"/api/v1/tasks/{task_id}/status", json={"status": "completed"}, headers=auth_headers)
    assert toggle_response.status_code == 200
    assert toggle_response.json()["status"] == "completed"

    toggle_response = client.patch(f"/api/v1/tasks/{task_id}/status", json={"status": "pending"}, headers=auth_headers)
    assert toggle_response.json()["status"] == "pending"
