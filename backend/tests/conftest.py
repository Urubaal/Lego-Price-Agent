import pytest
import asyncio
from typing import Generator


@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def sample_lego_sets():
    """Sample LEGO sets for testing"""
    from datetime import datetime
    from app.scraper.base_scraper import LegoSet
    
    return [
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
            set_number="42115",
            name="Lamborghini Sián FKP 37",
            price=1299.0,
            shipping_cost=15.0,
            total_price=1314.0,
            store_name="OLX",
            store_url="https://olx.pl/item/2",
            condition="new",
            availability=True,
            last_updated=datetime.now()
        ),
        LegoSet(
            set_number="42131",
            name="App-Controlled D11 Bulldozer",
            price=899.0,
            shipping_cost=0.0,
            total_price=899.0,
            store_name="Ceneo",
            store_url="https://ceneo.pl/item/3",
            condition="new",
            availability=True,
            last_updated=datetime.now()
        )
    ] 