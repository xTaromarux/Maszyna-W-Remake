# Dokumentacja Techniczna - Maszyna W Remake

## Architektura Systemu

### Przegląd technologii

**Frontend:**
- Vue.js 3 (Composition API)
- TypeScript/JavaScript
- SCSS (architektura BEM)
- Vite (bundler)
- CodeMirror (edytor kodu)

**Backend/Services:**
- Node.js/Express (proxy HuggingFace)
- WebSocket (komunikacja z ESP32)
- Web Workers (AI chat)

**Deployment:**
- Netlify (hosting)
- Git Actions (CI/CD)

---

## Struktura Kodu

### Komponenty Vue.js

#### Main.vue - Komponent główny
```javascript
// Stan aplikacji
data() {
  return {
    // Rejestry procesora
    ak: 0, pc: 0, il: 0, rm: 0, rb: 0, rz: 0, rp: 0,
    x: 0, y: 0, ws: 0,
    
    // Pamięć
    mem: new Array(16).fill(0),
    
    // Sygnały sterujące
    signals: {
      czyt: false, pisz: false, wei: false,
      // ... pozostałe sygnały
    },
    
    // Stan wykonywania
    isRunning: false,
    activeInstrIndex: -1,
    breakpoints: new Set()
  }
}
```

#### Kluczowe metody:
```javascript
// Wykonywanie pojedynczego kroku
stepExecution() {
  if (this.compiledProgram?.length > 0) {
    this.executeStructuredStep();
  } else {
    this.executeLegacyStep();
  }
}

// Kompilacja programu
handleProgramSectionCompile(payload) {
  if (typeof payload === 'string') {
    // Legacy mode
    this.code = payload;
    this.compiledCode = payload.split('\n');
  } else {
    // Structured mode
    this.compiledProgram = payload.program;
    this.rawLines = payload.rawLines;
  }
}
```

### System WLAN

#### Lexer (lexer.ts)
```typescript
const TOKEN_RULES: Array<[string, RegExp]> = [
  ['COMMENT_SLASH', /^\/\/[^\n]*/],
  ['COMMENT_SEMI', /^;[^\n]*/],
  ['WHITESPACE', /^\s+/],
  ['NUMBER', /^-?\d+/],
  ['IDENT', /^[\p{L}_][\p{L}0-9_]*/u],
  ['DOT', /^\./],
  ['COLON', /^:/],
  ['SEMICOLON', /^;/],
  ['COMMA', /^,/],
  ['NEWLINE', /^\n/],
];

export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let line = 1, col = 1, pos = 0;
  
  while (pos < input.length) {
    let matched = false;
    
    for (const [type, regex] of TOKEN_RULES) {
      const match = input.slice(pos).match(regex);
      if (match) {
        const text = match[0];
        
        if (type === 'WHITESPACE' || type.startsWith('COMMENT_')) {
          // Pomijaj whitespace i komentarze
          updatePosition(text);
          continue;
        }
        
        tokens.push({ type, text, line, col, pos });
        updatePosition(text);
        matched = true;
        break;
      }
    }
    
    if (!matched) {
      throw new WlanError('LEXER_UNKNOWN_CHARACTER', 
        `Nieznany znak: '${input[pos]}'`, { line, col });
    }
  }
  
  return tokens;
}
```

#### Parser (parser.ts)
```typescript
export class Parser {
  private tokens: Token[];
  private pos: number = 0;

  parse(): ProgramNode {
    const units: Array<DataUnit | CodeUnit> = [];
    
    while (!this.isAtEnd()) {
      this.skipEmptyLines();
      if (this.isAtEnd()) break;
      
      if (this.check('DOT')) {
        units.push(this.parseDataUnit());
      } else {
        units.push(this.parseCodeUnit());
      }
    }
    
    return { type: 'Program', units };
  }

  private parseInstruction(): InstructionNode {
    const nameTok = this.consume();
    
    if (nameTok.text.toUpperCase() === 'RST' || 
        nameTok.text.toUpperCase() === 'RPA') {
      return this.parseDirective(nameTok);
    }
    
    const operands: OperandNode[] = [];
    
    while (!this.check('SEMICOLON') && !this.check('NEWLINE') && !this.isAtEnd()) {
      if (this.check('COMMA')) {
        this.consume();
        continue;
      }
      
      if (this.check('IDENT')) {
        break;
      }
      
      operands.push(this.parseOperand());
    }
    
    return {
      type: 'Instruction',
      name: nameTok.text.toUpperCase(),
      operands,
      pos: nameTok.pos
    };
  }
}
```

