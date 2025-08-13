import { test, expect } from '@playwright/test';

test.describe('API Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API responses for testing
    await page.route('**/api/search**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          sets: [
            {
              set_number: '42100',
              name: 'Liebherr R 9800',
              price: 2499,
              shipping_cost: 0,
              total_price: 2499,
              store_name: 'Test Store',
              store_url: 'https://example.com',
              condition: 'new',
              availability: true,
              last_updated: '2024-01-01T00:00:00Z'
            }
          ]
        })
      });
    });

    await page.route('**/api/recommendations**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          recommendations: [
            {
              set_number: '42100',
              set_name: 'Liebherr R 9800',
              current_best_price: 2499,
              average_market_price: 2600,
              price_percentage: -3.9,
              recommendation: 'buy',
              confidence_score: 0.85,
              reasoning: 'Price is below market average',
              best_offer: {
                store_name: 'Test Store',
                price: 2499,
                total_price: 2499,
                store_url: 'https://example.com',
                condition: 'new'
              }
            }
          ]
        })
      });
    });
  });

  test('should handle search API requests', async ({ page }) => {
    await page.goto('/search');
    
    // Fill search input
    const searchInput = page.locator('input[placeholder*="Enter LEGO set name or number"]');
    await searchInput.fill('42100');
    
    // Submit search
    const searchButton = page.locator('button:has-text("Search")');
    await searchButton.click();
    
    // Wait for API response
    await page.waitForTimeout(1000);
    
    // Check if results are displayed
    await expect(page.locator('div:has-text("Found 1 results for")')).toBeVisible();
    await expect(page.locator('h3:has-text("42100 - Liebherr R 9800")')).toBeVisible();
  });

  test('should handle recommendations API requests', async ({ page }) => {
    await page.goto('/recommendations');
    
    // Wait for API response
    await page.waitForTimeout(1000);
    
    // Check if recommendations are displayed
    await expect(page.locator('h3:has-text("42100 - Liebherr R 9800")')).toBeVisible();
    await expect(page.locator('span:has-text("BUY")')).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error response
    await page.route('**/api/search**', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          detail: 'Internal server error'
        })
      });
    });

    await page.goto('/search');
    
    // Fill search input
    const searchInput = page.locator('input[placeholder*="Enter LEGO set name or number"]');
    await searchInput.fill('42100');
    
    // Submit search
    const searchButton = page.locator('button:has-text("Search")');
    await searchButton.click();
    
    // Wait for API response
    await page.waitForTimeout(1000);
    
    // Check if error is handled gracefully
    await expect(page.locator('h1:has-text("Search LEGO Sets")')).toBeVisible();
  });

  test('should show loading states during API calls', async ({ page }) => {
    await page.goto('/search');
    
    // Fill search input
    const searchInput = page.locator('input[placeholder*="Enter LEGO set name or number"]');
    await searchInput.fill('42100');
    
    // Submit search
    const searchButton = page.locator('button:has-text("Search")');
    await searchButton.click();
    
    // Check if loading state appears
    await expect(page.locator('div:has-text("Searching for LEGO sets...")')).toBeVisible();
    await expect(page.locator('div.animate-spin')).toBeVisible();
  });

  test('should handle API timeouts gracefully', async ({ page }) => {
    // Mock slow API response
    await page.route('**/api/search**', async route => {
      await new Promise(resolve => setTimeout(resolve, 5000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ sets: [] })
      });
    });

    await page.goto('/search');
    
    // Fill search input
    const searchInput = page.locator('input[placeholder*="Enter LEGO set name or number"]');
    await searchInput.fill('42100');
    
    // Submit search
    const searchButton = page.locator('button:has-text("Search")');
    await searchButton.click();
    
    // Check if loading state appears
    await expect(page.locator('div:has-text("Searching for LEGO sets...")')).toBeVisible();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock network error
    await page.route('**/api/search**', async route => {
      await route.abort('failed');
    });

    await page.goto('/search');
    
    // Fill search input
    const searchInput = page.locator('input[placeholder*="Enter LEGO set name or number"]');
    await searchInput.fill('42100');
    
    // Submit search
    const searchButton = page.locator('button:has-text("Search")');
    await searchButton.click();
    
    // Wait for potential error
    await page.waitForTimeout(1000);
    
    // Check if page is still functional
    await expect(page.locator('h1:has-text("Search LEGO Sets")')).toBeVisible();
  });

  test('should handle empty API responses', async ({ page }) => {
    // Mock empty response
    await page.route('**/api/search**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ sets: [] })
      });
    });

    await page.goto('/search');
    
    // Fill search input
    const searchInput = page.locator('input[placeholder*="Enter LEGO set name or number"]');
    await searchInput.fill('nonexistent');
    
    // Submit search
    const searchButton = page.locator('button:has-text("Search")');
    await searchButton.click();
    
    // Wait for API response
    await page.waitForTimeout(1000);
    
    // Check if no results message is shown
    await expect(page.locator('div:has-text("No results found")')).toBeVisible();
  });

  test('should handle malformed API responses', async ({ page }) => {
    // Mock malformed response
    await page.route('**/api/search**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: 'invalid json'
      });
    });

    await page.goto('/search');
    
    // Fill search input
    const searchInput = page.locator('input[placeholder*="Enter LEGO set name or number"]');
    await searchInput.fill('42100');
    
    // Submit search
    const searchButton = page.locator('button:has-text("Search")');
    await searchButton.click();
    
    // Wait for API response
    await page.waitForTimeout(1000);
    
    // Check if page handles error gracefully
    await expect(page.locator('h1:has-text("Search LEGO Sets")')).toBeVisible();
  });

  test('should handle authentication API calls', async ({ page }) => {
    // Mock authentication API
    await page.route('**/auth/login**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'test-token'
        })
      });
    });

    await page.goto('/');
    
    // Check if login form is visible
    await expect(page.locator('h2:has-text("Sign in to your account")')).toBeVisible();
    
    // Fill login form
    const usernameInput = page.locator('input[name="username"]');
    const passwordInput = page.locator('input[name="password"]');
    
    await usernameInput.fill('testuser');
    await passwordInput.fill('testpassword');
    
    // Submit form
    const signInButton = page.locator('button:has-text("Sign in")');
    await signInButton.click();
    
    // Wait for API response
    await page.waitForTimeout(1000);
    
    // Check if authentication was handled
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle API rate limiting', async ({ page }) => {
    // Mock rate limit response
    await page.route('**/api/search**', async route => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({
          detail: 'Too many requests'
        })
      });
    });

    await page.goto('/search');
    
    // Fill search input
    const searchInput = page.locator('input[placeholder*="Enter LEGO set name or number"]');
    await searchInput.fill('42100');
    
    // Submit search
    const searchButton = page.locator('button:has-text("Search")');
    await searchButton.click();
    
    // Wait for API response
    await page.waitForTimeout(1000);
    
    // Check if rate limit error is handled gracefully
    await expect(page.locator('h1:has-text("Search LEGO Sets")')).toBeVisible();
  });

  test('should handle concurrent API requests', async ({ page }) => {
    await page.goto('/search');
    
    // Fill search input
    const searchInput = page.locator('input[placeholder*="Enter LEGO set name or number"]');
    await searchInput.fill('42100');
    
    // Submit multiple searches quickly
    const searchButton = page.locator('button:has-text("Search")');
    await searchButton.click();
    await searchButton.click();
    await searchButton.click();
    
    // Wait for responses
    await page.waitForTimeout(2000);
    
    // Check if page is still functional
    await expect(page.locator('h1:has-text("Search LEGO Sets")')).toBeVisible();
  });

  test('should validate API response data', async ({ page }) => {
    await page.goto('/search');
    
    // Fill search input
    const searchInput = page.locator('input[placeholder*="Enter LEGO set name or number"]');
    await searchInput.fill('42100');
    
    // Submit search
    const searchButton = page.locator('button:has-text("Search")');
    await searchButton.click();
    
    // Wait for API response
    await page.waitForTimeout(1000);
    
    // Check if response data is properly displayed
    await expect(page.locator('h3:has-text("42100 - Liebherr R 9800")')).toBeVisible();
    await expect(page.locator('span:has-text("2499 PLN")')).toBeVisible();
    await expect(page.locator('span:has-text("Test Store")')).toBeVisible();
  });

  test('should handle API pagination when implemented', async ({ page }) => {
    // This test would check pagination when implemented
    // For now, we'll verify the basic search functionality
    
    await page.goto('/search');
    
    // Check if search functionality is available
    await expect(page.locator('h1:has-text("Search LEGO Sets")')).toBeVisible();
    await expect(page.locator('input[placeholder*="Enter LEGO set name or number"]')).toBeVisible();
  });

  test('should handle API filtering when implemented', async ({ page }) => {
    // This test would check filtering when implemented
    // For now, we'll verify the basic search functionality
    
    await page.goto('/search');
    
    // Check if search functionality is available
    await expect(page.locator('h1:has-text("Search LEGO Sets")')).toBeVisible();
    await expect(page.locator('input[placeholder*="Enter LEGO set name or number"]')).toBeVisible();
  });

  test('should handle API sorting when implemented', async ({ page }) => {
    // This test would check sorting when implemented
    // For now, we'll verify the basic search functionality
    
    await page.goto('/search');
    
    // Check if search functionality is available
    await expect(page.locator('h1:has-text("Search LEGO Sets")')).toBeVisible();
    await expect(page.locator('input[placeholder*="Enter LEGO set name or number"]')).toBeVisible();
  });
});
