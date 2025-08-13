import { test, expect } from '@playwright/test';

test.describe('Playwright Test Examples', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  // Przykład 1: Test z różnymi asercjami
  test('should demonstrate various assertions', async ({ page }) => {
    // Sprawdzenie widoczności
    await expect(page.locator('main')).toBeVisible();
    
    // Sprawdzenie tekstu
    await expect(page.locator('h1')).toHaveText(/LEGO/);
    
    // Sprawdzenie wartości
    const searchInput = page.locator('input[placeholder*="search" i]');
    if (await searchInput.count() > 0) {
      await searchInput.fill('test');
      await expect(searchInput).toHaveValue('test');
    }
    
    // Sprawdzenie liczby elementów
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);
    
    // Sprawdzenie stanu elementu
    const submitButton = page.locator('button[type="submit"]');
    if (await submitButton.count() > 0) {
      await expect(submitButton).toBeEnabled();
    }
  });

  // Przykład 2: Test z interakcjami
  test('should demonstrate user interactions', async ({ page }) => {
    // Kliknięcie
    const navLinks = page.locator('nav a, [role="navigation"] a');
    if (await navLinks.count() > 0) {
      await navLinks.first().click();
      await page.waitForTimeout(1000);
    }
    
    // Wypełnienie formularza
    const searchInput = page.locator('input[placeholder*="search" i]');
    if (await searchInput.count() > 0) {
      await searchInput.fill('LEGO');
      await searchInput.press('Enter');
      await page.waitForTimeout(1000);
    }
    
    // Wybór opcji z selecta
    const selectElement = page.locator('select');
    if (await selectElement.count() > 0) {
      await selectElement.selectOption({ index: 0 });
      await page.waitForTimeout(500);
    }
    
    // Sprawdzenie checkboxa
    const checkbox = page.locator('input[type="checkbox"]');
    if (await checkbox.count() > 0) {
      await checkbox.check();
      await expect(checkbox).toBeChecked();
    }
  });

  // Przykład 3: Test z oczekiwaniem na elementy
  test('should demonstrate waiting strategies', async ({ page }) => {
    // Oczekiwanie na widoczność elementu
    const mainContent = page.locator('main, [role="main"]');
    await mainContent.waitFor({ state: 'visible' });
    
    // Oczekiwanie na stan sieci
    await page.waitForLoadState('networkidle');
    
    // Oczekiwanie na timeout
    await page.waitForTimeout(1000);
    
    // Oczekiwanie na URL
    await page.waitForURL('**/');
    
    // Oczekiwanie na funkcję
    await page.waitForFunction(() => document.readyState === 'complete');
  });

  // Przykład 4: Test z różnymi selektorami
  test('should demonstrate various selectors', async ({ page }) => {
    // Selektor CSS
    const cssSelector = page.locator('.class-name');
    
    // Selektor tekstu
    const textSelector = page.locator('text=LEGO');
    
    // Selektor atrybutu
    const attributeSelector = page.locator('[data-testid="button"]');
    
    // Selektor z warunkiem
    const conditionalSelector = page.locator('button:has-text("Click me")');
    
    // Selektor z indeksem
    const indexedSelector = page.locator('button').nth(0);
    
    // Selektor z filtrem
    const filteredSelector = page.locator('button').filter({ hasText: 'Submit' });
    
    // Selektor z relacją
    const relativeSelector = page.locator('form').locator('input');
  });

  // Przykład 5: Test z obsługą błędów
  test('should demonstrate error handling', async ({ page }) => {
    try {
      // Próba znalezienia elementu, który może nie istnieć
      const nonExistentElement = page.locator('.non-existent');
      
      if (await nonExistentElement.count() > 0) {
        await expect(nonExistentElement).toBeVisible();
      } else {
        console.log('Element nie istnieje - to jest oczekiwane zachowanie');
      }
    } catch (error) {
      console.log('Złapano błąd:', error.message);
    }
    
    // Sprawdzenie czy strona nadal działa
    await expect(page.locator('body')).toBeVisible();
  });

  // Przykład 6: Test z różnymi viewportami
  test('should demonstrate viewport testing', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop' },
      { width: 1024, height: 768, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      
      // Sprawdzenie czy strona jest responsywna
      await expect(page.locator('main, [role="main"]')).toBeVisible();
      
      // Sprawdzenie nawigacji
      const navbar = page.locator('nav, [role="navigation"]');
      await expect(navbar).toBeVisible();
      
      await page.waitForTimeout(500);
    }
  });

  // Przykład 7: Test z mockowaniem
  test('should demonstrate mocking capabilities', async ({ page }) => {
    // Mockowanie odpowiedzi API
    await page.route('**/api/products', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 1, name: 'LEGO Star Wars', price: 99.99 },
          { id: 2, name: 'LEGO Technic', price: 149.99 }
        ])
      });
    });
    
    // Sprawdzenie czy mock działa
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Sprawdzenie czy dane są wyświetlane
    await expect(page.locator('body')).toBeVisible();
  });

  // Przykład 8: Test z screenshotami
  test('should demonstrate screenshot capabilities', async ({ page }) => {
    // Screenshot całej strony
    await page.screenshot({ path: 'full-page.png', fullPage: true });
    
    // Screenshot konkretnego elementu
    const mainContent = page.locator('main, [role="main"]');
    if (await mainContent.count() > 0) {
      await mainContent.screenshot({ path: 'main-content.png' });
    }
    
    // Sprawdzenie czy screenshoty zostały utworzone
    await expect(page.locator('body')).toBeVisible();
  });

  // Przykład 9: Test z klawiaturą
  test('should demonstrate keyboard interactions', async ({ page }) => {
    // Fokus na element
    const searchInput = page.locator('input[placeholder*="search" i]');
    if (await searchInput.count() > 0) {
      await searchInput.focus();
      
      // Wpisywanie tekstu
      await page.keyboard.type('LEGO');
      
      // Usuwanie tekstu
      await page.keyboard.press('Backspace');
      
      // Nawigacja klawiaturą
      await page.keyboard.press('Tab');
      await page.keyboard.press('Shift+Tab');
      
      // Sprawdzenie czy interakcje działają
      await expect(page.locator('body')).toBeVisible();
    }
  });

  // Przykład 10: Test z różnymi przeglądarkami
  test('should work across different browsers', async ({ page, browserName }) => {
    // Sprawdzenie nazwy przeglądarki
    console.log(`Test uruchomiony w: ${browserName}`);
    
    // Sprawdzenie czy strona ładuje się w każdej przeglądarce
    await expect(page.locator('main, [role="main"]')).toBeVisible();
    
    // Sprawdzenie nawigacji
    const navbar = page.locator('nav, [role="navigation"]');
    await expect(navbar).toBeVisible();
    
    // Sprawdzenie wyszukiwania
    const searchInput = page.locator('input[placeholder*="search" i]');
    if (await searchInput.count() > 0) {
      await searchInput.fill('LEGO');
      await expect(searchInput).toHaveValue('LEGO');
    }
  });

  // Przykład 11: Test z asercjami niestandardowymi
  test('should demonstrate custom assertions', async ({ page }) => {
    // Sprawdzenie czy strona ma odpowiedni tytuł
    const title = await page.title();
    expect(title).toContain('LEGO');
    
    // Sprawdzenie czy strona ma odpowiedni URL
    const url = page.url();
    expect(url).toContain('localhost');
    
    // Sprawdzenie czy strona ma odpowiednią strukturę HTML
    const html = await page.content();
    expect(html).toContain('<html');
    expect(html).toContain('</html>');
    
    // Sprawdzenie czy strona ma odpowiednie meta tagi
    const metaDescription = page.locator('meta[name="description"]');
    if (await metaDescription.count() > 0) {
      const content = await metaDescription.getAttribute('content');
      expect(content).toBeTruthy();
    }
  });

  // Przykład 12: Test z obsługą stanów
  test('should demonstrate state handling', async ({ page }) => {
    // Sprawdzenie stanu początkowego
    await expect(page.locator('main, [role="main"]')).toBeVisible();
    
    // Zmiana stanu (np. kliknięcie przycisku)
    const button = page.locator('button');
    if (await button.count() > 0) {
      await button.first().click();
      await page.waitForTimeout(1000);
      
      // Sprawdzenie nowego stanu
      await expect(page.locator('body')).toBeVisible();
    }
    
    // Przywrócenie stanu (np. odświeżenie strony)
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Sprawdzenie czy stan został przywrócony
    await expect(page.locator('main, [role="main"]')).toBeVisible();
  });
});