#### Semantic Analyzer (semanticAnalyzer.ts)
```typescript
export function analyzeSemantics(program: ProgramNode): {
  assignments: Assignment[];
  errors: WlanError[];
} {
  const context = {
    assignments: [] as Assignment[],
    errors: [] as WlanError[],
    labels: new Map<string, number>(),
    currentAddr: 0
  };

  // Pierwszy przebieg - zbieranie etykiet
  collectLabels(program, context);
  
  // Drugi przebieg - generowanie przypisań
  generateAssignments(program, context);
  
  // Walidacja adresów i wartości
  validateAssignments(context);
  
  return {
    assignments: context.assignments,
    errors: context.errors
  };
}

function validateInstruction(instr: InstructionNode, context: AnalysisContext) {
  const name = instr.name.toUpperCase();
  
  // Sprawdź czy rozkaz istnieje
  if (!KNOWN_INSTRUCTIONS.has(name)) {
    context.errors.push(new WlanError('SEMANTIC_UNKNOWN_INSTRUCTION',
      `Nieznany rozkaz: ${name}`, extractErrorLocation(instr)));
    return;
  }
  
  // Sprawdź liczbę operandów
  const expectedOperands = INSTRUCTION_OPERANDS[name] || 0;
  const actualOperands = instr.operands?.length || 0;
  
  if (actualOperands !== expectedOperands) {
    context.errors.push(new WlanError('SEMANTIC_OPERAND_COUNT',
      `Rozkaz ${name} oczekuje ${expectedOperands} operandów, otrzymał ${actualOperands}`,
      extractErrorLocation(instr)));
  }
}
```

#### Micro Generator (microGenerator.ts)
```typescript
export function generateMicroProgram(program: ProgramNode): GeneratedProgram {
  const instructions: MicroInstruction[] = [];
  let srcLine = 1;
  
  for (const unit of program.units) {
    if (unit.type === 'CodeUnit') {
      for (const instr of unit.body) {
        if (instr.type === 'Instruction') {
          const generated = generateInstructionMicro(instr, srcLine);
          instructions.push(...generated.instructions);
          srcLine = generated.nextSrcLine;
        }
      }
    }
  }
  
  return { instructions };
}

function generateInstructionMicro(instr: InstructionNode, srcLine: number): {
  instructions: MicroInstruction[];
  nextSrcLine: number;
} {
  const name = instr.name.toUpperCase();
  
  switch (name) {
    case 'DOD':
      return {
        instructions: [
          { type: 'phase', signals: ['czyt', 'wys', 'wei', 'il'], srcLine },
          { type: 'phase', signals: ['wyad', 'wea'], srcLine: srcLine + 1 },
          { type: 'phase', signals: ['czyt', 'wys', 'weja', 'dod', 'weak', 'wyl', 'wea'], srcLine: srcLine + 2 }
        ],
        nextSrcLine: srcLine + 3
      };
      
    case 'SOZ':
      return {
        instructions: [
          { type: 'phase', signals: ['czyt', 'wys', 'wei', 'il'], srcLine },
          { 
            type: 'conditional', 
            condition: { flag: 'Z' },
            truePhases: [
              { type: 'phase', signals: ['wyad', 'wea', 'wel'], srcLine: srcLine + 1 }
            ],
            falsePhases: [
              { type: 'phase', signals: ['wyl', 'wea'], srcLine: srcLine + 2 }
            ],
            srcLine: srcLine + 1
          }
        ],
        nextSrcLine: srcLine + 3
      };
      
    default:
      throw new Error(`Nieobsługiwany rozkaz: ${name}`);
  }
}
```

---

## System Sygnałów

### Implementacja sygnałów sterujących

