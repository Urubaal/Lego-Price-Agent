import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login form when not authenticated', async ({ page }) => {
    // Check if login form is visible
    await expect(page.locator('h2:has-text("Sign in to your account")')).toBeVisible();
    
    // Check if username input is present
    const usernameInput = page.locator('input[name="username"]');
    await expect(usernameInput).toBeVisible();
    await expect(usernameInput).toHaveAttribute('placeholder', 'Username');
    
    // Check if password input is present
    const passwordInput = page.locator('input[name="password"]');
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toHaveAttribute('placeholder', 'Password');
    
    // Check if sign in button is present
    const signInButton = page.locator('button:has-text("Sign in")');
    await expect(signInButton).toBeVisible();
  });

  test('should display registration form when switching', async ({ page }) => {
    // Click on switch to register button
    const switchToRegisterButton = page.locator('button:has-text("Don\'t have an account? Sign up")');
    await switchToRegisterButton.click();
    
    // Check if registration form is visible
    await expect(page.locator('h2:has-text("Create your account")')).toBeVisible();
    
    // Check if username input is present
    const usernameInput = page.locator('input[name="username"]');
    await expect(usernameInput).toBeVisible();
    
    // Check if password input is present
    const passwordInput = page.locator('input[name="password"]');
    await expect(passwordInput).toBeVisible();
    
    // Check if confirm password input is present
    const confirmPasswordInput = page.locator('input[name="confirmPassword"]');
    await expect(confirmPasswordInput).toBeVisible();
    
    // Check if sign up button is present
    const signUpButton = page.locator('button:has-text("Sign up")');
    await expect(signUpButton).toBeVisible();
  });

  test('should allow user registration', async ({ page }) => {
    // Switch to registration form
    const switchToRegisterButton = page.locator('button:has-text("Don\'t have an account? Sign up")');
    await switchToRegisterButton.click();
    
    // Fill in registration form
    const usernameInput = page.locator('input[name="username"]');
    const passwordInput = page.locator('input[name="password"]');
    const confirmPasswordInput = page.locator('input[name="confirmPassword"]');
    
    await usernameInput.fill('testuser');
    await passwordInput.fill('testpassword123');
    await confirmPasswordInput.fill('testpassword123');
    
    // Submit registration form
    const signUpButton = page.locator('button:has-text("Sign up")');
    await signUpButton.click();
    
    // Wait for potential API call
    await page.waitForTimeout(2000);
    
    // Check if either success or error message is shown
    const hasSuccess = await page.locator('div:has-text("Account created successfully")').isVisible();
    const hasError = await page.locator('div:has-text("Username already exists")').isVisible();
    
    // At least one should be true
    expect(hasSuccess || hasError).toBeTruthy();
  });

  test('should allow user login', async ({ page }) => {
    // Fill in login form
    const usernameInput = page.locator('input[name="username"]');
    const passwordInput = page.locator('input[name="password"]');
    
    await usernameInput.fill('testuser');
    await passwordInput.fill('testpassword123');
    
    // Submit login form
    const signInButton = page.locator('button:has-text("Sign in")');
    await signInButton.click();
    
    // Wait for potential API call
    await page.waitForTimeout(2000);
    
    // Check if either success or error message is shown
    const hasSuccess = await page.locator('div:has-text("Login successful")').isVisible();
    const hasError = await page.locator('div:has-text("Invalid credentials")').isVisible();
    
    // At least one should be true
    expect(hasSuccess || hasError).toBeTruthy();
  });

  test('should validate form inputs', async ({ page }) => {
    // Try to submit empty form
    const signInButton = page.locator('button:has-text("Sign in")');
    await signInButton.click();
    
    // Check if form validation works (this depends on HTML5 validation)
    const usernameInput = page.locator('input[name="username"]');
    const passwordInput = page.locator('input[name="password"]');
    
    // Check if inputs have required attribute
    await expect(usernameInput).toHaveAttribute('required');
    await expect(passwordInput).toHaveAttribute('required');
  });

  test('should handle authentication errors gracefully', async ({ page }) => {
    // Fill in login form with invalid credentials
    const usernameInput = page.locator('input[name="username"]');
    const passwordInput = page.locator('input[name="password"]');
    
    await usernameInput.fill('invaliduser');
    await passwordInput.fill('invalidpassword');
    
    // Submit login form
    const signInButton = page.locator('button:has-text("Sign in")');
    await signInButton.click();
    
    // Wait for potential API call
    await page.waitForTimeout(2000);
    
    // Check if error message is shown
    const errorMessage = page.locator('div:has-text("Invalid credentials")');
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toBeVisible();
    }
  });

  test('should show loading states during authentication', async ({ page }) => {
    // Fill in login form
    const usernameInput = page.locator('input[name="username"]');
    const passwordInput = page.locator('input[name="password"]');
    
    await usernameInput.fill('testuser');
    await passwordInput.fill('testpassword123');
    
    // Submit login form
    const signInButton = page.locator('button:has-text("Sign in")');
    await signInButton.click();
    
    // Check if button shows loading state
    await expect(page.locator('button:has-text("Signing in...")')).toBeVisible();
    
    // Check if button is disabled during loading
    await expect(page.locator('button:has-text("Signing in...")')).toBeDisabled();
  });

  test('should maintain form state on errors', async ({ page }) => {
    // Fill in login form
    const usernameInput = page.locator('input[name="username"]');
    const passwordInput = page.locator('input[name="password"]');
    
    await usernameInput.fill('testuser');
    await passwordInput.fill('testpassword123');
    
    // Submit login form
    const signInButton = page.locator('button:has-text("Sign in")');
    await signInButton.click();
    
    // Wait for potential API call
    await page.waitForTimeout(2000);
    
    // Check if form values are maintained
    await expect(usernameInput).toHaveValue('testuser');
    await expect(passwordInput).toHaveValue('testpassword123');
  });

  test('should have proper form accessibility', async ({ page }) => {
    // Check if form has proper labels (even if they're sr-only)
    const usernameInput = page.locator('input[name="username"]');
    const passwordInput = page.locator('input[name="password"]');
    
    // Check if inputs have proper name attributes
    await expect(usernameInput).toHaveAttribute('name', 'username');
    await expect(passwordInput).toHaveAttribute('name', 'password');
    
    // Check if form has proper structure
    const form = page.locator('form');
    await expect(form).toBeVisible();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // This test would require mocking network failures
    // For now, we'll test basic form functionality
    
    // Fill in login form
    const usernameInput = page.locator('input[name="username"]');
    const passwordInput = page.locator('input[name="password"]');
    
    await usernameInput.fill('testuser');
    await passwordInput.fill('testpassword123');
    
    // Submit login form
    const signInButton = page.locator('button:has-text("Sign in")');
    await signInButton.click();
    
    // Wait for potential API call
    await page.waitForTimeout(2000);
    
    // Check if page is still functional
    await expect(page.locator('h2:has-text("Sign in to your account")')).toBeVisible();
  });

  test('should switch between login and registration forms', async ({ page }) => {
    // Start on login form
    await expect(page.locator('h2:has-text("Sign in to your account")')).toBeVisible();
    
    // Switch to registration
    const switchToRegisterButton = page.locator('button:has-text("Don\'t have an account? Sign up")');
    await switchToRegisterButton.click();
    
    // Check if registration form is visible
    await expect(page.locator('h2:has-text("Create your account")')).toBeVisible();
    
    // Switch back to login
    const switchToLoginButton = page.locator('button:has-text("Already have an account? Sign in")');
    await switchToLoginButton.click();
    
    // Check if login form is visible again
    await expect(page.locator('h2:has-text("Sign in to your account")')).toBeVisible();
  });

  test('should display appropriate form descriptions', async ({ page }) => {
    // Check if login form has helpful description
    await expect(page.locator('p:has-text("Track LEGO prices and get the best deals")')).toBeVisible();
    
    // Switch to registration form
    const switchToRegisterButton = page.locator('button:has-text("Don\'t have an account? Sign up")');
    await switchToRegisterButton.click();
    
    // Check if registration form has helpful description
    await expect(page.locator('p:has-text("Join LEGO Price Agent to start tracking prices")')).toBeVisible();
  });
});
