# WebSocket Protocol — Maszyna W

## Uruchamianie z Next.js

Lokalny serwer `server.cjs` przekazuje komunikaty między przeglądarkami i urządzeniami ESP32. Domyślnie nasłuchuje tylko na `ws://127.0.0.1:8080`.

W pierwszym terminalu:

```powershell
npm run serve:ws
```

W drugim terminalu uruchom interfejs Next.js z obsługą ESP:

```powershell
$env:NEXT_PUBLIC_WS_URL = 'ws://127.0.0.1:8080'
npm run dev:esp
```

Tryb `npm run dev` domyślnie działa jako symulator webowy bez automatycznego łączenia z WebSocket. Aby użyć wspólnego polecenia `npm run dev:ws`, ustaw wcześniej `NEXT_PUBLIC_APP_PLATFORM=esp`.

| Zmienna                    | Domyślna wartość      | Zastosowanie                                                               |
| -------------------------- | --------------------- | -------------------------------------------------------------------------- |
| `WS_HOST`                  | `127.0.0.1`           | Adres nasłuchiwania serwera Node.js.                                       |
| `WS_PORT`                  | `8080`                | Port serwera Node.js; `0` wybiera wolny port do testów.                    |
| `NEXT_PUBLIC_WS_URL`       | `ws://localhost:8080` | Adres połączenia klienta Next.js.                                          |
| `NEXT_PUBLIC_APP_PLATFORM` | `web`                 | Ustaw `esp`, aby interfejs łączył się z urządzeniem lub lokalnym serwerem. |

`WS_HOST` i `WS_PORT` są zmiennymi procesu serwera; `server.cjs` nie ładuje plików `.env`. Zmienne `NEXT_PUBLIC_*` można ustawić w środowisku lub w `.env.local`. Next.js zapisuje je w kodzie klienta podczas kompilacji, więc po zmianie adresu trzeba ponownie uruchomić tryb developerski lub wykonać build.

### Połączenie ESP32 przez sieć lokalną

Aby urządzenie w tej samej sieci mogło połączyć się z komputerem, jawnie włącz nasłuchiwanie LAN:

```powershell
$env:WS_HOST = '0.0.0.0'
$env:WS_PORT = '8080'
npm run serve:ws
```

ESP32 i zdalna przeglądarka łączą się z adresem komputera, np. `ws://192.168.1.20:8080`; `0.0.0.0` jest adresem nasłuchiwania, nie adresem klienta. Dla przeglądarki ustaw odpowiednio `NEXT_PUBLIC_WS_URL`. Jeśli firmware ESP32 sam udostępnia serwer WebSocket, wpisz adres urządzenia i pomiń lokalny przekaźnik. Strona działająca przez HTTPS wymaga połączenia `wss://`, np. przez terminujący TLS reverse proxy.

## Zasady przekazywania

Wiadomości aplikacji to obiekty JSON przesyłane jako tekstowe ramki WebSocket. Serwer przekazuje `signal-toggle`, `reg-update`, `mem-update`, `color-update` i `button_press` wszystkim pozostałym połączonym klientom. Nadawca nie otrzymuje własnej wiadomości. Treść pakietu pozostaje bez zmian.

Serwer odpowiada na `ping` bezpośrednio do nadawcy. Nie przekazuje `ping` ani `pong` innym klientom. Niepoprawny JSON, tablice, wartości proste i nieznane typy wiadomości są ignorowane bez zamykania połączenia.

Interfejs przeglądarkowy obsługuje przychodzące `signal-toggle` i `button_press` oraz ignoruje otrzymane `pong`. Rejestry, pamięć i kolory wysyła do urządzenia. Samo podłączenie dwóch przeglądarek nie synchronizuje wartości ich rejestrów ani pamięci.

## 1. Przełączanie sygnału

Przeglądarka wysyła stan sygnału:

```json
{ "type": "signal-toggle", "signal": "czyt", "state": true }
```

`state` jest wartością logiczną. ESP32 aktualizuje odpowiednią diodę, a pozostałe przeglądarki aktualizują stan sygnału i listę sygnałów następnego kroku.

Urządzenie wysyła naciśnięcie przycisku:

```json
{ "type": "button_press", "buttonName": "czyt" }
```

Przekaźnik dostarcza je do przeglądarki, która przełącza sygnał i wysyła `signal-toggle` z jego nowym stanem. ESP32 może wtedy zaktualizować diodę. Przy wielu aktywnych interfejsach każde z nich obsługuje przycisk osobno; serwer nie wybiera głównego symulatora.