```javascript
// Grupy konfliktowych sygnałów
const CONFLICTING_GROUPS = [
  ['wyad', 'wyak', 'wyx', 'wyy', 'wyws'],  // Magistrala A
  ['wys', 'wes'],                          // Magistrala S  
  ['iak', 'dak', 'iws', 'dws']            // Operacje JAML
];

// Walidacja konfliktów sygnałów
validateSignalConflicts(activeSignals) {
  for (const group of CONFLICTING_GROUPS) {
    const activeInGroup = group.filter(sig => activeSignals.includes(sig));
    if (activeInGroup.length > 1) {
      throw new Error(`Konflikt sygnałów: ${activeInGroup.join(', ')}`);
    }
  }
}

// Wykonywanie sygnałów
executeSignals(signals) {
  // 1. Najpierw wszystkie WY (wyjścia)
  signals.filter(s => s.startsWith('wy')).forEach(signal => {
    this.executeSignal(signal);
  });
  
  // 2. Potem wszystkie WE (wejścia)
  signals.filter(s => s.startsWith('we')).forEach(signal => {
    this.executeSignal(signal);
  });
  
  // 3. Na końcu operacje matematyczne
  signals.filter(s => ['dod', 'ode', 'przep'].includes(s)).forEach(signal => {
    this.executeSignal(signal);
  });
}
```

### Obsługa magistral

```javascript
// Zarządzanie magistralami
holdBus(which) {
  const key = which === 'A' ? 'busA' : 'busS';
  this.signals[key] = true;
  
  // Automatyczne zwolnienie po określonym czasie
  const slot = which === 'A' ? 'A' : 'S';
  if (this._busHoldTimers[slot]) {
    clearTimeout(this._busHoldTimers[slot]);
  }
  
  this._busHoldTimers[slot] = setTimeout(() => {
    this.signals[key] = false;
    this._busHoldTimers[slot] = null;
  }, this.busHoldMs);
}
```

---

## System Wykonywania

### Tryby wykonywania

#### 1. Tryb manualny (krok po krok)
```javascript
stepExecution() {
  if (this.manualMode) {
    // Tryb ręczny - ignoruj breakpointy
    this.executeSingleStep();
  } else {
    // Tryb automatyczny - sprawdź breakpointy
    if (this.shouldPauseOnBreakpoint()) {
      this.pauseExecution();
      return;
    }
    this.executeSingleStep();
  }
}
```

#### 2. Tryb ciągły (RUN)
```javascript
async runContinuous() {
  const CHUNK = 1;
  const TICK_MS = Math.max(1, this.oddDelay);
  
  while (this.isRunning && !this.isFinished()) {
    for (let i = 0; i < CHUNK && this.isRunning; i++) {
      this.stepExecution();
      
      if (this.shouldPauseOnBreakpoint()) {
        this.pauseExecution();
        return;
      }
    }
    
    // Krótka pauza dla responsywności UI
    await new Promise(resolve => setTimeout(resolve, TICK_MS));
  }
}
```

#### 3. Tryb szybki (RUN FAST)
```javascript
runFast() {
  this._headless = true;
  this.suppressBroadcast = true;
  
  // Wykonuj bez aktualizacji UI
  while (this.isRunning && !this.isFinished()) {
    this.executeSingleStep();
    
    if (this._stepGuard++ > 10000) {
      throw new Error('Przekroczono limit kroków - możliwa pętla nieskończona');
    }
  }
  
  // Przywróć normalny tryb
  this._headless = false;
  this.suppressBroadcast = false;
  this._refreshAll();
}
```

### Obsługa breakpointów

```javascript
// Sprawdzanie breakpointów
shouldPauseOnBreakpoint() {
  if (this._skipNextBreakpoint) {
    this._skipNextBreakpoint = false;
    return false;
  }
  
  return (
    this.isRunning &&
    this.breakpointsEnabled &&
    this.breakpoints.has(this.activeLine)
  );
}

// Pomijanie pierwszego breakpointu przy RUN
skipFirstBreakpoint() {
  this._skipNextBreakpoint = true;
}
```

---

## System Pamięci

### Struktura pamięci

```javascript
// Inicjalizacja pamięci
initMemory() {
  const size = 1 << this.memoryAddresBits;
  this.mem = new Array(size).fill(0);
  
  // Domyślne wartości dla pierwszych 8 komórek
  if (size >= 8) {
    this.mem[0] = 5;   // Przykładowa wartość
    this.mem[1] = 3;
    this.mem[2] = 8;
    this.mem[3] = 15;
    this.mem[4] = 12;
    this.mem[5] = 7;
    this.mem[6] = 0;
    this.mem[7] = 1;
  }
}

// Maskowanie wartości do rozmiaru słowa
toWord(value) {
  return value & this.wordMask();
}

wordMask() {
  return (1 << (this.codeBits + this.addresBits)) - 1;
}

// Maskowanie adresu
addrMask() {
  return (1 << this.memoryAddresBits) - 1;
}
```

