# Changelog

Wszystkie istotne zmiany w projekcie Maszyna W Remake będą dokumentowane w tym pliku.

Format oparty na [Keep a Changelog](https://keepachangelog.com/pl/1.0.0/),
a projekt używa [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Dodane
- Kompletna dokumentacja projektu (README.md, DOKUMENTACJA.md, DOKUMENTACJA_TECHNICZNA.md, API_DOCS.md)
- GitHub templates dla issues i pull requests
- Polityka bezpieczeństwa i kodeks postępowania
- Wsparcie dla Contributors

## [2.0.0] - 2025-01-07

### Dodane
- 🧠 **Kompletny symulator procesora WLAN** z 16-bitową architekturą
- 🤖 **Integracja AI** z HuggingFace RAG dla wsparcia programistów
- 🔗 **WebSocket integration** z ESP32 dla fizycznych projektów
- 📝 **Zaawansowany edytor kodu** z podświetlaniem składni WLAN
- 🎨 **Material Design 3** z trybem ciemnym i jasnym
- 📱 **Responsywny design** dla urządzeń mobilnych
- ⚡ **PWA capabilities** z offline support
- 🔧 **DevTools integration** dla debugowania

### Szczegóły funkcjonalności
- **Symulator procesora:**
  - Pełny zestaw rozkazów WLAN (POB, ŁAD, DOD, ODE, SOB, SOZ, STP)
  - Wizualizacja rejestrów: Akumulator, licznik rozkazów, wskaźnik stosu
  - Symulacja pamięci 64KB z podglądem w czasie rzeczywistym
  - Magistrale danych A i S z animacjami przepływu
  - 20+ sygnałów mikroprogramu (czyt, pisz, wei, wyak, dod, ode, etc.)

- **Edytor kodu:**
  - CodeMirror 6 z custom language support dla WLAN
  - IntelliSense z autouzupełnianiem instrukcji
  - Real-time error detection i syntax highlighting
  - Breakpoints i step-by-step debugging
  - Program import/export functionality

- **AI Assistant:**
  - HuggingFace RAG integration dla kontekstowej pomocy
  - Automatyczne wyjaśnianie błędów kompilacji
  - Code suggestions i optimization tips
  - Natural language programming assistance

- **ESP32 Integration:**
  - WebSocket real-time communication
  - Physical I/O signal mapping
  - Sensor data integration
  - LED matrix state visualization

- **User Experience:**
  - Material Design 3 z smooth animations
  - Dark/light theme z system preference detection
  - Mobile-first responsive layout
  - Customizable workspace layout
  - Keyboard shortcuts i accessibility features

### Technologie
- **Frontend:** Vue.js 3, TypeScript, Vite, SCSS
- **Editor:** CodeMirror 6, Custom WLAN compiler
- **AI:** HuggingFace Transformers, RAG implementation
- **Communication:** WebSocket API, Service Workers
- **Build:** Netlify hosting, GitHub Actions CI/CD
- **Testing:** Cypress e2e, Jest unit tests

## [1.0.0] - 2024-12-01

### Dodane
- Podstawowy symulator procesora Maszyna W
- Prosty edytor assembly
- Podstawowa wizualizacja rejestrów
- Wykonywanie programów krok po kroku

### Zmienione
- Przepisanie z JavaScript na TypeScript
- Migracja z Vue 2 na Vue 3
- Nowy system buildowania z Vite

### Poprawione
- Wydajność renderowania interfejsu
- Błędy w kompilatorze assembly
- Problemy z responsywnością na urządzeniach mobilnych

## [0.9.0] - 2024-10-15

### Dodane
- Pierwszy prototyp symulatora
- Podstawowy parser języka WLAN
- Prosta wizualizacja pamięci

### Znane problemy
- Ograniczona funkcjonalność debugowania
- Brak obsługi wszystkich instrukcji WLAN
- Problemy z wydajnością na starszych przeglądarkach

---

## Typy zmian

- `Dodane` - nowe funkcjonalności
- `Zmienione` - zmiany w istniejących funkcjonalnościach  
- `Przestarzałe` - funkcjonalności które zostaną usunięte w przyszłych wersjach
- `Usunięte` - usunięte funkcjonalności
- `Poprawione` - poprawki błędów
- `Bezpieczeństwo` - poprawki związane z bezpieczeństwem

## Konwencje wersjonowania

Projekt używa [Semantic Versioning](https://semver.org/):

- **MAJOR.MINOR.PATCH** (np. 2.1.0)
- **MAJOR** - breaking changes w API
- **MINOR** - nowe funkcjonalności (backward compatible)  
- **PATCH** - bug fixes (backward compatible)

## Linki

- [Dokumentacja](README.md)
- [Issues](https://github.com/xTaromarux/Maszyna-W-Remake/issues)
- [Pull Requests](https://github.com/xTaromarux/Maszyna-W-Remake/pulls)
- [Releases](https://github.com/xTaromarux/Maszyna-W-Remake/releases)