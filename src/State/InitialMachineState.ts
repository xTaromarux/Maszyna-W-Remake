import type { Machine, MachineState } from '@/Types/Simulator';
import { commandList } from '../Shared/Utils/Data/Commands.js';
import { createLabCatalog, defaultLabId } from '../Shared/Utils/Data/Labs.js';
export function initialMachineState(this: Machine): MachineState {
  return {
    _skipNextBreakpoint: false,
    breakpointsEnabled: true,
    breakpoints: new Set(),
    _headless: false,
    isFastRunning: false,
    fastProgress: 0,
    _lastLogKey: null,
    _lastLogCount: 0,
    _lastLogTs: 0,
    platform: process.env.NEXT_PUBLIC_APP_PLATFORM || 'web',
    ws: null,
    wsStatus: 'disconnected', // 'connecting' | 'connected' | 'error'
    wsPingTimer: null,
    decSigned: false,
    _condState: null,
    _pendingStackWrite: null,
    _pendingStackRead: null,
    autocompleteEnabled: true,
    autoResetOnAsmCompile: true,
    isMobile: typeof window !== 'undefined' && window.innerWidth <= 768,
    suppressBroadcast: false,
    prevSignals: {},
    prevMem: [],
    addresBits: 4,
    codeBits: 6,
    JAML: 0,
    mem: [0b000001, 0b000010, 0b000100, 0b001000, 0b010001, 0b100010, 0b100100, 0b111000],
    programCounter: 0,

    X: 0,
    Y: 0,
    RB: 0,
    G: 0,
    RM: 0,
    AP: 0,
    RP: 0,
    RZ: 0,
    ACC: 0,
    I: 0,
    A: 0,
    S: 0,
    BusA: 0,
    BusS: 0,
    WS: 0,
    DEV_READY: 1,
    DEV_IN: 0,
    DEV_OUT: 0,
    DEV_BUSY: false,
    deviceOperationTimer: null,

    runLoopTimer: null,
    isRunning: false,

    // Internal stack for subroutines and data
    stack: [],

    code: 'czyt wys wei il;\nwyad wea;\nczyt wys weja dod weak wyl wea;',
    program: 'DOD 0',
    compiledCode: [],
    // Structured micro-program (preferred execution format)
    compiledProgram: [],
    activeInstrIndex: -1,
    activePhaseIndex: 0,
    activeLine: 0,
    nextLine: new Set(),
    _stepGuard: 0, // licznik anty-pętli
    // Array to store active timeout IDs for signal management
    activeTimeouts: [],

    // DEFAULT IS 100ms
    oddDelay: 400,
    stepDelay: 500, // Delay between auto steps in ms
    isAutoStepping: false,
    autoStepInterval: null,
    busHoldMs: 200,
    _busHoldTimers: { A: null, S: null },

    commandList: structuredClone(commandList),

    numberFormat: 'dec',
    registerFormats: {
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
    },

    signals: {
      as: false,
      sa: false,

      // PROGRAM COUNTER
      il: false,
      dl: false,
      wel: false,
      wyl: false,

      // BUSES
      busA: false,
      busS: false,

      // I
      wyad: false,
      wei: false,

      // JAML
      iak: false,
      dak: false,

      weak: false,
      weja: false,
      wyak: false,
      przep: false,

      dod: false,
      ode: false,
      mno: false,
      dziel: false,
      shr: false,
      shl: false,
      neg: false,
      lub: false,
      i: false,

      // MEMORY
      czyt: false,
      pisz: false,
      wea: false,
      wes: false,
      wys: false,

      // X
      wyx: false,
      wex: false,

      // Y
      wyy: false,
      wey: false,

      stop: false,

      wyws: false,
      iws: false,
      dws: false,
      werm: false,
      wyap: false,
      weap: false,
      wews: false,
      wyrm: false,
      wyrz: false,
      werz: false,
      wyrp: false,
      werp: false,
      wyls: false,
      wyg: false,
      werb: false,
      wyrb: false,
      rint: false,
      start: false,
      ustrm: false,
      czrm: false,
    },
    extras: this.getDefaultExtras(),
    logs: [],

    manualMode: true,
    codeCompiled: false,

    disappearBlour: false,
    blurHideTimer: null,
    settingsOpen: false,
    commandListOpen: false,
    aiChatOpen: false,
    labDialogOpen: false,
    selectedLabId: defaultLabId,
    labCatalog: createLabCatalog(),

    toast: {
      visible: false,
      message: '',
      type: 'warning',
    },
    toastTimer: null,

    lightMode: true,
    language: 'pl',

    consoleOpen: false,
    hasConsoleErrors: false,
  };
}
