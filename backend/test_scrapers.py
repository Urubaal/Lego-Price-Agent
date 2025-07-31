#!/usr/bin/env python3
"""
Simple test script to verify scrapers are working
Run this to test if all scrapers can find LEGO sets
"""

import asyncio
import sys
import os

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.scraper.allegro_scraper import AllegroScraper
from app.scraper.olx_scraper import OlxScraper
from app.scraper.ceneo_scraper import CeneoScraper


async def test_scrapers():
    """Test all scrapers with a simple LEGO set search"""
    
    print("🧱 Testing LEGO Price Agent Scrapers...")
    print("=" * 50)
    
    # Initialize scrapers
    scrapers = {
        "Allegro": AllegroScraper(),
        "OLX": OlxScraper(),
        "Ceneo": CeneoScraper()
    }
    
    # Test query
    test_query = "lego 42100"
    
    for name, scraper in scrapers.items():
        print(f"\n🔍 Testing {name} scraper...")
        try:
            results = await scraper.search_sets(test_query)
            print(f"✅ {name}: Found {len(results)} results")
            
            if results:
                # Show first result
                first_result = results[0]
                print(f"   📦 Set: {first_result.set_number} - {first_result.name[:50]}...")
                print(f"   💰 Price: {first_result.price} PLN + {first_result.shipping_cost} PLN shipping")
                print(f"   🏪 Store: {first_result.store_name}")
                print(f"   🔗 URL: {first_result.store_url}")
            else:
                print(f"   ⚠️  No results found on {name}")
                
        except Exception as e:
            print(f"❌ {name}: Error - {str(e)}")
    
    print("\n" + "=" * 50)
    print("🎉 Scraper test completed!")


if __name__ == "__main__":
    asyncio.run(test_scrapers()) 