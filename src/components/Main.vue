<template>
  <TopBar
    @open-chat="aiChatOpen = true"
    @open-settings="settingsOpen = true"
    @toggle-console="toggleConsole"
    @ws-reconnect="reconnectWS"
    :hasConsoleErrors="hasConsoleErrors"
    :ws-status="wsStatus"
  />

  <div id="wLayout">
    <MaszynaW
      :manual-mode="manualMode"
      :signals="signals"
      :dec-signed="decSigned"
      :programCounter="programCounter"
      :formatNumber="formatNumber"
      :registerFormats="registerFormats"
      :extras="extras"
      :BusA="BusA"
      :BusS="BusS"
      :I="I"
      :ACC="ACC"
      :JAML="JAML"
      :A="A"
      :S="S"
      :mem="mem"
      :X="X"
      :Y="Y"
      :RB="RB"
      :G="G"
      :RZ="RZ"
      :RP="RP"
      :RM="RM"
      :AP="AP"
      :WS="WS"
      :rz-inputs="RZInputs"
      :word-bits="codeBits + addresBits"
      :decToCommand="decToCommand"
      :decToArgument="decToArgument"
      @clickItem="handleSignalToggle"
      @update:programCounter="programCounter = $event"
      @update:I="I = $event"
      @update:ACC="ACC = $event"
      @update:JAML="JAML = $event"
      @update:A="A = $event"
      @update:S="S = $event"
      @update:mem="mem = $event"
      @update:X="X = $event"
      @update:Y="Y = $event"
      @update:RB="RB = $event"
      @update:G="G = $event"
      @update:RZ="RZ = $event"
      @update:rz-inputs="RZInputs = $event"
      @update:RP="RP = $event"
      @update:RM="RM = $event"
      @update:AP="AP = $event"
      @update:WS="WS = $event"
      @update:number-format="({ field, value }) => (registerFormats[field] = value)"
    />

    <div id="inputs">
      <ProgramEditor
        :manual-mode="manualMode"
        :code-compiled="codeCompiled"
        :code="code"
        :compiled-code="compiledCode"
        :active-line="activeLine"
        :next-line="nextLine"
        :show-io="extras?.io?.rbRegister"
        :dev-in="DEV_IN"
        :dev-out="DEV_OUT"
        :dev-ready="DEV_READY"
        :word-bits="codeBits + addresBits"
        :format-number="formatNumber"
        :breakpoints="breakpoints"
        :breakpoints-enabled="breakpointsEnabled"
        @toggle-breakpoint="toggleBreakpoint"
        @setManualMode="(flag) => (flag ? manualModeCheck() : manualModeUncheck())"
        @update:code="(code) => (this.code = code)"
        @update:devIn="
          (v) => {
            DEV_IN = v;
            DEV_READY = v ? 0 : 1;
          }
        "
        @update:devReady="
          (v) => {
            DEV_READY = v;
          }
        "
      />
      <ExecutionControls
        :manual-mode="manualMode"
        :code-compiled="codeCompiled"
        :code="code"
        :is-running="isRunning"
        :is-fast-running="isFastRunning"
        :fast-progress="fastProgress"
        @compile="compileCode"
        @edit="uncompileCode"
        @step="executeLine"
        @run-fast="runToEndFast"
        @run="runCode"
        @stop="stopRun"
      />
    </div>

    <ProgramSection
      :manualMode="manualMode"
      :commandList="commandList"
      :program="program"
      :code-bits="codeBits"
      :addres-bits="addresBits"
      :autocompleteEnabled="autocompleteEnabled"
      :auto-reset-on-asm-compile="autoResetOnAsmCompile"
      @update:code="handleProgramSectionCompile($event)"
      @log="addLog($event.message, $event.class, $event.error)"
      @initMemory="applyInitMemory($event)"
      @reset-registers="handleAsmAutoReset"
    />

    <ConsoleDock
      :logs="logs.slice().reverse()"
      :manual-mode="manualMode"
      :code-compiled="codeCompiled"
      :code="code"
      :is-running="isRunning"
      :is-fast-running="isFastRunning"
      :fast-progress="fastProgress"
      :breakpoints-enabled="breakpointsEnabled"
      :console-open="consoleOpen"
      :has-console-errors="hasConsoleErrors"
      @compile="compileCode"
      @edit="uncompileCode"
      @step="executeLine"
      @run="runCode"
      @run-fast="runToEndFast"
      @stop="stopRun"
      @close="closeConsole"
      @clear="clearConsole"
      @open="toggleConsole"
      @update:breakpointsEnabled="breakpointsEnabled = $event"
      @disable-all-breakpoints="breakpointsEnabled = false"
      @clear-breakpoints="
        (() => {
          breakpoints.clear();
          breakpoints = new Set(breakpoints);
          addLog('Usunięto wszystkie breakpointy', 'system');
        })()
      "
      :class="{ 'console-collapsed': !consoleOpen }"
    />

    <!-- Console indicator - visible only when console is collapsed -->
    <div
      v-if="!consoleOpen"
      class="console-indicator"
      :class="{ 'has-errors': hasConsoleErrors }"
      @click="toggleConsole"
      title="Click to open console"
    />

    <div v-if="disappearBlour" @click="closePopups" :class="{ show: anyPopupOpen, hide: !anyPopupOpen }" id="popupsBackdrop" />

    <SettingsOverlay
      :settings-open="settingsOpen"
      :is-mobile="isMobile"
      :light-mode="lightMode"
      :language="language"
      :number-format="numberFormat"
      :code-bits="codeBits"
      :addres-bits="addresBits"
      :dec-signed="decSigned"
      :odd-delay="oddDelay"
      :step-delay="stepDelay"
      :extras="extras"
      :autocomplete-enabled="autocompleteEnabled"
      :auto-reset-on-asm-compile="autoResetOnAsmCompile"
      @close="closePopups('settingsOpen')"
      @update:lightMode="lightMode = $event"
      @update:language="language = $event"
      @update:numberFormat="numberFormat = $event"
      @update:decSigned="decSigned = $event"
      @update:codeBits="codeBits = $event"
      @update:addresBits="addresBits = $event"
      @update:oddDelay="oddDelay = $event"
      @update:stepDelay="stepDelay = $event"
      @update:extras="(patch) => (extras = mergeExtras(extras, patch))"
      @resetValues="resetValues()"
      @defaultSettings="restoreDefaults()"
      @open-command-list="openCommandList()"
      @open-lab-dialog="openLabDialog()"
      @update:autocompleteEnabled="autocompleteEnabled = $event"
      @update:autoResetOnAsmCompile="autoResetOnAsmCompile = $event"
      @color-change="sendColorToESP"
    />

    <LabCatalogDialog
      :visible="labDialogOpen"
      :labs="labCatalog"
      :selected-lab-id="selectedLabId"
      @close="closeLabDialog()"
      @select-lab="selectLab($event)"
      @load-lab="loadSelectedLab()"
    />

    <CommandList
      :visible="commandListOpen"
      :commandList="commandList"
      :codeBits="codeBits"
      @update:commandList="commandList = $event"
      @close="closePopups('commandListOpen')"
    />

    <AiChat
      :visible="aiChatOpen"
      @close="closePopups('aiChatOpen')"
      :title="$t('aiChat.title')"
      :placeholder="$t('aiChat.placeholder')"
      :instruction="$t('aiChat.instruction')"
    />
  </div>

  <div v-if="toast.visible" class="app-toast" role="status" aria-live="polite">
    {{ toast.message }}
  </div>
</template>

<script>
import MaszynaW from '@/components/MaszynaW.vue';
import CommandList from './CommandList.vue';
import ProgramSection from './InstructionsEditor/ProgramSection.vue';
import CounterComponent from '@/components/CounterComponent.vue';
import BusSignal from '@/components/BusSignal.vue';
import SignalButton from '@/components/SignalButton.vue';
import MemorySection from '@/components/MemorySection.vue';
import CalcSection from '@/components/CalcSection.vue';
import RegisterISection from '@/components/RegisterISection.vue';
import XRegisterSection from '@/components/XRegisterSection.vue';
import YRegisterSection from '@/components/YRegisterSection.vue';
import TopBar from '@/components/UI/TopBar.vue';
import AiChat from '@/components/AiChat.vue';
import ConsoleDock from '@/components/Console/ConsoleDock.vue';
import SettingsOverlay from '@/components/Settings/SettingsOverlay.vue';
import LabCatalogDialog from '@/components/Settings/LabCatalogDialog.vue';
import ExecutionControls from './MicroInstructionsEdtior/ExecutionControls.vue';
import ProgramEditor from './MicroInstructionsEdtior/ProgramEditor.vue';
import { commandList } from '@/utils/data/commands.js';
import { setLocale } from '@/i18n';
import { mainMicroInstructionExecutionMethods } from './microInstructions/microInstructionExecutionMethods';

const LAB_ASM_STUB = Array.from({ length: 11 }, (_, idx) => `DOD ${idx}`).join('\n');

