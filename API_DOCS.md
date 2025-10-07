# API Documentation - Maszyna W

## WebSocket API

### Połączenie z ESP32

#### Endpoint
```
ws://localhost:8080
```

#### Protokół komunikacji

Wszystkie wiadomości są w formacie JSON.

### Typy wiadomości

#### 1. Sygnały sterujące

**Wysyłanie sygnału do ESP32:**
```json
{
  "type": "signal",
  "name": "czyt",
  "value": true,
  "timestamp": "2025-01-07T12:00:00Z"
}
```

**Odbieranie sygnału z ESP32:**
```json
{
  "type": "signal", 
  "name": "button_pressed",
  "value": true,
  "pin": 12,
  "timestamp": "2025-01-07T12:00:01Z"
}
```

#### 2. Stany rejestrów

**Wysyłanie stanu rejestru:**
```json
{
  "type": "register",
  "name": "ak",
  "value": 42,
  "timestamp": "2025-01-07T12:00:02Z"
}
```

**Odbieranie zmiany rejestru:**
```json
{
  "type": "register",
  "name": "external_input",
  "value": 255,
  "source": "potentiometer",
  "timestamp": "2025-01-07T12:00:03Z"
}
```

#### 3. Ping/Pong

**Ping (utrzymanie połączenia):**
```json
"ping"
```

**Pong (odpowiedź):**
```json
"pong"
```

### Lista sygnałów

#### Sygnały pamięci
- `czyt` - Odczyt z pamięci
- `pisz` - Zapis do pamięci
- `wea` - Włącz adres do pamięci
- `wes` - Włącz dane do pamięci
- `wys` - Wyłącz z pamięci na magistralę S

#### Sygnały rejestrów
- `wei` - Włącz do rejestru IL
- `wyad` - Wyłącz adres z IL
- `wyak` - Wyłącz akumulator na magistralę
- `weak` - Włącz akumulator z magistrali
- `wyl` - Wyłącz z rejestru ładowania

#### Sygnały ALU
- `dod` - Operacja dodawania
- `ode` - Operacja odejmowania
- `przep` - Operacja przepisania
- `weja` - Włącz do ALU z magistrali A

#### Sygnały stosu
- `dws` - Dekrementuj wskaźnik stosu
- `iws` - Inkrementuj wskaźnik stosu
- `wyws` - Wyłącz wskaźnik stosu

#### Sygnały kontrolne
- `wel` - Włącz do licznika rozkazów
- `stop` - Zatrzymaj wykonywanie
- `il` - Zatrzask instrukcji
- `dl` - Dekoder rozkazów

#### Magistrale
- `busA` - Magistrala adresowa
- `busS` - Magistrala danych

---

## HuggingFace Chat API

### Endpoint
```
POST /api/chat
```

### Proxy Server Configuration

**Environment Variables:**
```bash
HF_TARGET_URL=https://marcsixtysix-rag-chat.hf.space
ALLOWED_ORIGINS=https://wmaszyna.netlify.app,http://localhost:5173
```

### Request Format

```json
{
  "query": "Jak napisać program dodający dwie liczby?",
  "history": [
    {
      "role": "user",
      "content": "Poprzednie pytanie"
    },
    {
      "role": "assistant", 
      "content": "Poprzednia odpowiedź"
    }
  ]
}
```

### Response Format

```json
{
  "response": "Aby napisać program dodający dwie liczby w języku WLAN...",
  "sources": [
    {
      "title": "Dokumentacja rozkazów",
      "url": "/docs/rozkazy"
    }
  ]
}
```

### Health Check

**Endpoint:**
```
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "upstream": "connected",
  "timestamp": "2025-01-07T12:00:00Z"
}
```

---

## WLAN Compiler API

### Tokenizer

```typescript
import { tokenize } from './WLAN/lexer';

const tokens = tokenize(`
PROGRAM Test;
BEGIN
    POB 10;
    STP;
END.
`);
```

**Token Structure:**
```typescript
interface Token {
  type: string;      // 'IDENT', 'NUMBER', 'SEMICOLON', etc.
  text: string;      // Zawartość tokenu
  line: number;      // Numer linii (1-based)
  col: number;       // Numer kolumny (1-based)  
  pos: number;       // Pozycja w tekście
}
```

### Parser

```typescript
import { Parser } from './WLAN/parser';

const parser = new Parser(tokens);
const program = parser.parse();
```

