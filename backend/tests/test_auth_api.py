import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch
from sqlalchemy.orm import Session

from app.main import app
from app.database.models import User
from app.auth.auth import get_password_hash

client = TestClient(app)


class TestAuthAPI:
    """Test authentication API endpoints"""
    
    @pytest.fixture
    def mock_db(self):
        """Create a mock database session"""
        return Mock(spec=Session)
    
    @pytest.fixture
    def sample_user_data(self):
        """Sample user data for testing"""
        return {
            "username": "testuser",
            "email": "test@example.com",
            "password": "testpassword123"
        }
    
    @pytest.fixture
    def existing_user(self):
        """Create an existing user for testing"""
        return User(
            id=1,
            username="existinguser",
            email="existing@example.com",
            hashed_password=get_password_hash("testpassword"),
            is_active=True
        )
    
    def test_register_new_user_success(self, mock_db, sample_user_data):
        """Test successful user registration"""
        # Mock database to return no existing user
        mock_db.query.return_value.filter.return_value.first.return_value = None
        
        with patch('app.api.auth.get_db', return_value=mock_db):
            response = client.post("/auth/register", json=sample_user_data)
            
            assert response.status_code == 200
            data = response.json()
            assert data["username"] == sample_user_data["username"]
            assert data["email"] == sample_user_data["email"]
            assert "password" not in data  # Password should not be returned
            assert data["is_active"] is True
    
    def test_register_existing_username(self, mock_db, sample_user_data, existing_user):
        """Test registration with existing username"""
        # Mock database to return existing user with same username
        mock_db.query.return_value.filter.return_value.first.return_value = existing_user
        
        with patch('app.api.auth.get_db', return_value=mock_db):
            response = client.post("/auth/register", json=sample_user_data)
            
            assert response.status_code == 400
            data = response.json()
            assert "already registered" in data["detail"].lower()
    
    def test_register_existing_email(self, mock_db, sample_user_data, existing_user):
        """Test registration with existing email"""
        # Mock database to return existing user with same email
        mock_db.query.return_value.filter.return_value.first.return_value = existing_user
        
        with patch('app.api.auth.get_db', return_value=mock_db):
            response = client.post("/auth/register", json={
                "username": "newuser",
                "email": "existing@example.com",
                "password": "testpassword123"
            })
            
            assert response.status_code == 400
            data = response.json()
            assert "already registered" in data["detail"].lower()
    
    def test_register_invalid_data(self):
        """Test registration with invalid data"""
        invalid_data = {
            "username": "",  # Empty username
            "email": "invalid-email",  # Invalid email
            "password": "123"  # Too short password
        }
        
        response = client.post("/auth/register", json=invalid_data)
        assert response.status_code == 422  # Validation error
    
    def test_login_success(self, mock_db, existing_user):
        """Test successful login"""
        # Mock database to return existing user
        mock_db.query.return_value.filter.return_value.first.return_value = existing_user
        
        with patch('app.api.auth.get_db', return_value=mock_db):
            response = client.post("/auth/login", data={
                "username": "existinguser",
                "password": "testpassword"
            })
            
            assert response.status_code == 200
            data = response.json()
            assert "access_token" in data
            assert data["token_type"] == "bearer"
            assert len(data["access_token"]) > 0
    
    def test_login_invalid_username(self, mock_db):
        """Test login with non-existent username"""
        # Mock database to return no user
        mock_db.query.return_value.filter.return_value.first.return_value = None
        
        with patch('app.api.auth.get_db', return_value=mock_db):
            response = client.post("/auth/login", data={
                "username": "nonexistentuser",
                "password": "testpassword"
            })
            
            assert response.status_code == 401
            data = response.json()
            assert "incorrect username or password" in data["detail"].lower()
    
    def test_login_invalid_password(self, mock_db, existing_user):
        """Test login with incorrect password"""
        # Mock database to return existing user
        mock_db.query.return_value.filter.return_value.first.return_value = existing_user
        
        with patch('app.api.auth.get_db', return_value=mock_db):
            response = client.post("/auth/login", data={
                "username": "existinguser",
                "password": "wrongpassword"
            })
            
            assert response.status_code == 401
            data = response.json()
            assert "incorrect username or password" in data["detail"].lower()
    
    def test_login_inactive_user(self, mock_db, existing_user):
        """Test login with inactive user"""
        existing_user.is_active = False
        mock_db.query.return_value.filter.return_value.first.return_value = existing_user
        
        with patch('app.api.auth.get_db', return_value=mock_db):
            response = client.post("/auth/login", data={
                "username": "existinguser",
                "password": "testpassword"
            })
            
            assert response.status_code == 400
            data = response.json()
            assert "inactive user" in data["detail"].lower()
    
    def test_get_current_user_profile(self, mock_db, existing_user):
        """Test getting current user profile"""
        # Mock the authentication dependency
        with patch('app.api.auth.get_current_active_user', return_value=existing_user):
            response = client.get("/auth/me")
            
            assert response.status_code == 200
            data = response.json()
            assert data["username"] == existing_user.username
            assert data["email"] == existing_user.email
            assert data["is_active"] == existing_user.is_active
            assert "password" not in data
    
    def test_logout(self):
        """Test logout endpoint"""
        response = client.post("/auth/logout")
        
        assert response.status_code == 200
        data = response.json()
        assert "successfully logged out" in data["message"].lower()


