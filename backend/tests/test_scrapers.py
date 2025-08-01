import pytest
from app.scraper.allegro_scraper import AllegroScraper
from app.scraper.olx_scraper import OlxScraper
from app.scraper.ceneo_scraper import CeneoScraper


class TestAllegroScraper:
    """Test cases for AllegroScraper"""
    
    def setup_method(self):
        """Set up test fixtures"""
        self.scraper = AllegroScraper()
    
    def test_initialization(self):
        """Test scraper initialization"""
        assert self.scraper.store_name == "Allegro"
        assert self.scraper.base_url == "https://allegro.pl"
    
    def test_extract_set_number(self):
        """Test LEGO set number extraction"""
        # Test various formats
        test_cases = [
            ("LEGO Technic 42100 Liebherr R 9800", "42100"),
            ("LEGO 42115 Lamborghini Sián", "42115"),
            ("LEGO Technic 42131-1 D11 Bulldozer", "42131-1"),
            ("LEGO 42145 Airbus H175", "42145"),
            ("LEGO Technic 42154 Ford GT", "42154"),
            ("LEGO City 60292", "60292"),
            ("No set number here", None),
            ("LEGO 12345-2 Test Set", "12345-2"),
        ]
        
        for title, expected in test_cases:
            result = self.scraper._extract_set_number(title)
            assert result == expected, f"Failed for title: {title}"
    
    def test_parse_price(self):
        """Test price parsing"""
        # Test various price formats
        test_cases = [
            ("2 499,00 zł", 2499.0),
            ("1 299 zł", 1299.0),
            ("899,99 PLN", 899.99),
            ("1,234.56", 1234.56),
            ("999", 999.0),
            ("", None),
            ("abc", None),
            ("2,499 zł", 2499.0),
        ]
        
        for price_text, expected in test_cases:
            result = self.scraper._parse_price(price_text)
            assert result == expected, f"Failed for price: {price_text}"
    
    def test_get_shipping_cost(self):
        """Test shipping cost calculation"""
        # Test free shipping for orders above 100 PLN
        assert self.scraper.get_shipping_cost(150.0) == 0.0
        assert self.scraper.get_shipping_cost(100.0) == 0.0
        
        # Test standard shipping for orders below 100 PLN
        assert self.scraper.get_shipping_cost(99.0) == 15.0
        assert self.scraper.get_shipping_cost(50.0) == 15.0


class TestOlxScraper:
    """Test cases for OlxScraper"""
    
    def setup_method(self):
        """Set up test fixtures"""
        self.scraper = OlxScraper()
    
    def test_initialization(self):
        """Test scraper initialization"""
        assert self.scraper.store_name == "OLX"
        assert self.scraper.base_url == "https://olx.pl"
    
    def test_extract_set_number(self):
        """Test LEGO set number extraction"""
        # Test various formats
        test_cases = [
            ("LEGO Technic 42100 Liebherr R 9800", "42100"),
            ("LEGO 42115 Lamborghini Sián", "42115"),
            ("LEGO Technic 42131-1 D11 Bulldozer", "42131-1"),
            ("LEGO 42145 Airbus H175", "42145"),
            ("LEGO Technic 42154 Ford GT", "42154"),
            ("LEGO City 60292", "60292"),
            ("No set number here", None),
            ("LEGO 12345-2 Test Set", "12345-2"),
        ]
        
        for title, expected in test_cases:
            result = self.scraper._extract_set_number(title)
            assert result == expected, f"Failed for title: {title}"
    
    def test_parse_price(self):
        """Test price parsing"""
        # Test various price formats
        test_cases = [
            ("2 499 zł", 2499.0),
            ("1 299 PLN", 1299.0),
            ("899,99 zł", 899.99),
            ("1,234.56", 1234.56),
            ("999", 999.0),
            ("", None),
            ("abc", None),
            ("2,499 zł", 2499.0),
        ]
        
        for price_text, expected in test_cases:
            result = self.scraper._parse_price(price_text)
            assert result == expected, f"Failed for price: {price_text}"
    
    def test_get_shipping_cost(self):
        """Test shipping cost calculation"""
        # OLX typically has different shipping rules
        # Test with various price ranges
        assert self.scraper.get_shipping_cost(200.0) >= 0.0
        assert self.scraper.get_shipping_cost(50.0) >= 0.0


class TestCeneoScraper:
    """Test cases for CeneoScraper"""
    
    def setup_method(self):
        """Set up test fixtures"""
        self.scraper = CeneoScraper()
    
    def test_initialization(self):
        """Test scraper initialization"""
        assert self.scraper.store_name == "Ceneo"
        assert self.scraper.base_url == "https://ceneo.pl"
    
    def test_extract_set_number(self):
        """Test LEGO set number extraction"""
        # Test various formats
        test_cases = [
            ("LEGO Technic 42100 Liebherr R 9800", "42100"),
            ("LEGO 42115 Lamborghini Sián", "42115"),
            ("LEGO Technic 42131-1 D11 Bulldozer", "42131-1"),
            ("LEGO 42145 Airbus H175", "42145"),
            ("LEGO Technic 42154 Ford GT", "42154"),
            ("LEGO City 60292", "60292"),
            ("No set number here", None),
            ("LEGO 12345-2 Test Set", "12345-2"),
        ]
        
        for title, expected in test_cases:
            result = self.scraper._extract_set_number(title)
            assert result == expected, f"Failed for title: {title}"
    
    def test_parse_price(self):
        """Test price parsing"""
        # Test various price formats
        test_cases = [
            ("2 499 zł", 2499.0),
            ("1 299 PLN", 1299.0),
            ("899,99 zł", 899.99),
            ("1,234.56", 1234.56),
            ("999", 999.0),
            ("", None),
            ("abc", None),
            ("2,499 zł", 2499.0),
        ]
        
        for price_text, expected in test_cases:
            result = self.scraper._parse_price(price_text)
            assert result == expected, f"Failed for price: {price_text}"
    
    def test_get_shipping_cost(self):
        """Test shipping cost calculation"""
        # Ceneo typically has different shipping rules
        # Test with various price ranges
        assert self.scraper.get_shipping_cost(200.0) >= 0.0
        assert self.scraper.get_shipping_cost(50.0) >= 0.0 