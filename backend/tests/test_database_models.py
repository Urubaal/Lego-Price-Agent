import pytest
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import IntegrityError

from app.database.models import (
    Base, User, LegoSet, PriceHistory, 
    PriceRecommendation, WatchlistItem
)


class TestDatabaseModels:
    """Test database models functionality"""
    
    @pytest.fixture
    def engine(self):
        """Create in-memory SQLite engine for testing"""
        engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(bind=engine)
        return engine
    
    @pytest.fixture
    def session(self, engine):
        """Create database session"""
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        session = SessionLocal()
        try:
            yield session
        finally:
            session.close()
    
    def test_user_creation(self, session):
        """Test User model creation"""
        user = User(
            username="testuser",
            email="test@example.com",
            hashed_password="hashedpassword123"
        )
        
        session.add(user)
        session.commit()
        session.refresh(user)
        
        assert user.id is not None
        assert user.username == "testuser"
        assert user.email == "test@example.com"
        assert user.hashed_password == "hashedpassword123"
        assert user.is_active is True
        assert user.created_at is not None
    
    def test_user_unique_constraints(self, session):
        """Test User model unique constraints"""
        # Create first user
        user1 = User(
            username="testuser",
            email="test@example.com",
            hashed_password="hashedpassword123"
        )
        session.add(user1)
        session.commit()
        
        # Try to create user with same username
        user2 = User(
            username="testuser",  # Same username
            email="different@example.com",
            hashed_password="hashedpassword456"
        )
        session.add(user2)
        
        with pytest.raises(IntegrityError):
            session.commit()
        
        session.rollback()
        
        # Try to create user with same email
        user3 = User(
            username="differentuser",
            email="test@example.com",  # Same email
            hashed_password="hashedpassword789"
        )
        session.add(user3)
        
        with pytest.raises(IntegrityError):
            session.commit()
    
    def test_lego_set_creation(self, session):
        """Test LegoSet model creation"""
        lego_set = LegoSet(
            set_number="42100",
            name="Liebherr R 9800 Excavator",
            theme="Technic",
            year_released=2019,
            pieces=4108,
            minifigures=0,
            age_range="11+",
            price_msrp=449.99
        )
        
        session.add(lego_set)
        session.commit()
        session.refresh(lego_set)
        
        assert lego_set.id is not None
        assert lego_set.set_number == "42100"
        assert lego_set.name == "Liebherr R 9800 Excavator"
        assert lego_set.theme == "Technic"
        assert lego_set.year_released == 2019
        assert lego_set.pieces == 4108
        assert lego_set.price_msrp == 449.99
        assert lego_set.created_at is not None
        assert lego_set.updated_at is not None
    
    def test_lego_set_unique_constraint(self, session):
        """Test LegoSet model unique constraint on set_number"""
        # Create first LEGO set
        lego_set1 = LegoSet(
            set_number="42100",
            name="Liebherr R 9800 Excavator",
            theme="Technic"
        )
        session.add(lego_set1)
        session.commit()
        
        # Try to create LEGO set with same set_number
        lego_set2 = LegoSet(
            set_number="42100",  # Same set number
            name="Different Name",
            theme="City"
        )
        session.add(lego_set2)
        
        with pytest.raises(IntegrityError):
            session.commit()
    
    def test_price_history_creation(self, session):
        """Test PriceHistory model creation"""
        # Create LEGO set first
        lego_set = LegoSet(
            set_number="42100",
            name="Liebherr R 9800 Excavator",
            theme="Technic"
        )
        session.add(lego_set)
        session.commit()
        
        price_history = PriceHistory(
            lego_set_id=lego_set.id,
            store_name="Test Store",
            store_url="https://teststore.com",
            price=400.00,
            shipping_cost=10.00,
            total_price=410.00,
            condition="new",
            availability=True,
            currency="PLN"
        )
        
        session.add(price_history)
        session.commit()
        session.refresh(price_history)
        
        assert price_history.id is not None
        assert price_history.lego_set_id == lego_set.id
        assert price_history.store_name == "Test Store"
        assert price_history.price == 400.00
        assert price_history.total_price == 410.00
        assert price_history.condition == "new"
        assert price_history.availability is True
        assert price_history.currency == "PLN"
        assert price_history.scraped_at is not None
    
    def test_price_history_foreign_key_constraint(self, session):
        """Test PriceHistory foreign key constraint"""
        # Try to create price history without existing LEGO set
        price_history = PriceHistory(
            lego_set_id=999,  # Non-existent LEGO set ID
            store_name="Test Store",
            price=400.00,
            total_price=400.00
        )
        session.add(price_history)
        
        with pytest.raises(IntegrityError):
            session.commit()
    
    def test_price_recommendation_creation(self, session):
        """Test PriceRecommendation model creation"""
        # Create LEGO set first
        lego_set = LegoSet(
            set_number="42100",
            name="Liebherr R 9800 Excavator",
            theme="Technic"
        )
        session.add(lego_set)
        session.commit()
        
        recommendation = PriceRecommendation(
            lego_set_id=lego_set.id,
            current_best_price=410.00,
            average_market_price=450.00,
            price_difference=-40.00,
            price_percentage=91.11,
            recommendation="buy",
            confidence_score=0.85,
            reasoning="Good price compared to market average"
        )
        
        session.add(recommendation)
        session.commit()
        session.refresh(recommendation)
        
        assert recommendation.id is not None
        assert recommendation.lego_set_id == lego_set.id
        assert recommendation.current_best_price == 410.00
        assert recommendation.average_market_price == 450.00
        assert recommendation.price_difference == -40.00
        assert recommendation.price_percentage == 91.11
        assert recommendation.recommendation == "buy"
        assert recommendation.confidence_score == 0.85
        assert recommendation.reasoning == "Good price compared to market average"
        assert recommendation.created_at is not None
    
    def test_watchlist_item_creation(self, session):
        """Test WatchlistItem model creation"""
        # Create user and LEGO set first
        user = User(
            username="testuser",
            email="test@example.com",
            hashed_password="hashedpassword123"
        )
        session.add(user)
        
        lego_set = LegoSet(
            set_number="42100",
            name="Liebherr R 9800 Excavator",
            theme="Technic"
        )
        session.add(lego_set)
        session.commit()
        
        watchlist_item = WatchlistItem(
            user_id=user.id,
            lego_set_id=lego_set.id,
            target_price=350.00,
            notification_enabled=True
        )
        
        session.add(watchlist_item)
        session.commit()
        session.refresh(watchlist_item)
        
        assert watchlist_item.id is not None
        assert watchlist_item.user_id == user.id
        assert watchlist_item.lego_set_id == lego_set.id
        assert watchlist_item.target_price == 350.00
        assert watchlist_item.notification_enabled is True
        assert watchlist_item.created_at is not None
    
    def test_watchlist_item_foreign_key_constraints(self, session):
        """Test WatchlistItem foreign key constraints"""
        # Try to create watchlist item with non-existent user
        watchlist_item = WatchlistItem(
            user_id=999,  # Non-existent user ID
            lego_set_id=1,
            target_price=350.00
        )
        session.add(watchlist_item)
        
        with pytest.raises(IntegrityError):
            session.commit()
        
        session.rollback()
        
        # Try to create watchlist item with non-existent LEGO set
        watchlist_item2 = WatchlistItem(
            user_id=1,
            lego_set_id=999,  # Non-existent LEGO set ID
            target_price=350.00
        )
        session.add(watchlist_item2)
        
        with pytest.raises(IntegrityError):
            session.commit()


