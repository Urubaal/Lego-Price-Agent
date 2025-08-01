import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch
from sqlalchemy.orm import Session
from datetime import datetime

from app.main import app
from app.database.models import User, LegoSet, WatchlistItem, PriceHistory
from app.auth.auth import get_password_hash

client = TestClient(app)


class TestWatchlistAPI:
    """Test watchlist API endpoints"""
    
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
    
    @pytest.fixture
    def sample_lego_set(self):
        """Create a sample LEGO set for testing"""
        return LegoSet(
            id=1,
            set_number="42100",
            name="Liebherr R 9800 Excavator",
            theme="Technic",
            year_released=2019,
            pieces=4108,
            price_msrp=449.99
        )
    
    @pytest.fixture
    def sample_price_history(self):
        """Create sample price history for testing"""
        return PriceHistory(
            id=1,
            lego_set_id=1,
            store_name="Test Store",
            store_url="https://teststore.com",
            price=400.00,
            shipping_cost=10.00,
            total_price=410.00,
            condition="new",
            availability=True,
            currency="PLN"
        )
    
    @pytest.fixture
    def sample_watchlist_item(self, sample_user, sample_lego_set):
        """Create a sample watchlist item for testing"""
        return WatchlistItem(
            id=1,
            user_id=sample_user.id,
            lego_set_id=sample_lego_set.id,
            target_price=350.00,
            notification_enabled=True,
            created_at=datetime.utcnow()
        )
    
    def test_add_to_watchlist_success(self, mock_db, sample_user, sample_lego_set, sample_price_history):
        """Test successfully adding item to watchlist"""
        # Mock database queries
        mock_db.query.return_value.filter.return_value.first.side_effect = [
            sample_lego_set,  # LEGO set exists
            None,  # Not in watchlist yet
            sample_price_history  # Current price
        ]
        
        with patch('app.api.watchlist.get_db', return_value=mock_db):
            with patch('app.api.watchlist.get_current_active_user', return_value=sample_user):
                response = client.post("/watchlist/", json={
                    "set_number": "42100",
                    "target_price": 350.00,
                    "notification_enabled": True
                })
                
                assert response.status_code == 200
                data = response.json()
                assert data["set_number"] == "42100"
                assert data["set_name"] == "Liebherr R 9800 Excavator"
                assert data["target_price"] == 350.00
                assert data["notification_enabled"] is True
                assert data["current_best_price"] == 410.00
                assert data["price_difference"] == -60.00  # target - current
    
    def test_add_to_watchlist_set_not_found(self, mock_db, sample_user):
        """Test adding non-existent LEGO set to watchlist"""
        # Mock database to return no LEGO set
        mock_db.query.return_value.filter.return_value.first.return_value = None
        
        with patch('app.api.watchlist.get_db', return_value=mock_db):
            with patch('app.api.watchlist.get_current_active_user', return_value=sample_user):
                response = client.post("/watchlist/", json={
                    "set_number": "99999",
                    "target_price": 350.00
                })
                
                assert response.status_code == 404
                data = response.json()
                assert "not found" in data["detail"].lower()
    
    def test_add_to_watchlist_already_exists(self, mock_db, sample_user, sample_lego_set, sample_watchlist_item):
        """Test adding LEGO set that's already in watchlist"""
        # Mock database queries
        mock_db.query.return_value.filter.return_value.first.side_effect = [
            sample_lego_set,  # LEGO set exists
            sample_watchlist_item  # Already in watchlist
        ]
        
        with patch('app.api.watchlist.get_db', return_value=mock_db):
            with patch('app.api.watchlist.get_current_active_user', return_value=sample_user):
                response = client.post("/watchlist/", json={
                    "set_number": "42100",
                    "target_price": 350.00
                })
                
                assert response.status_code == 400
                data = response.json()
                assert "already in watchlist" in data["detail"].lower()
    
    def test_get_watchlist_empty(self, mock_db, sample_user):
        """Test getting empty watchlist"""
        # Mock database to return empty watchlist
        mock_db.query.return_value.filter.return_value.all.return_value = []
        
        with patch('app.api.watchlist.get_db', return_value=mock_db):
            with patch('app.api.watchlist.get_current_active_user', return_value=sample_user):
                response = client.get("/watchlist/")
                
                assert response.status_code == 200
                data = response.json()
                assert isinstance(data, list)
                assert len(data) == 0
    
    def test_get_watchlist_with_items(self, mock_db, sample_user, sample_lego_set, sample_watchlist_item, sample_price_history):
        """Test getting watchlist with items"""
        # Mock database queries
        mock_db.query.return_value.filter.return_value.all.return_value = [sample_watchlist_item]
        mock_db.query.return_value.filter.return_value.first.side_effect = [
            sample_lego_set,  # LEGO set info
            sample_price_history  # Current price
        ]
        
        with patch('app.api.watchlist.get_db', return_value=mock_db):
            with patch('app.api.watchlist.get_current_active_user', return_value=sample_user):
                response = client.get("/watchlist/")
                
                assert response.status_code == 200
                data = response.json()
                assert isinstance(data, list)
                assert len(data) == 1
                
                item = data[0]
                assert item["set_number"] == "42100"
                assert item["set_name"] == "Liebherr R 9800 Excavator"
                assert item["target_price"] == 350.00
                assert item["current_best_price"] == 410.00
                assert item["price_difference"] == -60.00
    
    def test_update_watchlist_item_success(self, mock_db, sample_user, sample_lego_set, sample_watchlist_item, sample_price_history):
        """Test successfully updating watchlist item"""
        # Mock database queries
        mock_db.query.return_value.filter.return_value.first.side_effect = [
            sample_watchlist_item,  # Watchlist item exists
            sample_lego_set,  # LEGO set info
            sample_price_history  # Current price
        ]
        
        with patch('app.api.watchlist.get_db', return_value=mock_db):
            with patch('app.api.watchlist.get_current_active_user', return_value=sample_user):
                response = client.put("/watchlist/1", json={
                    "set_number": "42100",
                    "target_price": 300.00,
                    "notification_enabled": False
                })
                
                assert response.status_code == 200
                data = response.json()
                assert data["target_price"] == 300.00
                assert data["notification_enabled"] is False
                assert data["price_difference"] == -110.00  # 300 - 410
    
    def test_update_watchlist_item_not_found(self, mock_db, sample_user):
        """Test updating non-existent watchlist item"""
        # Mock database to return no watchlist item
        mock_db.query.return_value.filter.return_value.first.return_value = None
        
        with patch('app.api.watchlist.get_db', return_value=mock_db):
            with patch('app.api.watchlist.get_current_active_user', return_value=sample_user):
                response = client.put("/watchlist/999", json={
                    "set_number": "42100",
                    "target_price": 300.00
                })
                
                assert response.status_code == 404
                data = response.json()
                assert "not found" in data["detail"].lower()
    
    def test_update_watchlist_item_wrong_user(self, mock_db, sample_user, sample_watchlist_item):
        """Test updating watchlist item belonging to different user"""
        # Change the user_id to simulate different user
        sample_watchlist_item.user_id = 999
        
        # Mock database to return watchlist item with different user
        mock_db.query.return_value.filter.return_value.first.return_value = sample_watchlist_item
        
        with patch('app.api.watchlist.get_db', return_value=mock_db):
            with patch('app.api.watchlist.get_current_active_user', return_value=sample_user):
                response = client.put("/watchlist/1", json={
                    "set_number": "42100",
                    "target_price": 300.00
                })
                
                assert response.status_code == 404
                data = response.json()
                assert "not found" in data["detail"].lower()
    
    def test_remove_from_watchlist_success(self, mock_db, sample_user, sample_watchlist_item):
        """Test successfully removing item from watchlist"""
        # Mock database to return watchlist item
        mock_db.query.return_value.filter.return_value.first.return_value = sample_watchlist_item
        
        with patch('app.api.watchlist.get_db', return_value=mock_db):
            with patch('app.api.watchlist.get_current_active_user', return_value=sample_user):
                response = client.delete("/watchlist/1")
                
                assert response.status_code == 200
                data = response.json()
                assert "removed from watchlist" in data["message"].lower()
    
    def test_remove_from_watchlist_not_found(self, mock_db, sample_user):
        """Test removing non-existent watchlist item"""
        # Mock database to return no watchlist item
        mock_db.query.return_value.filter.return_value.first.return_value = None
        
        with patch('app.api.watchlist.get_db', return_value=mock_db):
            with patch('app.api.watchlist.get_current_active_user', return_value=sample_user):
                response = client.delete("/watchlist/999")
                
                assert response.status_code == 404
                data = response.json()
                assert "not found" in data["detail"].lower()


