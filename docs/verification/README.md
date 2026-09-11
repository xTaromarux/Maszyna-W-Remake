# Wyniki weryfikacji — 11.09.2026

- `npm test`: 43/43, bez pominięć.
- `npm run test:e2e`: 12/12, Chrome, build produkcyjny Next.js.
- `simulator.spec.ts` na eksporcie statycznym: 7/7.
- `npm run typecheck`: poprawny.
- `npm run build`, `npm run build:static`, `npm run build:esp`: poprawne.
- `npm audit` aplikacji i `hf-proxy`: zero znanych podatności w dniu weryfikacji.

Surowe raporty JSON oraz zrzuty `baseline-*.png` i `next-*.png` są lokalnymi artefaktami ignorowanymi przez Git. Repozytorium przechowuje to podsumowanie i kod testów. Zrzuty pokazują stan w danym momencie testu; zawartość logów i włączone opcje nie muszą być identyczne.

Aktualne raporty można wygenerować ponownie z katalogu głównego:

```sh
npm audit --json > docs/verification/npm-audit-web.json
npm --prefix hf-proxy audit --json > docs/verification/npm-audit-proxy.json
npm ls --all --json > docs/verification/dependencies-web.json
npm --prefix hf-proxy ls --all --json > docs/verification/dependencies-proxy.json
```

Scenariusz referencyjny `DOD 0`: w obu wersjach po kompilacji i wykonaniu akumulator ma wartość 16, licznik 1. Sprawdzono też mobilną pamięć przy 390 × 844, język i motyw, katalog laboratoriów, własne rozkazy oraz breakpointy.

Worker czatu testowano z atrapą API i fikcyjnym kluczem; relay WebSocket z lokalnymi klientami. Eksport ESP w przeglądarce połączył się z lokalnym relayem na porcie 8085 i wysłał kolory LED. Fizyczny ESP32 i zewnętrzny model AI nie były używane.