class TestModelRelationships:
    """Test model relationships and associations"""
    
    @pytest.fixture
    def engine(self):
        """Create in-memory SQLite engine for testing"""
        engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(bind=engine)
        return engine
    
    @pytest.fixture
    def session(self, engine):
        """Create database session"""
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        session = SessionLocal()
        try:
            yield session
        finally:
            session.close()
    
    def test_user_watchlist_relationship(self, session):
        """Test User-WatchlistItem relationship"""
        # Create user
        user = User(
            username="testuser",
            email="test@example.com",
            hashed_password="hashedpassword123"
        )
        session.add(user)
        
        # Create LEGO set
        lego_set = LegoSet(
            set_number="42100",
            name="Liebherr R 9800 Excavator",
            theme="Technic"
        )
        session.add(lego_set)
        session.commit()
        
        # Create watchlist item
        watchlist_item = WatchlistItem(
            user_id=user.id,
            lego_set_id=lego_set.id,
            target_price=350.00
        )
        session.add(watchlist_item)
        session.commit()
        
        # Test relationship
        assert len(user.watchlist) == 1
        assert user.watchlist[0].id == watchlist_item.id
        assert user.watchlist[0].target_price == 350.00
    
    def test_lego_set_price_history_relationship(self, session):
        """Test LegoSet-PriceHistory relationship"""
        # Create LEGO set
        lego_set = LegoSet(
            set_number="42100",
            name="Liebherr R 9800 Excavator",
            theme="Technic"
        )
        session.add(lego_set)
        session.commit()
        
        # Create price history entries
        price1 = PriceHistory(
            lego_set_id=lego_set.id,
            store_name="Store 1",
            price=400.00,
            total_price=400.00
        )
        price2 = PriceHistory(
            lego_set_id=lego_set.id,
            store_name="Store 2",
            price=420.00,
            total_price=420.00
        )
        session.add_all([price1, price2])
        session.commit()
        
        # Test relationship
        assert len(lego_set.prices) == 2
        assert lego_set.prices[0].store_name == "Store 1"
        assert lego_set.prices[1].store_name == "Store 2"
    
    def test_lego_set_recommendations_relationship(self, session):
        """Test LegoSet-PriceRecommendation relationship"""
        # Create LEGO set
        lego_set = LegoSet(
            set_number="42100",
            name="Liebherr R 9800 Excavator",
            theme="Technic"
        )
        session.add(lego_set)
        session.commit()
        
        # Create recommendation
        recommendation = PriceRecommendation(
            lego_set_id=lego_set.id,
            current_best_price=410.00,
            average_market_price=450.00,
            price_difference=-40.00,
            price_percentage=91.11,
            recommendation="buy",
            confidence_score=0.85
        )
        session.add(recommendation)
        session.commit()
        
        # Test relationship
        assert len(lego_set.recommendations) == 1
        assert lego_set.recommendations[0].recommendation == "buy"
        assert lego_set.recommendations[0].confidence_score == 0.85