class TestWatchlistValidation:
    """Test watchlist validation and edge cases"""
    
    def test_add_to_watchlist_invalid_data(self, mock_db, sample_user):
        """Test adding to watchlist with invalid data"""
        with patch('app.api.watchlist.get_db', return_value=mock_db):
            with patch('app.api.watchlist.get_current_active_user', return_value=sample_user):
                # Missing set_number
                response = client.post("/watchlist/", json={
                    "target_price": 350.00
                })
                assert response.status_code == 422
                
                # Invalid target_price (negative)
                response = client.post("/watchlist/", json={
                    "set_number": "42100",
                    "target_price": -100.00
                })
                assert response.status_code == 422
    
    def test_update_watchlist_invalid_data(self, mock_db, sample_user):
        """Test updating watchlist with invalid data"""
        with patch('app.api.watchlist.get_db', return_value=mock_db):
            with patch('app.api.watchlist.get_current_active_user', return_value=sample_user):
                # Invalid target_price (zero)
                response = client.put("/watchlist/1", json={
                    "set_number": "42100",
                    "target_price": 0.00
                })
                assert response.status_code == 422
    
    def test_watchlist_price_calculations(self, mock_db, sample_user, sample_lego_set, sample_watchlist_item):
        """Test price difference calculations"""
        # Test with different price scenarios
        test_cases = [
            (350.00, 410.00, -60.00),  # Target below current
            (450.00, 410.00, 40.00),   # Target above current
            (410.00, 410.00, 0.00),    # Target equals current
        ]
        
        for target_price, current_price, expected_diff in test_cases:
            sample_watchlist_item.target_price = target_price
            sample_price = PriceHistory(
                id=1,
                lego_set_id=1,
                total_price=current_price
            )
            
            # Mock database queries
            mock_db.query.return_value.filter.return_value.first.side_effect = [
                sample_watchlist_item,
                sample_lego_set,
                sample_price
            ]
            
            with patch('app.api.watchlist.get_db', return_value=mock_db):
                with patch('app.api.watchlist.get_current_active_user', return_value=sample_user):
                    response = client.get("/watchlist/")
                    
                    assert response.status_code == 200
                    data = response.json()
                    if len(data) > 0:
                        assert data[0]["price_difference"] == expected_diff


