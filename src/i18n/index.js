import { createI18n } from 'vue-i18n';

const messages = {
  pl: {
    settings: {
      title: 'Ustawienia',
      actions: {
        close: 'Zamknij ustawienia',
        resetRegisters: 'Resetuj wartości rejestrów',
        defaultSettings: 'Przywróć domyślne ustawienia',
        commandList: 'Lista rozkazów',
        sendAllColors: '📡 Wyślij wszystkie kolory do ESP32',
      },
      theme: {
        light: 'Jasny',
        dark: 'Ciemny',
      },
      language: {
        label: 'Język interfejsu',
        pl: 'Polski',
        en: 'Angielski',
      },
      numberFormat: {
        label: 'Domyślny format liczb',
        options: {
          dec: 'DEC',
          hex: 'HEX',
          bin: 'BIN',
        },
      },
      decSigned: {
        label: 'Wyświetlanie DEC',
        options: {
          unsigned: 'Bez znaku',
          signed: 'U2 (ze znakiem)',
        },
        hint: 'U2 używa szerokości słowa {bits} bitów (np. 4027 → -69).',
      },
      bits: {
        codeLabel: 'Bity kodu:',
        codeHelp: 'Liczba bitów dla kodu rozkazu.',
        addressLabel: 'Bity adresu:',
        addressHelp: 'Liczba bitów dla argumentu.',
      },
      delays: {
        microLabel: 'Opóźnienie mikro-kroku (ms):',
        microHelp: 'Opóźnienie między mikro-operacjami w milisekundach.',
        stepLabel: 'Opóźnienie kroku automatycznego (ms):',
        stepHelp: 'Czas między kolejnymi krokami w trybie krokowym (cykle na sekundę = 1000/ms).',
      },
      extras: {
        heading: 'Dodatki:',
        labels: {
          xRegister: 'Rejestr X',
          yRegister: 'Rejestr Y',
          dl: 'DL',
          jamlExtras: 'Dodatki JAML',
          busConnectors: 'Łączniki magistrali',
          showInvisibleRegisters: 'Pokaż niewidoczne rejestry magistral',
        },
        groups: {
          io: {
            title: 'Urządzenia wejścia/wyjścia',
            rbRegister: 'Rejestr RB',
            gRegister: 'Rejestr G',
          },
          stack: {
            title: 'Obsługa stosu',
            wsRegister: 'Rejestr WS',
            wylsSignal: 'Sygnał wyls',
          },
          interrupts: {
            title: 'Przerwania',
            rzRegister: 'Rejestr RZ',
            rpRegister: 'Rejestr RP',
            rmRegister: 'Rejestr RM',
            apRegister: 'Rejestr AP',
            rintSignal: 'Sygnał rint',
            eniSignal: 'Sygnał eni',
          },
        },
      },
      editor: {
        heading: 'Edytor:',
        autocomplete: 'Auto-uzupełnianie (podpowiedzi)',
      },
      asm: {
        heading: 'Kompilacja ASM:',
        reset: 'Resetuj rejestry przy kompilacji',
        help: 'Po włączeniu rejestry i pamięć są czyszczone automatycznie przed kompilacją assemblera.',
      },
      colors: {
        heading: 'Kolory LED',
        signalLines: 'Linie sygnałowe',
        display: 'Wyświetlacz',
        bus: 'Magistrala',
      },
      colorPicker: {
        signalLine: 'Kolor linii sygnałowych',
        display: 'Kolor wyświetlacza',
        bus: 'Kolor magistrali',
      },
      people: {
        caregivers: 'Opiekunowie',
        creators: 'Twórcy',
      },
    },
    titles: {
      dr: 'Dr',
      drHab: 'Dr hab.',
      inz: 'inż.',
    },
    common: {
      social: {
        linkedin: 'LinkedIn',
        github: 'GitHub',
      },
      segmentedToggle: {
        aria: 'Przełącznik segmentowy',
      },
    },
    programEditor: {
      manualInstruction: "Aby uruchomić program, kliknij wybrany sygnał i naciśnij 'Wykonaj takt'",
      modeToggle: {
        manual: 'Tryb ręczny',
        program: 'Program',
      },
      nextLineTitle: 'Sygnały następnej linii:',
    },
    execution: {
      compileTitle: 'Skompiluj program',
      compile: 'Kompiluj',
      editTitle: 'Wróć do edycji',
      edit: 'Edytuj',
      stepTitle: 'Krok wykonania',
      stepManual: 'Wykonaj takt',
      stepAuto: 'Następny takt',
      runTitle: 'Uruchom program',
      run: 'Uruchom',
      stopTitle: 'Zatrzymaj wykonywanie',
      stop: 'Stop',
      runFastTitle: 'Uruchom całość (bez animacji)',
      runFast: 'Uruchom (bez animacji)',
      runningFast: 'Pracuję… {progress}%',
    },
    aiChat: {
      resetAria: 'Resetuj czat',
      closeAria: 'Zamknij czat',
      checking: 'Sprawdzam połączenie z modelem…',
      waking: 'Wybudzam model na Hugging Face…',
      senderAi: 'AI',
      senderUser: 'Ty',
      cancel: 'Anuluj odpowiedź',
      send: 'Wyślij',
      title: 'Asystent AI 🤖',
      placeholder: 'Wpisz wiadomość…',
      instruction: 'Opisz operację uzyskania kodu maszynowego:',
    },
    ioPanel: {
      title: 'Urządzenie zewnętrzne',
      inputLabel: 'Wejście (DEV_IN):',
      inputPlaceholder: 'Wpisz znak…',
      currentInput: 'Aktualny DEV_IN:',
      outputLabel: 'Wyjście (DEV_OUT):',
      statusLabel: 'Status (READY/G):',
      statusReady: 'READY',
      statusBusy: 'BUSY',
    },
    memory: {
      labelShort: 'Adr.',
      labelFull: 'Adres pamięci',
      value: 'Wartość',
      code: 'Kod',
      address: 'Adres',
      empty: 'EMPTY',
      outOfRange: 'Wartość {val} poza zakresem {min}..{max} (słowo {bits}-bitowe).',
    },
  },
  en: {
    settings: {
      title: 'Settings',
      actions: {
        close: 'Close settings',
        resetRegisters: 'Reset register values',
        defaultSettings: 'Restore default settings',
        commandList: 'Command list',
        sendAllColors: '📡 Send all colors to ESP32',
      },
      theme: {
        light: 'Light',
        dark: 'Dark',
      },
      language: {
        label: 'Interface language',
        pl: 'Polish',
        en: 'English',
      },
      numberFormat: {
        label: 'Default number format',
        options: {
          dec: 'DEC',
          hex: 'HEX',
          bin: 'BIN',
        },
      },
      decSigned: {
        label: 'DEC display',
        options: {
          unsigned: 'Unsigned',
          signed: "Two's complement (signed)",
        },
        hint: "Two's complement uses a word width of {bits} bits (e.g. 4027 → -69).",
      },
      bits: {
        codeLabel: 'Instruction bits:',
        codeHelp: 'Number of bits for the opcode.',
        addressLabel: 'Address bits:',
        addressHelp: 'Number of bits for the argument.',
      },
      delays: {
        microLabel: 'Micro-step delay (ms):',
        microHelp: 'Delay between micro-operations in milliseconds.',
        stepLabel: 'Auto-step delay (ms):',
        stepHelp: 'Time between subsequent steps in stepping mode (cycles per second = 1000/ms).',
      },
      extras: {
        heading: 'Extras:',
        labels: {
          xRegister: 'X register',
          yRegister: 'Y register',
          dl: 'DL',
          jamlExtras: 'JAML extras',
          busConnectors: 'Bus connectors',
          showInvisibleRegisters: 'Show hidden bus registers',
        },
        groups: {
          io: {
            title: 'Input/Output devices',
            rbRegister: 'RB register',
            gRegister: 'G register',
          },
          stack: {
            title: 'Stack handling',
            wsRegister: 'WS register',
            wylsSignal: 'wyls signal',
          },
          interrupts: {
            title: 'Interrupts',
            rzRegister: 'RZ register',
            rpRegister: 'RP register',
            rmRegister: 'RM register',
            apRegister: 'AP register',
            rintSignal: 'rint signal',
            eniSignal: 'eni signal',
          },
        },
      },
      editor: {
        heading: 'Editor:',
        autocomplete: 'Autocomplete (suggestions)',
      },
      asm: {
        heading: 'ASM compilation:',
        reset: 'Reset registers on compile',
        help: 'When enabled, registers and memory are cleared automatically before assembly.',
      },
      colors: {
        heading: 'LED colors',
        signalLines: 'Signal lines',
        display: 'Display',
        bus: 'Bus',
      },
      colorPicker: {
        signalLine: 'Signal line color',
        display: 'Display color',
        bus: 'Bus color',
      },
      people: {
        caregivers: 'Supervisors',
        creators: 'Authors',
      },
    },
    titles: {
      dr: 'PhD',
      drHab: 'Habilitated doctor',
      inz: 'Eng.',
    },
    common: {
      social: {
        linkedin: 'LinkedIn',
        github: 'GitHub',
      },
      segmentedToggle: {
        aria: 'Segmented toggle',
      },
    },
    programEditor: {
      manualInstruction: "To run the program, click a signal and press 'Execute step'",
      modeToggle: {
        manual: 'Manual mode',
        program: 'Program',
      },
      nextLineTitle: 'Signals of the next line:',
    },
    execution: {
      compileTitle: 'Compile program',
      compile: 'Compile',
      editTitle: 'Back to edit',
      edit: 'Edit',
      stepTitle: 'Step execution',
      stepManual: 'Execute step',
      stepAuto: 'Next step',
      runTitle: 'Run program',
      run: 'Run',
      stopTitle: 'Stop execution',
      stop: 'Stop',
      runFastTitle: 'Run all (no animation)',
      runFast: 'Run (no animation)',
      runningFast: 'Running… {progress}%',
    },
    aiChat: {
      resetAria: 'Reset chat',
      closeAria: 'Close chat',
      checking: 'Checking connection to the model…',
      waking: 'Waking the model on Hugging Face…',
      senderAi: 'AI',
      senderUser: 'You',
      cancel: 'Cancel response',
      send: 'Send',
      title: 'AI Assistant 🤖',
      placeholder: 'Type a message…',
      instruction: 'Describe the operation to obtain machine code:',
    },
    ioPanel: {
      title: 'External device',
      inputLabel: 'Input (DEV_IN):',
      inputPlaceholder: 'Type a character…',
      currentInput: 'Current DEV_IN:',
      outputLabel: 'Output (DEV_OUT):',
      statusLabel: 'Status (READY/G):',
      statusReady: 'READY',
      statusBusy: 'BUSY',
    },
    memory: {
      labelShort: 'Addr.',
      labelFull: 'Memory address',
      value: 'Value',
      code: 'Opcode',
      address: 'Address',
      empty: 'EMPTY',
      outOfRange: 'Value {val} is out of range {min}..{max} (word is {bits} bits).',
    },
  },
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