**Program Structure:**
```typescript
interface ProgramNode {
  type: 'Program';
  units: Array<DataUnit | CodeUnit>;
}

interface CodeUnit {
  type: 'CodeUnit';
  body: Array<InstructionNode | LabelNode>;
}

interface InstructionNode {
  type: 'Instruction';
  name: string;
  operands: OperandNode[];
  pos: number;
}
```

### Semantic Analyzer

```typescript
import { analyzeSemantics } from './WLAN/semanticAnalyzer';

const result = analyzeSemantics(program);

// result.assignments - przpisania pamięci
// result.errors - błędy semantyczne
```

**Assignment Structure:**
```typescript
interface Assignment {
  addr: number;      // Adres w pamięci
  val: number;       // Wartość do zapisania
  label?: string;    // Opcjonalna etykieta
}
```

### Micro Generator

```typescript
import { generateMicroProgram } from './WLAN/microGenerator';

const microProgram = generateMicroProgram(program);
```

**Micro Instruction Structure:**
```typescript
interface MicroInstruction {
  type: 'phase' | 'conditional';
  signals?: string[];           // Lista sygnałów do aktywacji
  condition?: ConditionSpec;    // Warunek dla instrukcji warunkowych
  truePhases?: MicroPhase[];    // Fazy dla true branch
  falsePhases?: MicroPhase[];   // Fazy dla false branch
  srcLine?: number;             // Linia źródłowa
}
```

---

## Component Events API

### Main.vue Events

#### @update:register
Emitowany przy zmianie rejestru:
```javascript
{
  name: 'ak',       // Nazwa rejestru
  value: 42,        // Nowa wartość
  oldValue: 30      // Poprzednia wartość
}
```

#### @update:memory
Emitowany przy zmianie pamięci:
```javascript
{
  address: 10,      // Adres
  value: 255,       // Nowa wartość
  oldValue: 128     // Poprzednia wartość
}
```

#### @signal:change
Emitowany przy zmianie sygnału:
```javascript
{
  name: 'czyt',     // Nazwa sygnału
  value: true,      // Stan sygnału
  duration: 200     // Czas trwania (ms)
}
```

#### @execution:step
Emitowany przy każdym kroku wykonywania:
```javascript
{
  step: 42,                    // Numer kroku
  instruction: 'POB 10',       // Wykonywana instrukcja
  phase: 'czyt wys wei il',    // Aktualna faza
  registers: { ak: 0, pc: 1 }, // Stan rejestrów
  flags: { Z: false, N: false } // Stan flag
}
```

### ExecutionControls.vue Events

#### @compile
Emitowany przy kompilacji:
```javascript
{
  code: 'POB 10; STP;',        // Kod źródłowy
  success: true,               // Czy kompilacja sukces
  errors: [],                  // Lista błędów
  warnings: []                 // Lista ostrzeżeń
}
```

#### @execution:start
```javascript
{
  mode: 'step',               // 'step', 'run', 'run-fast'
  breakpoints: [5, 10, 15]    // Aktywne breakpointy
}
```

#### @execution:pause
```javascript
{
  reason: 'breakpoint',       // 'breakpoint', 'manual', 'error'
  line: 5,                    // Linia zatrzymania
  step: 10                    // Numer kroku
}
```

#### @execution:stop
```javascript
{
  reason: 'completed',        // 'completed', 'error', 'manual'
  totalSteps: 25,            // Całkowita liczba kroków
  executionTime: 1250        // Czas wykonywania (ms)
}
```

---

## Local Storage API

### Klucze w localStorage

#### Ustawienia aplikacji
- `maszyna-w-settings` - Ustawienia globalne
- `maszyna-w-theme` - Wybrany motyw ('light'/'dark')
- `maszyna-w-layout` - Ustawienia layoutu

#### Programy użytkownika
- `maszyna-w-programs` - Zapisane programy
- `maszyna-w-recent` - Ostatnio otwarte pliki

#### Stan sesji
- `maszyna-w-session` - Stan aktualnej sesji
- `maszyna-w-breakpoints` - Zapisane breakpointy

### Struktura danych

**Ustawienia:**
```json
{
  "memoryAddresBits": 4,
  "codeBits": 6,
  "addresBits": 4,
  "oddDelay": 400,
  "busHoldMs": 200,
  "autoSave": true,
  "debugMode": false
}
```

