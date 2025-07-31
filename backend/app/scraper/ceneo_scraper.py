import asyncio
from typing import List, Optional
from datetime import datetime
import re
from playwright.async_api import async_playwright
from .base_scraper import BaseScraper, LegoSet


class CeneoScraper(BaseScraper):
    """Scraper for Ceneo.pl - Polish price comparison site"""
    
    def __init__(self):
        super().__init__("Ceneo")
        self.base_url = "https://www.ceneo.pl"
    
    async def search_sets(self, query: str) -> List[LegoSet]:
        """Search for LEGO sets on Ceneo"""
        sets = []
        
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            
            # Search for LEGO sets on Ceneo
            search_url = f"{self.base_url}/;szukaj-{query.replace(' ', '+')}"
            await page.goto(search_url)
            
            # Wait for results to load
            await page.wait_for_selector('.cat-prod-row', timeout=10000)
            
            # Extract product listings
            listings = await page.query_selector_all('.cat-prod-row')
            
            for listing in listings[:10]:  # Limit to first 10 results
                try:
                    # Extract set information
                    title_elem = await listing.query_selector('.cat-prod-row__name')
                    price_elem = await listing.query_selector('.cat-prod-row__price')
                    link_elem = await listing.query_selector('.cat-prod-row__name a')
                    
                    if not all([title_elem, price_elem, link_elem]):
                        continue
                    
                    title = await title_elem.text_content()
                    price_text = await price_elem.text_content()
                    link = await link_elem.get_attribute('href')
                    
                    # Parse set number from title
                    set_number = self._extract_set_number(title)
                    if not set_number:
                        continue
                    
                    # Parse price
                    price = self._parse_price(price_text)
                    if not price:
                        continue
                    
                    # Calculate shipping (Ceneo shows prices from various stores)
                    shipping = await self.get_shipping_cost(price)
                    total_price = self.calculate_total_price(price, shipping)
                    
                    # Determine if new or used (Ceneo mostly has new items)
                    condition = "new"
                    
                    lego_set = LegoSet(
                        set_number=set_number,
                        name=title.strip(),
                        price=price,
                        shipping_cost=shipping,
                        total_price=total_price,
                        store_name=self.store_name,
                        store_url=f"{self.base_url}{link}",
                        condition=condition,
                        availability=True,
                        last_updated=datetime.now()
                    )
                    
                    sets.append(lego_set)
                    
                except Exception as e:
                    print(f"Error parsing Ceneo listing: {e}")
                    continue
            
            await browser.close()
        
        return sets
    
    async def get_set_details(self, set_number: str) -> Optional[LegoSet]:
        """Get detailed information about specific LEGO set"""
        query = f"lego {set_number}"
        results = await self.search_sets(query)
        
        # Return the first result that matches the set number exactly
        for result in results:
            if result.set_number == set_number:
                return result
        
        return None
    
    async def get_shipping_cost(self, price: float, location: str = "PL") -> float:
        """Calculate shipping cost for Ceneo"""
        # Ceneo shows prices from various stores, shipping varies
        if price >= 150:  # Free shipping for orders above 150 PLN
            return 0.0
        else:
            return 12.0  # Average shipping cost
    
    def _extract_set_number(self, title: str) -> Optional[str]:
        """Extract LEGO set number from title"""
        # Common patterns for LEGO set numbers
        patterns = [
            r'\b(\d{3,5})\b',  # 3-5 digit numbers
            r'\b(\d{4}-\d{1,2})\b',  # Format like 42100-1
            r'\b(\d{3,5}-\d{1,2})\b'  # Format like 42100-1
        ]
        
        for pattern in patterns:
            match = re.search(pattern, title)
            if match:
                return match.group(1)
        
        return None
    
    def _parse_price(self, price_text: str) -> Optional[float]:
        """Parse price from text"""
        if not price_text:
            return None
        
        # Remove currency symbols and spaces, replace comma with dot
        price_clean = re.sub(r'[^\d,.]', '', price_text)
        price_clean = price_clean.replace(',', '.')
        
        try:
            return float(price_clean)
        except ValueError:
            return None 