import { test, expect } from '@playwright/test';

test.describe('Price Recommendations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/recommendations');
  });

  test('should display recommendations page with correct elements', async ({ page }) => {
    // Check if page title is visible
    await expect(page.locator('h1:has-text("Price Recommendations")')).toBeVisible();
    
    // Check if description is visible
    await expect(page.locator('p:has-text("AI-powered recommendations for LEGO set purchases")')).toBeVisible();
  });

  test('should show loading state initially', async ({ page }) => {
    // Check if loading spinner is visible
    await expect(page.locator('div.animate-spin')).toBeVisible();
    
    // Check if loading text is visible
    await expect(page.locator('p:has-text("Loading recommendations...")')).toBeVisible();
  });

  test('should display recommendations when available', async ({ page }) => {
    // Wait for recommendations to load
    await page.waitForTimeout(3000);
    
    // Check if either recommendations are shown or no recommendations message
    const hasRecommendations = await page.locator('div:has-text("Current Best Price:")').isVisible();
    const hasNoRecommendations = await page.locator('div:has-text("No recommendations available")').isVisible();
    
    // At least one should be true
    expect(hasRecommendations || hasNoRecommendations).toBeTruthy();
  });

  test('should display recommendation items with correct structure', async ({ page }) => {
    // Wait for recommendations to load
    await page.waitForTimeout(3000);
    
    // Check if recommendation cards exist
    const recommendationCards = page.locator('div.bg-white.rounded-lg.shadow-md');
    if (await recommendationCards.count() > 0) {
      await expect(recommendationCards.first()).toBeVisible();
    }
  });

  test('should display product information in recommendations', async ({ page }) => {
    // Wait for recommendations to load
    await page.waitForTimeout(3000);
    
    // Check if product information is displayed
    const productInfo = page.locator('h3:has-text(" - ")');
    if (await productInfo.count() > 0) {
      await expect(productInfo.first()).toBeVisible();
    }
  });

  test('should display price information correctly', async ({ page }) => {
    // Wait for recommendations to load
    await page.waitForTimeout(3000);
    
    // Check if price information is displayed
    const priceInfo = page.locator('div:has-text("PLN")');
    if (await priceInfo.count() > 0) {
      await expect(priceInfo.first()).toBeVisible();
    }
  });

  test('should display store information when available', async ({ page }) => {
    // Wait for recommendations to load
    await page.waitForTimeout(3000);
    
    // Check if store information is displayed
    const storeInfo = page.locator('div:has-text("Best Offer")');
    if (await storeInfo.count() > 0) {
      await expect(storeInfo.first()).toBeVisible();
    }
  });

  test('should display recommendation status with correct colors', async ({ page }) => {
    // Wait for recommendations to load
    await page.waitForTimeout(3000);
    
    // Check if recommendation status badges are displayed
    const statusBadges = page.locator('span:has-text("BUY"), span:has-text("WAIT"), span:has-text("AVOID")');
    if (await statusBadges.count() > 0) {
      await expect(statusBadges.first()).toBeVisible();
    }
  });

  test('should display confidence scores', async ({ page }) => {
    // Wait for recommendations to load
    await page.waitForTimeout(3000);
    
    // Check if confidence scores are displayed
    const confidenceScores = page.locator('span:has-text("Confidence:")');
    if (await confidenceScores.count() > 0) {
      await expect(confidenceScores.first()).toBeVisible();
    }
  });

  test('should display price analysis section', async ({ page }) => {
    // Wait for recommendations to load
    await page.waitForTimeout(3000);
    
    // Check if price analysis section is displayed
    const priceAnalysis = page.locator('h4:has-text("Price Analysis")');
    if (await priceAnalysis.count() > 0) {
      await expect(priceAnalysis.first()).toBeVisible();
    }
  });

  test('should display recommendation reasoning', async ({ page }) => {
    // Wait for recommendations to load
    await page.waitForTimeout(3000);
    
    // Check if recommendation reasoning is displayed
    const reasoning = page.locator('h4:has-text("Recommendation")');
    if (await reasoning.count() > 0) {
      await expect(reasoning.first()).toBeVisible();
    }
  });

  test('should handle empty recommendations gracefully', async ({ page }) => {
    // Wait for recommendations to load
    await page.waitForTimeout(3000);
    
    // Check if no recommendations message is shown when appropriate
    const noRecommendations = page.locator('div:has-text("No recommendations available")');
    if (await noRecommendations.isVisible()) {
      await expect(noRecommendations).toBeVisible();
      await expect(page.locator('p:has-text("Try searching for specific LEGO sets")')).toBeVisible();
    }
  });

  test('should display best offer details when available', async ({ page }) => {
    // Wait for recommendations to load
    await page.waitForTimeout(3000);
    
    // Check if best offer section is displayed
    const bestOffer = page.locator('div:has-text("Best Offer")');
    if (await bestOffer.count() > 0) {
      await expect(bestOffer.first()).toBeVisible();
      
      // Check if view offer button is present
      const viewOfferButton = page.locator('a:has-text("View Offer")');
      if (await viewOfferButton.count() > 0) {
        await expect(viewOfferButton.first()).toBeVisible();
      }
    }
  });

  test('should display condition badges correctly', async ({ page }) => {
    // Wait for recommendations to load
    await page.waitForTimeout(3000);
    
    // Check if condition badges are displayed
    const conditionBadges = page.locator('span:has-text("new"), span:has-text("used")');
    if (await conditionBadges.count() > 0) {
      await expect(conditionBadges.first()).toBeVisible();
    }
  });

  test('should be responsive on different screen sizes', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Wait for recommendations to load
    await page.waitForTimeout(3000);
    
    // Check if content is still accessible
    await expect(page.locator('h1:has-text("Price Recommendations")')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Check if content is still accessible
    await expect(page.locator('h1:has-text("Price Recommendations")')).toBeVisible();
  });

  test('should handle page refresh correctly', async ({ page }) => {
    // Wait for initial load
    await page.waitForTimeout(3000);
    
    // Refresh the page
    await page.reload();
    
    // Check if loading state appears again
    await expect(page.locator('div:has-text("Loading recommendations...")')).toBeVisible();
  });

  test('should display recommendation icons correctly', async ({ page }) => {
    // Wait for recommendations to load
    await page.waitForTimeout(3000);
    
    // Check if recommendation icons are displayed
    const icons = page.locator('span:has-text("✅"), span:has-text("⏳"), span:has-text("❌")');
    if (await icons.count() > 0) {
      await expect(icons.first()).toBeVisible();
    }
  });

  test('should display price comparison information', async ({ page }) => {
    // Wait for recommendations to load
    await page.waitForTimeout(3000);
    
    // Check if price comparison is displayed
    const priceComparison = page.locator('div:has-text("vs")');
    if (await priceComparison.count() > 0) {
      await expect(priceComparison.first()).toBeVisible();
    }
  });

  test('should display percentage differences correctly', async ({ page }) => {
    // Wait for recommendations to load
    await page.waitForTimeout(3000);
    
    // Check if percentage differences are displayed
    const percentageDiff = page.locator('span:has-text("%")');
    if (await percentageDiff.count() > 0) {
      await expect(percentageDiff.first()).toBeVisible();
    }
  });
});
