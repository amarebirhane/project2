from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

def test_create_task(client: TestClient):
    # Register and login to get token
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "task@example.com",
            "username": "taskuser",
            "password": "Password123!",
            "first_name": "Task",
            "last_name": "User"
        }
    )
    login_res = client.post(
        "/api/v1/auth/login",
        data={"username": "taskuser", "password": "Password123!"}
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create category first
    cat_res = client.post(
        "/api/v1/categories/",
        json={"name": "Work", "color": "#FF0000"},
        headers=headers
    )
    cat_id = cat_res.json()["id"]
    
    # Create task
    response = client.post(
        "/api/v1/tasks/",
        json={
            "title": "Important Project",
            "description": "Professionalization of backend",
            "priority": "high",
            "category_id": cat_id
        },
        headers=headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Important Project"
    assert data["category_id"] == cat_id
