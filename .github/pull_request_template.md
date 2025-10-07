# Pull Request

## 📝 Opis zmian

**Co zostało zmienione:**
Krótkie, jasne podsumowanie wprowadzonych zmian.

**Dlaczego ta zmiana jest potrzebna:**
Wyjaśnij biznesową/techniczną przyczynę tej zmiany.

## 🔗 Powiązane Issues

Closes #(issue number)
Fixes #(issue number)
Related to #(issue number)

## 📋 Typ zmian

**Zaznacz odpowiednie opcje:**
- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📚 Documentation update
- [ ] 🧪 Test improvements
- [ ] 🎨 Code style/formatting changes
- [ ] ⚡ Performance improvements
- [ ] 🔧 Build/CI improvements
- [ ] ♻️ Refactoring (no functional changes)

## 🧪 Jak przetestować

**Kroki do przetestowania zmian:**
1. Checkout tego branch: `git checkout feature/branch-name`
2. Zainstaluj dependencies: `npm install`
3. Uruchom dev server: `npm run dev`
4. Otwórz symulator w przeglądarce
5. Wykonaj następujące kroki:
   - Krok 1...
   - Krok 2...
   - Krok 3...

**Testowane scenariusze:**
- [ ] Scenariusz A: ...
- [ ] Scenariusz B: ...
- [ ] Scenariusz C: ...

**Test data/code:**
```wlan
// Przykładowy kod WLAN do testowania
PROGRAM Test;
BEGIN
    POB 10;
    STP;
END.
```

## 📱 Środowiska testowe

**Przetestowane przeglądarki:**
- [ ] Chrome (wersja: )
- [ ] Firefox (wersja: )
- [ ] Safari (wersja: )
- [ ] Edge (wersja: )

**Przetestowane systemy:**
- [ ] Windows 10/11
- [ ] macOS
- [ ] Linux (Ubuntu/Fedora/etc.)
- [ ] Android
- [ ] iOS

**Responsive testing:**
- [ ] Desktop (1920x1080+)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

## 📊 Performance Impact

**Czy zmiana wpływa na wydajność:**
- [ ] ✅ Nie wpływa na performance
- [ ] ⚡ Poprawia performance
- [ ] ⚠️ Może wpłynąć na performance (opisz poniżej)
- [ ] 🐌 Wiadomo że obniża performance (uzasadnij poniżej)

**Szczegóły performance (jeśli dotyczy):**
- Bundle size change: +/- X KB
- Load time impact: +/- X ms
- Memory usage: +/- X MB
- Specific bottlenecks addressed: ...

## 🔒 Security Considerations

**Security checklist:**
- [ ] No sensitive data exposed
- [ ] Input validation added where needed
- [ ] XSS prevention considered
- [ ] Dependencies updated/scanned
- [ ] No hardcoded secrets/tokens

**Security concerns (jeśli jakieś):**
Opisz potencjalne problemy bezpieczeństwa i jak zostały rozwiązane.

## 📚 Dokumentacja

**Aktualizacje dokumentacji:**
- [ ] README.md updated
- [ ] API docs updated
- [ ] User guide updated
- [ ] Technical docs updated
- [ ] Code comments added
- [ ] Examples updated
- [ ] No documentation needed

**Nowe przykłady (jeśli dodane):**
- Przykład 1: `docs/examples/path/file.wlan`
- Przykład 2: `docs/tutorials/new-tutorial.md`

## 🎯 Breaking Changes

**Czy wprowadza breaking changes:**
- [ ] ✅ Nie, backwards compatible
- [ ] ❌ Tak, breaking changes (opisz poniżej)

**Szczegóły breaking changes:**
1. Co się zmieniło: ...
2. Jak migrować: ...
3. Deprecated features: ...

**Migration guide:**
```typescript
// Stary sposób (deprecated)
oldAPI.method();

// Nowy sposób
newAPI.method();
```

## ✅ Checklist przed mergem

### Code Quality
- [ ] Code compiles without errors
- [ ] No TypeScript errors
- [ ] ESLint passes
- [ ] Prettier formatting applied
- [ ] No console.log statements left
- [ ] No TODO comments (or tracked in issues)

### Testing
- [ ] Unit tests pass: `npm run test`
- [ ] E2E tests pass: `npm run test:e2e`
- [ ] Manual testing completed
- [ ] Edge cases considered
- [ ] Error handling tested

### Code Review
- [ ] Self-review completed
- [ ] Code follows project conventions
- [ ] Functions/variables have meaningful names
- [ ] Complex logic is commented
- [ ] No duplicate code introduced

### Dependencies
- [ ] No unnecessary dependencies added
- [ ] Dependencies are up to date
- [ ] License compatibility checked
- [ ] Security scan passed

### Documentation
- [ ] CHANGELOG.md updated
- [ ] Documentation reflects changes
- [ ] Examples work correctly
- [ ] API changes documented

## 📷 Screenshots/GIFs

**Before/After (jeśli UI changes):**

Before:
![Before](url-to-screenshot)

After:
![After](url-to-screenshot)

**Demo (jeśli new feature):**
![Demo](url-to-gif-or-video)

## 🎓 Educational Impact

**Jak to pomoże learners:**
Opisz jak te zmiany poprawią doświadczenie edukacyjne.

**Target learning outcomes:**
- Students będą mogli...
- Teachers będą mogli...

## 💭 Dodatkowe uwagi

**Challenges faced:**
Jakie były główne wyzwania podczas implementacji?

**Alternative approaches considered:**
Jakie inne rozwiązania rozważałeś?

**Future improvements:**
Co można by ulepszyć w przyszłości?

**Questions for reviewers:**
- Pytanie 1: ...
- Pytanie 2: ...

## 🔄 Post-merge tasks

**Follow-up items (jeśli jakieś):**
- [ ] Update deployment configuration
- [ ] Notify beta testers
- [ ] Update marketing materials
- [ ] Schedule announcement

---

## 👥 Dla reviewers

**Focus areas dla review:**
- [ ] Code logic correctness
- [ ] Security considerations
- [ ] Performance implications
- [ ] Educational value
- [ ] User experience
- [ ] Documentation completeness

**Estimated review time:** ___ minutes

---

**Dziękuję za review! 🙏**

*Po zaakceptowaniu tego PR, użytkownicy będą mogli cieszyć się nową funkcjonalnością/poprawką.*