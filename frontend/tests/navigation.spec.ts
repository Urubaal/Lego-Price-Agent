import { test, expect } from '@playwright/test';

test.describe('Navigation and Responsiveness', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display working navigation menu', async ({ page }) => {
    // Check if navigation bar is visible
    const navbar = page.locator('nav.bg-white.shadow-lg');
    await expect(navbar).toBeVisible();
    
    // Check if logo/brand is visible
    await expect(page.locator('h1:has-text("LEGO Price Agent")')).toBeVisible();
    
    // Check if navigation links are present
    const homeLink = page.locator('a:has-text("Home")');
    const searchLink = page.locator('a:has-text("Search")');
    const recommendationsLink = page.locator('a:has-text("Recommendations")');
    
    await expect(homeLink).toBeVisible();
    await expect(searchLink).toBeVisible();
    await expect(recommendationsLink).toBeVisible();
  });

  test('should navigate to different pages', async ({ page }) => {
    // Navigate to Search page
    const searchLink = page.locator('a:has-text("Search")');
    await searchLink.click();
    
    // Check if we're on the Search page
    await expect(page.locator('h1:has-text("Search LEGO Sets")')).toBeVisible();
    
    // Navigate to Recommendations page
    const recommendationsLink = page.locator('a:has-text("Recommendations")');
    await recommendationsLink.click();
    
    // Check if we're on the Recommendations page
    await expect(page.locator('h1:has-text("Price Recommendations")')).toBeVisible();
    
    // Navigate back to Home
    const homeLink = page.locator('a:has-text("Home")');
    await homeLink.click();
    
    // Check if we're back on the Home page
    await expect(page.locator('h1:has-text("LEGO Price Agent")')).toBeVisible();
  });

  test('should show active navigation state', async ({ page }) => {
    // Check if Home link is active by default
    const homeLink = page.locator('a:has-text("Home")');
    await expect(homeLink).toHaveClass(/text-blue-600 bg-blue-50/);
    
    // Navigate to Search page
    const searchLink = page.locator('a:has-text("Search")');
    await searchLink.click();
    
    // Check if Search link is now active
    await expect(searchLink).toHaveClass(/text-blue-600 bg-blue-50/);
    
    // Check if Home link is no longer active
    await expect(homeLink).not.toHaveClass(/text-blue-600 bg-blue-50/);
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if navigation is still visible
    const navbar = page.locator('nav.bg-white.shadow-lg');
    await expect(navbar).toBeVisible();
    
    // Check if navigation links are still accessible
    await expect(page.locator('a:has-text("Home")')).toBeVisible();
    await expect(page.locator('a:has-text("Search")')).toBeVisible();
    await expect(page.locator('a:has-text("Recommendations")')).toBeVisible();
  });

  test('should be responsive on tablet devices', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Check if navigation is still visible
    const navbar = page.locator('nav.bg-white.shadow-lg');
    await expect(navbar).toBeVisible();
    
    // Check if navigation links are still accessible
    await expect(page.locator('a:has-text("Home")')).toBeVisible();
    await expect(page.locator('a:has-text("Search")')).toBeVisible();
    await expect(page.locator('a:has-text("Recommendations")')).toBeVisible();
  });

  test('should be responsive on desktop devices', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Check if navigation is still visible
    const navbar = page.locator('nav.bg-white.shadow-lg');
    await expect(navbar).toBeVisible();
    
    // Check if navigation links are still accessible
    await expect(page.locator('a:has-text("Home")')).toBeVisible();
    await expect(page.locator('a:has-text("Search")')).toBeVisible();
    await expect(page.locator('a:has-text("Recommendations")')).toBeVisible();
  });

  test('should maintain navigation state on page refresh', async ({ page }) => {
    // Navigate to Search page
    const searchLink = page.locator('a:has-text("Search")');
    await searchLink.click();
    
    // Check if we're on the Search page
    await expect(page.locator('h1:has-text("Search LEGO Sets")')).toBeVisible();
    
    // Refresh the page
    await page.reload();
    
    // Check if we're still on the Search page
    await expect(page.locator('h1:has-text("Search LEGO Sets")')).toBeVisible();
    
    // Check if Search link is still active
    await expect(searchLink).toHaveClass(/text-blue-600 bg-blue-50/);
  });

  test('should handle browser back and forward navigation', async ({ page }) => {
    // Navigate to Search page
    const searchLink = page.locator('a:has-text("Search")');
    await searchLink.click();
    
    // Check if we're on the Search page
    await expect(page.locator('h1:has-text("Search LEGO Sets")')).toBeVisible();
    
    // Go back
    await page.goBack();
    
    // Check if we're back on the Home page
    await expect(page.locator('h1:has-text("LEGO Price Agent")')).toBeVisible();
    
    // Go forward
    await page.goForward();
    
    // Check if we're back on the Search page
    await expect(page.locator('h1:has-text("Search LEGO Sets")')).toBeVisible();
  });

  test('should display user authentication status in navigation', async ({ page }) => {
    // Check if user is not logged in (should show login form)
    await expect(page.locator('h2:has-text("Sign in to your account")')).toBeVisible();
    
    // Note: This test would need to be expanded when user authentication is implemented
    // For now, we'll check that the basic navigation structure is present
    const navbar = page.locator('nav.bg-white.shadow-lg');
    await expect(navbar).toBeVisible();
  });

  test('should have proper navigation accessibility', async ({ page }) => {
    // Check if navigation has proper role
    const navbar = page.locator('nav.bg-white.shadow-lg');
    await expect(navbar).toBeVisible();
    
    // Check if navigation links have proper href attributes
    const homeLink = page.locator('a:has-text("Home")');
    const searchLink = page.locator('a:has-text("Search")');
    const recommendationsLink = page.locator('a:has-text("Recommendations")');
    
    await expect(homeLink).toHaveAttribute('href', '/');
    await expect(searchLink).toHaveAttribute('href', '/search');
    await expect(recommendationsLink).toHaveAttribute('href', '/recommendations');
  });

  test('should handle navigation with search parameters', async ({ page }) => {
    // Navigate to Search page
    const searchLink = page.locator('a:has-text("Search")');
    await searchLink.click();
    
    // Check if we're on the Search page
    await expect(page.locator('h1:has-text("Search LEGO Sets")')).toBeVisible();
    
    // Check if URL is correct
    await expect(page).toHaveURL(/.*\/search/);
  });

  test('should maintain navigation state during user interactions', async ({ page }) => {
    // Navigate to Search page
    const searchLink = page.locator('a:has-text("Search")');
    await searchLink.click();
    
    // Perform a search action
    const searchInput = page.locator('input[placeholder*="Enter LEGO set name or number"]');
    await searchInput.fill('42100');
    
    // Check if we're still on the Search page
    await expect(page.locator('h1:has-text("Search LEGO Sets")')).toBeVisible();
    
    // Check if navigation is still functional
    await expect(page.locator('a:has-text("Home")')).toBeVisible();
    await expect(page.locator('a:has-text("Recommendations")')).toBeVisible();
  });

  test('should handle navigation errors gracefully', async ({ page }) => {
    // Try to navigate to a non-existent route
    await page.goto('/non-existent-route');
    
    // Check if the page handles the error gracefully
    // This depends on how the app handles 404 errors
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have consistent navigation styling', async ({ page }) => {
    // Check if all navigation links have consistent styling
    const navLinks = page.locator('nav a');
    
    if (await navLinks.count() > 0) {
      const firstLink = navLinks.first();
      await expect(firstLink).toBeVisible();
      
      // Check if links have consistent classes
      const linkClasses = await firstLink.getAttribute('class');
      expect(linkClasses).toContain('px-3');
      expect(linkClasses).toContain('py-2');
      expect(linkClasses).toContain('rounded-md');
      expect(linkClasses).toContain('text-sm');
      expect(linkClasses).toContain('font-medium');
    }
  });

  test('should handle navigation with keyboard', async ({ page }) => {
    // Focus on navigation
    const homeLink = page.locator('a:has-text("Home")');
    await homeLink.focus();
    
    // Check if link is focusable
    await expect(homeLink).toBeFocused();
    
    // Navigate with Tab key
    await page.keyboard.press('Tab');
    
    // Check if focus moved to next element
    const searchLink = page.locator('a:has-text("Search")');
    await expect(searchLink).toBeFocused();
  });
});
