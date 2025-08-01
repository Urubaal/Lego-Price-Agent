import pytest
from datetime import datetime, timedelta
from unittest.mock import Mock, patch
from sqlalchemy.orm import Session

from app.auth.auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    verify_token,
    get_current_user,
    get_current_active_user
)
from app.database.models import User
from app.database.database import get_db


class TestPasswordHashing:
    """Test password hashing and verification functions"""
    
    def test_get_password_hash(self):
        """Test password hashing"""
        password = "testpassword123"
        hashed = get_password_hash(password)
        
        assert hashed != password
        assert len(hashed) > len(password)
        assert hashed.startswith("$2b$")  # bcrypt format
    
    def test_verify_password_correct(self):
        """Test password verification with correct password"""
        password = "testpassword123"
        hashed = get_password_hash(password)
        
        assert verify_password(password, hashed) is True
    
    def test_verify_password_incorrect(self):
        """Test password verification with incorrect password"""
        password = "testpassword123"
        wrong_password = "wrongpassword"
        hashed = get_password_hash(password)
        
        assert verify_password(wrong_password, hashed) is False


class TestJWTToken:
    """Test JWT token creation and verification"""
    
    def test_create_access_token(self):
        """Test access token creation"""
        data = {"sub": "testuser"}
        token = create_access_token(data)
        
        assert isinstance(token, str)
        assert len(token) > 0
    
    def test_create_access_token_with_expiry(self):
        """Test access token creation with custom expiry"""
        data = {"sub": "testuser"}
        expires_delta = timedelta(minutes=30)
        token = create_access_token(data, expires_delta=expires_delta)
        
        assert isinstance(token, str)
        assert len(token) > 0
    
    def test_verify_token_valid(self):
        """Test token verification with valid token"""
        data = {"sub": "testuser"}
        token = create_access_token(data)
        
        # Mock the credentials exception
        credentials_exception = Exception("Invalid credentials")
        
        username = verify_token(token, credentials_exception)
        assert username == "testuser"
    
    def test_verify_token_invalid(self):
        """Test token verification with invalid token"""
        invalid_token = "invalid.token.here"
        credentials_exception = Exception("Invalid credentials")
        
        with pytest.raises(Exception):
            verify_token(invalid_token, credentials_exception)


class TestUserManagement:
    """Test user management functions"""
    
    @pytest.fixture
    def mock_db(self):
        """Create a mock database session"""
        return Mock(spec=Session)
    
    @pytest.fixture
    def sample_user(self):
        """Create a sample user for testing"""
        return User(
            id=1,
            username="testuser",
            email="test@example.com",
            hashed_password=get_password_hash("testpassword"),
            is_active=True
        )
    
    def test_get_current_user_valid(self, mock_db, sample_user):
        """Test getting current user with valid token"""
        # Create a valid token
        token = create_access_token({"sub": sample_user.username})
        
        # Mock the database query
        mock_db.query.return_value.filter.return_value.first.return_value = sample_user
        
        with patch('app.auth.auth.get_db', return_value=mock_db):
            with patch('app.auth.auth.oauth2_scheme', return_value=token):
                user = get_current_user(token, mock_db)
                
                assert user == sample_user
                assert user.username == "testuser"
                assert user.is_active is True
    
    def test_get_current_user_not_found(self, mock_db):
        """Test getting current user with non-existent user"""
        token = create_access_token({"sub": "nonexistentuser"})
        
        # Mock the database query to return None
        mock_db.query.return_value.filter.return_value.first.return_value = None
        
        with patch('app.auth.auth.get_db', return_value=mock_db):
            with patch('app.auth.auth.oauth2_scheme', return_value=token):
                with pytest.raises(Exception):
                    get_current_user(token, mock_db)
    
    def test_get_current_active_user_active(self, sample_user):
        """Test getting current active user with active user"""
        user = get_current_active_user(sample_user)
        assert user == sample_user
    
    def test_get_current_active_user_inactive(self, sample_user):
        """Test getting current active user with inactive user"""
        sample_user.is_active = False
        
        with pytest.raises(Exception):
            get_current_active_user(sample_user)


class TestUserModel:
    """Test User model functionality"""
    
    def test_user_creation(self):
        """Test user creation with all fields"""
        user = User(
            username="testuser",
            email="test@example.com",
            hashed_password="hashedpassword123"
        )
        
        assert user.username == "testuser"
        assert user.email == "test@example.com"
        assert user.hashed_password == "hashedpassword123"
        assert user.is_active is True
        assert user.created_at is not None
    
    def test_user_defaults(self):
        """Test user creation with default values"""
        user = User(
            username="testuser",
            email="test@example.com",
            hashed_password="hashedpassword123"
        )
        
        assert user.is_active is True
        assert user.created_at is not None
    
    def test_user_string_representation(self):
        """Test user string representation"""
        user = User(
            id=1,
            username="testuser",
            email="test@example.com"
        )
        
        # This will be used for debugging and logging
        assert "testuser" in str(user)
        assert "test@example.com" in str(user)


class TestPasswordSecurity:
    """Test password security features"""
    
    def test_password_complexity(self):
        """Test that passwords are properly hashed"""
        passwords = [
            "simple",
            "password123",
            "VeryLongPasswordWithSpecialChars!@#",
            "1234567890"
        ]
        
        for password in passwords:
            hashed = get_password_hash(password)
            
            # Verify the hash is different from original
            assert hashed != password
            
            # Verify the hash can be verified
            assert verify_password(password, hashed) is True
            
            # Verify wrong password doesn't work
            assert verify_password(password + "wrong", hashed) is False
    
    def test_same_password_different_hashes(self):
        """Test that same password produces different hashes (salt)"""
        password = "testpassword"
        hash1 = get_password_hash(password)
        hash2 = get_password_hash(password)
        
        # Hashes should be different due to salt
        assert hash1 != hash2
        
        # Both should verify correctly
        assert verify_password(password, hash1) is True
        assert verify_password(password, hash2) is True 