### Operacje pamięci

```javascript
// Odczyt z pamięci
readMemory(address) {
  const maskedAddr = address & this.addrMask();
  if (maskedAddr >= 0 && maskedAddr < this.mem.length) {
    return this.mem[maskedAddr];
  }
  return 0;
}

// Zapis do pamięci
writeMemory(address, value) {
  const maskedAddr = address & this.addrMask();
  const maskedValue = this.toWord(value);
  
  if (maskedAddr >= 0 && maskedAddr < this.mem.length) {
    this.mem[maskedAddr] = maskedValue;
    this.addLog(`Pamięć[${maskedAddr}] = ${maskedValue}`, 'memory');
  }
}
```

---

## System Logowania

### Struktura logów

```javascript
// Dodawanie wpisu do logu
addLog(message, level = 'info', error = null) {
  const timestamp = new Date().toISOString();
  const key = `${level}:${message}`;
  
  // Grupowanie powtarzających się wpisów
  if (this._lastLogKey === key && this._lastLogTs) {
    const now = performance.now();
    if (now - this._lastLogTs < 1000) {
      const last = this.logs[this.logs.length - 1];
      if (last) {
        last.count = (last.count || 1) + 1;
        last.timestamp = timestamp;
      }
      this._lastLogTs = now;
      return;
    }
  }
  
  // Nowy wpis
  const entry = {
    message,
    level,
    timestamp,
    count: 1,
    isError: level === 'error' || error != null
  };
  
  if (error) {
    entry.error = {
      code: error.code || 'UNKNOWN_ERROR',
      location: error.location || null,
      extra: error.extra || null
    };
  }
  
  this.logs.push(entry);
  this._lastLogKey = key;
  this._lastLogTs = performance.now();
}
```

### Filtry logów

```javascript
// Filtrowanie logów według poziomu
filteredLogs() {
  return this.logs.filter(log => {
    switch (this.logFilter) {
      case 'errors': return log.isError;
      case 'system': return log.level === 'system';
      case 'execution': return log.level === 'execution';
      case 'memory': return log.level === 'memory';
      default: return true;
    }
  });
}
```

---

## WebSocket Integration

### Komunikacja z ESP32

```javascript
// Nawiązywanie połączenia
connectWebSocket() {
  try {
    this.wsStatus = 'connecting';
    this.ws = new WebSocket('ws://localhost:8080');
    this.ws.binaryType = 'arraybuffer';
    
    this.ws.addEventListener('open', () => {
      this.wsStatus = 'connected';
      this.addLog('[WS] Connected to server', 'system');
      
      // Ping timer dla utrzymania połączenia
      this.wsPingTimer = setInterval(() => {
        if (this.ws?.readyState === WebSocket.OPEN) {
          this.ws.send('ping');
        }
      }, 30000);
    });
    
    this.ws.addEventListener('message', (event) => {
      this.handleWebSocketMessage(event);
    });
    
    this.ws.addEventListener('close', () => {
      this.wsStatus = 'disconnected';
      this.addLog('[WS] Connection closed', 'system');
      this.cleanupWebSocket();
    });
    
  } catch (error) {
    this.wsStatus = 'error';
    this.addLog(`[WS] Connection failed: ${error.message}`, 'error');
  }
}

// Obsługa wiadomości
handleWebSocketMessage(event) {
  try {
    const data = JSON.parse(event.data);
    
    if (data.type === 'signal') {
      // Sygnały z ESP32
      this.handleExternalSignal(data.name, data.value);
    } else if (data.type === 'register') {
      // Zmiany rejestrów
      this.handleExternalRegisterChange(data.name, data.value);
    }
    
  } catch (error) {
    this.addLog(`[WS] Message parse error: ${error.message}`, 'error');
  }
}

// Wysyłanie sygnałów do ESP32
broadcastSignalChange(signalName, value) {
  if (this.suppressBroadcast) return;
  
  if (this.ws?.readyState === WebSocket.OPEN) {
    this.ws.send(JSON.stringify({
      type: 'signal',
      name: signalName,
      value: value
    }));
  }
}
```

