from abc import ABC, abstractmethod
from typing import List, Dict, Optional
from dataclasses import dataclass
from datetime import datetime


@dataclass
class LegoSet:
    """Data class for LEGO set information"""
    set_number: str
    name: str
    price: float
    shipping_cost: float
    total_price: float
    store_name: str
    store_url: str
    condition: str  # "new" or "used"
    availability: bool
    last_updated: datetime
    image_url: Optional[str] = None


class BaseScraper(ABC):
    """Base class for all LEGO store scrapers"""
    
    def __init__(self, store_name: str):
        self.store_name = store_name
        self.base_url = ""
    
    @abstractmethod
    async def search_sets(self, query: str) -> List[LegoSet]:
        """Search for LEGO sets by query"""
        pass
    
    @abstractmethod
    async def get_set_details(self, set_number: str) -> Optional[LegoSet]:
        """Get detailed information about specific LEGO set"""
        pass
    
    @abstractmethod
    async def get_shipping_cost(self, price: float, location: str = "PL") -> float:
        """Calculate shipping cost for given price and location"""
        pass
    
    def calculate_total_price(self, price: float, shipping: float) -> float:
        """Calculate total price including shipping"""
        return price + shipping 