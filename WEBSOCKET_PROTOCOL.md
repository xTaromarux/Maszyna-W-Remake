# WebSocket Protocol - Maszyna W

## Przegląd
Protokół komunikacji między interfejsem webowym a ESP32 przez WebSocket.

**Server:** `ws://localhost:8080` (lub IP ESP32)

---

## Formaty wiadomości

Wszystkie wiadomości są w formacie JSON.

### 1. **Signal Toggle** (Przełączanie sygnałów)

#### Web → ESP32 (wysyłanie stanu sygnału)
```json
{
  "type": "signal-toggle",
  "signal": "nazwa_sygnału",
  "state": true/false
}
```

**Przykład:**
```json
{
  "type": "signal-toggle",
  "signal": "czyt",
  "state": true
}
```

#### ESP32 → Web (naciśnięcie przycisku)
```json
{
  "type": "button_press",
  "buttonName": "nazwa_sygnału"
}
```

**Przykład:**
```json
{
  "type": "button_press",
  "buttonName": "czyt"
}
```

**Obsługa po stronie ESP32:**
1. Gdy przyjdzie `signal-toggle`, zaświeć/zgaś odpowiedni LED
2. Gdy użytkownik naciśnie przycisk, wyślij `button_press`
3. ESP32 automatycznie dostanie z powrotem `signal-toggle` z aktualnym stanem

---

### 2. **Memory Update** (Aktualizacja pamięci)

```json
{
  "type": "mem-update",
  "data": {
    "addrs": [0, 1, 2, 3],
    "args": ["ADR", "ADR", "ADR", "ADR"],
    "vals": [1, 2, 4, 8]
  }
}
```

---

### 3. **Register Update** (Aktualizacja rejestru)

```json
{
  "type": "reg-update",
  "field": "acc",
  "value": 42
}
```

**Pola:**
- `acc` - Akumulator
- `a` - Rejestr A
- `s` - Rejestr S
- `c` - Program Counter (Licznik)
- `i` - Rejestr rozkazów

---

### 4. **Color Update** (Sterowanie LED RGB)

```json
{
  "type": "color-update",
  "data": {
    "colorType": "active",
    "hex": "#FF5733",
    "r": 255,
    "g": 87,
    "b": 51,
    "brightness": 200,
    "timestamp": 1701876543210
  }
}
```

**Uwaga:** Po wysłaniu `color-update`, serwer automatycznie wysyła też `mem-update` z pełnymi danymi, aby ESP32 od razu zaktualizował wyświetlacze z nowymi kolorami LED.

---

### 5. **Ping/Pong** (Keep-alive)

#### Web → ESP32
```json
{
  "type": "ping",
  "t": 1701876543210
}
```

#### ESP32 → Web
```json
{
  "type": "pong",
  "t": 1701876543210
}
```

---

## Przepływ sygnałów

### Scenariusz 1: Użytkownik klika w interfejsie web

1. Web: `handleSignalToggle()` → zmienia `signals[name]` i `nextLine`
2. Web → Server: wysyła `signal-toggle` z aktualnym stanem
3. Server → ESP32: przekazuje `signal-toggle` 
4. **ESP32: Zaświeca/gasi LED odpowiadający sygnałowi**

### Scenariusz 2: Użytkownik naciska przycisk na ESP32

1. **ESP32 → Server:** wysyła `button_press` z nazwą sygnału
2. Server → Web: przekazuje `button_press`
3. Web: `handleRemoteToggleESPWebSocket()` → przełącza sygnał lokalnie
4. Web → Server: wysyła `signal-toggle` z nowym stanem
5. Server → ESP32: przekazuje `signal-toggle`
6. **ESP32: Zaświeca/gasi LED (synchronizacja)**

### Scenariusz 3: Wiele klientów (Multi-Web + ESP32)

1. Klient A: zmienia sygnał
2. Server → Wszyscy inni klienci: `signal-toggle`
3. Wszyscy klienci: aktualizują swój stan (w tym ESP32 LED)

### Scenariusz 4: Zmiana koloru LED

