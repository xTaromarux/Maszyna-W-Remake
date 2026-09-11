# Wyniki weryfikacji — 11.09.2026

- `npm test`: 43/43, bez pominięć.
- `npm run test:e2e`: 12/12, Chrome, build produkcyjny Next.js.
- `simulator.spec.ts` na eksporcie statycznym: 7/7.
- `npm run typecheck`: poprawny.
- `npm run build`, `npm run build:static`, `npm run build:esp`: poprawne.
- `npm audit` aplikacji i `hf-proxy`: zero znanych podatności. Surowe wyniki w plikach `npm-audit-*.json`.
- Pełne drzewa zainstalowanych zależności: `dependencies-web.json`, `dependencies-proxy.json`.

`baseline-*.png` przedstawiają oryginalną stronę Vue, `next-*.png` wersję React/Next. Zrzuty settings/program pokazują stan w danym momencie testu; zawartość logów i włączone opcje nie muszą być identyczne.

Scenariusz referencyjny `DOD 0`: w obu wersjach po kompilacji i wykonaniu akumulator ma wartość 16, licznik 1. Sprawdzono też mobilną pamięć przy 390 × 844, język i motyw, katalog laboratoriów, własne rozkazy oraz breakpointy.

Worker czatu testowano z atrapą API i fikcyjnym kluczem; relay WebSocket z lokalnymi klientami. Eksport ESP w przeglądarce połączył się z lokalnym relayem na porcie 8085 i wysłał kolory LED. Fizyczny ESP32 i zewnętrzny model AI nie były używane.
