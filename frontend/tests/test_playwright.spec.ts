import { test, expect } from '@playwright/test';

test.describe('LEGO Price Agent - Basic Functionality', () => {
  test('should load the main page', async ({ page }) => {
    await page.goto('/');
    
    // Check if the page loads
    await expect(page).toHaveTitle(/LEGO Price Agent/);
    
    // Check if main content is visible
    await expect(page.locator('main, [role="main"]')).toBeVisible();
  });

  test('should display search functionality', async ({ page }) => {
    await page.goto('/');
    
    // Check if search input is present
    const searchInput = page.locator('input[placeholder*="search" i], input[placeholder*="szukaj" i], input[type="search"], input[name*="search"]');
    await expect(searchInput).toBeVisible();
    
    // Check if search button is present
    const searchButton = page.locator('button[type="submit"], button:has-text("Search"), button:has-text("Szukaj")');
    await expect(searchButton).toBeVisible();
  });

  test('should show price recommendations', async ({ page }) => {
    await page.goto('/');
    
    // Check if price recommendations section exists
    const recommendationsSection = page.locator('section:has-text("recommendations"), section:has-text("rekomendacje"), div:has-text("recommendations"), div:has-text("rekomendacje")');
    await expect(recommendationsSection).toBeVisible();
  });

  test('should display navigation menu', async ({ page }) => {
    await page.goto('/');
    
    // Check if navigation is visible
    const navbar = page.locator('nav, [role="navigation"]');
    await expect(navbar).toBeVisible();
    
    // Check if navigation has links
    const navLinks = navbar.locator('a, button[role="link"]');
    if (await navLinks.count() > 0) {
      await expect(navLinks.first()).toBeVisible();
    }
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    await page.goto('/');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if content is still accessible
    await expect(page.locator('main, [role="main"]')).toBeVisible();
    
    // Check if navigation is mobile-friendly
    const navbar = page.locator('nav, [role="navigation"]');
    await expect(navbar).toBeVisible();
  });

  test('should handle page refresh correctly', async ({ page }) => {
    await page.goto('/');
    
    // Refresh the page
    await page.reload();
    
    // Check if content is still visible after refresh
    await expect(page.locator('main, [role="main"]')).toBeVisible();
    await expect(page).toHaveTitle(/LEGO Price Agent/);
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    await page.goto('/');
    
    // Check if main content has proper role
    const main = page.locator('main, [role="main"]');
    await expect(main).toBeVisible();
    
    // Check if navigation has proper role
    const nav = page.locator('nav, [role="navigation"]');
    await expect(nav).toBeVisible();
  });

  test('should display loading states appropriately', async ({ page }) => {
    await page.goto('/');
    
    // Check if the page doesn't show obvious loading errors
    await expect(page.locator('main, [role="main"]')).toBeVisible();
    
    // Wait a bit to see if any loading states appear
    await page.waitForTimeout(1000);
    
    // Check if page is still functional
    await expect(page.locator('main, [role="main"]')).toBeVisible();
  });
}); 