export default {
  name: 'MainComponent',

  components: {
    MaszynaW,
    CommandList,
    ProgramSection,
    CounterComponent,
    BusSignal,
    SignalButton,
    MemorySection,
    CalcSection,
    RegisterISection,
    XRegisterSection,
    YRegisterSection,
    TopBar,
    AiChat,
    ConsoleDock,
    SettingsOverlay,
    LabCatalogDialog,
    ExecutionControls,
    ProgramEditor,
  },

  computed: {
    anyPopupOpen() {
      return this.commandListOpen || this.aiChatOpen || this.settingsOpen;
    },

    selectedLab() {
      return this.labCatalog.find((lab) => lab.id === this.selectedLabId) || this.labCatalog[0] || null;
    },

    rint() {
      const active = this.RZ & ~this.RM;
      return active !== 0;
    },

    highestPriorityIRQ() {
      const active = this.RZ & ~this.RM;
      if (!active) return null;

      for (let i = 3; i >= 0; i--) {
        if (active & (1 << i)) {
          return i + 1;
        }
      }
      return null;
    },
  },

  created() {
    this.ws = null;
  },

  provide() {
    return {
      showToast: (message, options) => this.showToast(message, options),
      getMaxValueForRegister: (registerType) => this.getMaxValueForRegister(registerType),
    };
  },

  data() {
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
      platform: import.meta.env.VITE_APP_PLATFORM,
      ws: null,
      wsStatus: 'disconnected', // 'connecting' | 'connected' | 'error'
      wsPingTimer: null,
      decSigned: false,
      _condState: null,
      _pendingMemoryClear: null,
      autocompleteEnabled: true,
      autoResetOnAsmCompile: true,
      isMobile: window.innerWidth <= 768,
      suppressBroadcast: false,
      prevSignals: {},
      prevMem: [],
      addresBits: 4,
      codeBits: 6,
      JAML: 0,
      mem: [0b000001, 0b000010, 0b000100, 0b001000, 0b010001, 0b100010, 0b100100, 0b111000],
      programCounter: 0,
      JAML: 0,
      RZInputs: [0, 0, 0, 0],

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

      commandList,

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
      settingsOpen: false,
      commandListOpen: false,
      aiChatOpen: false,
      labDialogOpen: false,
      selectedLabId: 'lab-add-intro',
      labCatalog: [
        {
          id: 'lab-add-intro',
          title: 'Lab 1: Podstawy dodawania',
          description: 'Poznasz najprostszy przeplyw danych dla dodawania i sposob mapowania logiki na kroki ASM.',
          outcomes: ['jak czytac wartosci z pamieci', 'jak wykonac operacje DOD', 'jak obserwowac wynik i stan rejestrow'],
          pythonOverview: `def run(memory):\n    a = memory[0]\n    b = memory[1]\n    result = a + b\n    return result`,
          asmStub: LAB_ASM_STUB,
        },
        {
          id: 'lab-loop-counter',
          title: 'Lab 2: Licznik w petli',
          description: 'Lab pokazuje jak aktualizowac licznik i jak przygotowac grunt pod petle sterowana warunkiem.',
          outcomes: ['praca na liczniku', 'aktualizacja stanu po kazdym kroku', 'przygotowanie do skokow warunkowych'],
          pythonOverview: `def run(limit):\n    counter = 0\n    while counter < limit:\n        counter += 1\n    return counter`,
          asmStub: LAB_ASM_STUB,
        },
        {
          id: 'lab-branching',
          title: 'Lab 3: Warunek i rozgalezienie',
          description: 'Zobaczysz jak w praktyce wyglada decyzja warunkowa i jakie zachowanie chcemy uzyskac w ASM.',
          outcomes: ['porownanie wartosci', 'wybor jednej z dwoch sciezek', 'analiza efektu warunku'],
          pythonOverview: `def run(value):\n    if value == 0:\n        return "zero"\n    return "non-zero"`,
          asmStub: LAB_ASM_STUB,
        },
      ],

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
  },
  methods: {
    ...mainMicroInstructionExecutionMethods,
    showToast(message, options = {}) {
      if (!message) return;
      const { type = 'warning', duration = 2400 } = options || {};
      this.toast.message = message;
      this.toast.type = type;
      this.toast.visible = true;

      if (this.toastTimer) {
        clearTimeout(this.toastTimer);
        this.toastTimer = null;
      }

      this.toastTimer = setTimeout(() => {
        this.toast.visible = false;
      }, duration);
    },
    getMaxValueForRegister(registerType) {
      const type = String(registerType || '');
      const wordBits = this.codeBits + this.addresBits;
      const wordMax = (1 << wordBits) - 1;
      const addrMax = (1 << this.addresBits) - 1;
      const irqMax = 0x0f;

      if (['RM', 'RZ', 'RP'].includes(type)) return irqMax;
      if (['programCounter', 'L', 'I', 'A', 'S', 'AP', 'WS', 'BusA'].includes(type)) return addrMax;
      if (['ACC', 'AK', 'JAML', 'JAL', 'X', 'Y', 'RB', 'G', 'BusS', 'memory'].includes(type)) return wordMax;

      return wordMax;
    },
    toggleBreakpoint(lineIdx) {
      if (typeof lineIdx !== 'number') return;
      if (this.breakpoints.has(lineIdx)) this.breakpoints.delete(lineIdx);
      else this.breakpoints.add(lineIdx);
      this.addLog(`Breakpoint ${this.breakpoints.has(lineIdx) ? 'dodany' : 'usunięty'} @${lineIdx}`, 'system');
    },
    _shouldPauseOnBreakpoint(nextSrcLine) {
      return this.isRunning && Number.isFinite(nextSrcLine) && this.breakpoints.has(nextSrcLine);
    },
    reconnectWS() {
      try {
        if (this.ws) {
          try {
            this.ws.close();
          } catch (_) {}
          this.ws = null;
        }
        this.wsStatus = 'connecting';
        setTimeout(() => this.initWebsocket(), 150);
      } catch (e) {
        this.wsStatus = 'error';
        this.addLog('[WS] Reconnect failed', 'Error', { message: String(e) });
      }
    },

    holdBus(which) {
      // 'A' lub 'S'
      const key = which === 'A' ? 'busA' : 'busS';
      this.signals[key] = true;
      const slot = which === 'A' ? 'A' : 'S';
      if (this._busHoldTimers[slot]) clearTimeout(this._busHoldTimers[slot]);
      this._busHoldTimers[slot] = setTimeout(() => {
        this.signals[key] = false;
        this._busHoldTimers[slot] = null;
      }, this.busHoldMs);
    },

    toSigned(value, bits) {
      const mod = 1 << bits;
      const mask = mod - 1;
      const sign = 1 << (bits - 1);
      const v = value & mask;
      return v & sign ? v - mod : v;
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
      const src = current || {};
      const p = patch || {};
      return {
        ...base,
        ...src,
        ...p,
        io: { ...base.io, ...(src.io || {}), ...(p.io || {}) },
        stack: { ...base.stack, ...(src.stack || {}), ...(p.stack || {}) },
        interrupts: { ...base.interrupts, ...(src.interrupts || {}), ...(p.interrupts || {}) },
      };
    },

    to8(v) {
      return v & 0xff;
    },

    // Dynamic word size masking based on machine word size (codeBits + addresBits)
    toWord(v) {
      return v & this.wordMask();
    },

    // Dynamic word mask based on actual machine word size (codeBits + addresBits)
    wordMask() {
      return (1 << (this.codeBits + this.addresBits)) - 1;
    },

    addrMask() {
      return (1 << this.addresBits) - 1;
    },

    updateAP() {
      const addressEntries = this.stack.filter((item) => item.type === 'Address');
      if (addressEntries.length > 0) {
        this.AP = addressEntries[addressEntries.length - 1].value;
      } else {
        this.AP = 0;
      }
    },

    stackPush(type, value) {
      // type: 'Data' | 'Address' zastanawiam się czy rozdzielać to programowo w taki sposób czy to jest bardziej problem programisty implementującego assembler...
      // w razie W będzie łatwe do zmiany
      const entry = { type, value: value & this.wordMask() };
      this.stack.push(entry);
      console.log('Stack PUSH:', entry, 'New stack:', this.stack);

      if (type === 'Address') {
        this.updateAP();
        this.addLog(`Stos PUSH [${type}]: ${value} (AP=${this.AP}, WS=${this.WS}, rozmiar=${this.stack.length})`, 'stos');
      } else {
        this.addLog(`Stos PUSH [${type}]: ${value} (WS=${this.WS}, rozmiar=${this.stack.length})`, 'stos');
      }
    },

    stackPop(expectedType) {
      // expectedType: 'Data' | 'Address' | null
      if (this.stack.length === 0) {
        this.addLog(`Stos POP: stos pusty!`, 'Błąd');
        return 0;
      }

      const entry = this.stack.pop();

      if (expectedType && entry.type !== expectedType) {
        this.addLog(`Stos POP: oczekiwano ${expectedType}, otrzymano ${entry.type}!`, 'Ostrzeżenie');
      }

      if (entry.type === 'Address') {
        this.updateAP();
        this.addLog(`Stos POP [${entry.type}]: ${entry.value} (AP=${this.AP}, WS=${this.WS}, rozmiar=${this.stack.length})`, 'stos');
      } else {
        this.addLog(`Stos POP [${entry.type}]: ${entry.value} (WS=${this.WS}, rozmiar=${this.stack.length})`, 'stos');
      }

      return entry.value;
    },

    handleProgramSectionCompile(payload) {
      // Accept both legacy string and structured payload from ProgramSection
      if (typeof payload === 'string') {
        this.code = payload;
        this.compiledCode = payload
          .split('\n')
          .map((l) => l.replace(/;\s*$/, ''))
          .filter((l) => l.trim() !== '');
        this.compiledProgram = [];
        this.codeCompiled = true;
        this.activeLine = -1;
        this.activeInstrIndex = -1;
        this.activePhaseIndex = 0;
        this.nextLine.clear();
        return;
      }

      const { text, program } = payload || {};
      if (typeof text === 'string') {
        this.code = text;
        this.compiledCode = text
          .split('\n')
          .map((l) => l.replace(/;\s*$/, ''))
          .filter((l) => l.trim() !== '');
      }
      this.compiledProgram = Array.isArray(program) ? program : [];
      this.codeCompiled = true;
      this.activeLine = -1;
      this.activeInstrIndex = -1;
      this.activePhaseIndex = 0;
      this.nextLine.clear();
      this.addLog('Program skompilowany (strukturalny mikro‑program).', 'kompilator rozkazów');
    },

    handleAsmAutoReset() {
      if (!this.autoResetOnAsmCompile) return;
      this.resetValues({
        resetLogs: false,
        logMessage: this.$t('logs.asmAutoReset'),
      });
    },

    applyInitMemory(assignments) {
      // assignments: Array<{ addr:number, val:number }>
      const size = 1 << this.addresBits;
      const nextMem = new Array(size).fill(0);

      for (let i = 0; i < Math.min(this.mem.length, size); i++) nextMem[i] = this.mem[i];
      const mask = this.wordMask();
      for (const { addr, val } of assignments) {
        if (addr >= 0 && addr < size) {
          nextMem[addr] = val & mask;
        } else {
          this.addLog(`Adres poza zakresem pamięci przy inicjalizacji: ${addr}`, 'Error');
        }
      }
      this.mem = nextMem;
      this.addLog(`Zastosowano inicjalizację pamięci (${assignments.length} wpisów)`, 'system');
    },

    initWebsocket() {
      try {
        this.wsStatus = 'connecting';
        this.ws = new WebSocket('ws://localhost:8080'); // lub IP ESP32
        this.ws.binaryType = 'arraybuffer';

        this.ws.addEventListener('open', () => {
          this.wsStatus = 'connected';
          this.addLog('[WS] Connected to server', 'system');
          this.sendFullDataToESP();

          // prosty ping, by utrzymać i weryfikować połączenie
          this.wsPingTimer && clearInterval(this.wsPingTimer);
          this.wsPingTimer = setInterval(() => {
            if (this.ws?.readyState === WebSocket.OPEN) {
              this.ws.send(JSON.stringify({ type: 'ping', t: Date.now() }));
            }
          }, 10000);
        });

        this.ws.addEventListener('close', () => {
          this.wsStatus = 'disconnected';
          this.addLog('[WS] Disconnected', 'system');
          this.wsPingTimer && clearInterval(this.wsPingTimer);
          this.wsPingTimer = null;
        });

        this.ws.addEventListener('error', (err) => {
          this.wsStatus = 'error';
          this.addLog('[WS] Connection error', 'Error', { message: String(err) });
        });

        this.ws.addEventListener('message', async ({ data }) => {
          let text;
          if (data instanceof Blob) text = await data.text();
          else if (data instanceof ArrayBuffer) text = new TextDecoder().decode(data);
          else text = data;

          let msg;
          try {
            msg = JSON.parse(text);
          } catch (_) {
            return;
          }

          if (msg.type === 'pong') return;

          // ESP32 sygnały z przycisków
          if (msg.type === 'button_press') {
            this.handleRemoteToggleESPWebSocket(msg.buttonName);
          }

          if (msg.type === 'signal-toggle') {
            this.handleRemoteToggleLocalWebSocket(msg.signal, msg.state);
          }
        });
      } catch (e) {
        this.wsStatus = 'error';
        this.addLog('[WS] Init failed', 'Error', { message: String(e) });
      }
    },

    handleRemoteToggleLocalWebSocket(id, value) {
      this.suppressBroadcast = true;
      if (value) {
        this.nextLine.add(id);
      } else {
        this.nextLine.delete(id);
      }
      this.signals[id] = value;
      this.addLog(`[WS] Odebrano sygnał ${id}: ${value ? 'ON' : 'OFF'}`, 'system');
      this.suppressBroadcast = false;
    },

    checkConflict(signalName) {
      // Groups of mutually conflicting signals:
      const groups = [
        ['wyad', 'wyl'],
        ['wys', 'wyak'],
        ['il', 'wel'],
        ['czyt', 'pisz'],
        ['iak', 'dak'],
      ];

      // Sygnały używające magistrali A
      const busASignals = ['wyl', 'wel', 'wyad', 'wea', 'as', 'sa', 'wyws', 'wyap', 'wyrm', 'werm'];

      // Sygnały używające magistrali S
      const busSSignals = [
        'wei',
        'weja',
        'wyak',
        'wyx',
        'wex',
        'wyy',
        'wey',
        'wes',
        'wys',
        'as',
        'sa',
        'wyls',
        'wyg',
        'wyrb',
        'werb',
        'start',
      ];

      // One JAML Operation at a Time Group:
      const jalOperations = ['dod', 'ode', 'przep', 'mno', 'dziel', 'shr', 'shl', 'neg', 'lub', 'i'];

      for (const group of groups) {
        if (group.includes(signalName)) {
          for (const other of group) {
            if (other === signalName) continue;
            if (this.signals[other]) {
              return `Nie można włączyć „${signalName}" - koliduje z „${other}".`;
            }
          }
        }
      }

      // Sprawdzenie konfliktów magistrali A
      if (busASignals.includes(signalName)) {
        for (const other of busASignals) {
          if (other === signalName) continue;
          if (this.signals[other]) {
            return `Nie można włączyć „${signalName}" - koliduje z „${other}" (magistrala A zajęta).`;
          }
        }
      }

      // Sprawdzenie konfliktów magistrali S
      if (busSSignals.includes(signalName)) {
        for (const other of busSSignals) {
          if (other === signalName) continue;
          if (this.signals[other]) {
            return `Nie można włączyć „${signalName}" - koliduje z „${other}" (magistrala S zajęta).`;
          }
        }
      }

      if (jalOperations.includes(signalName)) {
        for (const other of jalOperations) {
          if (other === signalName) continue;
          if (this.signals[other]) {
            return `Nie można włączyć „${signalName}" - już działa „${other}" (maks. jedna operacja JAML naraz).`;
          }
        }
      }

      return null;
    },

    handleRemoteToggleESPWebSocket(value) {
      this.suppressBroadcast = true;

      if (!this.signals[value]) {
        this.nextLine.add(value);
      } else {
        this.nextLine.delete(value);
      }
      this.signals[value] = !this.signals[value];

      this.addLog(`[ESP32] Przycisk ${value}: ${this.signals[value] ? 'ON' : 'OFF'}`, 'system');

      this.sendSignalToESP(value, this.signals[value]);

      this.suppressBroadcast = false;
    },

    checkConflict(signalName) {
      // Groups of mutually conflicting signals:
      const groups = [
        ['wyad', 'wyl'],
        ['wys', 'wyak'],
        ['il', 'wel'],
        ['czyt', 'pisz'],
        ['iak', 'dak'],
      ];
      // One JAML Operation at a Time Group:
      const jalOperations = ['dod', 'ode', 'przep', 'mno', 'dziel', 'shr', 'shl', 'neg', 'lub', 'i'];

      for (const group of groups) {
        if (group.includes(signalName)) {
          for (const other of group) {
            if (other === signalName) continue;
            if (this.signals[other]) {
              return `Nie można włączyć „${signalName}” – koliduje z „${other}”.`;
            }
          }
        }
      }

      if (jalOperations.includes(signalName)) {
        for (const other of jalOperations) {
          if (other === signalName) continue;
          if (this.signals[other]) {
            return `Nie można włączyć „${signalName}” – już działa „${other}” (maks. jedna operacja JAML naraz).`;
          }
        }
      }

      return null;
    },

    handleSignalToggle(signalName) {
      if (!this.manualMode) return;

      const willBeOn = !this.signals[signalName];

      if (willBeOn) {
        const conflictMsg = this.checkConflict(signalName);
        if (conflictMsg) {
          if (this.errorTimeoutId) {
            clearTimeout(this.errorTimeoutId);
          }
          this.errorMessage = conflictMsg;
          this.errorTimeoutId = setTimeout(() => {
            this.errorMessage = '';
            this.errorTimeoutId = null;
          }, 3000);
          return;
        }
      }

      this.errorMessage = '';
      if (this.errorTimeoutId) {
        clearTimeout(this.errorTimeoutId);
        this.errorTimeoutId = null;
      }

      if (this.nextLine.has(signalName)) {
        this.nextLine.delete(signalName);
        this.signals[signalName] = false;
      } else {
        this.nextLine.add(signalName);
        this.signals[signalName] = true;
      }

      this.sendSignalToESP(signalName, this.signals[signalName]);
    },

    sendSignalToESP(signalName, state) {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(
          JSON.stringify({
            type: 'signal-toggle',
            signal: signalName,
            state: state,
          })
        );
        this.addLog(`[WS] Wysłano sygnał ${signalName}: ${state ? 'ON' : 'OFF'}`, 'system');
      }
    },

    sendPartialData(fieldName, newValue) {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(
          JSON.stringify({
            type: 'reg-update',
            field: fieldName,
            value: newValue,
          })
        );
      }
    },

    sendMemUpdate() {
      const addrs = this.mem.slice(0, 4).map((_, idx) => idx);
      const args = this.mem.slice(0, 4).map((val) => this.decToArgument(val));
      const vals = this.mem.slice(0, 4);

      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(
          JSON.stringify({
            type: 'mem-update',
            data: {
              addrs: addrs,
              args: args,
              vals: vals,
            },
          })
        );
      }
    },

    sendFullDataToESP() {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        const addrs = this.mem.slice(0, 4).map((val, idx) => idx);
        const args = this.mem.slice(0, 4).map((val) => this.decToArgument(val));
        const vals = this.mem.slice(0, 4);

        const data = {
          acc: this.ACC,
          a: this.A,
          s: this.S,
          c: this.programCounter,
          i: this.I,
          addrs: addrs,
          args: args,
          vals,
          vals,
        };

        this.ws.send(
          JSON.stringify({
            type: 'mem-update',
            data: data,
          })
        );
      }
    },

    sendColorToESP(colorData) {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(
          JSON.stringify({
            type: 'color-update',
            data: {
              colorType: colorData.type,
              hex: colorData.hex,
              r: colorData.rgbScaled.r,
              g: colorData.rgbScaled.g,
              b: colorData.rgbScaled.b,
              brightness: Math.round(colorData.brightness * 255),
              timestamp: Date.now(),
            },
          })
        );
        this.addLog(
          `[LED] Wysłano kolor ${colorData.type}: ${colorData.hex} (RGB: ${colorData.rgbScaled.r}, ${colorData.rgbScaled.g}, ${colorData.rgbScaled.b})`,
          'system'
        );

        // Wyślij pełne dane po zmianie koloru, aby ESP32 od razu zaktualizował LED z nowymi wartościami
        this.sendFullDataToESP();
      }
    },

    handleRemoteMemUpdate(idx, value) {
      this.suppressBroadcast = true;
      this.$set(this.mem, idx, value);
      this.suppressBroadcast = false;
    },

    loadFromLS() {
      const data = localStorage.getItem('W');
      if (data) {
        const parsed = JSON.parse(data);

        // Only restore settings, not register values or code
        const settingsToRestore = [
          'addresBits',
          'codeBits',
          'oddDelay',
          'stepDelay',
          'numberFormat',
          'extras',
          'lightMode',
          'language',
          'registerFormats',
          'autocompleteEnabled',
          'autoResetOnAsmCompile',
          'decSigned',
        ];

        settingsToRestore.forEach((setting) => {
          if (parsed[setting] !== undefined) {
            if (setting === 'extras') {
              this.extras = this.mergeExtras(this.extras, parsed.extras);
            } else {
              this[setting] = parsed[setting];
            }
          }
        });

        // Always reset to default values for registers and program state
        this.A = 0;
        this.ACC = 0;
        this.JAML = 0;
        this.programCounter = 0;
        this.I = 0;
        this.X = 0;
        this.Y = 0;
        this.RM = 0;
        this.RZ = 0;
        this.AP = 0;
        this.RP = 0;
        this.WS = 0;
        this.G = 0;
        this.RB = 0;
        this.S = 0;
        this.BusA = 0;
        this.BusS = 0;

        // Reset stack
        this.stack = [];

        // Reset code to default
        this.code = 'czyt wys wei il;\nwyad wea;\nczyt wys weja dod weak wyl wea;';
        this.compiledCode = [];
        this.activeLine = 0;

        this.nextLine = new Set();
        this.codeCompiled = false;
        this.manualMode = true;

        // Reset all signals to false
        for (const key in this.signals) {
          this.signals[key] = false;
        }

        // Don't reset logs - they should persist during the session
      }
      this.syncDocumentLanguage();
    },

    syncDocumentLanguage(lang = this.language) {
      const resolved = lang || 'pl';
      const applied = setLocale(resolved);
      document.documentElement.lang = applied || resolved;
    },

    saveToLS() {
      // Create a copy of data without logs
      const dataToSave = { ...this.$data };
      delete dataToSave.logs;
      delete dataToSave.hasConsoleErrors;
      localStorage.setItem('W', JSON.stringify(dataToSave));
    },

    addLog(message, classification = 'info', errorObj = null) {
      const translatedMessage = this.translateLogMessage(message);
      const timestamp = new Date();
      const key = `${classification}|${translatedMessage}`;
      const now = timestamp.getTime();

      // reset liczników po przerwie > 1000 ms
      if (now - (this._lastLogTs || 0) > 1000) {
        this._lastLogKey = null;
        this._lastLogCount = 0;
      }

      if (this._lastLogKey === key) {
        this._lastLogCount += 1;
        const last = this.logs[this.logs.length - 1];
        if (last) {
          last.message = `${translatedMessage} ×${this._lastLogCount + 1}`;
          last.timestamp = timestamp;
        }
        this._lastLogTs = now;
        return; // nie dopisujemy nowej pozycji
      } else {
        this._lastLogKey = key;
        this._lastLogCount = 0;
        this._lastLogTs = now;
      }

      // Enhanced log entry structure that supports both legacy and new error formats
      const logEntry = {
        timestamp,
        message: translatedMessage,
        class: classification,
      };

      // If an error object is provided (e.g., WlanError or BaseAppError)
      if (errorObj) {
        logEntry.error = {
          message: errorObj.message || message,
          level: errorObj.level,
          timestamp: errorObj.timestamp,
          code: errorObj.code,
          hint: errorObj.hint,
          loc: errorObj.loc,
          frame: errorObj.frame,
          context: errorObj.context,
        };
      }

      this.logs.push(logEntry);

      // Check if this is an error and set the error flag
      const errorTypes = ['error', 'błąd parsera kodu', 'Error', 'Błąd parsera kodu', 'błąd sygnału'];
      const isError =
        errorTypes.some((type) => classification.toLowerCase().includes(type.toLowerCase())) ||
        (errorObj && ['ERROR', 'CRITICAL'].includes(errorObj.level));

      if (isError) {
        this.hasConsoleErrors = true;
      }
    },

    translateLogMessage(message) {
      const t = this.$t;
      const stateLabel = (raw) => t(`logs.breakpointStatus.${raw?.toLowerCase() === 'on' ? 'on' : 'off'}`);
      const patterns = [
        {
          regex: /^Breakpoint (dodany|usunięty) @(\d+)$/,
          handler: (m) => t(`logs.breakpoint.${m[1] === 'dodany' ? 'added' : 'removed'}`, { line: m[2] }),
        },
        {
          regex: /^\[WS\] Odebrano sygnał (.+): (ON|OFF)$/,
          handler: (m) => t('logs.wsSignalReceived', { id: m[1], state: stateLabel(m[2]) }),
        },
        {
          regex: /^\[ESP32] Przycisk (.+): (ON|OFF)$/,
          handler: (m) => t('logs.espButton', { button: m[1], state: stateLabel(m[2]) }),
        },
        {
          regex: /^\[WS] Wysłano sygnał (.+): (ON|OFF)$/,
          handler: (m) => t('logs.wsSignalSent', { signal: m[1], state: stateLabel(m[2]) }),
        },
        {
          regex: /^Stos PUSH \[(.+)\]: (.+) \(AP=(.+), WS=(.+), rozmiar=(.+)\)$/,
          handler: (m) => t('logs.stackPushAp', { type: m[1], value: m[2], ap: m[3], ws: m[4], size: m[5] }),
        },
        {
          regex: /^Stos PUSH \[(.+)\]: (.+) \(WS=(.+), rozmiar=(.+)\)$/,
          handler: (m) => t('logs.stackPush', { type: m[1], value: m[2], ws: m[3], size: m[4] }),
        },
        {
          regex: /^Stos POP \[(.+)\]: (.+) \(AP=(.+), WS=(.+), rozmiar=(.+)\)$/,
          handler: (m) => t('logs.stackPopAp', { type: m[1], value: m[2], ap: m[3], ws: m[4], size: m[5] }),
        },
        {
          regex: /^Stos POP \[(.+)\]: (.+) \(WS=(.+), rozmiar=(.+)\)$/,
          handler: (m) => t('logs.stackPop', { type: m[1], value: m[2], ws: m[3], size: m[4] }),
        },
        {
          regex: /^Stos POP: oczekiwano (.+), otrzymano (.+)!$/,
          handler: (m) => t('logs.stackPopExpected', { expected: m[1], actual: m[2] }),
        },
        {
          regex: /^Adres poza zakresem pamięci przy inicjalizacji: (.+)$/,
          handler: (m) => t('logs.memoryInitOutOfRange', { addr: m[1] }),
        },
        {
          regex: /^Zastosowano inicjalizację pamięci \((\d+) wpisów\)$/,
          handler: (m) => t('logs.memoryInitApplied', { count: m[1] }),
        },
        {
          regex: /^Pauza na breakpoint @(\d+)$/,
          handler: (m) => t('logs.breakpointPause', { line: m[1] }),
        },
        {
          regex: /^Skok poza zakres programu: PC=(.+)$/,
          handler: (m) => t('logs.jumpOob', { target: m[1] }),
        },
        {
          regex: /^Wyczyszczono komórkę pamięci \[(.+)\] po zdjęciu ze stosu$/,
          handler: (m) => t('logs.memoryClearedFromStack', { idx: m[1] }),
        },
        {
          regex: /^RM ustawione na (.+) \(maska przerwań\) \[BusS=(.+)\]$/,
          handler: (m) => t('logs.rmSet', { rm: m[1], busS: m[2] }),
        },
        {
          regex: /^RZ ustawione na (.+) \(zgłoszenia przerwań\)$/,
          handler: (m) => t('logs.rzSet', { rz: m[1] }),
        },
        {
          regex: /^RP ustawione na (.+) \(priorytet przerwania\)$/,
          handler: (m) => t('logs.rpSet', { rp: m[1] }),
        },
        {
          regex: /^Ustawiono bit (.+) w RM \(RM=(.+)\) - zablokowano IRQ(.+)$/,
          handler: (m) => t('logs.rmBitSet', { bit: m[1], rm: m[2], irq: m[3] }),
        },
        {
          regex: /^Wyczyszczono bit (.+) w RM \(RM=(.+)\) - odblokowano IRQ(.+)$/,
          handler: (m) => t('logs.rmBitCleared', { bit: m[1], rm: m[2], irq: m[3] }),
        },
      ];

      for (const p of patterns) {
        const m = message.match(p.regex);
        if (m) return p.handler(m);
      }

      switch (message) {
        case 'Usunięto wszystkie breakpointy':
          return t('logs.breakpointsCleared');
        case 'Stos POP: stos pusty!':
          return t('logs.stackPopEmpty');
        case '[WS] Connected to server':
          return t('logs.wsConnected');
        case '[WS] Disconnected':
          return t('logs.wsDisconnected');
        case '[WS] Connection error':
          return t('logs.wsError');
        case '[WS] Init failed':
          return t('logs.wsInitFailed');
        case 'Program skompilowany (strukturalny mikro‑program).':
        case 'Program skompilowany (strukturalny mikro–program).':
        case 'Program skompilowany (strukturalny mikro-program).':
          return t('logs.programCompiledStructured');
        case 'Przejście w tryb ręczny – program wstrzymany i wyczyszczony.':
          return t('logs.manualModeEnabled');
        case 'Kod skompilowany pomyślnie (mikro-ASM)':
          return t('logs.asmCompiled');
        case 'handleInterrupt: brak aktywnego przerwania':
          return t('logs.handleInterruptNone');
        case '─────────────────────────────────────':
          return t('logs.separator');
        case 'Przerwano: przekroczono limit kroków (prawdopodobna pętla).':
          return t('logs.loopGuard');
        case 'Kod zakończony':
          return t('logs.codeFinished');
        case 'STOP - program zatrzymany':
          return t('logs.stopInstr');
        case 'Wykonanie przerwane przyciskiem STOP.':
          return t('logs.stoppedByUser');
        case 'Przerwano: limit kroków RUN osiągnięty.':
          return t('logs.runStepLimit');
        case 'Przerwano: limit kroków RUN-FAST osiągnięty.':
          return t('logs.runFastLimit');
        case 'Ustawienia zostały przywrócone do wartości domyślnych':
          return t('logs.settingsRestored');
        case 'Konsola została wyczyszczona':
          return t('logs.consoleCleared');
        case 'System inicjalizowany':
          return t('logs.systemInit');
        case 'Wystąpił błąd leksykalny podczas parsowania':
          return t('logs.lexError');
        case 'Ostrzeżenie kompilatora':
          return t('logs.compilerWarning');
        case 'Błąd krytyczny':
          return t('logs.criticalError');
        case 'System zainicjalizowany.':
          return t('logs.systemInitialized');
        default:
          break;
      }

      if (message?.startsWith('Błąd kompilacji ASM: ')) {
        return t('logs.asmCompileError', { message: message.replace('Błąd kompilacji ASM: ', '') });
      }
      if (message?.startsWith('[WS] Reconnect failed')) {
        return t('logs.wsReconnectFailed');
      }
      if (message?.startsWith('PRZERWANIE IRQ')) {
        const num = message.replace('PRZERWANIE IRQ', '');
        return t('logs.interruptStart', { num });
      }
      if (message?.startsWith('   RP ← ')) {
        const num = message.replace(/[^\d]/g, '');
        return t('logs.interruptRp', { num });
      }
      if (message?.startsWith('   Stos: zapisano PC=')) {
        const match = message.match(/PC=(.+), WS=(.+)\)/);
        if (match) return t('logs.interruptStackSaved', { pc: match[1], ws: match[2] });
      }
      if (message?.startsWith('   Błąd: wektor ')) {
        const match = message.match(/wektor (.+) poza programem/);
        if (match) return t('logs.interruptVectorOob', { vector: match[1] });
      }
      if (message?.startsWith('   A ← ')) {
        const match = message.match(/A ← (.+) \(wskaźnik na wektor\)/);
        if (match) return t('logs.interruptALoad', { a: match[1] });
      }
      if (message?.startsWith('   PC ← ')) {
        const match = message.match(/PC ← (.+) \(adres wektora IRQ(.+)\)/);
        if (match) return t('logs.interruptPcSet', { vector: match[1], num: match[2] });
      }
      if (message?.startsWith('   → Wykonanie: ')) {
        const line = message.replace('   → Wykonanie: ', '');
        return t('logs.interruptExec', { line });
      }
      if (message?.startsWith('   RZ ← ')) {
        const match = message.match(/RZ ← (.+) \(wyzerowano IRQ(.+)\)/);
        if (match) return t('logs.interruptRzClear', { rz: match[1], num: match[2] });
      }

      return message;
    },
    formatNumber(number) {
      if (typeof number !== 'number' || isNaN(number)) {
        return 'Błąd: Nieprawidłowa liczba.';
      }

      const formatters = {
        dec: () => {
          if (this.decSigned) {
            return this.toSigned(number, this.codeBits + this.addresBits);
          }
          return number | 0;
        },
        hex: () => '0x' + Math.floor(number).toString(16).toUpperCase(),
        bin: () => '0b' + Math.floor(number).toString(2),
      };

      return formatters[this.numberFormat]?.() ?? `EE${number}`;
    },
    decToCommand(dec) {
      return this.commandList[dec >> this.addresBits];
    },
    decToArgument(dec) {
      return dec & ((1 << this.addresBits) - 1);
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
        this.addLog('Przejście w tryb ręczny – program wstrzymany i wyczyszczony.', 'system');
      }
    },
    closePopups(popupName) {
      if (typeof popupName === 'string' && popupName in this.$data) {
        this[popupName] = false;
      }

      if (!this.settingsOpen && !this.commandListOpen && !this.aiChatOpen) {
        setTimeout(() => {
          this.disappearBlour = false;
        }, 1000);
      }
    },
    openLabDialog() {
      if (!this.selectedLab && this.labCatalog.length > 0) {
        this.selectedLabId = this.labCatalog[0].id;
      }
      this.labDialogOpen = true;
    },
    closeLabDialog() {
      this.labDialogOpen = false;
    },
    selectLab(labId) {
      if (typeof labId !== 'string' || !labId) return;
      this.selectedLabId = labId;
    },
    loadSelectedLab() {
      const selected = this.selectedLab;
      if (!selected) return;

      if (this.manualMode) {
        this.manualModeUncheck();
      }

      this.uncompileCode();
      this.program = selected.asmStub || LAB_ASM_STUB;
      this.labDialogOpen = false;
      this.closePopups('settingsOpen');
      this.addLog(`Zaladowano lab: ${selected.title}`, 'system');
    },

    compileCode() {
      try {
        if (!this.code || !this.code.trim()) {
          throw new Error('Brak kodu do kompilacji.');
        }

        this.compiledProgram = [];
        this.compiledCode = this.code
          .split(';')
          .map((line) => line.replace(/\r?\n/g, ' ').trim())
          .filter((line) => line.length > 0);

        this.codeCompiled = true;
        this.activeInstrIndex = -1;
        this.activePhaseIndex = 0;
        this.activeLine = -1;
        this._condState = null;
        this._stepGuard = 0;
        this.nextLine.clear();

        this.executeLine();
        this.addLog('Kod skompilowany pomyślnie (mikro-ASM)', 'kompilator rozkazów');
      } catch (e) {
        this.addLog(`Błąd kompilacji ASM: ${e?.message || String(e)}`, 'Error');
      }
    },

    uncompileCode() {
      this.codeCompiled = false;
      this.nextLine.clear();
      this.activeInstrIndex = -1;
      this.activePhaseIndex = 0;
      this._condState = null;
      this._stepGuard = 0;
    },

    handleInterrupt() {
      const irqNum = this.highestPriorityIRQ;
      if (!irqNum) {
        this.addLog('handleInterrupt: brak aktywnego przerwania', 'Ostrzeżenie');
        return;
      }

      this.addLog(`─────────────────────────────────────`, 'przerwanie');
      this.addLog(`PRZERWANIE IRQ${irqNum}`, 'przerwanie');

      this.RP = irqNum;
      this.addLog(`   RP ← ${irqNum} (numer aktywnego przerwania)`, 'przerwanie');

      const returnAddr = this.programCounter;
      this.stackPush('Address', returnAddr);

      const size = 1 << this.addresBits;
      this.WS = (this.WS - 1 + size) % size;
      const idx = this.WS & this.addrMask();
      this.mem[idx] = returnAddr;
      this.addLog(`   Stos: zapisano PC=${returnAddr}, WS=${this.WS}`, 'przerwanie');

      const vectorAddress = irqNum;

      if (vectorAddress < 0 || vectorAddress >= this.compiledProgram.length) {
        this.addLog(`   Błąd: wektor ${vectorAddress} poza programem!`, 'Błąd');
        return;
      }

      this.A = vectorAddress;
      this.programCounter = vectorAddress;

      this.addLog(`   A ← ${this.A} (wskaźnik na wektor)`, 'przerwanie');
      this.addLog(`   PC ← ${vectorAddress} (adres wektora IRQ${irqNum})`, 'przerwanie');

      this.activeInstrIndex = vectorAddress;
      this.activePhaseIndex = 0;

      const vectorInstr = this.compiledProgram[vectorAddress];
      this.addLog(`   → Wykonanie: ${vectorInstr?.asmLine || 'SOB'}`, 'przerwanie');

      this.RZ &= ~(1 << (irqNum - 1));
      this.addLog(`   RZ ← ${this.RZ} (wyzerowano IRQ${irqNum})`, 'przerwanie');

      this.addLog(`─────────────────────────────────────`, 'przerwanie');
    },

    executeLine() {
      const setHighlight = (node) => {
        if (this._headless) return;
        if (node && Number.isFinite(node.srcLine)) {
          this.activeLine = node.srcLine;
          return;
        }
        this._refreshHighlight();
      };

      const shouldPauseOn = (line) => {
        if (this._skipNextBreakpoint) {
          this._skipNextBreakpoint = false;
          return false;
        }
        return (
          this.isRunning &&
          this.breakpointsEnabled &&
          Number.isFinite(line) &&
          this.breakpoints &&
          typeof this.breakpoints.has === 'function' &&
          this.breakpoints.has(line)
        );
      };

      const stopAtBreakpoint = (line) => {
        if (!shouldPauseOn(line)) return false;
        if (Number.isFinite(line)) this.activeLine = line;
        this.addLog(`Pauza na breakpoint @${line}`, 'system');
        this._stopRun();
        return true;
      };

      const finishStructuredProgram = () => {
        this.uncompileCode();
        this.addLog('Kod zako\u0144czony', 'kompilator rozkaz\u00f3w');
      };

      const moveToNextPhase = () => {
        this.activePhaseIndex += 1;
        const instruction = this.compiledProgram[this.activeInstrIndex];
        if (this.activePhaseIndex >= (instruction?.phases?.length || 0)) {
          this.activeInstrIndex += 1;
          this.activePhaseIndex = 0;
        }
      };

      const jumpToProgramCounter = () => {
        const target = this.programCounter;
        if (target >= 0 && target < this.compiledProgram.length) {
          this.activeInstrIndex = target;
          this.activePhaseIndex = 0;
          this._condState = null;
          const nextInstruction = this.compiledProgram[this.activeInstrIndex];
          const nextPhase = nextInstruction?.phases?.[this.activePhaseIndex];
          setHighlight(nextPhase ?? nextInstruction);
          return true;
        }

        this.addLog(`Skok poza zakres programu: PC=${target}`, 'B\u0142\u0105d');
        this.uncompileCode();
        return false;
      };

      const executeMicroPhase = (phase) => {
        const signals = new Set(Object.keys(phase || {}).filter((key) => phase[key] === true));
        this.nextLine = signals;
        this.executeSignalsFromNextLine();
      };

      if (this.codeCompiled && Array.isArray(this.compiledProgram) && this.compiledProgram.length > 0) {
        if (this.activeInstrIndex < 0) {
          this.activeInstrIndex = 0;
          this.activePhaseIndex = 0;
          this._stepGuard = 0;
          this._condState = null;
        }

        if (this.activePhaseIndex === 0 && this.extras?.interrupts?.eniSignal && this.rint) {
          this.handleInterrupt();
          return;
        }

        this._stepGuard = (this._stepGuard || 0) + 1;
        if (this._stepGuard > 100000) {
          this.addLog('Przerwano: przekroczono limit krok\u00f3w (prawdopodobna p\u0119tla).', 'system');
          this.uncompileCode();
          return;
        }

        if (this.activeInstrIndex >= this.compiledProgram.length) {
          finishStructuredProgram();
          return;
        }

        const instruction = this.compiledProgram[this.activeInstrIndex];
        const currentPhase = instruction?.phases?.[this.activePhaseIndex];

        if (!currentPhase) {
          moveToNextPhase();
          if (this.activeInstrIndex >= this.compiledProgram.length) {
            finishStructuredProgram();
            return;
          }
          const nextInstruction = this.compiledProgram[this.activeInstrIndex];
          const nextPhase = nextInstruction?.phases?.[this.activePhaseIndex];
          setHighlight(nextPhase ?? nextInstruction);
          return;
        }

        let phaseToExecute = currentPhase;
        let sourceLine = Number.isFinite(phaseToExecute?.srcLine) ? phaseToExecute.srcLine : undefined;
        let executingConditionalBranch = false;

        if (currentPhase.conditional === true) {
          executingConditionalBranch = true;

          if (!this._condState || this._condState.phaseRef !== currentPhase) {
            const cond = this.evaluateFlag(currentPhase.flag);
            const list = (cond ? currentPhase.truePhases : currentPhase.falsePhases) || [];
            this._condState = {
              list,
              idx: 0,
              pick: cond ? 'T' : 'F',
              phaseRef: currentPhase,
            };

            const ifLine = Number.isFinite(currentPhase.srcLine) ? currentPhase.srcLine : undefined;
            if (stopAtBreakpoint(ifLine)) return;
          }

          const state = this._condState;
          const branchPhase = state?.list?.[state.idx];
          if (!branchPhase) {
            this._condState = null;
            moveToNextPhase();
            if (this.activeInstrIndex >= this.compiledProgram.length) {
              finishStructuredProgram();
              return;
            }
            const nextInstruction = this.compiledProgram[this.activeInstrIndex];
            const nextPhase = nextInstruction?.phases?.[this.activePhaseIndex];
            setHighlight(nextPhase ?? nextInstruction);
            return;
          }

          phaseToExecute = branchPhase;
          const fallbackLine = Number.isFinite(state?.phaseRef?.srcLine)
            ? state.phaseRef.srcLine + (state.pick === 'T' ? 1 : 2)
            : undefined;
          sourceLine = Number.isFinite(branchPhase?.srcLine) ? branchPhase.srcLine : fallbackLine;
        } else {
          this._condState = null;
        }

        if (phaseToExecute?.stop === true) {
          setHighlight(phaseToExecute);
          this.uncompileCode();
          this.addLog('STOP - program zatrzymany', 'kompilator rozkaz\u00f3w');
          return;
        }

        if (stopAtBreakpoint(sourceLine)) return;

        setHighlight(phaseToExecute);
        executeMicroPhase(phaseToExecute);

        if (phaseToExecute?.wel === true) {
          jumpToProgramCounter();
          return;
        }

        if (executingConditionalBranch && this._condState) {
          this._condState.idx += 1;
          if (this._condState.idx < this._condState.list.length) {
            const nextBranchPhase = this._condState.list[this._condState.idx];
            const fallbackLine = Number.isFinite(this._condState.phaseRef?.srcLine)
              ? this._condState.phaseRef.srcLine + (this._condState.pick === 'T' ? 1 : 2)
              : undefined;
            const nextLine = Number.isFinite(nextBranchPhase?.srcLine) ? nextBranchPhase.srcLine : fallbackLine;
            if (!this._headless && Number.isFinite(nextLine)) this.activeLine = nextLine;
            return;
          }
          this._condState = null;
        }

        moveToNextPhase();
        if (this.activeInstrIndex >= this.compiledProgram.length) {
          finishStructuredProgram();
          return;
        }

        const nextInstruction = this.compiledProgram[this.activeInstrIndex];
        const nextPhase = nextInstruction?.phases?.[this.activePhaseIndex];
        setHighlight(nextPhase ?? nextInstruction);
        return;
      }

      if (!this.manualMode) {
        if (this.activeLine < 0) this.activeLine = 0;
        if (this.activeLine >= this.compiledCode.length) {
          this.uncompileCode();
          this.addLog('Kod zako\u0144czony', 'kompilator rozkaz\u00f3w');
          return;
        }

        const nextSrc = this.activeLine;
        if (shouldPauseOn(nextSrc)) {
          this.addLog(`Pauza na breakpoint @${nextSrc}`, 'system');
          this._stopRun();
          this.activeLine = nextSrc;
          if (!this._headless) this._refreshHighlight();
          return;
        }

        this._refreshHighlight();
        const commands = this.compiledCode[this.activeLine].split(' ').filter(Boolean);
        this.nextLine.clear();
        for (const c of commands) this.nextLine.add(c);
        this.executeSignalsFromNextLine();
        this.activeLine++;

        if (this.activeLine >= this.compiledCode.length) {
          this.uncompileCode();
          this.addLog('Kod zako\u0144czony', 'kompilator rozkaz\u00f3w');
        } else if (!this._headless) {
          this._refreshHighlight();
        }
      } else {
        this.executeSignalsFromNextLine();
        if (!this._headless) this._refreshHighlight();
      }
    },

    _refreshHighlight() {
      if (!this.codeCompiled) return;

      if (this._condState) {
        const st = this._condState;
        if (st.stage === 'SHOW_IF') {
          if (Number.isFinite(st.phaseRef?.srcLine)) {
            this.activeLine = st.phaseRef.srcLine;
            return;
          }
        }

        const idx = Math.min(st.idx ?? 0, (st.list?.length ?? 1) - 1);
        const curr = st.list?.[idx];
        if (curr && Number.isFinite(curr.srcLine)) {
          this.activeLine = curr.srcLine;
          return;
        }
        if (Number.isFinite(st.phaseRef?.srcLine)) {
          this.activeLine = st.phaseRef.srcLine + (st.pick === 'T' ? 1 : 2);
          return;
        }
      }

      if (Array.isArray(this.compiledProgram) && this.compiledProgram.length > 0) {
        const instr = this.compiledProgram[this.activeInstrIndex];
        const phase = instr?.phases?.[this.activePhaseIndex];

        if (phase && Number.isFinite(phase.srcLine)) {
          this.activeLine = phase.srcLine;
          return;
        }
        if (instr && Number.isFinite(instr.srcLine)) {
          this.activeLine = instr.srcLine;
          return;
        }
      }

      let line = 0;
      const instrIdx = Math.max(0, this.activeInstrIndex);
      for (let i = 0; i < instrIdx; i++) {
        const phs = this.compiledProgram[i]?.phases || [];
        for (const p of phs) line += p && p.conditional === true ? 3 : 1;
        const extra = this.compiledProgram[i]?.meta?.postAsm;
        if (Array.isArray(extra)) line += extra.length;
      }
      const currPh = this.compiledProgram[instrIdx]?.phases || [];
      for (let k = 0; k < Math.max(0, this.activePhaseIndex); k++) {
        const p = currPh[k];
        line += p && p.conditional === true ? 3 : 1;
      }
      this.activeLine = line;

      const max = (this.compiledCode?.length || 1) - 1;
      this.activeLine = Math.max(0, Math.min(this.activeLine || 0, max));
    },

    getResolvedPhase(phase) {
      if (!phase) return {};
      if (phase.conditional === true) {
        const flag = phase.flag;
        const cond = this.evaluateFlag(flag);
        const branch = cond ? phase.truePhases : phase.falsePhases;
        return branch && branch[0] ? branch[0] : {};
      }
      return phase;
    },

    evaluateFlag(flag) {
      if (!flag) return false;
      const f = String(flag).toUpperCase();
      const acc8 = this.ACC & this.wordMask();
      const SIGN = 1 << (this.codeBits + this.addresBits - 1);

      switch (f) {
        case 'ZAK':
        case 'ZERO':
        case 'Z':
          return acc8 === 0;
        case 'NEG':
        case 'N':
        case 'M':
          return (acc8 & SIGN) !== 0;
        case 'NZ':
        case 'NZERO':
          return acc8 !== 0;
        case 'POS':
        case 'P':
          return (acc8 & SIGN) === 0;
        default:
          return false;
      }
    },

    stopRun() {
      this._stopRun();
      this.addLog('Wykonanie przerwane przyciskiem STOP.', 'system');
    },

    runCode() {
      if (this.isRunning || !this.codeCompiled) return;
      this.manualMode = false;
      this.clearActiveTimeouts();

      this._skipNextBreakpoint = true;
      this.isRunning = true;
      let stepsLeft = 100000;
      const CHUNK = 1; // było 200
      const TICK_MS = Math.max(1, this.oddDelay); // było 0

      if (this.compiledProgram && this.compiledProgram.length > 0 && this.activeInstrIndex < 0) {
        this.activeInstrIndex = 0;
        this.activePhaseIndex = 0;
      }

      const tick = () => {
        if (!this.codeCompiled || !this.isRunning) return this._stopRun();

        let i = 0;
        while (
          i++ < CHUNK &&
          stepsLeft-- > 0 &&
          this.codeCompiled &&
          this.activeInstrIndex >= 0 &&
          this.activeInstrIndex < this.compiledProgram.length
        ) {
          // jeżeli w trakcie ktoś kliknie STOP – przerwij natychmiast
          if (!this.isRunning) return this._stopRun();
          this.executeLine();
        }

        if (!this.codeCompiled || this.activeInstrIndex < 0 || this.activeInstrIndex >= this.compiledProgram.length) {
          return this._stopRun();
        }
        if (stepsLeft <= 0) {
          this.addLog('Przerwano: limit kroków RUN osiągnięty.', 'system');
          return this._stopRun();
        }

        // <<< TU ZMIANA: planuj następny tik tylko gdy nadal isRunning >>>
        if (this.isRunning) {
          this.runLoopTimer = setTimeout(tick, TICK_MS);
        } else {
          this._stopRun();
        }
      };

      this.runLoopTimer = setTimeout(tick, TICK_MS);
    },
    _stopRun() {
      if (this.runLoopTimer) {
        clearTimeout(this.runLoopTimer);
        this.runLoopTimer = null;
      }
      this.isRunning = false;
      this.isFastRunning = false;
      this.fastProgress = 0;

      this._skipNextBreakpoint = false; // ← reset

      this._headless = false;
      this.suppressBroadcast = false;
      this.clearActiveTimeouts();
      if (this._busHoldTimers?.A) {
        clearTimeout(this._busHoldTimers.A);
        this._busHoldTimers.A = null;
      }
      if (this._busHoldTimers?.S) {
        clearTimeout(this._busHoldTimers.S);
        this._busHoldTimers.S = null;
      }
      this.signals.busA = false;
      this.signals.busS = false;
      this.nextLine.clear();
    },

    async runToEndFast() {
      if (!this.codeCompiled) return;

      this._stopRun();

      this.manualMode = false;
      this.clearActiveTimeouts();

      this._headless = true;
      this.suppressBroadcast = true;

      this.isRunning = true;
      this.isFastRunning = true;
      this.fastProgress = 0;

      const prevTitle = document.title;
      document.title = '▶️ Running…';

      try {
        const hasStructured = Array.isArray(this.compiledProgram) && this.compiledProgram.length > 0;
        const totalInstr = hasStructured ? this.compiledProgram.length : this.compiledCode?.length || 0;

        if (hasStructured && this.activeInstrIndex < 0) {
          this.activeInstrIndex = 0;
          this.activePhaseIndex = 0;
        } else if (!hasStructured) {
          this.activeLine = Math.max(this.activeLine, 0);
        }

        let safety = 200_000;
        const CHUNK = 1200;

        while (this.codeCompiled && safety > 0) {
          for (let i = 0; i < CHUNK && safety > 0 && this.codeCompiled; i++, safety--) {
            if (hasStructured) {
              if (this.activeInstrIndex < 0 || this.activeInstrIndex >= this.compiledProgram.length) {
                this.uncompileCode();
                break;
              }
              this.executeLine(/* headless → patrz niżej */);
            } else {
              if (this.activeLine >= this.compiledCode.length) {
                this.uncompileCode();
                break;
              }
              this.executeLine();
            }
          }

          // progres bez malowania UI (tylko liczba)
          if (hasStructured) {
            const cur = Math.max(0, Math.min(this.activeInstrIndex, totalInstr));
            this.fastProgress = totalInstr ? Math.floor((cur / totalInstr) * 100) : 0;
          } else {
            const cur = Math.max(0, Math.min(this.activeLine, totalInstr));
            this.fastProgress = totalInstr ? Math.floor((cur / totalInstr) * 100) : 0;
          }

          // daj event loopowi odetchnąć
          await new Promise((r) => setTimeout(r, 0));

          if (!this.codeCompiled) break;
          if (hasStructured && (this.activeInstrIndex < 0 || this.activeInstrIndex >= this.compiledProgram.length)) break;
          if (!hasStructured && this.activeLine >= this.compiledCode.length) break;
        }

        if (safety <= 0) this.addLog('Przerwano: limit kroków RUN-FAST osiągnięty.', 'system');
      } finally {
        this._headless = false; // ← WRÓĆ do normalnego trybu
        this.suppressBroadcast = false; // ← ponownie pozwól na WS
        this.isFastRunning = false;
        this.isRunning = false;
        this.fastProgress = 0;
        document.title = prevTitle;
      }
    },

    resetValues(options = {}) {
      const { resetMemory = true, resetLogs = true, logMessage = 'Wszystkie wartości rejestrów zostały zresetowane' } = options;
      // Clear any active timeouts first
      this.clearActiveTimeouts();

      // Reset all register values to 0
      this.programCounter = 0;
      this.I = 0;
      this.ACC = 0;
      this.A = 0;
      this.S = 0;
      this.X = 0;
      this.Y = 0;
      this.RM = 0;
      this.RZ = 0;
      this.AP = 0;
      this.RP = 0;
      this.WS = 0;
      this.G = 0;
      this.RB = 0;
      this.JAML = 0;
      this.BusA = 0;
      this.BusS = 0;

      // Reset stack
      this.stack = [];

      // Reset memory to all zeros
      if (resetMemory) {
        this.mem = new Array(1 << this.addresBits).fill(0);
      }

      // Reset all signals to false
      for (const key in this.signals) {
        this.signals[key] = false;
      }

      this.nextLine.clear();

      // Clear console logs
      if (resetLogs) {
        this.logs = [];
        this.hasConsoleErrors = false;
      }

      if (logMessage) {
        this.addLog(logMessage, 'system');
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
      this.addLog('Ustawienia zostały przywrócone do wartości domyślnych', 'system');
    },

    openCommandList() {
      this.closePopups('settingsOpen');
      this.commandListOpen = true;
    },

    toggleConsole() {
      this.consoleOpen = !this.consoleOpen;

      if (this.consoleOpen) {
        this.hasConsoleErrors = false;

        this.$nextTick(() => {
          if (window.innerWidth <= 1080 && this.$refs.console?.$el) {
            this.$refs.console.$el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      }
    },

    closeConsole() {
      this.consoleOpen = false;
    },

    clearConsole() {
      this.logs = [];
      this.hasConsoleErrors = false;
      this.addLog('Konsola została wyczyszczona', 'system');
    },

    handleKeyPress(event) {
      if (event.key === 'Escape' && this.labDialogOpen) {
        this.labDialogOpen = false;
        return;
      }

      // Close console with Escape key
      if (event.key === 'Escape' && this.consoleOpen) {
        this.consoleOpen = false;
      }
    },

    clearActiveTimeouts() {
      // Clear all active timeouts and reset all signals to false
      this.activeTimeouts.forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
      this.activeTimeouts = [];

      // Immediately turn off all signals
      for (const key in this.signals) {
        this.signals[key] = false;
      }
    },

    // Test method to demonstrate enhanced console with different error types
    testEnhancedConsole() {
      // Test different error levels and formats
      this.addLog('System inicjalizowany', 'system');

      // Test BaseAppError structure
      const mockWlanError = {
        message: 'Nieznany znak w linii kodu',
        level: 'ERROR',
        timestamp: new Date().toISOString(),
        code: 'LEX_UNKNOWN_CHAR',
        hint: "Usuń lub popraw znak. Jeżeli to komentarz, użyj '/\/' lub rozpocznij linię średnikiem ';'.",
        loc: { line: 5, col: 12, length: 1 },
        frame: '    3 | ŁAD 15\n    4 | DOD 20\n  > 5 | BŁĘDNY#ZNAK\n        |           ^\n    6 | SOB start',
      };

      this.addLog('Wystąpił błąd leksykalny podczas parsowania', 'Error', mockWlanError);

      // Test warning
      const mockWarning = {
        message: 'Niewykorzystana etykieta',
        level: 'WARNING',
        timestamp: new Date().toISOString(),
        code: 'SEM_UNUSED_LABEL',
        hint: 'Sprawdź czy etykieta jest faktycznie potrzebna lub czy nie ma literówki w nazwie.',
      };

      this.addLog('Ostrzeżenie kompilatora', 'Warning', mockWarning);

      // Test critical error
      const mockCritical = {
        message: 'Krytyczny błąd systemu',
        level: 'CRITICAL',
        timestamp: new Date().toISOString(),
        code: 'SYS_CRITICAL',
        hint: 'Skontaktuj się z administratorem systemu.',
      };

      this.addLog('Błąd krytyczny', 'Critical', mockCritical);
    },
  },
  watch: {
    $data: {
      handler() {
        this.saveToLS();
      },
      deep: true,
    },
    addresBits() {
      this.resizeMemory();
    },
    lightMode() {
      // add lightMode or darkMode class to body
      if (this.lightMode) {
        document.body.classList.add('lightMode');
        document.body.classList.remove('darkMode');
      } else {
        document.body.classList.add('darkMode');
        document.body.classList.remove('lightMode');
      }
    },
    language(newLang) {
      this.syncDocumentLanguage(newLang);
    },
    numberFormat(newVal, oldVal) {
      if (!newVal || newVal === oldVal) return;

      const updated = { ...this.registerFormats };
      Object.keys(updated).forEach((key) => {
        updated[key] = newVal;
      });

      this.registerFormats = updated;
    },

    signals: {
      deep: true,
      handler() {
        if (this.suppressBroadcast) return;
        const curr = { ...this.signals };
        for (const key in curr) {
          if (curr[key] !== this.prevSignals[key]) {
            this.sendPartialData(key, curr[key]);
          }
        }
        this.prevSignals = curr;
      },
    },

    mem: {
      deep: true,
      handler() {
        if (this.suppressBroadcast) return;

        let first4Changed = false;
        for (let i = 0; i < 4; i++) {
          if (this.mem[i] !== this.prevMem[i]) {
            first4Changed = true;
            break;
          }
        }

        if (first4Changed) {
          this.sendMemUpdate();
        }

        this.prevMem = [...this.mem];
      },
    },

    ACC(newVal, oldVal) {
      if (this.suppressBroadcast) return;
      this.sendPartialData('acc', newVal);
    },

    A(newVal, oldVal) {
      if (this.suppressBroadcast) return;
      this.sendPartialData('a', newVal);
    },

    S(newVal, oldVal) {
      if (this.suppressBroadcast) return;
      this.sendPartialData('s', newVal);
    },

    programCounter(newVal, oldVal) {
      if (this.suppressBroadcast) return;
      this.sendPartialData('c', newVal);
    },

    I(newVal, oldVal) {
      if (this.suppressBroadcast) return;
      this.sendPartialData('i', newVal);
    },

    anyPopupOpen: {
      handler(val) {
        if (val) {
          this.disappearBlour = val;
        }
      },
      immediate: true,
    },
  },

  mounted() {
    if (this.platform === 'esp') {
      this.initWebsocket();
    }
    this.loadFromLS();
    this.resizeMemory();

    this.addLog('System zainicjalizowany.', 'System');
    this.prevSignals = { ...this.signals };
    this.prevMem = [...this.mem];

    // Add event listener for key presses
    window.addEventListener('keydown', this.handleKeyPress);
  },

  beforeDestroy() {
    window.removeEventListener('keydown', this.handleKeyPress);
    if (this.wsPingTimer) clearInterval(this.wsPingTimer);
    if (this.toastTimer) clearTimeout(this.toastTimer);
  },
};
</script>

<style scoped>
ol {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  text-align: left;
}

.toolbar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
.toolbar button.active {
  background-color: var(--signal-active);
  color: white;
}
.toolbar select {
  padding: 0.2rem;
}

.app-toast {
  position: fixed;
  left: 50%;
  bottom: 1.5rem;
  transform: translateX(-50%);
  background: var(--panelBackgroundColor, #2a2c33);
  color: var(--fontColor, #eee);
  border: 1px solid var(--panelOutlineColor, #3a3d45);
  padding: 0.65rem 1rem;
  border-radius: 0.5rem;
  box-shadow:
    0 8px 20px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  z-index: 2000;
  max-width: min(90vw, 560px);
  text-align: center;
  font-size: 0.9rem;
  line-height: 1.35;
}
</style>
