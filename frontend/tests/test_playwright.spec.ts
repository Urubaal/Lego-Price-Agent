import { test, expect } from '@playwright/test';

test.describe('LEGO Price Agent Frontend', () => {
  test('should load the main page', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Check if the page loads
    await expect(page).toHaveTitle(/LEGO Price Agent/);
  });

  test('should display search functionality', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Check if search input is present
    const searchInput = page.locator('input[placeholder*="search" i], input[placeholder*="szukaj" i]');
    await expect(searchInput).toBeVisible();
  });

  test('should show price recommendations', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Check if price recommendations section exists
    const recommendationsSection = page.locator('text=/recommendations|rekomendacje/i');
    await expect(recommendationsSection).toBeVisible();
  });
}); 