class TestModelValidation:
    """Test model validation and constraints"""
    
    @pytest.fixture
    def engine(self):
        """Create in-memory SQLite engine for testing"""
        engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(bind=engine)
        return engine
    
    @pytest.fixture
    def session(self, engine):
        """Create database session"""
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        session = SessionLocal()
        try:
            yield session
        finally:
            session.close()
    
    def test_user_required_fields(self, session):
        """Test User model required fields"""
        # Try to create user without required fields
        user = User()
        session.add(user)
        
        with pytest.raises(IntegrityError):
            session.commit()
    
    def test_lego_set_required_fields(self, session):
        """Test LegoSet model required fields"""
        # Try to create LEGO set without required fields
        lego_set = LegoSet()
        session.add(lego_set)
        
        with pytest.raises(IntegrityError):
            session.commit()
    
    def test_price_history_required_fields(self, session):
        """Test PriceHistory model required fields"""
        # Try to create price history without required fields
        price_history = PriceHistory()
        session.add(price_history)
        
        with pytest.raises(IntegrityError):
            session.commit()
    
    def test_watchlist_item_required_fields(self, session):
        """Test WatchlistItem model required fields"""
        # Try to create watchlist item without required fields
        watchlist_item = WatchlistItem()
        session.add(watchlist_item)
        
        with pytest.raises(IntegrityError):
            session.commit()
    
    def test_price_recommendation_required_fields(self, session):
        """Test PriceRecommendation model required fields"""
        # Try to create recommendation without required fields
        recommendation = PriceRecommendation()
        session.add(recommendation)
        
        with pytest.raises(IntegrityError):
            session.commit()


class TestModelDefaults:
    """Test model default values"""
    
    @pytest.fixture
    def engine(self):
        """Create in-memory SQLite engine for testing"""
        engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(bind=engine)
        return engine
    
    @pytest.fixture
    def session(self, engine):
        """Create database session"""
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        session = SessionLocal()
        try:
            yield session
        finally:
            session.close()
    
    def test_user_defaults(self, session):
        """Test User model default values"""
        user = User(
            username="testuser",
            email="test@example.com",
            hashed_password="hashedpassword123"
        )
        session.add(user)
        session.commit()
        session.refresh(user)
        
        assert user.is_active is True
        assert user.created_at is not None
    
    def test_price_history_defaults(self, session):
        """Test PriceHistory model default values"""
        # Create LEGO set first
        lego_set = LegoSet(
            set_number="42100",
            name="Test Set",
            theme="Technic"
        )
        session.add(lego_set)
        session.commit()
        
        price_history = PriceHistory(
            lego_set_id=lego_set.id,
            store_name="Test Store",
            price=400.00,
            total_price=400.00
        )
        session.add(price_history)
        session.commit()
        session.refresh(price_history)
        
        assert price_history.shipping_cost == 0.0
        assert price_history.condition == "new"
        assert price_history.availability is True
        assert price_history.currency == "PLN"
        assert price_history.scraped_at is not None
    
    def test_watchlist_item_defaults(self, session):
        """Test WatchlistItem model default values"""
        # Create user and LEGO set first
        user = User(
            username="testuser",
            email="test@example.com",
            hashed_password="hashedpassword123"
        )
        session.add(user)
        
        lego_set = LegoSet(
            set_number="42100",
            name="Test Set",
            theme="Technic"
        )
        session.add(lego_set)
        session.commit()
        
        watchlist_item = WatchlistItem(
            user_id=user.id,
            lego_set_id=lego_set.id
        )
        session.add(watchlist_item)
        session.commit()
        session.refresh(watchlist_item)
        
        assert watchlist_item.notification_enabled is True
        assert watchlist_item.created_at is not None 