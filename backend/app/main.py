from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import asyncio
from datetime import datetime

from .scraper.allegro_scraper import AllegroScraper
from .scraper.olx_scraper import OlxScraper
from .scraper.ceneo_scraper import CeneoScraper
from .recommender.price_analyzer import PriceAnalyzer, PriceRecommendation
from .scraper.base_scraper import LegoSet
from .database.database import create_tables
from .api import auth, watchlist

app = FastAPI(
    title="LEGO Price Agent API",
    description="API for tracking and analyzing LEGO set prices",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize scrapers and analyzer
allegro_scraper = AllegroScraper()
olx_scraper = OlxScraper()
ceneo_scraper = CeneoScraper()
price_analyzer = PriceAnalyzer()

# Include API routers
app.include_router(auth.router)
app.include_router(watchlist.router)

# Create database tables on startup
@app.on_event("startup")
async def startup_event():
    create_tables()


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "LEGO Price Agent API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/api/search")
async def search_lego_sets(query: str, limit: int = 10):
    """Search for LEGO sets across all stores"""
    try:
        # Search on multiple platforms
        allegro_results = await allegro_scraper.search_sets(query)
        olx_results = await olx_scraper.search_sets(query)
        ceneo_results = await ceneo_scraper.search_sets(query)
        
        # Combine results from all platforms
        all_results = allegro_results + olx_results + ceneo_results
        all_results = all_results[:limit]  # Limit total results
        
        # Analyze prices and get recommendations
        recommendations = price_analyzer.analyze_prices(all_results)
        
        return {
            "query": query,
            "total_results": len(all_results),
            "sets": [
                {
                    "set_number": lego_set.set_number,
                    "name": lego_set.name,
                    "price": lego_set.price,
                    "shipping_cost": lego_set.shipping_cost,
                    "total_price": lego_set.total_price,
                    "store_name": lego_set.store_name,
                    "store_url": lego_set.store_url,
                    "condition": lego_set.condition,
                    "availability": lego_set.availability,
                    "last_updated": lego_set.last_updated.isoformat()
                }
                for lego_set in all_results
            ],
            "recommendations": [
                {
                    "set_number": rec.set_number,
                    "set_name": rec.set_name,
                    "current_best_price": rec.current_best_price,
                    "average_market_price": rec.average_market_price,
                    "price_difference": rec.price_difference,
                    "price_percentage": rec.price_percentage,
                    "recommendation": rec.recommendation,
                    "confidence_score": rec.confidence_score,
                    "reasoning": rec.reasoning,
                    "best_offers": [
                        {
                            "store_name": offer.store_name,
                            "price": offer.price,
                            "total_price": offer.total_price,
                            "store_url": offer.store_url,
                            "condition": offer.condition
                        }
                        for offer in rec.best_offers
                    ]
                }
                for rec in recommendations
            ]
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


@app.get("/api/set/{set_number}")
async def get_set_details(set_number: str):
    """Get detailed information about a specific LEGO set"""
    try:
        # Search for the specific set on multiple platforms
        query = f"lego {set_number}"
        allegro_results = await allegro_scraper.search_sets(query)
        olx_results = await olx_scraper.search_sets(query)
        ceneo_results = await ceneo_scraper.search_sets(query)
        results = allegro_results + olx_results + ceneo_results
        
        # Filter for exact set number match
        exact_matches = [r for r in results if r.set_number == set_number]
        
        if not exact_matches:
            raise HTTPException(status_code=404, detail=f"Set {set_number} not found")
        
        # Get recommendations
        recommendations = price_analyzer.analyze_prices(exact_matches)
        
        return {
            "set_number": set_number,
            "total_offers": len(exact_matches),
            "offers": [
                {
                    "name": lego_set.name,
                    "price": lego_set.price,
                    "shipping_cost": lego_set.shipping_cost,
                    "total_price": lego_set.total_price,
                    "store_name": lego_set.store_name,
                    "store_url": lego_set.store_url,
                    "condition": lego_set.condition,
                    "availability": lego_set.availability,
                    "last_updated": lego_set.last_updated.isoformat()
                }
                for lego_set in exact_matches
            ],
            "recommendation": recommendations[0] if recommendations else None
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get set details: {str(e)}")


@app.get("/api/recommendations")
async def get_recommendations():
    """Get current best deals and recommendations"""
    try:
        # Search for popular LEGO sets
        popular_sets = [
            "42100",  # Liebherr R 9800
            "42115",  # Lamborghini Sián FKP 37
            "42131",  # App-Controlled D11 Bulldozer
            "42145",  # Airbus H175 Rescue Helicopter
            "42154",  # 2022 Ford GT
        ]
        
        all_results = []
        for set_number in popular_sets:
            try:
                allegro_results = await allegro_scraper.search_sets(f"lego {set_number}")
                olx_results = await olx_scraper.search_sets(f"lego {set_number}")
                ceneo_results = await ceneo_scraper.search_sets(f"lego {set_number}")
                all_results.extend(allegro_results + olx_results + ceneo_results)
            except Exception as e:
                print(f"Error searching for set {set_number}: {e}")
                continue
        
        # Analyze all results
        recommendations = price_analyzer.analyze_prices(all_results)
        
        # Filter for good deals only
        good_deals = [r for r in recommendations if r.recommendation in ["buy"]]
        
        return {
            "total_recommendations": len(recommendations),
            "good_deals": len(good_deals),
            "recommendations": [
                {
                    "set_number": rec.set_number,
                    "set_name": rec.set_name,
                    "current_best_price": rec.current_best_price,
                    "average_market_price": rec.average_market_price,
                    "price_percentage": rec.price_percentage,
                    "recommendation": rec.recommendation,
                    "confidence_score": rec.confidence_score,
                    "reasoning": rec.reasoning,
                    "best_offer": {
                        "store_name": rec.best_offers[0].store_name,
                        "price": rec.best_offers[0].price,
                        "total_price": rec.best_offers[0].total_price,
                        "store_url": rec.best_offers[0].store_url,
                        "condition": rec.best_offers[0].condition
                    } if rec.best_offers else None
                }
                for rec in recommendations
            ]
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get recommendations: {str(e)}")


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "allegro_scraper": "available",
            "olx_scraper": "available",
            "ceneo_scraper": "available",
            "price_analyzer": "available"
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 