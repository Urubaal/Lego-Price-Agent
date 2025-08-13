import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


class TestAPI:
    """Test cases for API endpoints"""
    
    def test_root_endpoint(self):
        """Test root endpoint"""
        response = client.get("/")
        assert response.status_code == 200
        
        data = response.json()
        assert data["message"] == "LEGO Price Agent API"
        assert data["version"] == "1.0.0"
        assert data["status"] == "running"
    
    def test_health_check(self):
        """Test health check endpoint"""
        response = client.get("/health")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data
        assert "services" in data
        
        services = data["services"]
        assert services["allegro_scraper"] == "available"
        assert services["olx_scraper"] == "available"
        assert services["ceneo_scraper"] == "available"
        assert services["price_analyzer"] == "available"
    
    def test_search_endpoint_with_query(self):
        """Test search endpoint with query parameter"""
        response = client.get("/api/search?query=42100&limit=5")
        assert response.status_code == 200
        
        data = response.json()
        assert "query" in data
        assert "total_results" in data
        assert "sets" in data
        assert "recommendations" in data
        
        assert data["query"] == "42100"
        assert isinstance(data["total_results"], int)
        assert isinstance(data["sets"], list)
        assert isinstance(data["recommendations"], list)
    
    def test_search_endpoint_without_query(self):
        """Test search endpoint without query parameter"""
        response = client.get("/api/search")
        assert response.status_code == 422  # Validation error
    
    def test_search_endpoint_with_limit(self):
        """Test search endpoint with limit parameter"""
        response = client.get("/api/search?query=lego&limit=3")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data["sets"]) <= 3
    
    def test_search_endpoint_specific_set_number(self):
        """Test search endpoint with specific set number - should filter for exact matches"""
        response = client.get("/api/search?query=42100&limit=10")
        assert response.status_code == 200
        
        data = response.json()
        assert "query" in data
        assert "total_results" in data
        assert "sets" in data
        
        assert data["query"] == "42100"
        assert isinstance(data["total_results"], int)
        assert isinstance(data["sets"], list)
        
        # All returned sets should have the exact set number 42100
        for lego_set in data["sets"]:
            assert lego_set["set_number"] == "42100"
    
    def test_search_endpoint_general_query(self):
        """Test search endpoint with general query - should not filter for specific set"""
        response = client.get("/api/search?query=lego technic&limit=10")
        assert response.status_code == 200
        
        data = response.json()
        assert "query" in data
        assert "total_results" in data
        assert "sets" in data
        
        assert data["query"] == "lego technic"
        assert isinstance(data["total_results"], int)
        assert isinstance(data["sets"], list)
        
        # Should return various set numbers, not just one specific
        set_numbers = [lego_set["set_number"] for lego_set in data["sets"]]
        # At least some sets should be returned (mock data includes multiple sets)
        assert len(set_numbers) > 0
    
    def test_set_details_endpoint(self):
        """Test set details endpoint"""
        response = client.get("/api/set/42100")
        assert response.status_code == 200
        
        data = response.json()
        assert "set_number" in data
        assert "total_offers" in data
        assert "offers" in data
        assert "recommendation" in data
        
        assert data["set_number"] == "42100"
        assert isinstance(data["total_offers"], int)
        assert isinstance(data["offers"], list)
    
    def test_set_details_endpoint_not_found(self):
        """Test set details endpoint with non-existent set"""
        response = client.get("/api/set/99999")
        assert response.status_code == 404
        
        data = response.json()
        assert "detail" in data
        assert "not found" in data["detail"].lower()
    
    def test_recommendations_endpoint(self):
        """Test recommendations endpoint"""
        response = client.get("/api/recommendations")
        assert response.status_code == 200
        
        data = response.json()
        assert "total_recommendations" in data
        assert "good_deals" in data
        assert "recommendations" in data
        
        assert isinstance(data["total_recommendations"], int)
        assert isinstance(data["good_deals"], int)
        assert isinstance(data["recommendations"], list)
    
    def test_cors_headers(self):
        """Test CORS headers are present"""
        response = client.get("/")
        assert response.status_code == 200
        
        # Check CORS headers
        assert "access-control-allow-origin" in response.headers
        assert "access-control-allow-credentials" in response.headers
        assert "access-control-allow-methods" in response.headers
        assert "access-control-allow-headers" in response.headers
    
    def test_invalid_endpoint(self):
        """Test invalid endpoint returns 404"""
        response = client.get("/api/invalid")
        assert response.status_code == 404 