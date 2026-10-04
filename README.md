# Maszyna W — Next.js

Interaktywny symulator Maszyny W przepisany z Vue 3/Vite na React 19 i Next.js 16 (App Router). Zachowuje schemat rejestrów i magistral, ręczne sterowanie sygnałami, assembler WLAN, edytory CodeMirror, breakpointy, laboratoria, konsolę, ustawienia PL/EN, czat oraz komunikację z ESP32.

## Uruchomienie

Wymagany Node.js >=20.9 (weryfikacja na Node 24) i npm.

```sh
npm ci
npm run dev
```

Otwórz http://localhost:3000. Wersja produkcyjna:

```sh
npm run build
npm start
```

Build regeneruje oba parsery Lezer. Skrypty używają webpacka; kompilowanie osobnego Web Workera czatu jest sprawdzane również w eksporcie statycznym.

## Konfiguracja

Zmienne dla przeglądarki mają prefiks `NEXT_PUBLIC_` i są utrwalane podczas budowania. Dawne `VITE_APP_PLATFORM` i `VITE_API_URL` zastąpiono odpowiednio `NEXT_PUBLIC_APP_PLATFORM` i `NEXT_PUBLIC_API_URL`. Skopiuj `.env.example` do `.env.local` i dostosuj adresy. Lokalne pliki `.env*` są ignorowane przez Git; wersjonowane są wyłącznie szablony `.env.example`.

| Zmienna                    | Znaczenie                                                                                        |
| -------------------------- | ------------------------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_APP_PLATFORM` | `web` lub `esp`; skrypty `*:esp` ustawiają `esp` automatycznie.                                  |
| `NEXT_PUBLIC_API_URL`      | Adres czatu; domyślnie `/api/chat`. Dla statycznego hostingu podaj pełny adres API.              |
| `NEXT_PUBLIC_HEALTH_URL`   | Adres kontroli dostępności; domyślnie `/health` na tym samym serwerze co API.                    |
| `NEXT_PUBLIC_WS_URL`       | Adres WebSocket; domyślnie `ws://localhost:8080`. Dla HTTPS użyj dostępnego `wss://`.            |
| `API_PROXY_TARGET`         | Opcjonalny adres serwera API, np. `http://127.0.0.1:8787`. Next przekazuje `/api/*` i `/health`. |
| `API_PROXY_STRIP_PREFIX`   | `1` dla starszego serwera obsługującego `/chat`, domyślnie `0` dla dołączonego `/api/chat`.      |

Klucza użytkownika nie umieszczaj w `NEXT_PUBLIC_*`. Czat przyjmuje go w interfejsie; zgodnie z dotychczasowym działaniem zapisuje lokalnie i przesyła do skonfigurowanego API. Istniejące lokalne ustawienia pod kluczem `W` są odczytywane, ale zapisywane są tylko preferencje, bez rejestrów, pamięci, timerów i logów. Uszkodzone dane nie blokują startu strony.

## Wersja statyczna i ESP32

```sh
npm run build:static
npm run preview:static
```

Eksport trafia do `out/`, podgląd działa na http://127.0.0.1:3001. Ten katalog jest publikowany przez `netlify.toml`. Nie wymaga serwera Next.js. Wszystkie buildy używają roboczego katalogu `.next/`; po eksporcie przed `npm start` ponownie wykonaj `npm run build`. Na czas budowania zatrzymaj serwer uruchomiony z tego samego katalogu.

```sh
npm run dev:esp
npm run build:esp
```

Wariant ESP ukrywa czat i dodatki programowe, udostępnia wskaźnik połączenia oraz sterowanie kolorami LED. Także generuje `out/`. Konfiguracja przeglądarkowa jest wbudowana w pliki; po zmianie adresu ESP/API trzeba ponowić build. Skrypt ustawia platformę bezpośrednio, a pozostałe zmienne Next odczytuje ze standardowych `.env`/`.env.local`. Plik `.env.esp` nie jest wymagany.

