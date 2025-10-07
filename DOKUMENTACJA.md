# Dokumentacja Projektu Maszyna W - Remake

## Spis treści
1. [Wprowadzenie](#wprowadzenie)
2. [Architektura systemu](#architektura-systemu)
3. [Komponenty aplikacji](#komponenty-aplikacji)
4. [Rozkazy procesora](#rozkazy-procesora)
5. [System sygnałów](#system-sygnałów)
6. [Obsługa stosu](#obsługa-stosu)
7. [Programowanie w języku WLAN](#programowanie-w-języku-wlan)
8. [Interfejs użytkownika](#interfejs-użytkownika)
9. [Instalacja i uruchomienie](#instalacja-i-uruchomienie)
10. [API i konfiguracja](#api-i-konfiguracja)

---

## Wprowadzenie

**Maszyna W - Remake** to nowoczesna implementacja symulatora edukacyjnego procesora, zbudowana w technologii Vue.js. Projekt stanowi narzędzie dydaktyczne do nauki architektury komputerów, programowania w asemblerze oraz zrozumienia działania procesora na poziomie mikroprogramowania.

### Główne cele projektu:
- **Edukacja**: Nauka architektury komputerów i programowania w asemblerze
- **Symulacja**: Realistyczne odwzorowanie działania procesora
- **Interaktywność**: Wizualizacja wykonywania programów krok po krok
- **Dostępność**: Działanie w przeglądarce internetowej bez instalacji

### Kluczowe funkcjonalności:
- Symulator procesora z rejestami i pamięcią
- Kompilator języka WLAN (Wirtualny Język Asemblera Niskopoziomowy)
- Debugger z breakpointami i wykonywaniem krok po krok
- Wizualizacja sygnałów sterujących i magistral
- Obsługa stosu i przerwań
- Chat AI dla wsparcia edukacyjnego
- Tryb mobilny

---

## Architektura systemu

### Struktura procesora

Maszyna W implementuje architekturę RISC z następującymi komponentami:

#### Rejestry główne:
- **AK (Akumulator)**: Rejestr główny do operacji arytmetycznych
- **PC (Program Counter)**: Licznik rozkazów
- **IL (Instruction Latch)**: Zatrzask instrukcji
- **RM (Rejestr Memory)**: Rejestr pamięci
- **RB (Rejestr Bus)**: Rejestr magistrali
- **RZ (Rejestr Zero)**: Rejestr zerowy
- **RP (Rejestr Pointer)**: Wskaźnik stosu
- **X, Y**: Rejestry pomocnicze
- **WS (Wskaźnik Stosu)**: Rejestr wskaźnika stosu

#### Magistrale:
- **Magistrala A (Address)**: Przekazywanie adresów
- **Magistrala S (Data)**: Przekazywanie danych

#### Znaczniki (Flags):
- **Z (Zero)**: Ustawiony gdy wynik operacji = 0
- **N (Negative)**: Ustawiony gdy wynik operacji < 0

### Pamięć
- Konfigurowalna wielkość pamięci (domyślnie 16 komórek)
- Adresowanie przez rejestry adresowe
- Możliwość inicjalizacji wartości początkowych

---

## Komponenty aplikacji

### Struktura plików

```
src/
├── components/           # Komponenty Vue.js
│   ├── Main.vue         # Główny komponent aplikacji
│   ├── ExecutionControls.vue  # Kontrola wykonywania
│   ├── MemorySection.vue      # Sekcja pamięci
│   ├── ProgramSection.vue     # Edytor programu
│   ├── Console.vue           # Konsola logów
│   ├── SettingsPanel.vue     # Panel ustawień
│   └── ...
├── WLAN/                # Kompilator języka WLAN
│   ├── compiler.ts      # Główny kompilator
│   ├── lexer.ts         # Analiza leksykalna
│   ├── parser.ts        # Analiza składniowa
│   ├── semanticAnalyzer.ts  # Analiza semantyczna
│   ├── microGenerator.ts    # Generator mikrokodu
│   └── simulator.ts     # Symulator wykonywania
├── workers/             # Web Workers
│   └── chat.worker.js   # Worker dla czatu AI
├── styles/              # Style SCSS
└── assets/              # Zasoby statyczne
```

### Kluczowe komponenty

#### Main.vue
Główny komponent zarządzający:
- Stanem aplikacji i rejestów
- Wykonywaniem programów
- Komunikacją między komponentami
- Obsługą sygnałów i magistral

#### ExecutionControls.vue
Panel sterowania wykonywaniem:
- Kompilacja programu
- Wykonywanie krok po krok
- Uruchamianie ciągłe
- Reset systemu
- Zarządzanie breakpointami

#### WLAN Compiler
System kompilacji składający się z:
- **Lexer**: Tokenizacja kodu źródłowego
- **Parser**: Budowanie drzewa składniowego
- **Semantic Analyzer**: Analiza semantyczna i walidacja
- **Micro Generator**: Generowanie mikrokodu

---

## Rozkazy procesora

### Podstawowe rozkazy arytmetyczne

#### DOD (Dodawanie)
```
ROZKAZ DOD;
czyt wys wei il;
wyad wea;
czyt wys weja dod weak wyl wea;
```
Operacja: `AK = AK + (ADRES)`

#### ODE (Odejmowanie)  
```
ROZKAZ ODE;
czyt wys wei il;
wyad wea;
czyt wys weja ode weak wyl wea;
```
Operacja: `AK = AK - (ADRES)`

### Rozkazy transferu danych

#### POB (Pobierz)
```
ROZKAZ POB;
czyt wys wei il;
wyad wea;
czyt wys weja przep weak wyl wea;
```
Operacja: `AK = (ADRES)`

#### ŁAD (Ładuj)
```
ROZKAZ ŁAD;
czyt wys wei il;
wyad wea wyak wes;
pisz wyl wea;
```
Operacja: `(ADRES) = AK`

### Rozkazy skoku

#### SOB (Skok bezwarunkowy)
```
ROZKAZ SOB;
Argumenty 1;
czyt wys wei il;
wyad wea wel;
```
Operacja: Bezwarunkowy skok do adresu

#### SOZ (Skok gdy zero)
```
ROZKAZ SOZ;
czyt wys wei il;
IF Z THEN @zero ELSE @niezero;
@zero wyad wea wel KONIEC;
@niezero wyl wea;
```
Operacja: Skok gdy AK = 0

#### SOM (Skok gdy minus)
```
ROZKAZ SOM;
czyt wys wei il;
IF N THEN @ujemne ELSE @dodatnie;
@ujemne wyad wea wel KONIEC;
@dodatnie wyl wea;
```
Operacja: Skok gdy AK < 0

### Rozkazy stosu

#### DNS (Daj na stos)
```
rozkaz dns;
argumenty 0;
czyt wys wei il;
dws;
wyws wea wyak wes;
pisz wyl wea;
```
Operacja: Umieszcza AK na stosie

#### PWR (Pobierz wierzch stosu)
```
rozkaz pwr;
argumenty 0;
czyt wys wei il;
wyws wea iws;
czyt wys as wea wel;
```
Operacja: Pobiera wierzch stosu do AK

#### PZS (Pobierz ze stosu)
```
rozkaz pzs;
argumenty 0;
czyt wys wei il;
wyws wea iws;
czyt wys weja przep weak wyl wea;
```
Operacja: Pobiera ze stosu do AK i zmniejsza wskaźnik

#### SDP (Skok do podprogramu)
```
rozkaz sdp;
argumenty 1;
czyt wys wei il;
dws;
wyws wea wyls wes;
pisz wyad wel wea;
```
Operacja: Skok do podprogramu z zachowaniem adresu powrotu

### Rozkaz sterujący

#### STP (Stop)
```
ROZKAZ STP;
Argumenty 0;
czyt wys wei il;
stop;
```
Operacja: Zatrzymanie wykonywania programu

---

## System sygnałów

### Sygnały sterujące

#### Sygnały pamięci:
- **czyt**: Odczyt z pamięci
- **pisz**: Zapis do pamięci
- **wea**: Włącz adres do pamięci
- **wes**: Włącz dane do pamięci
- **wys**: Wyłącz z pamięci na magistralę S

#### Sygnały rejestrów:
- **wei**: Włącz do rejestru IL
- **wyad**: Wyłącz adres z IL
- **wyak**: Wyłącz akumulator na magistralę
- **weak**: Włącz akumulator z magistrali
- **wyl**: Wyłącz z rejestru ładowania

#### Sygnały ALU:
- **dod**: Operacja dodawania
- **ode**: Operacja odejmowania
- **przep**: Operacja przepisania
- **weja**: Włącz do ALU z magistrali A
- **werb**: Włącz do rejestru B

#### Sygnały stosu:
- **dws**: Dekrementuj wskaźnik stosu
- **iws**: Inkrementuj wskaźnik stosu
- **wyws**: Wyłącz wskaźnik stosu
- **wyls**: Wyłącz licznik na magistralę S

#### Sygnały kontrolne:
- **wel**: Włącz do licznika rozkazów
- **stop**: Zatrzymaj wykonywanie
- **il**: Zatrzask instrukcji
- **dl**: Dekoder rozkazów

### Magistrale
- **busA**: Magistrala adresowa (aktywna podczas transferu adresów)
- **busS**: Magistrala danych (aktywna podczas transferu danych)

---

## Obsługa stosu

### Implementacja stosu

Stos w Maszynie W działa jako struktura LIFO (Last In, First Out) i jest zarządzany przez:

- **Wskaźnik stosu (WS)**: Przechowuje aktualną pozycję na stosie
- **Rejestr RP**: Rejestr wskaźnika stosu
- **Operacje stosu**: DNS, PWR, PZS, SDP

### Operacje na stosie

1. **Umieszczanie na stosie (DNS)**:
   - Dekrementuje wskaźnik stosu
   - Zapisuje wartość AK pod adresem wskazywanym przez WS

2. **Pobieranie wierzchu (PWR)**:
   - Odczytuje wartość spod adresu wskazywanego przez WS
   - Nie zmienia wskaźnika stosu

3. **Pobieranie ze stosu (PZS)**:
   - Odczytuje wartość spod adresu wskazywanego przez WS
   - Inkrementuje wskaźnik stosu

4. **Skok do podprogramu (SDP)**:
   - Umieszcza na stosie adres powrotu (PC + 1)
   - Wykonuje skok do podanego adresu

---

## Programowanie w języku WLAN

### Składnia języka

#### Struktura programu:
```wlan
PROGRAM nazwa_programu;

// Definicje stałych
CONST
    nazwa = wartość;

// Sekcja danych
DATA
    .ORG adres
    etykieta: wartość, wartość, ...

// Sekcja kodu
BEGIN
    etykieta: ROZKAZ operand;
    // więcej instrukcji...
END.
```

#### Przykład programu:
```wlan
PROGRAM Dodawanie;

CONST
    LICZBA1 = 5;
    LICZBA2 = 3;

DATA
    .ORG 10
    wynik: 0;

BEGIN
    start: POB LICZBA1;
           DOD LICZBA2;
           ŁAD wynik;
           STP;
END.
```

### Dyrektywy

#### .ORG adres
Ustawia adres początkowy dla kolejnych definicji danych.

#### .DATA
Rozpoczyna sekcję danych.

### Etykiety
Etykiety mogą być używane do:
- Oznaczania adresów skoków
- Nazywania komórek pamięci
- Organizacji kodu

### Komentarze
- Linie komentarzy rozpoczynają się od `//`
- Komentarze końca linii po znaku `;`

---

## Interfejs użytkownika

### Layout aplikacji

#### Panel główny:
- **Sekcja rejestrów**: Wyświetla stan wszystkich rejestrów
- **Sekcja pamięci**: Pokazuje zawartość pamięci z możliwością edycji
- **Panel sygnałów**: Wizualizuje aktywne sygnały sterujące
- **Magistrale**: Pokazuje stan magistral A i S

#### Panel programu:
- **Edytor kodu**: Edytor z podświetlaniem składni WLAN
- **Kontrole wykonywania**: Przyciski kompilacji i wykonywania
- **Lista rozkazów**: Baza dostępnych rozkazów z opisami

#### Konsola:
- **Logi wykonywania**: Szczegółowe informacje o wykonywanych operacjach
- **Błędy kompilacji**: Komunikaty o błędach w kodzie
- **Filtrowanie**: Możliwość filtrowania logów według typu

#### Panel ustawień:
- **Konfiguracja procesora**: Ustawienia rozmiaru pamięci, rejestrów
- **Opcje debuggera**: Konfiguracja breakpointów
- **Motyw**: Przełączanie między trybem jasnym/ciemnym

### Funkcjonalności interaktywne

#### Debugger:
- **Breakpointy**: Ustawianie punktów przerwania w kodzie
- **Wykonywanie krok po krok**: Kontrolowane wykonywanie instrukcji
- **Podgląd stanu**: Monitoring zmian w rejestrach i pamięci

#### Edytor:
- **Podświetlanie składni**: Kolorowanie elementów języka WLAN
- **Autouzupełnianie**: Podpowiedzi rozkazów i etykiet
- **Numerowanie linii**: Łatwa nawigacja w kodzie

---

## Instalacja i uruchomienie

### Wymagania systemowe

#### Środowisko deweloperskie:
- Node.js 16+ 
- npm lub yarn
- Przeglądarka z obsługą ES6+

#### Produkcja:
- Dowolna przeglądarka internetowa
- Połączenie internetowe (dla zasobów CDN)

### Instalacja

```bash
# Klonowanie repozytorium
git clone https://github.com/xTaromarux/Maszyna-W-Remake.git
cd Maszyna-W-Remake

# Instalacja zależności
npm install

# Uruchomienie w trybie deweloperskim
npm run dev

# Budowanie wersji produkcyjnej
npm run build
```

### Konfiguracja

#### Plik `vite.config.js`:
```javascript
export default {
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
}
```

#### Zmienne środowiskowe:
```bash
# Dla proxy HuggingFace
HF_TARGET_URL=https://example.hf.space
ALLOWED_ORIGINS=http://localhost:5173
```

### Deployment

#### Netlify:
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## API i konfiguracja

### WebSocket API

#### Połączenie z ESP32:
```javascript
// Nawiązywanie połączenia
ws = new WebSocket('ws://localhost:8080');

// Wysyłanie sygnałów
ws.send(JSON.stringify({
  type: 'signal',
  name: 'czyt',
  value: true
}));

// Odbieranie danych
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Przetwarzanie danych...
};
```

### Chat API

#### Konfiguracja HuggingFace:
```javascript
// Worker dla czatu AI
const BASE_URL = 'https://proxy.example.com/api/chat';

fetch(BASE_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'Jak napisać program dodający dwie liczby?',
    history: []
  })
});
```

### Konfiguracja kompilatora

#### Ustawienia parsera:
```typescript
interface CompilerConfig {
  codeBits: number;        // Szerokość kodu rozkazu
  addresBits: number;      // Szerokość adresu
  memorySize: number;      // Rozmiar pamięci
  enableBreakpoints: boolean; // Obsługa breakpointów
}
```

### Customizacja

#### Dodawanie nowych rozkazów:
1. Zdefiniuj rozkaz w pliku `commands.js`
2. Dodaj implementację w `microGenerator.ts`
3. Zaktualizuj parser w `parser.ts`
4. Dodaj testy w odpowiednich plikach

#### Rozszerzanie języka WLAN:
1. Dodaj nowe tokeny w `lexer.ts`
2. Rozszerz gramatykę w `parser.ts`
3. Zaimplementuj semantykę w `semanticAnalyzer.ts`

---

## Podsumowanie

Maszyna W - Remake to kompleksowe narzędzie edukacyjne umożliwiające:

- **Naukę architektury komputerów** przez praktyczne doświadczenie
- **Programowanie w asemblerze** z wizualizacją wykonywania
- **Zrozumienie działania procesora** na poziomie sygnałów sterujących
- **Eksperymentowanie** z różnymi algorytmami i strukturami danych

Projekt łączy teoretyczną wiedzę z praktycznym zastosowaniem, oferując intuicyjny interfejs dla studentów i wykładowców architektury komputerów.

### Przyszły rozwój:
- Rozszerzenie zestawu rozkazów
- Dodanie obsługi przerwań
- Implementacja cache'u
- Tryb symulacji pipeline'u
- Integracja z zewnętrznymi narzędziami deweloperskimi

---

*Dokumentacja wygenerowana automatycznie dla projektu Maszyna W - Remake*