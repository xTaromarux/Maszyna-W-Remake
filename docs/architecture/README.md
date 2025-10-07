# Architektura systemu - Maszyna W

Szczegółowa dokumentacja architektury technicznej projektu Maszyna W Remake.

## 🏗️ Przegląd architektury

```
┌─────────────────────────────────────────────────────────────┐
│                    MASZYNA W REMAKE                         │
├─────────────────────────────────────────────────────────────┤
│  Frontend (Vue.js 3 + TypeScript)                          │
│  ┌─────────────────┬──────────────────┬─────────────────┐   │
│  │   UI Layer      │   Logic Layer    │   Data Layer    │   │
│  │                 │                  │                 │   │
│  │ • Components    │ • WLAN Compiler  │ • State Mgmt    │   │
│  │ • Views         │ • Simulator      │ • Local Storage │   │
│  │ • Styling       │ • Debugger       │ • WebSocket     │   │
│  └─────────────────┴──────────────────┴─────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  Backend Services                                           │
│  ┌─────────────────┬──────────────────┬─────────────────┐   │
│  │ HF Proxy Server │  WebSocket Srv   │   Static Files  │   │
│  │ (Node.js)       │  (ESP32 Comm)    │   (Netlify)     │   │
│  └─────────────────┴──────────────────┴─────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  External Integrations                                      │
│  ┌─────────────────┬──────────────────┬─────────────────┐   │
│  │  HuggingFace    │      ESP32       │   GitHub API    │   │
│  │   RAG Chat      │   Microcontroller│   Version Ctrl  │   │
│  └─────────────────┴──────────────────┴─────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Struktura projektu

```
Maszyna-W-Remake/
├── 📁 src/                          # Kod źródłowy aplikacji
│   ├── 📁 components/               # Komponenty Vue.js
│   │   ├── 📄 Main.vue             # Główny komponent aplikacji
│   │   ├── 📄 ProgramEditor.vue    # Edytor kodu WLAN
│   │   ├── 📄 ExecutionControls.vue# Kontrolki wykonywania
│   │   └── 📁 UI/                  # Komponenty interfejsu
│   ├── 📁 WLAN/                    # Kompilator języka WLAN
│   │   ├── 📄 lexer.ts            # Analiza leksykalna
│   │   ├── 📄 parser.ts           # Parser składni
│   │   ├── 📄 semanticAnalyzer.ts # Analiza semantyczna
│   │   ├── 📄 compiler.ts         # Główny kompilator
│   │   └── 📄 simulator.ts        # Symulator procesora
│   ├── 📁 styles/                  # Style SCSS
│   └── 📁 utils/                   # Narzędzia pomocnicze
├── 📁 hf-proxy/                    # Serwer proxy HuggingFace
├── 📁 docs/                        # Dokumentacja
├── 📁 public/                      # Pliki statyczne
└── 📄 *.config.js                 # Pliki konfiguracyjne
```

## 🧩 Komponenty systemu

### 1. Frontend Framework (Vue.js 3)

#### Composition API Architecture
```typescript
// Przykład struktury komponentu
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { ProcessorState } from '@/types'

// Reactive state
const processorState = ref<ProcessorState>({
  registers: new Map(),
  memory: new Array(65536).fill(0),
  programCounter: 0
})

// Computed properties
const isExecuting = computed(() => 
  processorState.value.status === 'running'
)

// Lifecycle hooks
onMounted(() => {
  initializeProcessor()
})
</script>
```

#### Component Hierarchy
```
App.vue
├── Main.vue (2000+ lines - główna logika)
│   ├── ProgramEditor.vue
│   │   ├── CodeMirrorEditor.vue
│   │   └── ExecutionControls.vue
│   ├── MemorySection.vue
│   │   ├── MemoryContent.vue
│   │   └── RegisterComponent.vue
│   ├── IOPanel.vue
│   │   ├── SignalButton.vue
│   │   └── BusSignal.vue
│   └── AiChat.vue
└── SettingsOverlay.vue
```

### 2. WLAN Compiler Pipeline

```
Source Code (WLAN)
       ↓
   📄 Lexer.ts
   • Tokenizacja
   • Rozpoznawanie słów kluczowych
   • Analiza leksykalna
       ↓
   📄 Parser.ts  
   • Budowanie AST
   • Sprawdzanie składni
   • Obsługa błędów
       ↓
   📄 SemanticAnalyzer.ts
   • Analiza semantyczna
   • Sprawdzanie typów
   • Rozwiązywanie etykiet
       ↓
   📄 MicroGenerator.ts
   • Generowanie mikroprogramu
   • Optymalizacja
   • Mapowanie instrukcji
       ↓
   Executable Microprogram
