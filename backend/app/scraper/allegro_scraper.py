import asyncio
from typing import List, Optional
from datetime import datetime
import re
from playwright.async_api import async_playwright
from .base_scraper import BaseScraper, LegoSet


class AllegroScraper(BaseScraper):
    """Scraper for Allegro.pl - Polish marketplace"""
    
    def __init__(self):
        super().__init__("Allegro")
        self.base_url = "https://allegro.pl"
    
    async def search_sets(self, query: str) -> List[LegoSet]:
        """Search for LEGO sets on Allegro"""
        sets = []
        
        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                page = await browser.new_page()
                
                # Set user agent to avoid detection
                await page.set_extra_http_headers({
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                })
                
                # Search for LEGO sets
                search_url = f"{self.base_url}/listing?string={query}"
                await page.goto(search_url, wait_until='networkidle')
                
                # Try multiple selectors for results
                selectors = [
                    '[data-testid="listing-grid"]',
                    '.listing-grid',
                    '.search-results',
                    '.products-grid',
                    '[data-role="search-results"]'
                ]
                
                listings = []
                for selector in selectors:
                    try:
                        await page.wait_for_selector(selector, timeout=5000)
                        listings = await page.query_selector_all(f'{selector} > div, {selector} > article, {selector} > li')
                        if listings:
                            break
                    except:
                        continue
                
                if not listings:
                    # Fallback: try to find any product cards
                    listings = await page.query_selector_all('[data-testid*="product"], .product-card, .listing-item, article')
                
                print(f"Found {len(listings)} potential listings on Allegro")
                
                for listing in listings[:10]:  # Limit to first 10 results
                    try:
                        # Try multiple selectors for title
                        title_selectors = ['h2', 'h3', '.title', '[data-testid="title"]', '.product-title']
                        title_elem = None
                        for selector in title_selectors:
                            title_elem = await listing.query_selector(selector)
                            if title_elem:
                                break
                        
                        # Try multiple selectors for price
                        price_selectors = ['[data-testid="price"]', '.price', '.product-price', '.listing-price']
                        price_elem = None
                        for selector in price_selectors:
                            price_elem = await listing.query_selector(selector)
                            if price_elem:
                                break
                        
                        # Try multiple selectors for link
                        link_selectors = ['a', '[data-testid="link"]', '.product-link']
                        link_elem = None
                        for selector in link_selectors:
                            link_elem = await listing.query_selector(selector)
                            if link_elem:
                                break
                        
                        if not all([title_elem, price_elem, link_elem]):
                            continue
                        
                        title = await title_elem.text_content()
                        price_text = await price_elem.text_content()
                        link = await link_elem.get_attribute('href')
                        
                        if not title or not price_text:
                            continue
                        
                        # Parse set number from title
                        set_number = self._extract_set_number(title)
                        if not set_number:
                            continue
                        
                        # Parse price
                        price = self._parse_price(price_text)
                        if not price:
                            continue
                        
                        # Calculate shipping (Allegro often has free shipping)
                        shipping = await self.get_shipping_cost(price)
                        total_price = self.calculate_total_price(price, shipping)
                        
                        # Determine if new or used
                        condition = "new" if "nowy" in title.lower() else "used"
                        
                        lego_set = LegoSet(
                            set_number=set_number,
                            name=title.strip(),
                            price=price,
                            shipping_cost=shipping,
                            total_price=total_price,
                            store_name=self.store_name,
                            store_url=f"{self.base_url}{link}" if link.startswith('/') else link,
                            condition=condition,
                            availability=True,
                            last_updated=datetime.now()
                        )
                        
                        sets.append(lego_set)
                        
                    except Exception as e:
                        print(f"Error parsing listing: {e}")
                        continue
                
                await browser.close()
        
        except Exception as e:
            print(f"Error in Allegro scraper: {e}")
        
        return sets
    
    async def get_set_details(self, set_number: str) -> Optional[LegoSet]:
        """Get detailed information about specific LEGO set"""
        # Implementation for getting specific set details
        # This would search for the exact set number
        query = f"lego {set_number}"
        results = await self.search_sets(query)
        
        # Return the first result that matches the set number exactly
        for result in results:
            if result.set_number == set_number:
                return result
        
        return None
    
    async def get_shipping_cost(self, price: float, location: str = "PL") -> float:
        """Calculate shipping cost for Allegro"""
        # Allegro often has free shipping for orders above certain amount
        if price >= 100:  # Free shipping for orders above 100 PLN
            return 0.0
        else:
            return 15.0  # Standard shipping cost
    
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