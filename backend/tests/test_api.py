import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

def test_admin_login():
    res = client.post("/api/auth/login", json={
        "email": "admin@example.com",
        "password": "Admin@123"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["role"] == "super_admin"

def test_invalid_login():
    res = client.post("/api/auth/login", json={
        "email": "admin@example.com",
        "password": "WrongPassword!"
    })
    assert res.status_code == 400

def test_user_registration():
    email = "test.newuser@example.com"
    res = client.post("/api/auth/register", json={
        "name": "Test Student",
        "email": email,
        "password": "Password@123",
        "phone": "9998887776",
        "role": "user"
    })
    if res.status_code == 400: # If already exists from repeated tests
        pass
    else:
        assert res.status_code == 201
        assert "access_token" in res.json()

def test_analytics_overview():
    # Login as admin
    login_res = client.post("/api/auth/login", json={
        "email": "admin@example.com",
        "password": "Admin@123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/analytics/overview", headers=headers)
    assert res.status_code == 200
    data = res.json()["data"]
    assert "total_complaints" in data
    assert data["total_complaints"] >= 100
    assert "resolution_rate" in data

def test_complaint_lifecycle():
    # 1. Login user
    user_login = client.post("/api/auth/login", json={
        "email": "james.smith1@example.com",
        "password": "User@123"
    })
    user_token = user_login.json()["access_token"]
    user_headers = {"Authorization": f"Bearer {user_token}"}

    # 2. Create complaint
    create_res = client.post("/api/complaints", json={
        "title": "Computer monitor smoking in Room 201",
        "description": "The CRT monitor started emitting smoke and burning plastic smell. Needs urgent electric shutdown.",
        "location": "Room 201 Block B"
    }, headers=user_headers)
    assert create_res.status_code == 201
    comp_data = create_res.json()["data"]
    comp_id = comp_data["id"]
    assert comp_data["ai_category"] in ["IT Support", "Infrastructure"]
    assert comp_data["ai_priority"] in ["critical", "high"]

    # 3. Login admin to inspect
    admin_login = client.post("/api/auth/login", json={
        "email": "admin@example.com",
        "password": "Admin@123"
    })
    admin_token = admin_login.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 4. Update status to in_progress
    status_res = client.patch(f"/api/complaints/{comp_id}/status", json={
        "status": "in_progress",
        "comment": "Fire safety and electrician notified."
    }, headers=admin_headers)
    assert status_res.status_code == 200
    assert status_res.json()["data"]["status"] == "in_progress"