1. Web: Użytkownik zmienia kolor LED w ustawieniach
2. Web → Server: wysyła `color-update` z nowym kolorem
3. Server → ESP32: przekazuje `color-update`
4. **Web → Server:** automatycznie wysyła `mem-update` z pełnymi danymi
5. **Server → ESP32:** przekazuje `mem-update`
6. **ESP32: Aktualizuje kolor LED i od razu wyświetla wartości rejestrów z nowym kolorem**

---

## Implementacja ESP32

### Wymagane akcje:

```cpp
// Pseudo-kod dla ESP32

void onWebSocketMessage(String message) {
  JsonDocument doc;
  deserializeJson(doc, message);
  
  String type = doc["type"];
  
  if (type == "signal-toggle") {
    String signal = doc["signal"];
    bool state = doc["state"];
    
    // Zaświeć/zgaś odpowiedni LED
    setSignalLED(signal, state);
    
  } else if (type == "reg-update") {
    String field = doc["field"];
    int value = doc["value"];
    
    // Wyświetl wartość rejestru na wyświetlaczu
    updateRegisterDisplay(field, value);
    
  } else if (type == "mem-update") {
    // Zaktualizuj wyświetlacze pamięci i rejestrów
    updateMemoryDisplay(doc["data"]);
    
  } else if (type == "color-update") {
    // Ustaw nowy kolor dla LED RGB
    setRGBColor(doc["data"]);
    // Uwaga: Zaraz po tym przyjdzie mem-update z aktualnymi wartościami
    // więc LED od razu pokażą wartości z nowym kolorem
    
  } else if (type == "ping") {
    // Odpowiedz pongiem
    sendPong();
  }
}

void onButtonPress(String buttonName) {
  // Wyślij informację o naciśnięciu przycisku
  JsonDocument doc;
  doc["type"] = "button_press";
  doc["buttonName"] = buttonName;
  
  String json;
  serializeJson(doc, json);
  webSocket.sendTXT(json);
  
  // Uwaga: Nie zmieniaj stanu LED tutaj!
  // LED zmieni stan gdy przyjdzie signal-toggle z serwera
}
```

---

## Lista sygnałów

### Sygnały podstawowe (zawsze dostępne):
- `il`, `wyl`, `wel`, `dl` - Licznik programu
- `wyad`, `wei` - Rejestr rozkazów
- `wea`, `wes`, `wys` - Rejestry pamięci
- `czyt`, `pisz` - Operacje pamięci
- `przep`, `dod`, `ode` - ALU podstawowe
- `weja`, `weak`, `wyak` - Transfer danych
- `stop`, `start` - Sterowanie

### Sygnały opcjonalne (w zależności od konfiguracji):
- `as`, `sa` - Połączenia magistral (busConnectors)
- `wyx`, `wex` - Rejestr X (xRegister)
- `wyy`, `wey` - Rejestr Y (yRegister)
- `mno`, `dziel`, `shr`, `shl`, `neg`, `lub`, `i` - ALU rozszerzone (jamlExtras)
- `wyws`, `iws`, `dws`, `wyls` - Stos (stack)
- `wyg`, `werb`, `wyrb` - IO (io)
- `werz`, `wyrz`, `werp`, `wyrp`, `werm`, `wyrm`, `weap`, `wyap`, `ustrm`, `czrm` - Przerwania (interrupts)
- `rint`, `eni` - Sygnały przerwań dodatkowe (interrupts)

---

## Debugging

W konsoli JavaScript pojawią się logi:
- `[WS] Wysłano sygnał nazwa: ON/OFF` - Web wysyła stan
- `[ESP32] Przycisk nazwa: ON/OFF` - ESP32 nacisnął przycisk
- `[WS] Odebrano sygnał nazwa: ON/OFF` - Web otrzymał stan od innego klienta

---

## Status połączenia

Stan połączenia WebSocket dostępny w `wsStatus`:
- `"connecting"` - Łączenie
- `"connected"` - Połączono
- `"disconnected"` - Rozłączono
- `"error"` - Błąd

Widoczny w interfejsie TopBar jako wskaźnik koloru.
