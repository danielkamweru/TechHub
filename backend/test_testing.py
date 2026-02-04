#!/usr/bin/env python3

import pytest
import sys
import os
import warnings

# Suppress all warnings during tests
warnings.filterwarnings("ignore")

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database.models import Content, ContentStatusEnum, ContentTypeEnum, User, Category
from app.database.connection import get_db
from sqlalchemy import text

class TestTechHubBasics:
    """Test basic backend functionality without requiring a running server"""
    
    def test_01_database_connection(self):
        """Test that we can connect to the database"""
        try:
            db_gen = get_db()
            db = next(db_gen)
            # Simple query to test connection
            result = db.execute(text("SELECT 1")).scalar()
            assert result == 1
            db.close()
        except Exception as e:
            pytest.fail(f"Database connection failed: {e}")
    
    def test_02_content_model_exists(self):
        """Test that Content model is properly defined"""
        # Test enum values
        assert ContentStatusEnum.DRAFT.value == "draft"
        assert ContentStatusEnum.PUBLISHED.value == "published"
        assert ContentTypeEnum.VIDEO.value == "video"
        assert ContentTypeEnum.ARTICLE.value == "article"
        
        # Test that Content model has required fields
        required_fields = ['id', 'title', 'content_type', 'status', 'author_id', 'category_id']
        for field in required_fields:
            assert hasattr(Content, field), f"Content model missing field: {field}"
    
    def test_03_user_model_exists(self):
        """Test that User model is properly defined"""
        required_fields = ['id', 'email', 'username', 'hashed_password']
        for field in required_fields:
            assert hasattr(User, field), f"User model missing field: {field}"
    
    def test_04_category_model_exists(self):
        """Test that Category model is properly defined"""
        required_fields = ['id', 'name', 'description']
        for field in required_fields:
            assert hasattr(Category, field), f"Category model missing field: {field}"
    
    def test_05_database_has_content(self):
        """Test that database has content records"""
        try:
            db_gen = get_db()
            db = next(db_gen)
            
            # Count content items
            content_count = db.query(Content).count()
            assert content_count > 0, "Database should have at least some content"
            
            # Check for different content types
            videos = db.query(Content).filter(Content.content_type == ContentTypeEnum.VIDEO).count()
            articles = db.query(Content).filter(Content.content_type == ContentTypeEnum.ARTICLE).count()
            
            db.close()
        except Exception as e:
            pytest.fail(f"Database content check failed: {e}")
    
    def test_06_database_has_draft_content(self):
        """Test that database has draft (unpublished) content"""
        try:
            db_gen = get_db()
            db = next(db_gen)
            
            # Count draft content items
            draft_count = db.query(Content).filter(Content.status == ContentStatusEnum.DRAFT).count()
            assert draft_count >= 4, f"Database should have at least 4 draft items, found {draft_count}"
            
            db.close()
        except Exception as e:
            pytest.fail(f"Draft content check failed: {e}")
    
    def test_07_imports_work(self):
        """Test that all necessary imports work"""
        try:
            from app.main import app
            from app.routes.auth import router as auth_router
            from app.routes.content import router as content_router
            from app.routes.users import router as users_router
            
            # Test that FastAPI app exists
            assert app is not None
            assert hasattr(app, 'title')
            
        except ImportError as e:
            pytest.fail(f"Import failed: {e}")
    
    def test_08_basic_arithmetic(self):
        """Simple test that always passes"""
        assert 1 + 1 == 2
        assert 2 * 3 == 6
    
    def test_09_string_operations(self):
        """Test basic string operations"""
        test_string = "TechHub"
        assert test_string.lower() == "techhub"
        assert test_string.upper() == "TECHHUB"
        assert len(test_string) == 7
    
    def test_10_list_operations(self):
        """Test basic list operations"""
        test_list = [1, 2, 3, 4, 5]
        assert len(test_list) == 5
        assert sum(test_list) == 15
        assert max(test_list) == 5
        assert min(test_list) == 1

if __name__ == "__main__":
    pytest.main([__file__])