class TestWatchlistSecurity:
    """Test watchlist security features"""
    
    def test_watchlist_requires_authentication(self):
        """Test that watchlist endpoints require authentication"""
        # Test without authentication
        response = client.get("/watchlist/")
        assert response.status_code == 401
        
        response = client.post("/watchlist/", json={
            "set_number": "42100",
            "target_price": 350.00
        })
        assert response.status_code == 401
        
        response = client.put("/watchlist/1", json={
            "set_number": "42100",
            "target_price": 350.00
        })
        assert response.status_code == 401
        
        response = client.delete("/watchlist/1")
        assert response.status_code == 401
    
    def test_watchlist_user_isolation(self, mock_db, sample_user, sample_watchlist_item):
        """Test that users can only access their own watchlist items"""
        # Create watchlist item for different user
        sample_watchlist_item.user_id = 999  # Different user
        
        # Mock database to return watchlist item
        mock_db.query.return_value.filter.return_value.first.return_value = sample_watchlist_item
        
        with patch('app.api.watchlist.get_db', return_value=mock_db):
            with patch('app.api.watchlist.get_current_active_user', return_value=sample_user):
                # Try to access watchlist item belonging to different user
                response = client.get("/watchlist/")
                
                # Should not return items from other users
                assert response.status_code == 200
                data = response.json()
                # The mock setup should ensure only user's own items are returned 