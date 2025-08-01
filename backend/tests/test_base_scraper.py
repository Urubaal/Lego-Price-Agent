import pytest
from datetime import datetime
from app.scraper.base_scraper import LegoSet, BaseScraper


class TestLegoSet:
    """Test cases for LegoSet dataclass"""
    
    def test_lego_set_creation(self):
        """Test creating a LegoSet instance"""
        lego_set = LegoSet(
            set_number="42100",
            name="Liebherr R 9800",
            price=2499.0,
            shipping_cost=0.0,
            total_price=2499.0,
            store_name="Allegro",
            store_url="https://allegro.pl/item/123",
            condition="new",
            availability=True,
            last_updated=datetime.now()
        )
        
        assert lego_set.set_number == "42100"
        assert lego_set.name == "Liebherr R 9800"
        assert lego_set.price == 2499.0
        assert lego_set.shipping_cost == 0.0
        assert lego_set.total_price == 2499.0
        assert lego_set.store_name == "Allegro"
        assert lego_set.condition == "new"
        assert lego_set.availability is True
    
    def test_lego_set_with_image_url(self):
        """Test creating a LegoSet with image URL"""
        lego_set = LegoSet(
            set_number="42115",
            name="Lamborghini Sián FKP 37",
            price=1299.0,
            shipping_cost=15.0,
            total_price=1314.0,
            store_name="OLX",
            store_url="https://olx.pl/item/456",
            condition="used",
            availability=True,
            last_updated=datetime.now(),
            image_url="https://example.com/image.jpg"
        )
        
        assert lego_set.image_url == "https://example.com/image.jpg"


class TestBaseScraper:
    """Test cases for BaseScraper abstract class"""
    
    def test_base_scraper_initialization(self):
        """Test BaseScraper initialization"""
        class MockScraper(BaseScraper):
            async def search_sets(self, query: str):
                return []
            
            async def get_set_details(self, set_number: str):
                return None
            
            async def get_shipping_cost(self, price: float, location: str = "PL"):
                return 0.0
        
        scraper = MockScraper("Test Store")
        assert scraper.store_name == "Test Store"
        assert scraper.base_url == ""
    
    def test_calculate_total_price(self):
        """Test total price calculation"""
        class MockScraper(BaseScraper):
            async def search_sets(self, query: str):
                return []
            
            async def get_set_details(self, set_number: str):
                return None
            
            async def get_shipping_cost(self, price: float, location: str = "PL"):
                return 0.0
        
        scraper = MockScraper("Test Store")
        
        # Test with zero shipping
        total = scraper.calculate_total_price(100.0, 0.0)
        assert total == 100.0
        
        # Test with shipping cost
        total = scraper.calculate_total_price(100.0, 15.0)
        assert total == 115.0
        
        # Test with decimal prices
        total = scraper.calculate_total_price(99.99, 5.50)
        assert total == 105.49 