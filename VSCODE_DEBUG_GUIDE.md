# VS Code Style Debug Interface - Przewodnik Użytkownika

## 🎯 Przegląd

Aplikacja LEGO Price Agent została wyposażona w zaawansowany interfejs debugowania wzorowany na Visual Studio Code, wraz z kompletnym zestawem narzędzi do monitorowania, debugowania i optymalizacji aplikacji React.

## 🚀 Główne Funkcje

### 1. **VS Code Style Layout**
- **Menu Bar** - Górny pasek z menu File, Edit, View, Run, Terminal, Help
- **Activity Bar** - Lewy pasek z ikonami aktywności (Explorer, Search, Debug, Extensions)
- **Sidebar** - Lewy panel z zawartością zależną od wybranej aktywności
- **Editor Area** - Główny obszar edycji z zakładkami
- **Status Bar** - Dolny pasek ze statusem
- **Right Panel** - Prawy panel z zakładkami Problems, Output, Terminal

### 2. **Narzędzia Debugowania**

#### **Debug Panel**
- **Console** - Zaawansowana konsola z filtrowaniem i kolorowaniem logów
- **Performance** - Monitorowanie wydajności komponentów
- **Network** - Monitorowanie żądań HTTP i XMLHttpRequest

#### **Error Boundary**
- Automatyczne przechwytywanie błędów React
- Szczegółowe informacje o błędach z ID
- Możliwość kopiowania szczegółów błędu
- Opcje ponownego uruchomienia lub przeładowania

#### **Performance Monitor**
- Pomiar czasu renderowania komponentów
- Wykrywanie wolnych renderów (>16ms)
- Statystyki wydajności w czasie rzeczywistym
- Eksport danych wydajności

#### **Network Monitor**
- Interceptowanie fetch i XMLHttpRequest
- Monitorowanie statusów HTTP
- Pomiar czasu odpowiedzi
- Filtrowanie i wyszukiwanie żądań

### 3. **Zarządzanie Wtyczkami**

#### **Extension Manager**
- **React DevTools** - Debugowanie komponentów React
- **Performance Monitor** - Monitorowanie wydajności
- **Error Boundary** - Obsługa błędów
- **Network Monitor** - Monitorowanie sieci
- **Debug Console** - Zaawansowana konsola
- **Component Inspector** - Inspekcja komponentów
- **Memory Profiler** - Profilowanie pamięci

## 🛠️ Jak Używać

### **Uruchomienie Aplikacji**

1. Zaloguj się do aplikacji
2. Zostaniesz przekierowany do głównego interfejsu VS Code
3. Użyj Activity Bar (lewy pasek) do nawigacji

### **Nawigacja po Panelach**

#### **Explorer (📁)**
- Przegląd głównych sekcji aplikacji
- Szybki dostęp do Home, Search, Recommendations

#### **Search (🔍)**
- Wyszukiwanie w plikach i kodzie
- Filtrowanie wyników

#### **Debug (🐛)**
- Uruchamianie sesji debugowania
- Testowanie błędów i ostrzeżeń
- Symulacja problemów z wydajnością

#### **Extensions (⚙️)**
- Zarządzanie wtyczkami debugowania
- Konfiguracja ustawień
- Włączanie/wyłączanie funkcji

### **Używanie Debug Panel**

#### **1. Console**
```typescript
// Logi są automatycznie kategoryzowane:
// 🔵 Info - Informacje ogólne
// 🟡 Warning - Ostrzeżenia
// 🔴 Error - Błędy
// 🟢 Debug - Informacje debugowania
```

#### **2. Performance**
- Monitoruje czas renderowania komponentów
- Wykrywa problemy z wydajnością
- Pokazuje statystyki w czasie rzeczywistym

#### **3. Network**
- Automatycznie przechwytuje żądania HTTP
- Pokazuje czas odpowiedzi i rozmiar danych
- Filtruje według metody HTTP i statusu

### **Konfiguracja Wtyczek**

1. Przejdź do **Extensions** w Activity Bar
2. Kliknij ikonę ustawień (⚙️) przy wtyczce
3. Dostosuj parametry według potrzeb
4. Włącz/wyłącz wtyczki używając przycisków Play/Stop

## 🔧 Zaawansowane Funkcje

### **Hooks Debugowania**

#### **useDebugger**
```typescript
import { useDebugger } from './hooks/useDebugger';

const MyComponent = () => {
  const debug = useDebugger('MyComponent');
  
  // Logowanie różnych typów informacji
  debug.log('info', 'Component rendered');
  debug.logProps(props);
  debug.logState(state);
  debug.logEffect('useEffect', dependencies);
  
  // Dodawanie breakpointów
  debug.addBreakpoint();
  
  // Oglądanie komponentu
  debug.watchComponent();
};
```

#### **usePerformanceMonitor**
```typescript
import { usePerformanceMonitor } from './hooks/usePerformanceMonitor';

const MyComponent = () => {
  const performance = usePerformanceMonitor('MyComponent');
  
  // Automatycznie mierzy czas renderowania
  // Dostarcza statystyki wydajności
};
```

### **Globalne Narzędzia Debugowania**