class TestAuthValidation:
    """Test authentication validation and edge cases"""
    
    def test_register_missing_fields(self):
        """Test registration with missing required fields"""
        # Missing username
        response = client.post("/auth/register", json={
            "email": "test@example.com",
            "password": "testpassword123"
        })
        assert response.status_code == 422
        
        # Missing email
        response = client.post("/auth/register", json={
            "username": "testuser",
            "password": "testpassword123"
        })
        assert response.status_code == 422
        
        # Missing password
        response = client.post("/auth/register", json={
            "username": "testuser",
            "email": "test@example.com"
        })
        assert response.status_code == 422
    
    def test_login_missing_fields(self):
        """Test login with missing required fields"""
        # Missing username
        response = client.post("/auth/login", data={
            "password": "testpassword"
        })
        assert response.status_code == 422
        
        # Missing password
        response = client.post("/auth/login", data={
            "username": "testuser"
        })
        assert response.status_code == 422
    
    def test_register_email_format(self):
        """Test registration with various email formats"""
        valid_emails = [
            "test@example.com",
            "user.name@domain.co.uk",
            "user+tag@example.org"
        ]
        
        invalid_emails = [
            "invalid-email",
            "@example.com",
            "user@",
            "user@.com"
        ]
        
        for email in valid_emails:
            response = client.post("/auth/register", json={
                "username": "testuser",
                "email": email,
                "password": "testpassword123"
            })
            # Should not fail on email format validation
            assert response.status_code in [200, 400]  # 400 if user exists, 200 if new
        
        for email in invalid_emails:
            response = client.post("/auth/register", json={
                "username": "testuser",
                "email": email,
                "password": "testpassword123"
            })
            assert response.status_code == 422  # Validation error


class TestAuthSecurity:
    """Test authentication security features"""
    
    def test_password_not_returned(self, mock_db):
        """Test that passwords are never returned in responses"""
        # Mock database for registration
        mock_db.query.return_value.filter.return_value.first.return_value = None
        
        with patch('app.api.auth.get_db', return_value=mock_db):
            response = client.post("/auth/register", json={
                "username": "testuser",
                "email": "test@example.com",
                "password": "testpassword123"
            })
            
            assert response.status_code == 200
            data = response.json()
            assert "password" not in data
            assert "hashed_password" not in data
    
    def test_token_format(self, mock_db, existing_user):
        """Test that JWT tokens have correct format"""
        mock_db.query.return_value.filter.return_value.first.return_value = existing_user
        
        with patch('app.api.auth.get_db', return_value=mock_db):
            response = client.post("/auth/login", data={
                "username": "existinguser",
                "password": "testpassword"
            })
            
            assert response.status_code == 200
            data = response.json()
            token = data["access_token"]
            
            # JWT tokens should have 3 parts separated by dots
            parts = token.split(".")
            assert len(parts) == 3
            
            # Each part should be base64 encoded
            import base64
            for part in parts:
                try:
                    base64.b64decode(part + "==")  # Add padding
                except:
                    pytest.fail(f"Token part {part} is not valid base64") 