Statyczny hosting nie wykonuje przekierowań API z `next.config.mjs`. API musi działać pod pełnym adresem z odpowiednim CORS albo host musi zapewnić własny reverse proxy. Eksport wymaga serwowania wszystkich plików `out/`, w tym `/_next/static/`; fizyczne wgranie do ESP32 i pojemność jego pamięci pozostają zależne od sprzętu.

## Serwery pomocnicze

Relay WebSocket:

```sh
npm run serve:ws
npm run dev:ws
```

Protokół i konfigurację sieci opisuje [WEBSOCKET_PROTOCOL.md](WEBSOCKET_PROTOCOL.md).

Opcjonalny proxy czatu ma własny manifest i lockfile:

```sh
npm --prefix hf-proxy ci
npm --prefix hf-proxy start
```

Skopiuj `hf-proxy/.env.example` do `hf-proxy/.env` i ustaw `HF_TARGET_URL` lub `HF_SPACE`. Opcjonalna konfiguracja: `ALLOWED_ORIGINS`, `PORT` (domyślnie 8787) i `BODY_LIMIT_MB`. Dla lokalnego frontendu dopisz jego adres do `ALLOWED_ORIGINS` i ustaw `API_PROXY_TARGET`. Samo uruchomienie strony nie wymaga tego proxy. Szczegóły protokołu czatu i testów opisuje [docs/migration-chat.md](docs/migration-chat.md).

## Weryfikacja

Rejestr instrukcji `I` przechowuje pełne słowo (kod rozkazu i argument); sygnał `wyad` wyprowadza tylko część adresową. Nazwy rozkazów w pamięci, na liście rozkazów i w podpowiedziach edytora odpowiadają językowi interfejsu. Asembler celowo akceptuje zarówno nazwy polskie, jak i angielskie aliasy, także w jednym programie. Dyrektywy `RST`, `RPA`, `ORG` i `DATA` są wspólne dla obu języków i dostępne w podpowiedziach.

```sh
npm --prefix hf-proxy ci
npm test
npm run typecheck
npm run build
npx playwright install chromium
npm run test:e2e
npm run build:esp
npm audit
npm --prefix hf-proxy audit
```

Testy jednostkowe obejmują assembler, silnik, renderowanie rejestrów, worker czatu i proxy z lokalnym zastępczym API. Testy E2E uruchamiają gotowy build na porcie 3000 lub używają istniejącego serwera. Można wskazać inny adres przez `E2E_BASE_URL` i lokalną przeglądarkę przez `PLAYWRIGHT_CHANNEL=chrome`. Nie wymagają prawdziwego klucza AI ani sprzętu ESP32. `typecheck` najpierw generuje lokalne typy Next.js; `next-env.d.ts` i katalog `.next/` nie są wersjonowane.

## Struktura

- `src/app/` — App Router, metadane, ekran błędu i klient symulatora.
- `src/components/` — komponenty React i dotychczasowe podziały funkcjonalne.
- [`src/types/`](src/types/README.md) ? wsp?lne typy aplikacji; komponenty `.tsx` i narz?dzia `.ts` sprawdzane z `strict: true`.
- `src/state/` — niezależny model maszyny, operacje, selektory i subskrypcja przez `useSyncExternalStore`.
- [`src/shared/utils/`](src/shared/utils/README.md) — wspólne funkcje liczbowe, kolory, aliasy rozkazów, storage, klonowanie i opóźnienia, bez zależności od React.
- `src/WLAN/`, `src/codemirror-langs/` — assembler, gramatyki i obsługa języków.
- `src/i18n/` — pełne słowniki PL/EN i tłumaczenia bez Vue.
- `src/styles/` — zachowany SCSS oraz izolowane style komponentów przeniesione z SFC.
- `tests/` — testy regresji i `tests/e2e/`.

Pełna inwentaryzacja komponentów, decyzje dla każdej zależności i ograniczenia weryfikacji: [docs/MIGRATION_AUDIT.md](docs/MIGRATION_AUDIT.md).
