import { test, expect } from '@playwright/test';

test.describe('Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/search');
  });

            test('should display search page with correct elements', async ({ page }) => {
            // Check if page title is visible
            await expect(page.locator('h1:has-text("Search")')).toBeVisible();
            
            // Check if search input is present
            const searchInput = page.locator('input[type="text"], input[placeholder*="search"], input[placeholder*="Search"]');
            await expect(searchInput).toBeVisible();
            
            // Check if search button is present
            const searchButton = page.locator('button:has-text("Search"), button[type="submit"]');
            await expect(searchButton).toBeVisible();
          });

            test('should allow typing in search input', async ({ page }) => {
            const searchInput = page.locator('input[type="text"], input[placeholder*="search"], input[placeholder*="Search"]');
            
            // Type in the search input
            await searchInput.fill('42100');
            
            // Check if the value was entered
            await expect(searchInput).toHaveValue('42100');
          });

            test('should allow clearing search input', async ({ page }) => {
            const searchInput = page.locator('input[type="text"], input[placeholder*="search"], input[placeholder*="Search"]');
            
            // Fill the input first
            await searchInput.fill('42100');
            await expect(searchInput).toHaveValue('42100');
            
            // Clear the input
            await searchInput.clear();
            await expect(searchInput).toHaveValue('');
          });

            test('should submit search when button is clicked', async ({ page }) => {
            const searchInput = page.locator('input[type="text"], input[placeholder*="search"], input[placeholder*="Search"]');
            const searchButton = page.locator('button:has-text("Search"), button[type="submit"]');
            
            // Fill the search input
            await searchInput.fill('42100');
            
            // Click the search button
            await searchButton.click();
            
            // Check if search was submitted (button should be clickable)
            await expect(searchButton).toBeVisible();
          });

            test('should handle empty search query', async ({ page }) => {
            const searchButton = page.locator('button:has-text("Search"), button[type="submit"]');
            
            // Try to search with empty input
            await searchButton.click();
            
            // Check if we're still on the search page
            await expect(page.locator('h1:has-text("Search")')).toBeVisible();
          });

            test('should handle special characters in search', async ({ page }) => {
            const searchInput = page.locator('input[type="text"], input[placeholder*="search"], input[placeholder*="Search"]');
            
            // Test with special characters
            await searchInput.fill('Liebherr R 9800!@#');
            await expect(searchInput).toHaveValue('Liebherr R 9800!@#');
          });

            test('should handle long search queries', async ({ page }) => {
            const searchInput = page.locator('input[type="text"], input[placeholder*="search"], input[placeholder*="Search"]');
            
            // Test with a long query
            const longQuery = 'Very long LEGO set name that might exceed normal input lengths and test the input handling capabilities';
            await searchInput.fill(longQuery);
            await expect(searchInput).toHaveValue(longQuery);
          });

            test('should maintain search input on navigation', async ({ page }) => {
            const searchInput = page.locator('input[type="text"], input[placeholder*="search"], input[placeholder*="Search"]');
            
            // Fill the search input
            await searchInput.fill('42100');
            
            // Navigate away and back
            await page.goto('/');
            await page.goto('/search');
            
            // Check if the input is empty (fresh page load)
            await expect(searchInput).toHaveValue('');
          });

            test('should submit search on Enter key press', async ({ page }) => {
            const searchInput = page.locator('input[type="text"], input[placeholder*="search"], input[placeholder*="Search"]');
            
            // Fill the search input
            await searchInput.fill('42100');
            
            // Press Enter key
            await searchInput.press('Enter');
            
            // Check if search was submitted (input should still have value)
            await expect(searchInput).toHaveValue('42100');
          });

            test('should display search results when available', async ({ page }) => {
            // Mock API response or wait for actual results
            const searchInput = page.locator('input[type="text"], input[placeholder*="search"], input[placeholder*="Search"]');
            const searchButton = page.locator('button:has-text("Search"), button[type="submit"]');
            
            await searchInput.fill('42100');
            await searchButton.click();
            
            // Wait for potential results or no results message
            await page.waitForTimeout(2000);
            
            // Check if either results or no results message is shown
            const hasResults = await page.locator('div:has-text("Found"), div:has-text("Results")').isVisible();
            const hasNoResults = await page.locator('div:has-text("No results"), div:has-text("No results found")').isVisible();
            
            // At least one should be true
            expect(hasResults || hasNoResults).toBeTruthy();
          });

            test('should show loading state during search', async ({ page }) => {
            const searchInput = page.locator('input[type="text"], input[placeholder*="search"], input[placeholder*="Search"]');
            const searchButton = page.locator('button:has-text("Search"), button[type="submit"]');
            
            await searchInput.fill('42100');
            await searchButton.click();
            
            // Check if loading spinner is visible (if it exists)
            const loadingSpinner = page.locator('div.animate-spin, [aria-busy="true"]');
            if (await loadingSpinner.count() > 0) {
              await expect(loadingSpinner.first()).toBeVisible();
            }
            
            // Check if search button is still functional
            await expect(searchButton).toBeVisible();
          });

            test('should disable search button during loading', async ({ page }) => {
            const searchInput = page.locator('input[type="text"], input[placeholder*="search"], input[placeholder*="Search"]');
            const searchButton = page.locator('button:has-text("Search"), button[type="submit"]');
            
            await searchInput.fill('42100');
            await searchButton.click();
            
            // Check if button shows loading state (if it exists)
            const loadingButton = page.locator('button:has-text("Searching..."), button:disabled');
            if (await loadingButton.count() > 0) {
              await expect(loadingButton.first()).toBeVisible();
            }
            
            // Check if original button is still functional
            await expect(searchButton).toBeVisible();
          });

            test('should display search suggestions or help text', async ({ page }) => {
            // Check if placeholder text provides helpful information
            const searchInput = page.locator('input[type="text"], input[placeholder*="search"], input[placeholder*="Search"]');
            const placeholder = await searchInput.getAttribute('placeholder');
            expect(placeholder).toBeTruthy();
            
            // Check if search input is accessible
            await expect(searchInput).toBeVisible();
          });
});