---

## Obsługa Błędów

### System błędów WLAN

```typescript
// Klasa bazowa błędów
export class WlanError extends Error {
  code: string;
  location?: ErrorLocation;
  extra?: Record<string, any>;
  timestamp: string;

  constructor(
    code: string,
    message: string,
    location?: ErrorLocation,
    extra?: Record<string, any>
  ) {
    super(message);
    this.name = 'WlanError';
    this.code = code;
    this.location = location;
    this.extra = extra;
    this.timestamp = new Date().toISOString();
  }
}

// Lokalizacja błędu
export interface ErrorLocation {
  line: number;
  col: number;
  length?: number;
}

// Factory dla błędów
export function createWlanError<T extends string>(
  code: T,
  message: string,
  location?: ErrorLocation,
  extra?: Record<string, any>
): WlanError {
  return new WlanError(code, message, location, extra);
}
```

### Obsługa błędów kompilacji

```javascript
// Wyświetlanie błędów kompilacji
handleCompilationErrors(errors) {
  this.addLog('=== BŁĘDY KOMPILACJI ===', 'error');
  
  for (const error of errors) {
    let message = `[${error.code}] ${error.message}`;
    
    if (error.location) {
      message += ` (linia ${error.location.line}, kolumna ${error.location.col})`;
    }
    
    this.addLog(message, 'error', error);
  }
  
  this.addLog(`Znaleziono ${errors.length} błędów kompilacji.`, 'error');
}
```

---

## Testy i Debugowanie

### Debugowanie kompilatora

```javascript
// Tryb debug dla kompilatora
if (process.env.NODE_ENV === 'development') {
  window.debugWLAN = {
    tokenize: (code) => tokenize(code),
    parse: (tokens) => new Parser(tokens).parse(),
    analyze: (program) => analyzeSemantics(program),
    generate: (program) => generateMicroProgram(program)
  };
}
```

### Logging rozwojowy

```javascript
// Szczegółowe logowanie w trybie dev
if (this.devMode) {
  console.group(`Executing phase: ${phase.signals.join(', ')}`);
  console.log('Before:', { ...this.getRegisterState() });
  
  this.executePhase(phase);
  
  console.log('After:', { ...this.getRegisterState() });
  console.log('Active signals:', Object.keys(this.signals).filter(k => this.signals[k]));
  console.groupEnd();
}
```

---

## Optymalizacje

### Performance

```javascript
// Optymalizacja renderowania list
// Użycie v-memo dla dużych list pamięci
<template v-for="(value, index) in mem" 
          :key="index" 
          v-memo="[value, index === selectedMemoryIndex]">
  <MemoryCell :value="value" :address="index" :selected="index === selectedMemoryIndex" />
</template>

// Debouncing dla częstych aktualizacji
const debouncedUpdate = debounce(() => {
  this.updateMemoryDisplay();
}, 16); // 60 FPS
```

### Bundle optimization

```javascript
// Lazy loading komponentów
const SettingsPanel = () => import('./components/SettingsPanel.vue');
const AiChat = () => import('./components/AiChat.vue');

// Code splitting dla WLAN kompilatora
const WLANCompiler = () => import('./WLAN/compiler');
```

---

## Deployment i CI/CD

### Netlify konfiguracja

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "https://proxy-server.herokuapp.com/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Netlify

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Netlify
        uses: netlify/actions/cli@master
        with:
          args: deploy --prod --dir=dist
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

---

## Monitorowanie i Analytics

### Error tracking

```javascript
// Globalny handler błędów
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  
  // Wysyłanie do serwisu monitoringu
  if (typeof analytics !== 'undefined') {
    analytics.track('JavaScript Error', {
      message: event.error.message,
      stack: event.error.stack,
      filename: event.filename,
      lineno: event.lineno
    });
  }
});

// Handler dla Promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});
```

### Performance monitoring

```javascript
// Monitoring wydajności kompilatora
export function measureCompilationTime<T>(
  operation: () => T,
  operationName: string
): T {
  const start = performance.now();
  const result = operation();
  const duration = performance.now() - start;
  
  console.log(`${operationName} took ${duration.toFixed(2)}ms`);
  
  return result;
}
```

---

*Dokumentacja techniczna wygenerowana dla projektu Maszyna W - Remake v2.0*