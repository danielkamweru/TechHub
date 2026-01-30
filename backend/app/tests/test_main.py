import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_endpoint():
    """Test the root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to Moringa TechHub API"}

def test_register_user():
    """Test user registration"""
    user_data = {
        "email": "test@example.com",
        "username": "testuser",
        "full_name": "Test User",
        "password": "testpass123",
        "role": "user"
    }
    response = client.post("/api/auth/register", json=user_data)
    assert response.status_code == 201
    assert "id" in response.json()
    assert response.json()["email"] == user_data["email"]

def test_login_user():
    """Test user login"""
    # First register a user
    user_data = {
        "email": "login@example.com",
        "username": "loginuser",
        "full_name": "Login User",
        "password": "loginpass123",
        "role": "user"
    }
    client.post("/api/auth/register", json=user_data)
    
    # Then try to login
    login_data = {
        "username": "loginuser",
        "password": "loginpass123"
    }
    response = client.post("/api/auth/login", json=login_data)
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert "user" in response.json()

def test_get_categories():
    """Test getting categories"""
    response = client.get("/api/categories/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_content():
    """Test getting content"""
    response = client.get("/api/content/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)