```

#### Lexer Architecture
```typescript
interface Token {
  type: TokenType;          // KEYWORD, IDENTIFIER, NUMBER, etc.
  text: string;            // Rzeczywisty tekst
  line: number;            // Numer linii (1-based)
  col: number;             // Kolumna (1-based)
  pos: number;             // Pozycja w źródle
}

// Token types
enum TokenType {
  PROGRAM = 'PROGRAM',
  BEGIN = 'BEGIN',
  END = 'END',
  INSTRUCTION = 'INSTRUCTION', // POB, ŁAD, DOD, etc.
  IDENTIFIER = 'IDENTIFIER',
  NUMBER = 'NUMBER',
  SEMICOLON = 'SEMICOLON',
  COLON = 'COLON',
  DOT = 'DOT'
}
```

#### Parser AST Structure
```typescript
interface ProgramNode {
  type: 'Program';
  name: string;
  units: (DataUnit | CodeUnit)[];
}

interface CodeUnit {
  type: 'CodeUnit';
  body: (InstructionNode | LabelNode)[];
}

interface InstructionNode {
  type: 'Instruction';
  name: string;              // POB, ŁAD, DOD, etc.
  operands: OperandNode[];   // Lista operandów
  pos: number;               // Pozycja w kodzie źródłowym
}
```

### 3. Simulator Engine

#### Processor State Management
```typescript
interface ProcessorState {
  // Rejestry
  registers: {
    AK: number;              // Akumulator (16-bit)
    PC: number;              // Program Counter
    SP: number;              // Stack Pointer
    IR: number;              // Instruction Register
    AR: number;              // Address Register
  };
  
  // Pamięć
  memory: number[];          // 64KB pamięci
  
  // Flagi
  flags: {
    Z: boolean;              // Zero flag
    N: boolean;              // Negative flag
    C: boolean;              // Carry flag
    V: boolean;              // Overflow flag
  };
  
  // Stan wykonywania
  status: 'stopped' | 'running' | 'paused' | 'error';
  currentInstruction?: MicroInstruction;
  executionSpeed: number;
}
```

#### Micro Instruction Format
```typescript
interface MicroInstruction {
  type: 'phase' | 'conditional';
  signals?: string[];              // Lista sygnałów do aktywacji
  condition?: ConditionSpec;       // Warunek dla instr. warunkowych
  truePhases?: MicroPhase[];       // Fazy dla true branch
  falsePhases?: MicroPhase[];      // Fazy dla false branch
  srcLine?: number;                // Linia źródłowa (debugging)
}

// Przykład mikroprogramu dla POB
const POB_MICROPROGRAM: MicroInstruction[] = [
  {
    type: 'phase',
    signals: ['czyt', 'wys', 'wei', 'il']
  },
  {
    type: 'phase', 
    signals: ['wyad', 'wea', 'czyt', 'wyak']
  }
];
```

### 4. WebSocket Communication

#### Protocol Specification
```typescript
// Message types
interface WebSocketMessage {
  type: 'signal' | 'register' | 'memory' | 'ping' | 'pong';
  timestamp: string;
  data: any;
}

// Signal message
interface SignalMessage extends WebSocketMessage {
  type: 'signal';
  data: {
    name: string;           // Nazwa sygnału (czyt, pisz, wei, etc.)
    value: boolean;         // Stan sygnału (true/false)
    duration?: number;      // Czas trwania w ms
  };
}

// Register update message  
interface RegisterMessage extends WebSocketMessage {
  type: 'register';
  data: {
    name: string;           // Nazwa rejestru (AK, PC, etc.)
    value: number;          // Nowa wartość
    oldValue?: number;      // Poprzednia wartość
  };
}
```

#### ESP32 Integration Flow
```
Vue.js App                    ESP32
    │                          │
    ├─ WebSocket Connect ───────┤
    │                          │
    ├─ Send Signal ─────────────┤
    │  { type: 'signal',        │
    │    name: 'czyt',          │
    │    value: true }          │
    │                          │
    │ ────────── GPIO Control ──┤
    │                          │
    ├─ Receive Sensor ──────────┤
    │  { type: 'register',      │
    │    name: 'input',         │
    │    value: 1023 }          │
    │                          │
    ├─ Update Memory ───────────┤
```

### 5. AI Integration (HuggingFace)

#### RAG (Retrieval Augmented Generation) Flow
```
User Query
    ↓
