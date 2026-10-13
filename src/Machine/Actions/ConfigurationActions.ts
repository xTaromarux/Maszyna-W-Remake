import type { ExtrasPatch, Machine, MachineActions } from '@/Machine/Types/Machine';
import { setLocale } from '../../I18n/Translator';

type Actions = Pick<
  MachineActions,
  | 'getMaxValueForRegister'
  | 'getDefaultExtras'
  | 'mergeExtras'
  | 'syncDocumentLanguage'
  | 'resizeMemory'
  | 'manualModeCheck'
  | 'manualModeUncheck'
  | 'manualModeChanged'
  | 'restoreDefaults'
>;

/** Existing configuration operations, bound to the machine by the store. */
export const configurationActions: Actions & ThisType<Machine> = {
  getMaxValueForRegister(registerType) {
    const type = String(registerType || '');
    const wordBits = this.codeBits + this.addresBits;
    const wordMax = (1 << wordBits) - 1;
    const addrMax = (1 << this.addresBits) - 1;
    const irqMax = 0x0f;

    if (['RM', 'RZ', 'RP'].includes(type)) {
      return irqMax;
    }
    if (['programCounter', 'L', 'A', 'AP', 'WS', 'BusA'].includes(type)) {
      return addrMax;
    }
    if (['I', 'S', 'ACC', 'AK', 'JAML', 'JAL', 'X', 'Y', 'RB', 'G', 'BusS', 'memory'].includes(type)) {
      return wordMax;
    }

    return wordMax;
  },

  getDefaultExtras() {
    return {
      xRegister: false,
      yRegister: false,
      io: { rbRegister: false, gRegister: false },
      stack: {
        wsRegister: false,
        wylsSignal: false,
      },
      interrupts: {
        rzRegister: false,
        rpRegister: false,
        rmRegister: false,
        apRegister: false,
        rintSignal: false,
        eniSignal: false,
      },
      dl: false,
      jamlExtras: false,
      busConnectors: false,
      showInvisibleRegisters: false,
    };
  },

  mergeExtras(current, patch) {
    const base = this.getDefaultExtras();
    const src: ExtrasPatch = current || {};
    const p: ExtrasPatch = patch || {};
    return {
      ...base,
      ...src,
      ...p,
      io: { ...base.io, ...(src.io || {}), ...(p.io || {}) },
      stack: { ...base.stack, ...(src.stack || {}), ...(p.stack || {}) },
      interrupts: { ...base.interrupts, ...(src.interrupts || {}), ...(p.interrupts || {}) },
    };
  },

  syncDocumentLanguage(lang) {
    const resolved = lang ?? this.language ?? 'pl';
    const applied = setLocale(resolved);
    document.documentElement.lang = applied || resolved;
  },

  resizeMemory() {
    const newSize = 1 << this.addresBits;
    const newMem = new Array(newSize).fill(0);

    // Set default values for the first 8 memory locations if memory is large enough
    const defaultValues = [0b000001, 0b000010, 0b000100, 0b001000, 0b010001, 0b100010, 0b100100, 0b111000];

    for (let i = 0; i < Math.min(defaultValues.length, newSize); i++) {
      newMem[i] = defaultValues[i];
    }

    this.mem = newMem;
  },

  manualModeCheck() {
    this.manualMode = true;
    this.manualModeChanged();
  },

  manualModeUncheck() {
    this.manualMode = false;
    this.manualModeChanged();
  },

  manualModeChanged() {
    // Clear any active timeouts when switching modes
    this.clearActiveTimeouts();

    this.nextLine.clear();

    if (this.manualMode) {
      this.uncompileCode();
      this.addLog(this.t('logs.manualModeEnabled'), 'system');
    }
  },

  restoreDefaults() {
    // Reset to default settings
    this.codeBits = 6;
    this.addresBits = 4;
    this.oddDelay = 100;
    this.numberFormat = 'dec';
    this.autoResetOnAsmCompile = true;
    this.registerFormats = {
      L: 'dec',
      I: 'dec',
      ACC: 'dec',
      A: 'dec',
      S: 'dec',
      X: 'dec',
      Y: 'dec',
      RB: 'dec',
      G: 'dec',
      RZ: 'dec',
      RP: 'dec',
      RM: 'dec',
      AP: 'dec',
      WS: 'dec',
      JAML: 'dec',
      BusA: 'dec',
      BusS: 'dec',
    };
    this.extras = this.getDefaultExtras();

    // Resize memory according to new settings
    this.resizeMemory();

    // Clear console logs
    this.logs = [];
    this.hasConsoleErrors = false;
    this.autocompleteEnabled = true;
    this.addLog(this.t('logs.settingsRestored'), 'system');
  },
};
