# Przewodnik współtworzenia projektu

🎉 Dziękujemy za zainteresowanie współtworzeniem projektu **Maszyna W Remake**! 

Ten dokument zawiera instrukcje i wytyczne, które pomogą Ci efektywnie współpracować z naszym zespołem.

## 📋 Spis treści

- [Kodeks postępowania](#kodeks-postępowania)
- [Jak zacząć](#jak-zacząć)
- [Typy wkładu](#typy-wkładu)
- [Proces development](#proces-development)
- [Zgłaszanie błędów](#zgłaszanie-błędów)
- [Proponowanie funkcjonalności](#proponowanie-funkcjonalności)
- [Pull Requests](#pull-requests)
- [Coding Standards](#coding-standards)
- [Testowanie](#testowanie)
- [Dokumentacja](#dokumentacja)

---

## 📜 Kodeks postępowania

Ten projekt przestrzega [Kodeksu postępowania](CODE_OF_CONDUCT.md). Uczestnicząc w projekcie, oczekujemy że będziesz przestrzegać tych zasad.

---

## 🚀 Jak zacząć

### 1. Przygotowanie środowiska

```bash
# Fork repozytorium na GitHubie
# Następnie klonuj swojego forka:
git clone https://github.com/YOUR_USERNAME/Maszyna-W-Remake.git
cd Maszyna-W-Remake

# Dodaj oryginalne repo jako upstream
git remote add upstream https://github.com/xTaromarux/Maszyna-W-Remake.git

# Zainstaluj zależności
npm install

# Uruchom w trybie deweloperskim
npm run dev
```

### 2. Sprawdź czy wszystko działa

```bash
# Uruchom testy
npm run test

# Sprawdź linting
npm run lint

# Sprawdź build
npm run build
```

### 3. Znajdź zadanie do wykonania

- 🏷️ **Good first issue** - dla początkujących
- 🐛 **Bug** - poprawki błędów
- ✨ **Enhancement** - nowe funkcjonalności  
- 📖 **Documentation** - ulepszenia dokumentacji
- 🧪 **Tests** - dodawanie testów

---

## 🛠️ Typy wkładu

### 🐛 Zgłaszanie błędów
Pomagasz znajdować i dokumentować problemy w kodzie.

### ✨ Nowe funkcjonalności
Implementujesz nowe możliwości symulatora.

### 📖 Dokumentacja
Ulepszasz lub piszesz nową dokumentację.

### 🧪 Testowanie
Dodajesz testy jednostkowe i e2e.

### 🎨 Design/UX
Ulepszasz interfejs użytkownika.

### 🌍 Tłumaczenia
Pomagasz w internacjonalizacji.

### 📚 Edukacja
Tworzysz materiały edukacyjne i przykłady.

---

## 🔄 Proces development

### 1. Synchronizacja z upstream

```bash
# Przed rozpoczęciem pracy zawsze synchronizuj
git checkout main
git fetch upstream
git merge upstream/main
git push origin main
```

### 2. Tworzenie brancha

```bash
# Użyj konwencji nazewnictwa:
git checkout -b feature/amazing-new-feature
git checkout -b fix/bug-description  
git checkout -b docs/update-readme
git checkout -b test/add-parser-tests
```

### 3. Nazewnictwo commitów

Używamy [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Typy commitów:
feat: dodaje nową funkcjonalność
fix: poprawia błąd
docs: aktualizuje dokumentację
style: zmiany formatowania (nie wpływające na logikę)
refactor: refaktoryzacja kodu
test: dodaje lub modyfikuje testy
chore: aktualizacje build tools, zależności

# Przykłady:
git commit -m "feat: add WebSocket connection status indicator"
git commit -m "fix: resolve memory leak in simulator execution"
git commit -m "docs: update API documentation for signals"
git commit -m "test: add unit tests for WLAN compiler"
```

### 4. Wykonywanie commitów

```bash
# Sprawdź zmiany
git status
git diff

# Dodaj pliki
git add .

# Commit z opisową wiadomością
git commit -m "feat: add support for custom instruction sets"

# Push do swojego forka
git push origin feature/amazing-new-feature
```

---

## 🐛 Zgłaszanie błędów

### Przed zgłoszeniem sprawdź:

1. ✅ Czy błąd nie został już zgłoszony w [Issues](https://github.com/xTaromarux/Maszyna-W-Remake/issues)
2. ✅ Czy używasz najnowszej wersji
3. ✅ Czy problem występuje w różnych przeglądarkach

### Informacje do załączenia:

```markdown
**Opis problemu:**
Krótki opis tego co poszło nie tak.

**Kroki reprodukcji:**
1. Otwórz symulator
2. Wklej kod WLAN: `POB 10; STP;`
3. Kliknij "Kompiluj"
4. Błąd pojawia się w konsoli

**Oczekiwane zachowanie:**
Program powinien się skompilować bez błędów.

**Rzeczywiste zachowanie:**
Pojawia się błąd "Undefined instruction POB".

**Środowisko:**
- OS: Windows 11
- Przeglądarka: Chrome 118.0.0.0
- Wersja Node.js: 18.17.0

**Dodatkowe informacje:**
Załącz zrzuty ekranu, logi konsoli, kod WLAN.
```

---

## ✨ Proponowanie funkcjonalności

### Szablon propozycji:

```markdown
**Problem/Potrzeba:**
Opisz jaki problem rozwiązuje ta funkcjonalność.

**Proponowane rozwiązanie:**
Szczegółowy opis implementacji.

**Alternatywy:**
Jakie inne rozwiązania rozważałeś?

**Mockupy/Wireframes:**
Załącz szkice interfejsu jeśli dotyczy.

**Wpływ na wydajność:**
Czy funkcjonalność może wpłynąć na performance?

**Breaking changes:**
Czy zmiana może złamać istniejący kod?
```

### Proces akceptacji:

1. 📝 **Dyskusja** - społeczność omawia propozycję
2. ✅ **Akceptacja** - maintainer oznacza jako approved
3. 🛠️ **Implementacja** - ktoś podejmuje się pracy
4. 🔍 **Code Review** - recenzja kodu
5. 🚀 **Merge** - włączenie do głównej gałęzi

---

## 🔀 Pull Requests

### Checklist przed wysłaniem PR:

- [ ] ✅ Branch jest zsynchronizowany z `upstream/main`
- [ ] ✅ Testy przechodzą: `npm run test`
- [ ] ✅ Linting jest OK: `npm run lint`  
- [ ] ✅ Build jest pomyślny: `npm run build`
- [ ] ✅ Dodano testy dla nowej funkcjonalności
- [ ] ✅ Dokumentacja jest zaktualizowana
- [ ] ✅ CHANGELOG.md zawiera wpis o zmianach

### Szablon opisu PR:

```markdown
## 📝 Opis zmian

Krótkie podsumowanie tego co zostało zmienione.

## 🔗 Powiązane Issues

Closes #123
Fixes #456

## 🧪 Jak przetestować

1. Sprawdź czy...
2. Kliknij...
3. Zweryfikuj że...

## 📷 Zrzuty ekranu (jeśli dotyczy)

![Before](before.png) ![After](after.png)

## ✅ Checklist

- [ ] Kod kompiluje się bez błędów
- [ ] Testy są napisane i przechodzą
- [ ] Dokumentacja jest zaktualizowana
- [ ] Self-review został wykonany
- [ ] Zmiany są backwards compatible (lub oznaczone jako breaking)
```

### Proces review:

1. 🤖 **CI/CD** - automatyczne sprawdzenie testów i linting
2. 👥 **Peer Review** - przynajmniej jeden code review
3. ✅ **Approval** - maintainer zatwierdza zmiany
4. 🔀 **Merge** - włączenie do głównej gałęzi

---

## 📋 Coding Standards

### TypeScript/JavaScript

```typescript
// ✅ Dobrze - używaj TypeScript
interface ProcessorState {
  registers: Register[];
  memory: Memory;
  programCounter: number;
}

// ✅ Dobrze - używaj meaningful names
const compileWLANProgram = (sourceCode: string): CompiledProgram => {
  // implementation
}

// ❌ Źle - unikaj any
const parseInstruction = (instruction: any) => { }

// ✅ Dobrze - explicit types
const parseInstruction = (instruction: string): ParsedInstruction => { }
```

### Vue.js 3 Composition API

```vue
<script setup lang="ts">
// ✅ Dobrze - Composition API z TypeScript
import { ref, computed, onMounted } from 'vue'

interface ProcessorProps {
  initialState?: ProcessorState
}

const props = defineProps<ProcessorProps>()
const isRunning = ref(false)

const canExecute = computed(() => 
  !isRunning.value && program.value.isValid
)

// ✅ Używaj lifecycle hooks 
onMounted(() => {
  initializeProcessor()
})
</script>
```

### SCSS/CSS

```scss
// ✅ Używaj BEM methodology
.processor {
  &__register {
    &--active {
      background-color: var(--color-primary);
    }
  }
  
  &__memory {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(50px, 1fr));
  }
}

// ✅ Używaj CSS custom properties
:root {
  --color-primary: #42b883;
  --color-secondary: #347474;
  --spacing-unit: 8px;
}
```

### Formatowanie

```bash
# Automatyczne formatowanie
npm run format

# Sprawdzenie linting
npm run lint

# Fix automatycznych problemów
npm run lint:fix
```

### ESLint i Prettier konfiguracja

Projekt używa:
- **ESLint** - linting JavaScript/TypeScript
- **Prettier** - formatowanie kodu
- **vue/vue3-essential** - Vue.js specific rules
- **@typescript-eslint** - TypeScript specific rules

---

## 🧪 Testowanie

### Uruchamianie testów

```bash
# Wszystkie testy
npm run test

# Testy w trybie watch
npm run test:watch

# Coverage report
npm run test:coverage

# E2E testy
npm run test:e2e

# E2E w trybie headless  
npm run test:e2e:headless
```

### Pisanie testów

#### Unit testy (Jest + Vue Test Utils)

```typescript
// tests/components/ProcessorRegister.test.ts
import { mount } from '@vue/test-utils'
import ProcessorRegister from '@/components/ProcessorRegister.vue'

describe('ProcessorRegister', () => {
  it('displays register value correctly', () => {
    const wrapper = mount(ProcessorRegister, {
      props: {
        name: 'AK',
        value: 42,
        size: 16
      }
    })
    
    expect(wrapper.find('.register__value').text()).toBe('42')
    expect(wrapper.find('.register__name').text()).toBe('AK')
  })
  
  it('emits update event on value change', async () => {
    // test implementation
  })
})
```

#### E2E testy (Cypress)

```typescript
// cypress/e2e/compiler.cy.ts
describe('WLAN Compiler', () => {
  beforeEach(() => {
    cy.visit('/')
  })
  
  it('compiles simple program successfully', () => {
    cy.get('[data-cy=code-editor]')
      .type('POB 10;{enter}STP;')
    
    cy.get('[data-cy=compile-button]').click()
    
    cy.get('[data-cy=compilation-status]')
      .should('contain', 'Success')
      
    cy.get('[data-cy=memory-view]')
      .should('be.visible')
  })
})
```

### Coverage target

- **Unit tests**: > 80% code coverage
- **Integration tests**: Critical user paths
- **E2E tests**: Main application flows

---

## 📖 Dokumentacja

### Kiedy aktualizować dokumentację:

- ✅ Dodajesz nową funkcjonalność
- ✅ Zmieniasz istniejące API
- ✅ Poprawiasz błędy w dokumentacji
- ✅ Dodajesz nowe przykłady użycia

### Typy dokumentacji:

1. **README.md** - wprowadzenie i quick start
2. **API_DOCS.md** - dokumentacja API
3. **DOKUMENTACJA.md** - przewodnik użytkownika
4. **DOKUMENTACJA_TECHNICZNA.md** - dokumentacja dla deweloperów
5. **JSDoc comments** - dokumentacja w kodzie

### JSDoc w kodzie

```typescript
/**
 * Kompiluje kod źródłowy WLAN do mikroprogramu.
 * 
 * @param sourceCode - Kod źródłowy w języku WLAN
 * @param options - Opcje kompilacji
 * @returns Skompilowany mikroprogram z metadanymi
 * 
 * @example
 * ```typescript
 * const program = compileWLAN('POB 10; STP;', { 
 *   optimizeLevel: 2 
 * });
 * ```
 */
export function compileWLAN(
  sourceCode: string, 
  options: CompilerOptions = {}
): CompiledProgram {
  // implementation
}
```

---

## 🔧 Development Tools

### Polecane rozszerzenia VS Code:

- **Volar** - Vue.js language support
- **TypeScript Vue Plugin** - TS support w Vue
- **ESLint** - linting w edytorze
- **Prettier** - formatowanie kodu
- **GitLens** - Git annotations
- **Thunder Client** - testowanie API

### Debugowanie

```bash
# Debug mode z source maps
npm run dev:debug

# Vue DevTools
# Zainstaluj rozszerzenie przeglądarki
```

### Hot Module Replacement

```typescript
// Akceptacja HMR dla komponentów
if (import.meta.hot) {
  import.meta.hot.accept('./components/Processor.vue', (newModule) => {
    console.log('HMR: Processor component updated')
  })
}
```

---

## 🎯 Priorytetowe obszary pomocy

### 🚨 High Priority
- Poprawki kritycznych błędów
- Performance optimizations
- Security issues
- Accessibility improvements

### 📈 Medium Priority  
- Nowe funkcjonalności symulatora
- UI/UX improvements
- Documentation updates
- Test coverage

### 🔮 Low Priority
- Refaktoryzacja kodu
- Code style improvements
- Developer experience
- Nice-to-have features

---

## ❓ Potrzebujesz pomocy?

### 💬 Kanały komunikacji:

- **GitHub Issues** - ogólne pytania i problemy
- **GitHub Discussions** - dyskusje o funkcjonalnościach
- **Discord** - real-time chat z społecznością
- **E-mail** - kontakt z maintainerami

### 📚 Przydatne zasoby:

- [Vue.js 3 Documentation](https://vuejs.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)
- [Cypress E2E Testing](https://docs.cypress.io/)

---

## 🏆 Uznanie dla współtwórców

Wszyscy współtwórcy są wymieniani w:
- 👥 **Contributors** section w README.md
- 📊 **GitHub Contributors** graph
- 🎉 **Release notes** dla większych wkładów
- 📱 **Social media** shoutouts

### Typy wkładu uznawane przez all-contributors:

- 💻 Code
- 📖 Documentation  
- 🎨 Design
- 💡 Ideas
- 🐛 Bug reports
- 📹 Videos
- 📢 Talks
- ❓ Answering Questions

---

## 📋 Checklist dla nowych contributorów

### Pierwszy raz?

- [ ] 👋 Przeczytaj [README.md](README.md)
- [ ] 📜 Zapoznaj się z [Code of Conduct](CODE_OF_CONDUCT.md)
- [ ] 🔧 Skonfiguruj środowisko developerskie
- [ ] 🧪 Uruchom testy i sprawdź czy przechodzą
- [ ] 🎯 Znajdź issue z etykietą "good first issue"
- [ ] 💬 Przedstaw się w GitHub Discussions
- [ ] 🚀 Zgłoś swój pierwszy PR!

### Regularne współtworzenie:

- [ ] 🔄 Synchronizuj z upstream przed rozpoczęciem pracy  
- [ ] 🌿 Twórz feature branch dla każdej zmiany
- [ ] ✅ Sprawdzaj testy i linting przed commitem
- [ ] 📝 Pisz dobre commit messages
- [ ] 🔍 Rób self-review przed wysłaniem PR
- [ ] 📖 Aktualizuj dokumentację gdy potrzeba

---

**Dziękujemy za współtworzenie Maszyny W Remake! 🎉**

Każdy wkład, niezależnie od wielkości, jest wartościowy i pomaga tworzyć lepsze narzędzie edukacyjne dla wszystkich. 

*Happy coding! 🚀*