import pytest
from datetime import datetime
from app.recommender.price_analyzer import PriceAnalyzer, PriceRecommendation
from app.scraper.base_scraper import LegoSet


class TestPriceAnalyzer:
    """Test cases for PriceAnalyzer class"""
    
    def setup_method(self):
        """Set up test fixtures"""
        self.analyzer = PriceAnalyzer()
        
        # Create test LEGO sets
        self.test_sets = [
            LegoSet(
                set_number="42100",
                name="Liebherr R 9800",
                price=2400.0,
                shipping_cost=0.0,
                total_price=2400.0,
                store_name="Allegro",
                store_url="https://allegro.pl/item/1",
                condition="new",
                availability=True,
                last_updated=datetime.now()
            ),
            LegoSet(
                set_number="42100",
                name="Liebherr R 9800",
                price=2600.0,
                shipping_cost=15.0,
                total_price=2615.0,
                store_name="OLX",
                store_url="https://olx.pl/item/2",
                condition="new",
                availability=True,
                last_updated=datetime.now()
            ),
            LegoSet(
                set_number="42100",
                name="Liebherr R 9800",
                price=2500.0,
                shipping_cost=0.0,
                total_price=2500.0,
                store_name="Ceneo",
                store_url="https://ceneo.pl/item/3",
                condition="new",
                availability=True,
                last_updated=datetime.now()
            )
        ]
    
    def test_group_sets_by_number(self):
        """Test grouping sets by set number"""
        grouped = self.analyzer._group_sets_by_number(self.test_sets)
        
        assert "42100" in grouped
        assert len(grouped["42100"]) == 3
        assert all(set.set_number == "42100" for set in grouped["42100"])
    
    def test_analyze_single_set(self):
        """Test analyzing a single set"""
        recommendation = self.analyzer._analyze_single_set("42100", self.test_sets)
        
        assert recommendation is not None
        assert recommendation.set_number == "42100"
        assert recommendation.set_name == "Liebherr R 9800"
        assert recommendation.current_best_price == 2400.0
        assert recommendation.average_market_price == 2505.0  # (2400 + 2615 + 2500) / 3
        assert recommendation.price_percentage > 0  # Should be positive (below average)
    
    def test_analyze_prices(self):
        """Test analyzing multiple sets"""
        recommendations = self.analyzer.analyze_prices(self.test_sets)
        
        assert len(recommendations) == 1
        assert recommendations[0].set_number == "42100"
        assert len(recommendations[0].best_offers) == 3
    
    def test_get_recommendation_buy(self):
        """Test buy recommendation logic"""
        # Price 20% below average should trigger buy
        recommendation, confidence, reasoning = self.analyzer._get_recommendation(
            best_price=800.0,  # 20% below 1000
            avg_price=1000.0,
            median_price=1000.0,
            price_percentage=20.0,
            condition="new"
        )
        
        assert recommendation == "buy"
        assert "Excellent deal" in reasoning
        assert confidence > 0
    
    def test_get_recommendation_wait(self):
        """Test wait recommendation logic"""
        # Price within 5% of average should trigger wait
        recommendation, confidence, reasoning = self.analyzer._get_recommendation(
            best_price=980.0,  # 2% below 1000
            avg_price=1000.0,
            median_price=1000.0,
            price_percentage=2.0,
            condition="new"
        )
        
        assert recommendation == "wait"
        assert "Average price" in reasoning
    
    def test_get_recommendation_avoid(self):
        """Test avoid recommendation logic"""
        # Price above average should trigger avoid
        recommendation, confidence, reasoning = self.analyzer._get_recommendation(
            best_price=1100.0,  # 10% above 1000
            avg_price=1000.0,
            median_price=1000.0,
            price_percentage=-10.0,
            condition="new"
        )
        
        assert recommendation == "avoid"
        assert "above market average" in reasoning
    
    def test_used_set_recommendation(self):
        """Test recommendation logic for used sets"""
        # Used sets should be significantly cheaper
        recommendation, confidence, reasoning = self.analyzer._get_recommendation(
            best_price=800.0,  # Only 20% below average for used set
            avg_price=1000.0,
            median_price=1000.0,
            price_percentage=20.0,
            condition="used"
        )
        
        assert recommendation == "avoid"
        assert "Used set should be cheaper" in reasoning
    
    def test_update_price_history(self):
        """Test updating price history"""
        set_number = "42100"
        price = 2500.0
        date = datetime.now()
        
        self.analyzer.update_price_history(set_number, price, date)
        
        assert set_number in self.analyzer.price_history
        assert len(self.analyzer.price_history[set_number]) == 1
        assert self.analyzer.price_history[set_number][0]['price'] == price
    
    def test_get_price_trend(self):
        """Test getting price trend"""
        set_number = "42100"
        
        # Add some historical data
        self.analyzer.update_price_history(set_number, 1000.0, datetime(2023, 1, 1))
        self.analyzer.update_price_history(set_number, 1100.0, datetime(2023, 1, 2))
        self.analyzer.update_price_history(set_number, 1200.0, datetime(2023, 1, 3))
        
        trend_data = self.analyzer.get_price_trend(set_number)
        
        assert trend_data['trend'] > 0  # Price increasing
        assert trend_data['price_count'] == 3
        assert 'volatility' in trend_data
    
    def test_get_price_trend_no_data(self):
        """Test getting price trend with no data"""
        trend_data = self.analyzer.get_price_trend("nonexistent")
        
        assert trend_data['trend'] == 0
        assert trend_data['volatility'] == 0 