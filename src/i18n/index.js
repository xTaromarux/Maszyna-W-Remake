import { createI18n } from 'vue-i18n';

const messages = {
  "pl": {
    "settings": {
      "title": "Ustawienia",
      "actions": {
        "close": "Zamknij ustawienia",
        "resetRegisters": "Resetuj wartości rejestrów",
        "defaultSettings": "Przywróć domyślne ustawienia",
        "commandList": "Lista rozkazów",
        "sendAllColors": "Wyślij wszystkie kolory do ESP32"
      },
      "theme": {
        "light": "Jasny",
        "dark": "Ciemny"
      },
      "language": {
        "label": "Język interfejsu",
        "pl": "Polski",
        "en": "Angielski"
      },
      "numberFormat": {
        "label": "Domyślny format liczb",
        "options": {
          "dec": "DEC",
          "hex": "HEX",
          "bin": "BIN"
        }
      },
      "decSigned": {
        "label": "Wyświetlanie DEC",
        "options": {
          "unsigned": "Bez znaku",
          "signed": "U2 (ze znakiem)"
        },
        "hint": "U2 używa szerokości słowa {bits} bitów (np. 4027 → -69)."
      },
      "bits": {
        "codeLabel": "Bity kodu:",
        "codeHelp": "Liczba bitów dla kodu rozkazu.",
        "addressLabel": "Bity adresu:",
        "addressHelp": "Liczba bitów dla argumentu."
      },
      "delays": {
        "microLabel": "Opóźnienie mikro-kroku (ms):",
        "microHelp": "Opóźnienie między mikro-operacjami w milisekundach.",
        "stepLabel": "Opóźnienie kroku automatycznego (ms):",
        "stepHelp": "Czas między kolejnymi krokami w trybie krokowym (cykle na sekundę = 1000/ms)."
      },
      "extras": {
        "heading": "Dodatki:",
        "labels": {
          "xRegister": "Rejestr X",
          "yRegister": "Rejestr Y",
          "dl": "DL",
          "jamlExtras": "Dodatki JAML",
          "busConnectors": "Łączniki magistrali",
          "showInvisibleRegisters": "Pokaż niewidoczne rejestry magistral"
        },
        "groups": {
          "io": {
            "title": "Urządzenia wejścia/wyjścia",
            "rbRegister": "Rejestr RB",
            "gRegister": "Rejestr G"
          },
          "stack": {
            "title": "Obsługa stosu",
            "wsRegister": "Rejestr WS",
            "wylsSignal": "Sygnał wyls"
          },
          "interrupts": {
            "title": "Przerwania",
            "rzRegister": "Rejestr RZ",
            "rpRegister": "Rejestr RP",
            "rmRegister": "Rejestr RM",
            "apRegister": "Rejestr AP",
            "rintSignal": "Sygnał rint",
            "eniSignal": "Sygnał eni"
          }
        }
      },
      "editor": {
        "heading": "Edytor:",
        "autocomplete": "Auto-uzupełnianie (podpowiedzi)"
      },
      "asm": {
        "heading": "Kompilacja ASM:",
        "reset": "Resetuj rejestry przy kompilacji",
        "help": "Po włączeniu rejestry i pamięć są czyszczone automatycznie przed kompilacją assemblera."
      },
      "colors": {
        "heading": "Kolory LED",
        "signalLines": "Linie sygnałowe",
        "display": "Wyświetlacz",
        "bus": "Magistrala"
      },
      "colorPicker": {
        "signalLine": "Kolor linii sygnałowych",
        "display": "Kolor wyświetlacza",
        "bus": "Kolor magistrali"
      },
      "people": {
        "caregivers": "Opiekunowie",
        "creators": "Twórcy"
      }
    },
    "titles": {
      "dr": "Dr",
      "drHab": "Dr hab.",
      "inz": "inż."
    },
    "common": {
      "social": {
        "linkedin": "LinkedIn",
        "github": "GitHub"
      },
      "segmentedToggle": {
        "aria": "Przełącznik segmentowy"
      },
      "validation": {
        "registerModulo": "Wartość {value} przekracza zakres rejestru (max {max}). Zapisano {result}."
      }
    },
    "programEditor": {
      "manualInstruction": "Aby uruchomić program, kliknij wybrany sygnał i naciśnij 'Wykonaj takt'",
      "modeToggle": {
        "manual": "Tryb ręczny",
        "program": "Program"
      },
      "nextLineTitle": "Sygnały następnej linii:",
      "breakpoints": {
        "disabled": "Breakpoints wylaczone",
        "add": "Dodaj breakpoint",
        "remove": "Usun breakpoint"
      }
    },
    "execution": {
      "compileTitle": "Skompiluj program",
      "compile": "Kompiluj",
      "editTitle": "Wróć do edycji",
      "edit": "Edytuj",
      "stepTitle": "Krok wykonania",
      "stepManual": "Wykonaj takt",
      "stepAuto": "Następny takt",
      "runTitle": "Uruchom program",
      "run": "Uruchom",
      "stopTitle": "Zatrzymaj wykonywanie",
      "stop": "Stop",
      "runFastTitle": "Uruchom całość (bez animacji)",
      "runFast": "Uruchom (bez animacji)",
      "runningFast": "Pracuję… {progress}%",
      "noCodeToCompile": "Brak kodu do kompilacji."
    },
    "aiChat": {
      "resetAria": "Resetuj czat",
      "closeAria": "Zamknij czat",
      "checking": "Sprawdzam połączenie z modelem…",
      "waking": "Wybudzam model na Hugging Face…",
      "senderAi": "AI",
      "senderUser": "Ty",
      "cancel": "Anuluj odpowiedź",
      "send": "Wyślij",
      "title": "Asystent AI 🤖",
      "placeholder": "Wpisz wiadomość…",
      "instruction": "Opisz operację uzyskania kodu maszynowego:",
      "suggestions": {
        "title": "Przyk??adowe pytania",
        "closeAria": "Ukryj propozycje",
        "items": {
          "whatIsW": "Co to jest maszyna W?",
          "addTwoNumbers": "Jak doda?? dwie liczby do siebie?",
          "firstProgram": "Poka?? prosty program startowy."
        }
      },
      "rateLimitExceeded": "Przekroczono limit zapytan.",
      "connectFailed": "Nie udalo sie polaczyc z modelem. {message}",
      "fetchFailed": "Nie udalo sie pobrac odpowiedzi od AI. {message}",
      "codeLabel": "kod",
      "copyCodeAria": "Skopiuj kod",
      "copyCode": "Kopiuj"
    },
    "ioPanel": {
      "title": "Urządzenie zewnętrzne",
      "inputLabel": "Wejście (DEV_IN):",
      "inputPlaceholder": "Wpisz znak…",
      "currentInput": "Aktualny DEV_IN:",
      "outputLabel": "Wyjście (DEV_OUT):",
      "statusLabel": "Status (READY/G):",
      "statusReady": "READY",
      "statusBusy": "BUSY"
    },
    "memory": {
      "labelShort": "Adr.",
      "labelFull": "Adres pamięci",
      "value": "Wartość",
      "code": "Kod",
      "address": "Adres",
      "empty": "EMPTY",
      "outOfRange": "Wartość {val} poza zakresem {min}..{max} (słowo {bits}-bitowe).",
      "sectionTitle": "Pamiec",
      "closeModal": "Zamknij modal",
      "cellLabel": "Pamiec[{index}]"
    },
    "commandList": {
      "title": "Lista rozkazów",
      "closeAria": "Zamknij listę rozkazów",
      "codePlaceholder": "Wpisz kod dla nowego rozkazu...",
      "deleteTitle": "Usuń rozkaz",
      "delete": "Usuń",
      "editTitle": "Edytuj treść rozkazu",
      "edit": "Edytuj",
      "saveTitle": "Zapisz zmiany",
      "save": "Zapisz",
      "confirmTitle": "Potwierdź zmianę nazwy",
      "confirm": "Potwierdź",
      "cancelTitle": "Anuluj edycję",
      "cancel": "Anuluj",
      "editNameTitle": "Edytuj nazwę rozkazu",
      "addTitle": "Dodaj nowy rozkaz",
      "add": "Dodaj",
      "loadTitle": "Wgraj listę rozkazów",
      "load": "Wgraj",
      "downloadTitle": "Pobierz listę rozkazów",
      "download": "Pobierz",
      "placeholder": {
        "editName": "Edytuj nazwę z \"{name}\"",
        "editCommand": "Edytuj rozkaz: {name}",
        "newName": "Nazwa nowego rozkazu"
      },
      "errors": {
        "notFound": "Błąd: nie znaleziono rozkazu do edycji",
        "emptyName": "Nazwa rozkazu nie może być pusta!",
        "duplicate": "Rozkaz o nazwie \"{name}\" już istnieje!",
        "limitReached": "Limit rozkazów osiągnięty",
        "loadFailed": "Błąd wczytywania listy",
        "duplicatesFound": "Nie można zapisać - znaleziono duplikaty nazw rozkazów: {names}"
      },
      "commandDescription": "Rozkaz {name}"
    },
    "console": {
      "title": "SYSTEM CONSOLE",
      "scrollTop": "Przewiń na początek",
      "scrollBottom": "Przewiń na koniec",
      "clear": "Wyczyść konsolę",
      "close": "Zamknij konsolę",
      "entryCount": "{count} wpisów",
      "detailCode": "Kod błędu:",
      "detailHint": "Podpowiedź:",
      "detailLocation": "Lokalizacja:",
      "detailContext": "Kontekst:",
      "detailOccurred": "Wystąpiło:",
      "locationValue": "Linia {line}, kolumna {column}",
      "unknownMessage": "Nieznana wiadomość"
    },
    "logs": {
      "breakpointsCleared": "Usunięto wszystkie breakpointy",
      "breakpoint": {
        "added": "Breakpoint dodany @{line}",
        "removed": "Breakpoint usunięty @{line}"
      },
      "wsReconnectFailed": "[WS] Reconnect failed",
      "stackPushAp": "Stos PUSH [{type}]: {value} (AP={ap}, WS={ws}, rozmiar={size})",
      "stackPush": "Stos PUSH [{type}]: {value} (WS={ws}, rozmiar={size})",
      "stackPopEmpty": "Stos POP: stos pusty!",
      "stackPopExpected": "Stos POP: oczekiwano {expected}, otrzymano {actual}!",
      "stackPopAp": "Stos POP [{type}]: {value} (AP={ap}, WS={ws}, rozmiar={size})",
      "stackPop": "Stos POP [{type}]: {value} (WS={ws}, rozmiar={size})",
      "programCompiledStructured": "Program skompilowany (strukturalny mikro-program).",
      "asmAutoReset": "Rejestry automatycznie zresetowane przed kompilacją assemblera.",
      "compileStart": "Kompiluję program...",
      "programCompiledWlan": "Program skompilowany pomyślnie przy użyciu systemu WLAN",
      "programUnlocked": "Program odblokowany do edycji",
      "compileMissingOpcode": "Nie znaleziono definicji rozkazu \"{name}\" w aktualnej liście rozkazów.",
      "compileOpcodeTooLarge": "Rozkaz \"{name}\" o indeksie {opcode} przekracza limit {maxOpcode} wynikający z {codeBits} bitów kodu.",
      "compileArgOutOfRange": "Argument {arg} instrukcji \"{name}\" wykracza poza zakres 0..{max} dla {addrBits} bitów adresu.",
      "compileError": "Błąd kompilacji: {message}",
      "compileHint": "Podpowiedź: {hint}",
      "memoryInitOutOfRange": "Adres poza zakresem pamięci przy inicjalizacji: {addr}",
      "memoryInitApplied": "Zastosowano inicjalizację pamięci ({count} wpisów)",
      "wsConnected": "[WS] Connected to server",
      "wsDisconnected": "[WS] Disconnected",
      "wsError": "[WS] Connection error",
      "wsInitFailed": "[WS] Init failed",
      "wsSignalReceived": "[WS] Odebrano sygnał {id}: {state}",
      "wsSignalSent": "[WS] Wysłano sygnał {signal}: {state}",
      "espButton": "[ESP32] Przycisk {button}: {state}",
      "manualModeEnabled": "Przejście w tryb ręczny – program wstrzymany i wyczyszczony.",
      "asmCompiled": "Kod skompilowany pomyślnie (mikro-ASM)",
      "asmCompileError": "Błąd kompilacji ASM: {message}",
      "handleInterruptNone": "handleInterrupt: brak aktywnego przerwania",
      "separator": "─────────────────────────────────────",
      "interruptStart": "PRZERWANIE IRQ{num}",
      "interruptRp": "   RP ← {num} (numer aktywnego przerwania)",
      "interruptStackSaved": "   Stos: zapisano PC={pc}, WS={ws}",
      "interruptVectorOob": "   Błąd: wektor {vector} poza programem!",
      "interruptALoad": "   A ← {a} (wskaźnik na wektor)",
      "interruptPcSet": "   PC ← {vector} (adres wektora IRQ{num})",
      "interruptExec": "   → Wykonanie: {line}",
      "interruptRzClear": "   RZ ← {rz} (wyzerowano IRQ{num})",
      "loopGuard": "Przerwano: przekroczono limit kroków (prawdopodobna pętla).",
      "codeFinished": "Kod zakończony",
      "breakpointPause": "Pauza na breakpoint @{line}",
      "jumpOob": "Skok poza zakres programu: PC={target}",
      "stopInstr": "STOP - program zatrzymany",
      "memoryClearedFromStack": "Wyczyszczono komórkę pamięci [{idx}] po zdjęciu ze stosu",
      "stoppedByUser": "Wykonanie przerwane przyciskiem STOP.",
      "runStepLimit": "Przerwano: limit kroków RUN osiągnięty.",
      "runFastLimit": "Przerwano: limit kroków RUN-FAST osiągnięty.",
      "rmSet": "RM ustawione na {rm} (maska przerwań) [BusS={busS}]",
      "rzSet": "RZ ustawione na {rz} (zgłoszenia przerwań)",
      "rpSet": "RP ustawione na {rp} (priorytet przerwania)",
      "rmBitSet": "Ustawiono bit {bit} w RM (RM={rm}) - zablokowano IRQ{irq}",
      "rmBitCleared": "Wyczyszczono bit {bit} w RM (RM={rm}) - odblokowano IRQ{irq}",
      "settingsRestored": "Ustawienia zostały przywrócone do wartości domyślnych",
      "consoleCleared": "Konsola została wyczyszczona",
      "systemInit": "System inicjalizowany",
      "lexError": "Wystąpił błąd leksykalny podczas parsowania",
      "compilerWarning": "Ostrzeżenie kompilatora",
      "criticalError": "Błąd krytyczny",
      "systemInitialized": "System zainicjalizowany.",
      "breakpointStatus": {
        "on": "ON",
        "off": "OFF"
      },
      "registersReset": "Rejestry zostaly zresetowane.",
      "labLoaded": "Zaladowano lab: {title}",
      "ledColorSent": "[ESP32] Wyslano kolor {type}: {hex} (R={r}, G={g}, B={b})",
      "mockUnusedLabel": "Etykieta \"start\" zostala zadeklarowana, ale nigdy nieuzyta.",
      "mockUnusedLabelHint": "Usun etykiete albo dodaj do niej odwolanie.",
      "mockCriticalMessage": "Wykryto niespojny stan systemu wykonywania.",
      "mockCriticalHint": "Zrestartuj program i sprawdz konfiguracje magistrali."
    },
    "actions": {
      "cancel": "Anuluj",
      "apply": "Zastosuj"
    },
    "errors": {
      "invalidNumber": "Blad: Nieprawidlowa liczba."
    },
    "consoleDock": {
      "breakpointsEnable": "Wlacz breakpointy",
      "breakpointsDisable": "Wylacz breakpointy (wygaszenie)",
      "breakpointsDisableAll": "Tymczasowo wylacz wszystkie breakpointy",
      "breakpointsClearAll": "Usun wszystkie breakpointy",
      "openConsole": "Kliknij, aby otworzyc konsole"
    },
    "topBar": {
      "wsStatusAria": "Status polaczenia z maszyna fizyczna",
      "openConsole": "Otworz konsole",
      "openChat": "Otworz czat AI",
      "openSettings": "Otworz ustawienia",
      "wsConnected": "Polaczono z maszyna fizyczna",
      "wsConnecting": "Laczenie...",
      "wsError": "Blad polaczenia z maszyna fizyczna",
      "wsDisconnected": "Brak polaczenia z maszyna fizyczna",
      "wsConnectedTitle": "Polaczenie aktywne - kliknij, aby odswiezyc.",
      "wsConnectingTitle": "Laczenie... - kliknij, aby sprobowac ponownie.",
      "wsErrorTitle": "Blad - kliknij, aby ponowic polaczenie.",
      "wsDisconnectedTitle": "Nie polaczono - kliknij, aby polaczyc."
    },
    "labs": {
      "chooseButton": "Wybierz lab",
      "dialog": {
        "aria": "Okno wyboru labu",
        "title": "Wybierz lab",
        "closeAria": "Zamknij okno wyboru labu",
        "outcomesTitle": "Czego nauczysz sie na tym labie",
        "pythonOverview": "Pythonowy overview",
        "asmMapping": "Mapowanie na ASM",
        "load": "Zaladuj lab"
      },
      "catalog": {
        "fibonacci": {
          "title": "Lab 1: Ciag Fibonacciego",
          "description": "Translacja petli Pythona na adresowanie tablicy i iteracyjne wyliczanie kolejnych elementow.",
          "outcomes": {
            "memoryIndexing": "adresowanie elementow tablicy przez wskaznik",
            "iterativeFlow": "organizacja petli i warunku zakonczenia",
            "resultExport": "przygotowanie wyniku do wyjscia"
          }
        },
        "arrayMin": {
          "title": "Lab 2: Minimum tablicy",
          "description": "Wyszukiwanie najmniejszej wartosci z wykorzystaniem porownan i skokow warunkowych.",
          "outcomes": {
            "comparisonLogic": "porownywanie elementu z aktualnym minimum",
            "pointerAdvance": "przesuwanie wskaznika po tablicy",
            "stateReset": "resetowanie stanu po przejsciu tablicy"
          }
        },
        "powerAdvanced": {
          "title": "Lab 3: Potegowanie a^b (zaawansowane)",
          "description": "Program wykorzystuje petle oraz operacje na stosie do budowy bardziej zlozonego przeplywu.",
          "outcomes": {
            "stackOps": "uzycie DNS/PZS/PWR w praktyce",
            "nestedLoops": "koordynacja petli zagniezdzonych",
            "compoundComputation": "realizacja potegowania bez instrukcji wysokiego poziomu"
          }
        },
        "gcd": {
          "title": "Lab 4: NWD dwoch liczb",
          "description": "Implementacja algorytmu Euklidesa przez odejmowanie i petle while.",
          "outcomes": {
            "whileMapping": "mapowanie warunku while na SOM/SOZ/SOB",
            "branchingUpdate": "aktualizacja jednej z dwoch zmiennych",
            "terminationCheck": "detekcja warunku zakonczenia programu"
          }
        },
        "arraySum": {
          "title": "Lab 5: Sumowanie tablicy",
          "description": "Przejscie po tablicy i akumulacja sumy elementow w dedykowanej zmiennej.",
          "outcomes": {
            "accumulation": "sumowanie elementow krok po kroku",
            "indexAddressing": "obliczanie adresu biezacego elementu",
            "loopBoundaries": "kontrola poczatku i konca petli"
          }
        },
        "factorial": {
          "title": "Lab 6: Silnia",
          "description": "Mapowanie schematu while i *= na mnozenie oraz inkrementacje licznika.",
          "outcomes": {
            "loopCondition": "realizacja warunku i <= n",
            "multiplicativeState": "aktualizacja wyniku przez MNO",
            "counterProgress": "inkrementacja i i przejscie do kolejnej iteracji"
          }
        },
        "inputFilterMo": {
          "title": "Lab 7: Filtr znakow po 4 znakach '$'",
          "description": "Program czyta wejscie, filtruje znaki i po czwartej '$' wypisuje liczebnosci M i O. Uwaga: oryginal z artykulu byl oznaczony jako potencjalnie buggy.",
          "outcomes": {
            "inputHandling": "obsluga wejscia przez WPR i warunki",
            "charFiltering": "filtrowanie znakow z przedzialu i licznikow",
            "formattedOutput": "wypisanie wynikow w uporzadkowanej formie"
          }
        },
        "interrupts": {
          "title": "Lab 8: Program z przerwaniami",
          "description": "Scenariusz ASM z obsluga przerwan 1-4 oraz maskowaniem i odmierzaniem licznikow wyjscia.",
          "outcomes": {
            "irqMasking": "uzycie CZM/MAS/MSK do sterowania maska",
            "irqHandlers": "organizacja procedur P1-P4",
            "stackRecovery": "zapis i odtwarzanie kontekstu przez DNS/PZS/PWR"
          }
        }
      }
    },
    "signals": {
      "conflict": "Nie mozna wlaczyc \"{signal}\" - koliduje z \"{other}\".",
      "conflictBusA": "Nie mozna wlaczyc \"{signal}\" - koliduje z \"{other}\" (magistrala A zajeta).",
      "conflictBusS": "Nie mozna wlaczyc \"{signal}\" - koliduje z \"{other}\" (magistrala S zajeta).",
      "conflictJaml": "Nie mozna wlaczyc \"{signal}\" - juz dziala \"{other}\" (maks. jedna operacja JAML naraz)."
    },
    "colorPicker": {
      "colorBrightness": "Jasnosc koloru",
      "ledBrightness": "Jasnosc LED (skaluje hex)"
    },
    "colorPickerPopup": {
      "brightness": "Jasnosc"
    },
    "registers": {
      "invalid": "Blad",
      "names": {
        "AK": "Akumulator",
        "X": "Rejestr X",
        "Y": "Rejestr Y",
        "I": "Rejestr I (adresowy)",
        "L": "Licznik",
        "S": "Rejestr S",
        "A": "Rejestr A",
        "JAML": "Rejestr JAL",
        "JAL": "Rejestr JAL",
        "RZ": "Rejestr zgloszen przerwan",
        "RP": "Rejestr priorytetow przerwan",
        "AP": "Rejestr adresu przerwania",
        "RM": "Rejestr maski przerwan",
        "G": "Rejestr gotowosci urzadzenia",
        "RB": "Rejestr bufora urzadzenia",
        "WS": "Wskaznik stosu"
      }
    },
    "wlan": {
      "error": {
        "location": "linia {line}, kolumna {col}",
        "hintPrefix": "Podpowiedz"
      },
      "lexer": {
        "unknownChar": "Nieznany znak: \"{char}\".",
        "unknownCharHint": "Usun albo zamien niedozwolony znak."
      },
      "microGenerator": {
        "sobNoAddress": "SOB wymaga docelowego adresu.",
        "sobBadAddress": "SOB wskazuje nieprawidlowy adres: {targetAddress}.",
        "emptyExecList": "Lista wykonywalnych rozkazow jest pusta.",
        "missingTemplate": "Brak szablonu mikrooperacji dla rozkazu \"{name}\".",
        "missingTemplateHint": "Sprawdz liste rozkazow i definicje mikrooperacji."
      },
      "parser": {
        "addressOutOfRange": "{context}: adres {value} jest poza zakresem.",
        "addressRangeHint": "Dozwolony zakres adresu: {min}..{max}.",
        "dataOutOfRange": "{context}: wartosc {value} jest poza zakresem danych.",
        "dataRangeHint": "Dozwolony zakres danych: {min}..{max}.",
        "arityExact": "Rozkaz \"{name}\" wymaga dokladnie {argsMin} argumentow, podano {count}.",
        "arityRange": "Rozkaz \"{name}\" wymaga {argsMin}..{argsMax} argumentow, podano {count}.",
        "arityHint": "Sprawdz skladnie rozkazu \"{name}\".",
        "noCommandList": "Brak listy rozkazow do parsowania.",
        "unexpectedEofOperand": "Nieoczekiwany koniec pliku podczas odczytu argumentu.",
        "expectedLabelAfterAt": "Oczekiwano etykiety po znaku \"@\".",
        "cannotParseNumber": "Nie mozna sparsowac liczby: \"{text}\".",
        "supportedFormats": "Obslugiwane formaty: dziesietny, 0xHEX, 0bBIN.",
        "unexpectedTokenInOperand": "Nieoczekiwany token w argumencie: {type} \"{text}\".",
        "allowedOperand": "Dozwolone argumenty: liczba, etykieta lub @etykieta.",
        "unexpectedTokenAtInstructionStart": "Nieoczekiwany token na poczatku instrukcji: {type} \"{text}\".",
        "expectedInstructionAfterLabel": "Po etykiecie oczekiwano instrukcji.",
        "commaWithoutOperand": "Nieoczekiwany przecinek bez argumentu.",
        "commaWithoutOperandHint": "Dodaj argument przed przecinkiem.",
        "trailingComma": "Koncowy przecinek bez kolejnego argumentu.",
        "trailingCommaHint": "Usun przecinek albo dopisz argument.",
        "unexpectedTokenAfterOperand": "Nieoczekiwany token po argumencie: {type} \"{text}\".",
        "separateArgsWithCommas": "Oddzielaj argumenty przecinkami.",
        "undefinedLabel": "Niezdefiniowana etykieta: \"{name}\".",
        "undefinedLabelHint": "Upewnij sie, ze etykieta zostala wczesniej zadeklarowana.",
        "duplicateLabel": "Zduplikowana etykieta: \"{name}\".",
        "duplicateLabelHint": "Kazda etykieta musi miec unikalna nazwe.",
        "unknownMnemonic": "Nieznany mnemonik: \"{name}\".",
        "unknownMnemonicHint": "Sprawdz pisownie albo dodaj rozkaz do listy.",
        "unsupportedMemoryDecl": "Nieobslugiwana deklaracja pamieci: \"{name}\".",
        "orgNeedsImmediateOrKnownLabel": "ORG wymaga liczby bezposredniej lub znanej etykiety.",
        "orgNeedsImmediateOrKnownLabelHint": "Uzyj liczby albo etykiety zdefiniowanej wczesniej.",
        "unsupportedDirective": "Nieobslugiwana dyrektywa: \"{name}\".",
        "unsupportedCommandType": "Nieobslugiwany typ rozkazu: \"{kind}\".",
        "instructionContext": "Instrukcja \"{name}\"",
        "jumpNeedsOneAddressArg": "Skok \"{name}\" wymaga dokladnie jednego argumentu adresowego.",
        "jumpSyntaxHint": "Poprawna skladnia: {name} <adres>."
      }
    }
  },
  "en": {
    "settings": {
      "title": "Settings",
      "actions": {
        "close": "Close settings",
        "resetRegisters": "Reset register values",
        "defaultSettings": "Restore default settings",
        "commandList": "Command list",
        "sendAllColors": "📡 Send all colors to ESP32"
      },
      "theme": {
        "light": "Light",
        "dark": "Dark"
      },
      "language": {
        "label": "Interface language",
        "pl": "Polish",
        "en": "English"
      },
      "numberFormat": {
        "label": "Default number format",
        "options": {
          "dec": "DEC",
          "hex": "HEX",
          "bin": "BIN"
        }
      },
      "decSigned": {
        "label": "DEC display",
        "options": {
          "unsigned": "Unsigned",
          "signed": "Two's complement (signed)"
        },
        "hint": "Two's complement uses a word width of {bits} bits (e.g. 4027 → -69)."
      },
      "bits": {
        "codeLabel": "Instruction bits:",
        "codeHelp": "Number of bits for the opcode.",
        "addressLabel": "Address bits:",
        "addressHelp": "Number of bits for the argument."
      },
      "delays": {
        "microLabel": "Micro-step delay (ms):",
        "microHelp": "Delay between micro-operations in milliseconds.",
        "stepLabel": "Auto-step delay (ms):",
        "stepHelp": "Time between subsequent steps in stepping mode (cycles per second = 1000/ms)."
      },
      "extras": {
        "heading": "Extras:",
        "labels": {
          "xRegister": "X register",
          "yRegister": "Y register",
          "dl": "DL",
          "jamlExtras": "JAML extras",
          "busConnectors": "Bus connectors",
          "showInvisibleRegisters": "Show hidden bus registers"
        },
        "groups": {
          "io": {
            "title": "Input/Output devices",
            "rbRegister": "RB register",
            "gRegister": "G register"
          },
          "stack": {
            "title": "Stack handling",
            "wsRegister": "WS register",
            "wylsSignal": "wyls signal"
          },
          "interrupts": {
            "title": "Interrupts",
            "rzRegister": "RZ register",
            "rpRegister": "RP register",
            "rmRegister": "RM register",
            "apRegister": "AP register",
            "rintSignal": "rint signal",
            "eniSignal": "eni signal"
          }
        }
      },
      "editor": {
        "heading": "Editor:",
        "autocomplete": "Autocomplete (suggestions)"
      },
      "asm": {
        "heading": "ASM compilation:",
        "reset": "Reset registers on compile",
        "help": "When enabled, registers and memory are cleared automatically before assembly."
      },
      "colors": {
        "heading": "LED colors",
        "signalLines": "Signal lines",
        "display": "Display",
        "bus": "Bus"
      },
      "colorPicker": {
        "signalLine": "Signal line color",
        "display": "Display color",
        "bus": "Bus color"
      },
      "people": {
        "caregivers": "Supervisors",
        "creators": "Authors"
      }
    },
    "titles": {
      "dr": "PhD",
      "drHab": "Habilitated doctor",
      "inz": "Eng."
    },
    "common": {
      "social": {
        "linkedin": "LinkedIn",
        "github": "GitHub"
      },
      "segmentedToggle": {
        "aria": "Segmented toggle"
      },
      "validation": {
        "registerModulo": "Value {value} exceeds the range of register (max {max}). Stored {result}."
      }
    },
    "programEditor": {
      "manualInstruction": "To run the program, click a signal and press 'Execute step'",
      "modeToggle": {
        "manual": "Manual mode",
        "program": "Program"
      },
      "nextLineTitle": "Signals of the next line:",
      "breakpoints": {
        "disabled": "Breakpoints disabled",
        "add": "Add breakpoint",
        "remove": "Remove breakpoint"
      }
    },
    "execution": {
      "compileTitle": "Compile program",
      "compile": "Compile",
      "editTitle": "Back to edit",
      "edit": "Edit",
      "stepTitle": "Step execution",
      "stepManual": "Execute step",
      "stepAuto": "Next step",
      "runTitle": "Run program",
      "run": "Run",
      "stopTitle": "Stop execution",
      "stop": "Stop",
      "runFastTitle": "Run all (no animation)",
      "runFast": "Run (no animation)",
      "runningFast": "Running… {progress}%",
      "noCodeToCompile": "No code to compile."
    },
    "aiChat": {
      "resetAria": "Reset chat",
      "closeAria": "Close chat",
      "checking": "Checking connection to the model…",
      "waking": "Waking the model on Hugging Face…",
      "senderAi": "AI",
      "senderUser": "You",
      "cancel": "Cancel response",
      "send": "Send",
      "title": "AI Assistant 🤖",
      "placeholder": "Type a message…",
      "instruction": "Describe the operation to obtain machine code:",
      "suggestions": {
        "title": "Example prompts",
        "closeAria": "Hide suggestions",
        "items": {
          "whatIsW": "What is the W machine?",
          "addTwoNumbers": "How do I add two numbers together?",
          "firstProgram": "Show a simple starter program."
        }
      },
      "rateLimitExceeded": "Request limit exceeded.",
      "connectFailed": "Could not connect to the model. {message}",
      "fetchFailed": "Could not fetch a response from AI. {message}",
      "codeLabel": "code",
      "copyCodeAria": "Copy code",
      "copyCode": "Copy"
    },
    "ioPanel": {
      "title": "External device",
      "inputLabel": "Input (DEV_IN):",
      "inputPlaceholder": "Type a character…",
      "currentInput": "Current DEV_IN:",
      "outputLabel": "Output (DEV_OUT):",
      "statusLabel": "Status (READY/G):",
      "statusReady": "READY",
      "statusBusy": "BUSY"
    },
    "memory": {
      "labelShort": "Addr.",
      "labelFull": "Memory address",
      "value": "Value",
      "code": "Opcode",
      "address": "Address",
      "empty": "EMPTY",
      "outOfRange": "Value {val} is out of range {min}..{max} (word is {bits} bits).",
      "sectionTitle": "Memory",
      "closeModal": "Close modal",
      "cellLabel": "Memory[{index}]"
    },
    "commandList": {
      "title": "Command list",
      "closeAria": "Close command list",
      "codePlaceholder": "Enter code for the new command...",
      "deleteTitle": "Delete command",
      "delete": "Delete",
      "editTitle": "Edit command content",
      "edit": "Edit",
      "saveTitle": "Save changes",
      "save": "Save",
      "confirmTitle": "Confirm name change",
      "confirm": "Confirm",
      "cancelTitle": "Cancel edit",
      "cancel": "Cancel",
      "editNameTitle": "Edit command name",
      "addTitle": "Add new command",
      "add": "Add",
      "loadTitle": "Load command list",
      "load": "Load",
      "downloadTitle": "Download command list",
      "download": "Download",
      "placeholder": {
        "editName": "Edit name from \"{name}\"",
        "editCommand": "Edit command: {name}",
        "newName": "New command name"
      },
      "errors": {
        "notFound": "Error: command to edit not found",
        "emptyName": "Command name cannot be empty!",
        "duplicate": "A command named \"{name}\" already exists!",
        "limitReached": "Command limit reached",
        "loadFailed": "Failed to load list",
        "duplicatesFound": "Cannot save - duplicate command names found: {names}"
      },
      "commandDescription": "Command {name}"
    },
    "console": {
      "title": "SYSTEM CONSOLE",
      "scrollTop": "Scroll to top",
      "scrollBottom": "Scroll to bottom",
      "clear": "Clear console",
      "close": "Close console",
      "entryCount": "{count} entries",
      "detailCode": "Error Code:",
      "detailHint": "Hint:",
      "detailLocation": "Location:",
      "detailContext": "Context:",
      "detailOccurred": "Occurred:",
      "locationValue": "Line {line}, Column {column}",
      "unknownMessage": "Unknown message"
    },
    "logs": {
      "breakpointsCleared": "Removed all breakpoints",
      "breakpoint": {
        "added": "Breakpoint added @{line}",
        "removed": "Breakpoint removed @{line}"
      },
      "wsReconnectFailed": "[WS] Reconnect failed",
      "stackPushAp": "Stack PUSH [{type}]: {value} (AP={ap}, WS={ws}, size={size})",
      "stackPush": "Stack PUSH [{type}]: {value} (WS={ws}, size={size})",
      "stackPopEmpty": "Stack POP: stack empty!",
      "stackPopExpected": "Stack POP: expected {expected}, got {actual}!",
      "stackPopAp": "Stack POP [{type}]: {value} (AP={ap}, WS={ws}, size={size})",
      "stackPop": "Stack POP [{type}]: {value} (WS={ws}, size={size})",
      "programCompiledStructured": "Program compiled (structured micro-program).",
      "asmAutoReset": "Registers automatically reset before ASM compilation.",
      "compileStart": "Compiling program...",
      "programCompiledWlan": "Program compiled successfully using the WLAN system",
      "programUnlocked": "Program unlocked for editing",
      "compileMissingOpcode": "No definition found for instruction \"{name}\" in the current command list.",
      "compileOpcodeTooLarge": "Instruction \"{name}\" with index {opcode} exceeds the {maxOpcode} limit from {codeBits} opcode bits.",
      "compileArgOutOfRange": "Argument {arg} of instruction \"{name}\" is out of range 0..{max} for {addrBits} address bits.",
      "compileError": "Compile error: {message}",
      "compileHint": "Hint: {hint}",
      "memoryInitOutOfRange": "Address out of memory range during init: {addr}",
      "memoryInitApplied": "Applied memory initialization ({count} entries)",
      "wsConnected": "[WS] Connected to server",
      "wsDisconnected": "[WS] Disconnected",
      "wsError": "[WS] Connection error",
      "wsInitFailed": "[WS] Init failed",
      "wsSignalReceived": "[WS] Received signal {id}: {state}",
      "wsSignalSent": "[WS] Sent signal {signal}: {state}",
      "espButton": "[ESP32] Button {button}: {state}",
      "manualModeEnabled": "Switched to manual mode – program paused and cleared.",
      "asmCompiled": "Code compiled successfully (micro-ASM)",
      "asmCompileError": "ASM compile error: {message}",
      "handleInterruptNone": "handleInterrupt: no active interrupt",
      "separator": "─────────────────────────────────────",
      "interruptStart": "INTERRUPT IRQ{num}",
      "interruptRp": "   RP ← {num} (active interrupt number)",
      "interruptStackSaved": "   Stack: saved PC={pc}, WS={ws}",
      "interruptVectorOob": "   Error: vector {vector} out of program range!",
      "interruptALoad": "   A ← {a} (pointer to vector)",
      "interruptPcSet": "   PC ← {vector} (IRQ{num} vector address)",
      "interruptExec": "   → Executing: {line}",
      "interruptRzClear": "   RZ ← {rz} (cleared IRQ{num})",
      "loopGuard": "Stopped: step limit exceeded (possible loop).",
      "codeFinished": "Code finished",
      "breakpointPause": "Paused at breakpoint @{line}",
      "jumpOob": "Jump out of program range: PC={target}",
      "stopInstr": "STOP - program halted",
      "memoryClearedFromStack": "Cleared memory cell [{idx}] after stack pop",
      "stoppedByUser": "Execution stopped by STOP button.",
      "runStepLimit": "Stopped: RUN step limit reached.",
      "runFastLimit": "Stopped: RUN-FAST step limit reached.",
      "rmSet": "RM set to {rm} (interrupt mask) [BusS={busS}]",
      "rzSet": "RZ set to {rz} (interrupt requests)",
      "rpSet": "RP set to {rp} (interrupt priority)",
      "rmBitSet": "Set bit {bit} in RM (RM={rm}) - blocked IRQ{irq}",
      "rmBitCleared": "Cleared bit {bit} in RM (RM={rm}) - unblocked IRQ{irq}",
      "settingsRestored": "Settings restored to defaults",
      "consoleCleared": "Console cleared",
      "systemInit": "System initializing",
      "lexError": "Lexical error occurred during parsing",
      "compilerWarning": "Compiler warning",
      "criticalError": "Critical error",
      "systemInitialized": "System initialized.",
      "breakpointStatus": {
        "on": "ON",
        "off": "OFF"
      },
      "registersReset": "Registers were reset.",
      "labLoaded": "Loaded lab: {title}",
      "ledColorSent": "[ESP32] Sent color {type}: {hex} (R={r}, G={g}, B={b})",
      "mockUnusedLabel": "Label \"start\" was declared but never used.",
      "mockUnusedLabelHint": "Remove the label or add a reference to it.",
      "mockCriticalMessage": "Detected inconsistent execution-system state.",
      "mockCriticalHint": "Restart the program and verify bus configuration."
    },
    "actions": {
      "cancel": "Cancel",
      "apply": "Apply"
    },
    "errors": {
      "invalidNumber": "Error: Invalid number."
    },
    "consoleDock": {
      "breakpointsEnable": "Enable breakpoints",
      "breakpointsDisable": "Disable breakpoints (dim)",
      "breakpointsDisableAll": "Temporarily disable all breakpoints",
      "breakpointsClearAll": "Clear all breakpoints",
      "openConsole": "Click to open console"
    },
    "topBar": {
      "wsStatusAria": "Physical machine connection status",
      "openConsole": "Open console",
      "openChat": "Open AI chat",
      "openSettings": "Open settings",
      "wsConnected": "Connected to physical machine",
      "wsConnecting": "Connecting...",
      "wsError": "Physical machine connection error",
      "wsDisconnected": "Disconnected from physical machine",
      "wsConnectedTitle": "Connection active - click to refresh.",
      "wsConnectingTitle": "Connecting... - click to retry.",
      "wsErrorTitle": "Error - click to reconnect.",
      "wsDisconnectedTitle": "Disconnected - click to connect."
    },
    "labs": {
      "chooseButton": "Choose lab",
      "dialog": {
        "aria": "Lab selection dialog",
        "title": "Choose lab",
        "closeAria": "Close lab selection dialog",
        "outcomesTitle": "What you will learn in this lab",
        "pythonOverview": "Python overview",
        "asmMapping": "ASM mapping",
        "load": "Load lab"
      },
      "catalog": {
        "fibonacci": {
          "title": "Lab 1: Fibonacci sequence",
          "description": "Translate Python loop logic into array indexing and iterative sequence generation.",
          "outcomes": {
            "memoryIndexing": "indexing array elements through an address pointer",
            "iterativeFlow": "structuring loop flow and termination condition",
            "resultExport": "preparing and exporting the final result"
          }
        },
        "arrayMin": {
          "title": "Lab 2: Array minimum",
          "description": "Find the smallest element using comparisons and conditional branches.",
          "outcomes": {
            "comparisonLogic": "comparing each element against current minimum",
            "pointerAdvance": "advancing a pointer through array memory",
            "stateReset": "resetting state after a full scan"
          }
        },
        "powerAdvanced": {
          "title": "Lab 3: Power a^b (advanced)",
          "description": "Uses loops and stack operations to implement a more complex execution flow.",
          "outcomes": {
            "stackOps": "practical use of DNS/PZS/PWR instructions",
            "nestedLoops": "coordinating nested loop stages",
            "compoundComputation": "building exponentiation without high-level operators"
          }
        },
        "gcd": {
          "title": "Lab 4: GCD of two numbers",
          "description": "Implements Euclid algorithm with subtraction and while-style looping.",
          "outcomes": {
            "whileMapping": "mapping while condition to SOM/SOZ/SOB control flow",
            "branchingUpdate": "updating one of two values after comparison",
            "terminationCheck": "detecting algorithm termination correctly"
          }
        },
        "arraySum": {
          "title": "Lab 5: Array sum",
          "description": "Walk through an array and accumulate all items in a running sum.",
          "outcomes": {
            "accumulation": "step-by-step accumulation in a dedicated variable",
            "indexAddressing": "computing current element address from index",
            "loopBoundaries": "controlling loop start and end boundaries"
          }
        },
        "factorial": {
          "title": "Lab 6: Factorial",
          "description": "Maps while and *= semantics into multiplication plus counter increments.",
          "outcomes": {
            "loopCondition": "implementing i <= n condition in ASM flow",
            "multiplicativeState": "updating result with MNO in each iteration",
            "counterProgress": "incrementing i and advancing iterations"
          }
        },
        "inputFilterMo": {
          "title": "Lab 7: Input filter after 4 '$' chars",
          "description": "Reads input stream, filters characters, and outputs counts for M and O. Note: the paper marks the original variant as potentially buggy.",
          "outcomes": {
            "inputHandling": "processing input with WPR and branch checks",
            "charFiltering": "filtering symbol ranges and counters",
            "formattedOutput": "printing final output in a structured format"
          }
        },
        "interrupts": {
          "title": "Lab 8: Interrupt-driven program",
          "description": "ASM scenario with IRQ 1-4 handlers, masking, and controlled output counters.",
          "outcomes": {
            "irqMasking": "using CZM/MAS/MSK to control interrupt masks",
            "irqHandlers": "structuring interrupt procedures P1-P4",
            "stackRecovery": "saving and restoring context with DNS/PZS/PWR"
          }
        }
      }
    },
    "signals": {
      "conflict": "Cannot enable \"{signal}\" - it conflicts with \"{other}\".",
      "conflictBusA": "Cannot enable \"{signal}\" - it conflicts with \"{other}\" (A bus is busy).",
      "conflictBusS": "Cannot enable \"{signal}\" - it conflicts with \"{other}\" (S bus is busy).",
      "conflictJaml": "Cannot enable \"{signal}\" - \"{other}\" is already active (max one JAML operation at a time)."
    },
    "colorPicker": {
      "colorBrightness": "Color brightness",
      "ledBrightness": "LED brightness (hex scaling)"
    },
    "colorPickerPopup": {
      "brightness": "Brightness"
    },
    "registers": {
      "invalid": "Error",
      "names": {
        "AK": "Accumulator",
        "X": "X Register",
        "Y": "Y Register",
        "I": "I Register (address)",
        "L": "Counter",
        "S": "S Register",
        "A": "A Register",
        "JAML": "JAL Register",
        "JAL": "JAL Register",
        "RZ": "Interrupt request register",
        "RP": "Interrupt priority register",
        "AP": "Interrupt address register",
        "RM": "Interrupt mask register",
        "G": "Device ready register",
        "RB": "Device buffer register",
        "WS": "Stack pointer"
      }
    },
    "wlan": {
      "error": {
        "location": "line {line}, column {col}",
        "hintPrefix": "Hint"
      },
      "lexer": {
        "unknownChar": "Unknown character: \"{char}\".",
        "unknownCharHint": "Remove or replace the unsupported character."
      },
      "microGenerator": {
        "sobNoAddress": "SOB requires a target address.",
        "sobBadAddress": "SOB points to an invalid address: {targetAddress}.",
        "emptyExecList": "Executable command list is empty.",
        "missingTemplate": "Missing micro-operation template for instruction \"{name}\".",
        "missingTemplateHint": "Check command list and micro-operation definition."
      },
      "parser": {
        "addressOutOfRange": "{context}: address {value} is out of range.",
        "addressRangeHint": "Allowed address range: {min}..{max}.",
        "dataOutOfRange": "{context}: value {value} is out of data range.",
        "dataRangeHint": "Allowed data range: {min}..{max}.",
        "arityExact": "Instruction \"{name}\" expects exactly {argsMin} operands, got {count}.",
        "arityRange": "Instruction \"{name}\" expects {argsMin}..{argsMax} operands, got {count}.",
        "arityHint": "Check syntax for instruction \"{name}\".",
        "noCommandList": "Missing command list for parser.",
        "unexpectedEofOperand": "Unexpected end of input while reading operand.",
        "expectedLabelAfterAt": "Expected a label after \"@\".",
        "cannotParseNumber": "Cannot parse number: \"{text}\".",
        "supportedFormats": "Supported formats: decimal, 0xHEX, 0bBIN.",
        "unexpectedTokenInOperand": "Unexpected token in operand: {type} \"{text}\".",
        "allowedOperand": "Allowed operands: number, label, or @label.",
        "unexpectedTokenAtInstructionStart": "Unexpected token at instruction start: {type} \"{text}\".",
        "expectedInstructionAfterLabel": "Expected an instruction after label.",
        "commaWithoutOperand": "Unexpected comma without an operand.",
        "commaWithoutOperandHint": "Add an operand before the comma.",
        "trailingComma": "Trailing comma without a following operand.",
        "trailingCommaHint": "Remove the comma or add another operand.",
        "unexpectedTokenAfterOperand": "Unexpected token after operand: {type} \"{text}\".",
        "separateArgsWithCommas": "Separate operands with commas.",
        "undefinedLabel": "Undefined label: \"{name}\".",
        "undefinedLabelHint": "Ensure the label is declared earlier.",
        "duplicateLabel": "Duplicate label: \"{name}\".",
        "duplicateLabelHint": "Each label must have a unique name.",
        "unknownMnemonic": "Unknown mnemonic: \"{name}\".",
        "unknownMnemonicHint": "Check spelling or add the command to the list.",
        "unsupportedMemoryDecl": "Unsupported memory declaration: \"{name}\".",
        "orgNeedsImmediateOrKnownLabel": "ORG requires an immediate value or a known label.",
        "orgNeedsImmediateOrKnownLabelHint": "Use a number or a previously defined label.",
        "unsupportedDirective": "Unsupported directive: \"{name}\".",
        "unsupportedCommandType": "Unsupported command type: \"{kind}\".",
        "instructionContext": "Instruction \"{name}\"",
        "jumpNeedsOneAddressArg": "Jump \"{name}\" requires exactly one address operand.",
        "jumpSyntaxHint": "Valid syntax: {name} <address>."
      }
    }
  }
};

export const i18n = createI18n({
  legacy: true,
  globalInjection: true,
  locale: 'pl',
  fallbackLocale: 'en',
  messages,
});

export function setLocale(locale) {
  const supported = Object.keys(messages);
  const target = supported.includes(locale) ? locale : i18n.global.fallbackLocale || supported[0] || 'en';
  i18n.global.locale = target;
  return target;
}

export function translate(key, params) {
  return i18n.global.t(key, params);
}