**Program:**
```json
{
  "id": "uuid-v4",
  "name": "Mój Program",
  "code": "PROGRAM Test;\nBEGIN\n    POB 10;\n    STP;\nEND.",
  "created": "2025-01-07T12:00:00Z",
  "modified": "2025-01-07T12:30:00Z",
  "metadata": {
    "author": "Jan Kowalski",
    "description": "Przykładowy program"
  }
}
```

---

## Error Codes

### WLAN Compiler Errors

#### LEXER Errors
- `LEXER_UNKNOWN_CHARACTER` - Nieznany znak w kodzie
- `LEXER_UNTERMINATED_STRING` - Niezakończony string
- `LEXER_INVALID_NUMBER` - Nieprawidłowy format liczby

#### PARSER Errors  
- `PARSER_UNEXPECTED_TOKEN` - Nieoczekiwany token
- `PARSER_MISSING_SEMICOLON` - Brakujący średnik
- `PARSER_INVALID_OPERAND` - Nieprawidłowy operand

#### SEMANTIC Errors
- `SEMANTIC_UNKNOWN_INSTRUCTION` - Nieznany rozkaz
- `SEMANTIC_OPERAND_COUNT` - Nieprawidłowa liczba operandów
- `SEMANTIC_UNDEFINED_LABEL` - Niezdefiniowana etykieta
- `SEMANTIC_DUPLICATE_LABEL` - Duplikowana etykieta
- `SEMANTIC_VALUE_OUT_OF_RANGE` - Wartość poza zakresem

#### GENERATOR Errors
- `GENERATOR_UNSUPPORTED_INSTRUCTION` - Nieobsługiwany rozkaz
- `GENERATOR_INVALID_CONDITION` - Nieprawidłowy warunek

### Runtime Errors

#### EXECUTION Errors
- `EXECUTION_INFINITE_LOOP` - Wykryto pętlę nieskończoną
- `EXECUTION_STACK_OVERFLOW` - Przepełnienie stosu
- `EXECUTION_STACK_UNDERFLOW` - Niedobór stosu
- `EXECUTION_INVALID_ADDRESS` - Nieprawidłowy adres pamięci

#### SIGNAL Errors
- `SIGNAL_CONFLICT` - Konflikt sygnałów
- `SIGNAL_INVALID_COMBINATION` - Nieprawidłowa kombinacja sygnałów
- `SIGNAL_TIMEOUT` - Timeout sygnału

#### WEBSOCKET Errors
- `WS_CONNECTION_FAILED` - Błąd połączenia WebSocket
- `WS_MESSAGE_PARSE_ERROR` - Błąd parsowania wiadomości
- `WS_SEND_FAILED` - Błąd wysyłania wiadomości

---

## Performance Metrics

### Timing APIs

```javascript
// Pomiar czasu kompilacji
const startTime = performance.now();
const result = compileProgram(code);
const compilationTime = performance.now() - startTime;

// Pomiar czasu wykonywania instrukcji
const executionStart = performance.now();
executeInstruction(instruction);
const instructionTime = performance.now() - executionStart;
```

### Memory Usage

```javascript
// Monitoring użycia pamięci przeglądarki
const memInfo = performance.memory;
console.log({
  usedJSHeapSize: memInfo.usedJSHeapSize,
  totalJSHeapSize: memInfo.totalJSHeapSize,
  jsHeapSizeLimit: memInfo.jsHeapSizeLimit
});
```

### Profiling

```javascript
// Profiling wydajności kompilatora
export function profileOperation<T>(
  operation: () => T,
  operationName: string
): T {
  const start = performance.now();
  const result = operation();
  const duration = performance.now() - start;
  
  console.log(`${operationName}: ${duration.toFixed(2)}ms`);
  return result;
}
```

---

## Development APIs

### Debug Mode

```javascript
// Aktywacja trybu debugowania
window.maszynaW = {
  debug: true,
  
  // Dostęp do kompilatora
  compiler: {
    tokenize,
    parse,
    analyze,
    generate
  },
  
  // Stan aplikacji
  getState: () => mainComponent.getState(),
  
  // Symulacja sygnałów
  simulateSignal: (name, value) => {
    mainComponent.executeSignal(name, value);
  }
};
```

### Hot Module Replacement

```javascript
// HMR dla komponentów Vue
if (import.meta.hot) {
  import.meta.hot.accept('./components/Main.vue', (newModule) => {
    console.log('Hot reloading Main.vue');
  });
}
```

---

*API Documentation - Maszyna W Remake v2.0*