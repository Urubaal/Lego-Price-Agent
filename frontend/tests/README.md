# Testy Playwright dla LEGO Price Agent

Ten katalog zawiera kompleksowe testy end-to-end napisane w Playwright dla aplikacji LEGO Price Agent.

## Struktura testów

### Pliki testowe

- **`test_playwright.spec.ts`** - Podstawowe testy funkcjonalności
- **`home.spec.ts`** - Testy strony głównej
- **`search.spec.ts`** - Testy funkcjonalności wyszukiwania
- **`recommendations.spec.ts`** - Testy rekomendacji cenowych
- **`auth.spec.ts`** - Testy uwierzytelniania
- **`watchlist.spec.ts`** - Testy listy obserwowanych produktów
- **`navigation.spec.ts`** - Testy nawigacji i responsywności
- **`api-integration.spec.ts`** - Testy integracji z backendem
- **`accessibility.spec.ts`** - Testy dostępności (WCAG)
- **`performance.spec.ts`** - Testy wydajności
- **`user-scenarios.spec.ts`** - Testy scenariuszy użytkownika

## Konfiguracja

### Wymagania

- Node.js 16+
- npm lub yarn
- Playwright zainstalowany globalnie lub lokalnie

### Instalacja

```bash
# Zainstaluj Playwright
npm install @playwright/test

# Zainstaluj przeglądarki
npx playwright install
```

### Konfiguracja Playwright

Plik `playwright.config.ts` zawiera konfigurację dla:
- Różnych przeglądarek (Chrome, Firefox, Safari)
- Urządzeń mobilnych
- Raportowania testów
- Automatycznego uruchamiania serwera deweloperskiego

## Uruchamianie testów

### Uruchomienie wszystkich testów

```bash
# Uruchom wszystkie testy
npm run test:e2e

# Uruchom testy w trybie watch
npm run test:e2e -- --watch

# Uruchom testy z interfejsem UI
npm run test:ui
```

### Uruchomienie konkretnych testów

```bash
# Uruchom konkretny plik testowy
npx playwright test home.spec.ts

# Uruchom testy z konkretnym tagiem
npx playwright test --grep "search"

# Uruchom testy w konkretnej przeglądarce
npx playwright test --project=chromium
```

### Uruchomienie testów w trybie debug

```bash
# Uruchom testy w trybie debug
npx playwright test --debug

# Uruchom konkretny test w trybie debug
npx playwright test home.spec.ts --debug
```

## Struktura testów

### Organizacja testów

Każdy plik testowy zawiera:
- `test.describe()` - Grupowanie powiązanych testów
- `test.beforeEach()` - Setup przed każdym testem
- `test()` - Pojedyncze testy
- `expect()` - Asercje Playwright

### Przykład testu

```typescript
import { test, expect } from '@playwright/test';

test.describe('Example Test Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display main content', async ({ page }) => {
    await expect(page.locator('main')).toBeVisible();
  });
});
```

## Asercje i selektory

### Podstawowe asercje

```typescript
// Sprawdzenie widoczności
await expect(page.locator('.element')).toBeVisible();

// Sprawdzenie tekstu
await expect(page.locator('h1')).toHaveText('LEGO Price Agent');

// Sprawdzenie wartości
await expect(page.locator('input')).toHaveValue('test');

// Sprawdzenie liczby elementów
await expect(page.locator('.item')).toHaveCount(5);
```

### Selektory

```typescript
// Selektor CSS
page.locator('.class-name')

// Selektor tekstu
page.locator('text=LEGO')

// Selektor atrybutu
page.locator('[data-testid="button"]')

// Selektor z warunkiem
page.locator('button:has-text("Click me")')
```

## Obsługa elementów

### Interakcje z elementami

```typescript
// Kliknięcie
await page.locator('button').click();

// Wypełnienie pola
await page.locator('input').fill('text');

// Wybór opcji
await page.locator('select').selectOption('option');

// Sprawdzenie checkboxa
await page.locator('input[type="checkbox"]').check();
```

### Oczekiwanie na elementy

```typescript
// Oczekiwanie na widoczność
await page.locator('.element').waitFor({ state: 'visible' });

// Oczekiwanie na stan sieci
await page.waitForLoadState('networkidle');

// Oczekiwanie na timeout
await page.waitForTimeout(1000);
```