#### **Debugger API**
```typescript
import { Debugger } from './hooks/useDebugger';

// Włącz/wyłącz globalne debugowanie
Debugger.setEnabled(true);

// Ustaw breakpoint dla komponentu
Debugger.setBreakpoint('MyComponent');

// Eksportuj wszystkie dane debugowania
Debugger.exportAllData();
```

#### **PerformanceMonitor API**
```typescript
import { PerformanceMonitor } from './hooks/usePerformanceMonitor';

// Pobierz podsumowanie wydajności wszystkich komponentów
const summary = PerformanceMonitor.getSummary();

// Eksportuj dane wydajności
const data = PerformanceMonitor.exportData();
```

## 📊 Monitorowanie i Analiza

### **Metryki Wydajności**
- **Render Time**: Czas renderowania komponentu
- **Threshold**: Próg 16ms (60fps)
- **Slow Renders**: Liczba wolnych renderów
- **Average Time**: Średni czas renderowania

### **Statystyki Sieci**
- **Total Requests**: Całkowita liczba żądań
- **Success Rate**: Procent udanych żądań
- **Average Response Time**: Średni czas odpowiedzi
- **Data Transferred**: Przesłane dane

### **Logi i Błędy**
- **Error ID**: Unikalny identyfikator błędu
- **Stack Trace**: Szczegółowy stos błędu
- **Component Stack**: Stos komponentów React
- **Timestamp**: Dokładny czas wystąpienia

## 🚨 Rozwiązywanie Problemów

### **Typowe Problemy**

#### **1. Wtyczka nie działa**
- Sprawdź czy jest włączona w Extension Manager
- Sprawdź zależności wtyczki
- Restartuj sesję debugowania

#### **2. Brak logów w Console**
- Upewnij się że sesja debugowania jest uruchomiona
- Sprawdź poziom logowania w ustawieniach
- Wyczyść konsolę i spróbuj ponownie

#### **3. Network Monitor nie przechwytuje żądań**
- Sprawdź czy monitoring jest włączony
- Upewnij się że wtyczka Network Monitor jest aktywna
- Sprawdź ustawienia interceptFetch i interceptXHR

### **Debugowanie Debuggera**

1. Otwórz konsolę przeglądarki (F12)
2. Sprawdź logi z prefiksem `[Debugger]`
3. Użyj `Debugger.exportAllData()` do eksportu danych
4. Sprawdź status wtyczek w Extension Manager

## 📈 Najlepsze Praktyki

### **1. Organizacja Logów**
- Używaj odpowiednich poziomów logowania (info, warn, error, debug)
- Dodawaj kontekst do logów (nazwa komponentu, dane)
- Grupuj powiązane logi

### **2. Monitorowanie Wydajności**
- Monitoruj komponenty o wysokiej częstotliwości renderowania
- Ustaw odpowiednie progi dla metryk wydajności
- Regularnie eksportuj dane do analizy

### **3. Zarządzanie Wtyczkami**
- Włączaj tylko potrzebne wtyczki
- Dostosuj ustawienia do specyfiki projektu
- Regularnie aktualizuj wtyczki

### **4. Obsługa Błędów**
- Używaj Error Boundary do przechwytywania błędów
- Loguj szczegółowe informacje o błędach
- Implementuj mechanizmy odzyskiwania

## 🔮 Rozszerzenia i Dostosowania

### **Dodawanie Nowych Wtyczek**

1. Stwórz nowy komponent wtyczki
2. Dodaj do ExtensionManager
3. Zdefiniuj kategorie, zależności i ustawienia
4. Zaimplementuj funkcjonalność

### **Dostosowywanie Motywu**

- Edytuj zmienne CSS w `App.css`
- Dostosuj kolory i style VS Code
- Dodaj nowe animacje i przejścia

### **Integracja z Zewnętrznymi Narzędziami**

- Eksport danych do formatów JSON/CSV
- Integracja z systemami monitorowania
- API do zewnętrznych narzędzi debugowania

## 📚 Dodatkowe Zasoby

### **Dokumentacja React**
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Performance Optimization](https://react.dev/learn/render-and-commit)

### **Narzędzia Debugowania**
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [React Profiler](https://react.dev/reference/react/Profiler)
- [Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance)

### **VS Code**
- [VS Code Documentation](https://code.visualstudio.com/docs)
- [VS Code Extensions](https://code.visualstudio.com/docs/editor/extension-marketplace)
- [VS Code Themes](https://code.visualstudio.com/docs/getstarted/themes)

---

## 🎉 Podsumowanie

Nowy interfejs VS Code dla aplikacji LEGO Price Agent zapewnia:

✅ **Profesjonalny wygląd** - Interfejs wzorowany na VS Code  
✅ **Zaawansowane debugowanie** - Kompletne narzędzia do debugowania  
✅ **Monitorowanie wydajności** - Śledzenie i optymalizacja  
✅ **Zarządzanie wtyczkami** - Elastyczny system rozszerzeń  
✅ **Obsługa błędów** - Graceful error handling  
✅ **Monitorowanie sieci** - Śledzenie żądań HTTP  
✅ **Responsywny design** - Działanie na różnych urządzeniach  

Aplikacja jest teraz wyposażona w narzędzia na poziomie profesjonalnych IDE, co znacznie ułatwia rozwój, debugowanie i utrzymanie kodu.
