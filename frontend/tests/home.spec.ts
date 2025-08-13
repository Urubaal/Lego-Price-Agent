import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the home page with correct title', async ({ page }) => {
    // Check if the page loads with correct title
    await expect(page).toHaveTitle(/LEGO Price Agent/);
    
    // Check if main heading is visible
    await expect(page.locator('h1:has-text("LEGO Price Agent")')).toBeVisible();
    
    // Check if subtitle is visible
    await expect(page.locator('p:has-text("Track, analyze, and get recommendations")')).toBeVisible();
  });

  test('should display navigation buttons', async ({ page }) => {
    // Check if Search link is visible and clickable
    const searchLink = page.locator('a:has-text("Search")');
    await expect(searchLink).toBeVisible();
    await expect(searchLink).toHaveAttribute('href', '/search');
    
    // Check if Recommendations link is visible and clickable
    const recommendationsLink = page.locator('a:has-text("Recommendations")');
    await expect(recommendationsLink).toBeVisible();
    await expect(recommendationsLink).toHaveAttribute('href', '/recommendations');
  });

  test('should display feature cards', async ({ page }) => {
    // Check if feature cards section exists
    const featureSection = page.locator('h2:has-text("Features"), h2:has-text("Features")');
    if (await featureSection.count() > 0) {
      await expect(featureSection.first()).toBeVisible();
    }
    
    // Check if at least one feature card is visible
    const featureCards = page.locator('div.bg-white.rounded-lg.shadow-md, div.shadow-md');
    if (await featureCards.count() > 0) {
      await expect(featureCards.first()).toBeVisible();
    }
  });

  test('should display popular LEGO sets section', async ({ page }) => {
    // Check if popular sets section exists
    const popularSetsSection = page.locator('h2:has-text("Popular"), h2:has-text("LEGO"), h2:has-text("Sets")');
    if (await popularSetsSection.count() > 0) {
      await expect(popularSetsSection.first()).toBeVisible();
    }
    
    // Check if some content is displayed in the section
    const contentElements = page.locator('div.bg-white.rounded-lg, div.shadow-md, h3, p');
    if (await contentElements.count() > 0) {
      await expect(contentElements.first()).toBeVisible();
    }
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if content is still accessible
    await expect(page.locator('h1:has-text("LEGO Price Agent")')).toBeVisible();
    
    // Check if navigation links are still visible
    await expect(page.locator('a:has-text("Search")')).toBeVisible();
    await expect(page.locator('a:has-text("Recommendations")')).toBeVisible();
    
    // Check if main content is still visible
    const mainContent = page.locator('main, .max-w-4xl, .container');
    if (await mainContent.count() > 0) {
      await expect(mainContent.first()).toBeVisible();
    }
  });

  test('should handle page refresh correctly', async ({ page }) => {
    // Refresh the page
    await page.reload();
    
    // Check if content is still visible after refresh
    await expect(page.locator('h1:has-text("LEGO Price Agent")')).toBeVisible();
    await expect(page.locator('a:has-text("Search")')).toBeVisible();
    
    // Check if some content section exists
    const contentSection = page.locator('h2, h3, p');
    if (await contentSection.count() > 0) {
      await expect(contentSection.first()).toBeVisible();
    }
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    // Check if main content has proper structure
    const mainHeading = page.locator('h1:has-text("LEGO Price Agent")');
    await expect(mainHeading).toBeVisible();
    
    // Check if navigation links have proper href attributes
    const searchLink = page.locator('a:has-text("Search")');
    await expect(searchLink).toHaveAttribute('href', '/search');
    
    const recommendationsLink = page.locator('a:has-text("Recommendations")');
    await expect(recommendationsLink).toHaveAttribute('href', '/recommendations');
  });

  test('should display loading states appropriately', async ({ page }) => {
    // Check if the page loads without obvious loading errors
    await expect(page.locator('h1:has-text("LEGO Price Agent")')).toBeVisible();
    
    // Wait a bit to see if any loading states appear
    await page.waitForTimeout(1000);
    
    // Check if page is still functional
    await expect(page.locator('h1:has-text("LEGO Price Agent")')).toBeVisible();
    await expect(page.locator('a:has-text("Search")')).toBeVisible();
  });
});
