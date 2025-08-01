from typing import List, Dict, Tuple
from dataclasses import dataclass
from datetime import datetime, timedelta
import statistics
from ..scraper.base_scraper import LegoSet


@dataclass
class PriceRecommendation:
    """Data class for price recommendations"""
    set_number: str
    set_name: str
    current_best_price: float
    average_market_price: float
    price_difference: float
    price_percentage: float
    recommendation: str  # "buy", "wait", "avoid"
    confidence_score: float
    reasoning: str
    best_offers: List[LegoSet]


class PriceAnalyzer:
    """Analyzes LEGO prices and provides recommendations"""
    
    def __init__(self):
        self.price_history = {}  # Store historical price data
    
    def analyze_prices(self, sets: List[LegoSet]) -> List[PriceRecommendation]:
        """Analyze prices and provide recommendations"""
        recommendations = []
        
        # Group sets by set number
        sets_by_number = self._group_sets_by_number(sets)
        
        for set_number, set_list in sets_by_number.items():
            recommendation = self._analyze_single_set(set_number, set_list)
            if recommendation:
                recommendations.append(recommendation)
        
        return recommendations
    
    def _group_sets_by_number(self, sets: List[LegoSet]) -> Dict[str, List[LegoSet]]:
        """Group LEGO sets by their set number"""
        grouped = {}
        for lego_set in sets:
            if lego_set.set_number not in grouped:
                grouped[lego_set.set_number] = []
            grouped[lego_set.set_number].append(lego_set)
        return grouped
    
    def _analyze_single_set(self, set_number: str, sets: List[LegoSet]) -> PriceRecommendation:
        """Analyze a single LEGO set and provide recommendation"""
        if not sets:
            return None
        
        # Separate new and used sets
        new_sets = [s for s in sets if s.condition == "new"]
        used_sets = [s for s in sets if s.condition == "used"]
        
        # Analyze new sets
        if new_sets:
            new_recommendation = self._analyze_by_condition(set_number, new_sets, "new")
            if new_recommendation:
                return new_recommendation
        
        # Analyze used sets if no new sets available
        if used_sets and not new_sets:
            return self._analyze_by_condition(set_number, used_sets, "used")
        
        return None
    
    def _analyze_by_condition(self, set_number: str, sets: List[LegoSet], condition: str) -> PriceRecommendation:
        """Analyze sets of specific condition (new/used)"""
        if not sets:
            return None
        
        # Calculate price statistics
        total_prices = [s.total_price for s in sets]
        current_best_price = min(total_prices)
        average_price = statistics.mean(total_prices)
        median_price = statistics.median(total_prices)
        
        # Calculate price difference and percentage
        price_difference = average_price - current_best_price
        price_percentage = (price_difference / average_price) * 100 if average_price > 0 else 0
        
        # Determine recommendation
        recommendation, confidence, reasoning = self._get_recommendation(
            current_best_price, average_price, median_price, price_percentage, condition
        )
        
        # Get best offers (lowest prices)
        best_offers = sorted(sets, key=lambda x: x.total_price)[:3]
        
        return PriceRecommendation(
            set_number=set_number,
            set_name=sets[0].name,
            current_best_price=current_best_price,
            average_market_price=average_price,
            price_difference=price_difference,
            price_percentage=price_percentage,
            recommendation=recommendation,
            confidence_score=confidence,
            reasoning=reasoning,
            best_offers=best_offers
        )
    
    def _get_recommendation(self, best_price: float, avg_price: float, 
                          median_price: float, price_percentage: float, 
                          condition: str) -> Tuple[str, float, str]:
        """Get recommendation based on price analysis"""
        
        # Base confidence on price consistency
        price_variance = abs(avg_price - median_price) / avg_price if avg_price > 0 else 0
        confidence = max(0.1, 1.0 - price_variance)
        
        # Determine recommendation logic
        if price_percentage >= 20:  # 20% below average
            recommendation = "buy"
            reasoning = f"Excellent deal! {price_percentage:.1f}% below market average"
        elif price_percentage >= 10:  # 10-20% below average
            recommendation = "buy"
            reasoning = f"Good deal! {price_percentage:.1f}% below market average"
        elif price_percentage >= -5:  # Within 5% of average
            recommendation = "wait"
            reasoning = f"Average price. Consider waiting for better deals"
        else:  # Above average
            recommendation = "avoid"
            reasoning = f"Price is {abs(price_percentage):.1f}% above market average"
        
        # Adjust for condition
        if condition == "used":
            if price_percentage < 30:  # Used sets should be significantly cheaper
                recommendation = "avoid"
                reasoning += " - Used set should be cheaper"
        
        return recommendation, confidence, reasoning
    
    def update_price_history(self, set_number: str, price: float, date: datetime):
        """Update historical price data"""
        if set_number not in self.price_history:
            self.price_history[set_number] = []
        
        self.price_history[set_number].append({
            'price': price,
            'date': date
        })
        
        # Keep only last 30 days of data
        cutoff_date = datetime.now() - timedelta(days=30)
        self.price_history[set_number] = [
            entry for entry in self.price_history[set_number]
            if entry['date'] > cutoff_date
        ]
    
    def get_price_trend(self, set_number: str) -> Dict[str, float]:
        """Get price trend for a specific set"""
        if set_number not in self.price_history:
            return {'trend': 0, 'volatility': 0}
        
        prices = [entry['price'] for entry in self.price_history[set_number]]
        if len(prices) < 2:
            return {'trend': 0, 'volatility': 0}
        
        # Calculate trend (positive = increasing, negative = decreasing)
        trend = (prices[-1] - prices[0]) / prices[0] * 100 if prices[0] > 0 else 0
        
        # Calculate volatility
        volatility = statistics.stdev(prices) / statistics.mean(prices) * 100 if len(prices) > 1 else 0
        
        return {
            'trend': trend,
            'volatility': volatility,
            'price_count': len(prices)
        } 