HF Proxy Server
    ↓
Document Retrieval
• WLAN documentation
• Code examples  
• Error explanations
    ↓
Context Augmentation
    ↓
LLM Generation
(HuggingFace Transformers)
    ↓
Response with Sources
```

#### Proxy Server Architecture
```javascript
// hf-proxy/server.js
const express = require('express');
const { HfInference } = require('@huggingface/inference');

const app = express();
const hf = new HfInference(process.env.HF_TOKEN);

app.post('/api/chat', async (req, res) => {
  const { query, history } = req.body;
  
  // Retrieve relevant documents
  const context = await retrieveDocuments(query);
  
  // Generate response with context
  const response = await hf.textGeneration({
    model: 'microsoft/DialoGPT-medium',
    inputs: buildPrompt(query, context, history)
  });
  
  res.json({ response: response.generated_text });
});
```

## 🔄 Data Flow

### 1. Program Compilation Flow
```
User Code Input
       ↓
CodeMirror Editor
       ↓
WLAN Compiler Pipeline
       ↓
Microprogram Generation
       ↓
Memory Allocation
       ↓
UI State Update
```

### 2. Execution Flow
```
Start Execution
       ↓
Fetch Instruction
       ↓
Decode Microprogram
       ↓
Execute Micro-phases
       ↓
Update State
       ↓
Trigger Events
       ↓
Update UI
       ↓
WebSocket Notify (ESP32)
       ↓
Continue/Stop Decision
```

### 3. Real-time Communication Flow
```
Simulator State Change
       ↓
Event Emission (Vue)
       ↓
WebSocket Message
       ↓
ESP32 Processing
       ↓
GPIO/Sensor Updates
       ↓
WebSocket Response
       ↓
Vue State Update
       ↓
UI Re-render
```

## 🎨 Styling Architecture

### SCSS Structure
```scss
// Main styling architecture
styles/
├── abstracts/
│   ├── _variables.scss    // CSS custom properties
│   ├── _mixins.scss      // Reusable mixins
│   └── _functions.scss   // SCSS functions
├── base/
│   ├── _reset.scss       // CSS reset
│   ├── _typography.scss  // Font definitions
│   └── _base.scss        // Base HTML elements
├── components/
│   ├── _buttons.scss     // Button styles
│   ├── _forms.scss       // Form elements
│   └── _cards.scss       // Card components
├── layout/
│   ├── _header.scss      // Header layout
│   ├── _sidebar.scss     // Sidebar layout
│   └── _grid.scss        // Grid system
└── utilities/
    ├── _animations.scss  // CSS animations
    └── _helpers.scss     // Utility classes
```

### BEM Methodology
```scss
// Block Element Modifier structure
.processor {                    // Block
  &__register {                // Element
    &--active {               // Modifier
      background-color: var(--color-primary);
    }
    
    &--error {                // Modifier
      background-color: var(--color-error);
    }
  }
  
  &__memory {                  // Element
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
    
    &-cell {                  // Sub-element
      padding: 0.5rem;
      border: 1px solid var(--color-border);
      
      &--highlighted {        // Modifier
        background-color: var(--color-highlight);
      }
    }
  }
}
```

## 🔧 Build & Deployment

### Vite Configuration
```typescript
// vite.config.js
export default defineConfig({
  plugins: [
    vue(),
    typescript({
      check: false,
      include: ['src/**/*.ts', 'src/**/*.vue']
    })
  ],
  
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', '@vue/runtime-core'],
          'codemirror': ['@codemirror/state', '@codemirror/view'],
          'wlan-compiler': ['./src/WLAN/lexer', './src/WLAN/parser']
        }
      }
    }
  },
  
  define: {
    __VUE_OPTIONS_API__: false,
    __VUE_PROD_DEVTOOLS__: false
  }
});
```

### Netlify Deployment
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "https://hf-proxy.herokuapp.com/:splat"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-eval'"
```

## 📊 Performance Considerations

### Code Splitting
- Vue components lazy-loaded
- WLAN compiler in separate chunk
- CodeMirror dynamically imported
- Heavy dependencies (AI) conditionally loaded

### Memory Management
- Efficient TypedArrays for processor memory
- Vue component recycling
- WebSocket connection pooling
- Automatic garbage collection triggers

### Rendering Optimization
- Virtual scrolling for memory view
- RAF-based animation loops
- CSS containment for isolated components
- Optimized re-render triggers

---

*Ta dokumentacja jest żywym dokumentem aktualizowanym wraz z rozwojem projektu.* 📈