#!/usr/bin/env python3

import pytest
import requests
import time

BASE_URL = "http://localhost:8000/api"

class TestTechHubAPI:
    def test_01_admin_login(self):
        login_data = {"email": "admin@techhub.com", "password": "admin123"}
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        assert response.status_code == 200
        assert "token" in response.json()

    def test_02_public_content(self):
        response = requests.get(f"{BASE_URL}/content/public")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_03_content_creation(self):
        login_data = {"email": "admin@techhub.com", "password": "admin123"}
        token = requests.post(f"{BASE_URL}/auth/login", json=login_data).json()["token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        content_data = {
            "title": "Test Article",
            "content_text": "Test content",
            "content_type": "article",
            "category_id": 1
        }
        
        response = requests.post(f"{BASE_URL}/content/", json=content_data, headers=headers)
        assert response.status_code == 200
        assert response.json()["status"] == "review"

    def test_04_content_approval(self):
        login_data = {"email": "admin@techhub.com", "password": "admin123"}
        token = requests.post(f"{BASE_URL}/auth/login", json=login_data).json()["token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        response = requests.get(f"{BASE_URL}/content/", headers=headers)
        content_list = response.json()
        review_content = next((item for item in content_list if item["status"] == "review"), None)
        
        if review_content:
            approve_response = requests.put(f"{BASE_URL}/content/{review_content['id']}/approve", headers=headers)
            assert approve_response.status_code == 200
            assert "message" in approve_response.json()

    def test_05_content_liking(self):
        login_data = {"email": "normaluser@techhub.com", "password": "user123"}
        token = requests.post(f"{BASE_URL}/auth/login", json=login_data).json()["token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        response = requests.get(f"{BASE_URL}/content/public")
        content_list = response.json()
        
        if content_list:
            like_data = {"content_id": content_list[0]["id"], "is_like": True}
            like_response = requests.post(f"{BASE_URL}/content/{content_list[0]['id']}/like", json=like_data, headers=headers)
            assert like_response.status_code == 200
            assert "message" in like_response.json()

    def test_06_content_flagging(self):
        login_data = {"email": "normaluser@techhub.com", "password": "user123"}
        token = requests.post(f"{BASE_URL}/auth/login", json=login_data).json()["token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        response = requests.get(f"{BASE_URL}/content/public")
        content_list = response.json()
        
        if content_list:
            flag_data = {"reason": "Test flag"}
            flag_response = requests.post(f"{BASE_URL}/content/{content_list[0]['id']}/flag", json=flag_data, headers=headers)
            assert flag_response.status_code == 200

    def test_07_category_subscription(self):
        login_data = {"email": "normaluser@techhub.com", "password": "user123"}
        token = requests.post(f"{BASE_URL}/auth/login", json=login_data).json()["token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        response = requests.get(f"{BASE_URL}/categories/", headers=headers)
        if response.status_code == 200 and response.json():
            category_id = response.json()[0]["id"]
            subscribe_response = requests.post(f"{BASE_URL}/categories/{category_id}/subscribe", headers=headers)
            assert subscribe_response.status_code == 200

    def test_08_notifications(self):
        login_data = {"email": "admin@techhub.com", "password": "admin123"}
        token = requests.post(f"{BASE_URL}/auth/login", json=login_data).json()["token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        response = requests.get(f"{BASE_URL}/notifications/", headers=headers)
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_09_comments(self):
        login_data = {"email": "normaluser@techhub.com", "password": "user123"}
        token = requests.post(f"{BASE_URL}/auth/login", json=login_data).json()["token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        response = requests.get(f"{BASE_URL}/content/public")
        content_list = response.json()
        
        if content_list:
            comment_data = {
                "content_id": content_list[0]["id"],
                "text": "Test comment",
                "parent_id": None
            }
            comment_response = requests.post(f"{BASE_URL}/comments", json=comment_data, headers=headers)
            assert comment_response.status_code == 200
            assert comment_response.json()["text"] == comment_data["text"]

    def test_10_user_registration(self):
        timestamp = str(int(time.time()))
        user_data = {
            "email": f"testuser_{timestamp}@example.com",
            "password": "testpass123",
            "name": f"Test User {timestamp}"
        }
        
        response = requests.post(f"{BASE_URL}/auth/register", json=user_data)
        assert response.status_code == 200
        assert "token" in response.json()

if __name__ == "__main__":
    pytest.main([__file__])