## Testy responsywności

### Testowanie różnych rozmiarów ekranu

```typescript
test('should be responsive', async ({ page }) => {
  const viewports = [
    { width: 1920, height: 1080 }, // Desktop
    { width: 1024, height: 768 },  // Tablet
    { width: 375, height: 667 },   // Mobile
  ];
  
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await expect(page.locator('main')).toBeVisible();
  }
});
```

## Testy dostępności

### Podstawowe testy WCAG

```typescript
test('should have proper heading structure', async ({ page }) => {
  const headings = page.locator('h1, h2, h3, h4, h5, h6');
  if (await headings.count() > 0) {
    const firstHeading = headings.first();
    const tagName = await firstHeading.evaluate(el => el.tagName.toLowerCase());
    expect(tagName).toBe('h1');
  }
});
```

## Raportowanie

### Generowanie raportów

```bash
# Generuj raport HTML
npx playwright show-report

# Generuj raport JUnit
npx playwright test --reporter=junit

# Generuj raport JSON
npx playwright test --reporter=json
```

### Konfiguracja raportów

Raporty są automatycznie generowane w katalogu `test-results/`:
- `results.html` - Raport HTML
- `results.xml` - Raport JUnit
- `results.json` - Raport JSON

## Debugowanie

### Tryb debug

```bash
# Uruchom test w trybie debug
npx playwright test --debug

# Uruchom konkretny test w trybie debug
npx playwright test home.spec.ts --debug
```

### Screenshoty i filmy

Screenshoty i filmy są automatycznie generowane przy błędach:
- Screenshoty: `test-results/screenshots/`
- Filmy: `test-results/videos/`
- Trace: `test-results/traces/`

## CI/CD

### Konfiguracja CI

```yaml
# .github/workflows/playwright.yml
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: 16
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
      - uses: actions/upload-artifact@v2
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Najlepsze praktyki

### Organizacja testów

1. **Grupuj powiązane testy** w `test.describe()`
2. **Używaj `beforeEach`** dla wspólnego setupu
3. **Nadawaj opisowe nazwy** testom
4. **Organizuj testy** w logiczne kategorie

### Selektory

1. **Preferuj `data-testid`** nad selektorami CSS
2. **Używaj semantycznych selektorów** (role, aria-label)
3. **Unikaj selektorów zależnych od tekstu** jeśli to możliwe
4. **Testuj selektory** przed napisaniem testów

### Asercje

1. **Używaj konkretnych asercji** zamiast `toBeVisible()`
2. **Sprawdzaj stan elementów** przed interakcją
3. **Oczekuj na odpowiednie stany** (visible, hidden, enabled)
4. **Używaj timeoutów** dla operacji asynchronicznych

### Wydajność

1. **Uruchamiaj testy równolegle** gdy to możliwe
2. **Minimalizuj setup** w `beforeEach`
3. **Używaj `waitForLoadState`** zamiast `waitForTimeout`
4. **Optymalizuj selektory** dla lepszej wydajności

## Rozwiązywanie problemów

### Częste problemy

1. **Element nie jest widoczny**
   - Sprawdź czy element jest w DOM
   - Sprawdź czy nie jest ukryty przez CSS
   - Użyj `waitFor` zamiast `waitForTimeout`

2. **Test nie przechodzi w CI**
   - Sprawdź czy serwer jest uruchomiony
   - Sprawdź czy port jest dostępny
   - Użyj `webServer` w konfiguracji

3. **Wolne testy**
   - Sprawdź czy testy są uruchamiane równolegle
   - Zoptymalizuj selektory
   - Użyj `waitForLoadState` zamiast `waitForTimeout`

### Debugowanie

1. **Uruchom test w trybie debug**
2. **Sprawdź screenshots i filmy**
3. **Użyj `console.log`** w testach
4. **Sprawdź trace** dla szczegółowych informacji

## Wsparcie

### Dokumentacja

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Test API](https://playwright.dev/docs/api/class-test)
- [Playwright Assertions](https://playwright.dev/docs/test-assertions)

### Społeczność

- [Playwright GitHub](https://github.com/microsoft/playwright)
- [Playwright Discord](https://discord.gg/playwright)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/playwright)