## 2. Aktualizacja rejestru

```json
{ "type": "reg-update", "field": "acc", "value": 42 }
```

| Pole  | Znaczenie          |
| ----- | ------------------ |
| `acc` | Akumulator AK      |
| `a`   | Rejestr adresowy A |
| `s`   | Rejestr słowa S    |
| `c`   | Licznik programu L |
| `i`   | Rejestr rozkazów I |

Obserwacja stanu maszyny wysyła tym samym typem również zmiany sygnałów: `field` zawiera wtedy nazwę sygnału, np. `busS`, a `value` jest wartością logiczną. Firmware powinien odróżniać te pola od pól rejestrów.

## 3. Aktualizacja pamięci

```json
{
  "type": "mem-update",
  "data": {
    "addrs": [0, 1, 2, 3],
    "args": [1, 2, 4, 8],
    "vals": [1, 2, 4, 8]
  }
}
```

Interfejs wysyła pierwsze cztery komórki pamięci. `addrs` zawiera indeksy, `args` — liczbowe argumenty wyodrębnione z wartości komórek, a `vals` — całe słowa. Po połączeniu klient wysyła pełniejszy pakiet tego samego typu; `data` zawiera dodatkowo `acc`, `a`, `s`, `c` i `i`.

## 4. Kolor diod RGB

```json
{
  "type": "color-update",
  "data": {
    "colorType": "signal_line",
    "hex": "#FF5733",
    "r": 255,
    "g": 87,
    "b": 51,
    "brightness": 255,
    "timestamp": 1701876543210
  }
}
```

`colorType` przyjmuje w bieżącym interfejsie `signal_line`, `display` lub `bus`. Kanały RGB przekazywane przez interfejs uwzględniają wybraną jasność, a `brightness` jest liczbą w skali 0–255. Po `color-update` **klient webowy** wysyła także `mem-update` z pełnymi danymi rejestrów i czterech komórek. Serwer przekazuje oba pakiety; nie generuje drugiego pakietu samodzielnie.

## 5. Ping/Pong

Interfejs wysyła co 10 sekund:

```json
{ "type": "ping", "t": 1701876543210 }
```

Lokalny serwer odpowiada do tego klienta, zachowując `t`:

```json
{ "type": "pong", "t": 1701876543210 }
```

Przy bezpośrednim połączeniu do serwera na ESP32 taką odpowiedź realizuje firmware. To komunikaty JSON aplikacji, niezależne od kontrolnych ramek ping/pong protokołu WebSocket. Interfejs obecnie nie oblicza opóźnienia i nie rozłącza klienta z powodu braku odpowiedzi JSON.

## Dostępne sygnały

- Licznik i rejestr I: `il`, `wyl`, `wel`, `wyad`, `wei`; opcjonalnie `dl`.
- Pamięć: `wea`, `wes`, `wys`, `czyt`, `pisz`.
- ALU i transfer: `przep`, `dod`, `ode`, `weja`, `weak`, `wyak`; opcjonalnie `iak`, `dak`, `mno`, `dziel`, `shr`, `shl`, `neg`, `lub`, `i`.
- Łączniki magistral: `as`, `sa`.
- Rejestry X/Y: `wyx`, `wex`, `wyy`, `wey`.
- Stos: `wyws`, `wews`, `iws`, `dws`, `wyls`.
- Wejście/wyjście: `wyg`, `werb`, `wyrb`, `start`.
- Przerwania: `werz`, `wyrz`, `werp`, `wyrp`, `werm`, `wyrm`, `weap`, `wyap`, `ustrm`, `czrm`, `rint`, `eni`.
- Zatrzymanie: `stop`.

Dostępność sygnałów w interfejsie zależy od ustawień dodatków maszyny.

## Diagnostyka i testy

Wskaźnik w górnym pasku pokazuje `connecting`, `connected`, `disconnected` lub `error`. Konsola symulatora zapisuje połączenia, błędy i komunikaty sygnałów. Serwer wypisuje rzeczywisty adres dopiero po rozpoczęciu nasłuchiwania.

```powershell
npm test
```

`tests/websocket.test.ts` tworzy lokalny serwer na losowym porcie i dwa klienty. Sprawdza przekazywanie pakietów, brak echa, JSON ping/pong oraz obsługę błędnych wiadomości. Testy nie łączą się z urządzeniem ani z siecią zewnętrzną.
