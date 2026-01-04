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
      @update:autocompleteEnabled="autocompleteEnabled = $event"
      @update:autoResetOnAsmCompile="autoResetOnAsmCompile = $event"
      @color-change="sendColorToESP"
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
</template>

<script>
import MaszynaW from '@/components/MaszynaW.vue';
import CommandList from './CommandList.vue';
import ProgramSection from './ProgramSection.vue';
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
import ConsoleDock from '@/components/ConsoleDock.vue';
import SettingsOverlay from '@/components/SettingsOverlay.vue';
import ExecutionControls from './ExecutionControls.vue';
import ProgramEditor from './ProgramEditor.vue';
import { commandList } from '@/utils/data/commands.js';
import { parse } from '@/WLAN/parser';
import { compileCodeExternal } from '@/WLAN/compiler';
import { setLocale } from '@/i18n';

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
    ExecutionControls,
    ProgramEditor,
  },

  computed: {
    anyPopupOpen() {
      return this.commandListOpen || this.aiChatOpen || this.settingsOpen;
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

      avaiableSignals: {
        always: [
          'il',
          'wyl',
          'wel',
          'wyad',
          'wei',
          'wea',
          'wes',
          'wys',
          'czyt',
          'pisz',
          'przep',
          'weja',
          'weak',
          'dod',
          'ode',
          'wyak',
          'stop',
          'wyws',
          'iws',
          'dws',
          'wyls',
          'wyg',
          'werb',
          'wyrb',
          'start',
          'ustrm',
          'czrm',
          'werm',
          'wyrm',
          'werz',
          'wyrz',
          'werp',
          'wyrp',
          'weap',
          'wyap',
        ],
        busConnectors: ['as', 'sa'],
        dl: ['dl'],
        jamlExtras: ['iak', 'dak', 'mno', 'dziel', 'shr', 'shl', 'neg', 'lub', 'i'],
        xRegister: ['wyx', 'wex'],
        yRegister: ['wyy', 'wey'],
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

      lightMode: true,
      language: 'pl',

      consoleOpen: false,
      hasConsoleErrors: false,
    };
  },
  methods: {
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
        // malutkie opóźnienie żeby zamknąć stary socket „do końca”
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
        logMessage: 'Rejestry automatycznie zresetowane przed kompilacją assemblera.',
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
              return `Nie można włączyć „${signalName}" – koliduje z „${other}".`;
            }
          }
        }
      }

      // Sprawdzenie konfliktów magistrali A
      if (busASignals.includes(signalName)) {
        for (const other of busASignals) {
          if (other === signalName) continue;
          if (this.signals[other]) {
            return `Nie można włączyć „${signalName}" – koliduje z „${other}" (magistrala A zajęta).`;
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

    compileCode() {
      try {
        const { program, rawLines } = compileCodeExternal(this.code, {
          availableSignals: this.avaiableSignals,
          extras: this.extras,
        });
        // console.log(program, rawLines);

        // 1) Ustawiamy program + surowe linie do podglądu
        this.compiledProgram = Array.isArray(program) ? program : [];
        this.compiledCode = Array.isArray(rawLines) ? rawLines : [];

        // 2) PRZYPISANIE srcLine
        //    Dla zwykłej fazy: +1 linia
        //    Dla fazy warunkowej: +3 linie (IF, @zero, @notzero)
        //    Po każdej instrukcji doliczamy jej postAsm (jeśli były dopisane linie w assemblerze)
        let linePtr = 0;
        for (const entry of this.compiledProgram) {
          if (!entry || !Array.isArray(entry.phases)) continue;

          for (const phase of entry.phases) {
            if (phase && phase.conditional === true) {
              // IF
              phase.srcLine = linePtr;

              // pierwsze pod-fazy — nadajemy im "wirtualne" źródła do poprawnego highlightu
              const t0 = phase.truePhases && phase.truePhases[0];
              const f0 = phase.falsePhases && phase.falsePhases[0];
              if (t0) t0.srcLine = linePtr + 1; // linia z @zero ...
              if (f0) f0.srcLine = linePtr + 2; // linia z @notzero ...

              linePtr += 3;
            } else {
              // zwykła faza
              if (phase) phase.srcLine = linePtr;
              linePtr += 1;
            }
          }

          // jeśli generator dopisał tekstowe linie po instrukcji (postAsm),
          // to w podglądzie one istnieją, więc licznik też trzeba przesunąć
          const extra = entry.meta?.postAsm;
          if (Array.isArray(extra) && extra.length) {
            linePtr += extra.length;
          }

          // bazowy srcLine wpisu — „pierwsza” linia wpisu (pomocniczo)
          if (entry.phases?.length && Number.isFinite(entry.phases[0]?.srcLine)) {
            entry.srcLine = entry.phases[0].srcLine;
          } else {
            entry.srcLine = entry.srcLine ?? 0;
          }
        }

        // 3) Reset stanu i start jak wcześniej
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
      // Lokalny helper do highlightu
      const hlFrom = (obj) => {
        if (this._headless) return;
        if (obj && Number.isFinite(obj.srcLine)) {
          this.activeLine = obj.srcLine;
          return;
        }
        this._refreshHighlight();
      };

      // Lokalny helper do pauzy na breakpointach (działa tylko przy RUN/RUN-FAST)
      const shouldPauseOn = (line) => {
        // jeśli mamy do pominięcia pierwszy breakpoint – zrób to tylko raz
        if (this._skipNextBreakpoint) {
          this._skipNextBreakpoint = false; // ← wypal „bezpiecznik”
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

      // --- tryb mikro-programu ---
      if (this.codeCompiled && Array.isArray(this.compiledProgram) && this.compiledProgram.length > 0) {
        // Inicjalizacja przy pierwszym uruchomieniu
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
        //console.log(this.compiledProgram[this.activeInstrIndex].asmLine);

        // Zabezpieczenie przed nieskończoną pętlą
        this._stepGuard = (this._stepGuard || 0) + 1;
        if (this._stepGuard > 100000) {
          this.addLog('Przerwano: przekroczono limit kroków (prawdopodobna pętla).', 'system');
          this.uncompileCode();
          return;
        }

        // Sprawdzenie końca programu
        if (this.activeInstrIndex >= this.compiledProgram.length) {
          this.uncompileCode();
          this.addLog('Kod zakończony', 'kompilator rozkazów');
          return;
        }

        const instr = this.compiledProgram[this.activeInstrIndex];
        const rawPhase = instr.phases?.[this.activePhaseIndex] || {};

        // --- FAZA WARUNKOWA ---
        if (rawPhase && rawPhase.conditional === true) {
          // 1) Pierwszy krok: pokaż IF (bez wykonywania)
          if (!this._condState) {
            const cond = this.evaluateFlag(rawPhase.flag);
            const list = (cond ? rawPhase.truePhases : rawPhase.falsePhases) || [];

            this._condState = {
              list,
              idx: 0,
              pick: cond ? 'T' : 'F',
              phaseRef: phase,
              stage: 'SHOW_IF',
            };

            // Linia IF to srcLine fazy warunkowej
            const nextSrc = Number.isFinite(rawPhase.srcLine) ? rawPhase.srcLine : undefined;

            // Pauza na breakpoint dokładnie na linii IF
            if (shouldPauseOn(nextSrc)) {
              if (Number.isFinite(nextSrc)) this.activeLine = nextSrc;
              this.addLog(`Pauza na breakpoint @${nextSrc}`, 'system');
              this._stopRun();
              return;
            }

            hlFrom(rawPhase);

            return;
          }

          // 2) Wykonywanie ciała wybranej gałęzi – po jednej pod-fazie na krok
          const st = this._condState;
          const curr = st.list[st.idx];

          // Brak więcej podfaz -> zamknij warunkową i idź dalej
          if (!curr) {
            this._condState = null;
            this.activePhaseIndex += 1;

            // Koniec faz tej instrukcji?
            if (this.activePhaseIndex >= (instr.phases?.length || 0)) {
              this.activeInstrIndex += 1;
              this.activePhaseIndex = 0;
            }

            // Podświetl następną fazę/instrukcję
            if (this.activeInstrIndex < this.compiledProgram.length) {
              const ni = this.compiledProgram[this.activeInstrIndex];
              const np = ni?.phases?.[this.activePhaseIndex];
              hlFrom(np ?? ni);
            } else {
              this.uncompileCode();
              this.addLog('Kod zakończony', 'kompilator rozkazów');
            }
            return;
          }

          // Kandydat na srcLine tej POD-FAZY (gdy nie ma, fallback to linia @zero/@notzero)
          const fallback = Number.isFinite(st.phaseRef?.srcLine) ? st.phaseRef.srcLine + (st.pick === 'T' ? 1 : 2) : undefined;
          const nextSrc = Number.isFinite(curr?.srcLine) ? curr.srcLine : fallback;

          // Pauza na breakpoint PRZED wykonaniem tej pod-fazy
          if (shouldPauseOn(nextSrc)) {
            if (Number.isFinite(nextSrc)) this.activeLine = nextSrc;
            this.addLog(`Pauza na breakpoint @${nextSrc}`, 'system');
            this._stopRun();
            return;
          }
          hlFrom(curr, st.phaseRef, st.pick);
          // Wykonaj JEDNĄ pod-fazę wybranej gałęzi
          const signals = new Set(Object.keys(curr).filter((k) => curr[k] === true));
          this.nextLine = signals;
          this.executeSignalsFromNextLine();

          // Jeśli podfaza zawierała sygnał 'wel', to programCounter został zmieniony
          if (curr.wel === true) {
            const target = this.programCounter;
            if (target >= 0 && target < this.compiledProgram.length) {
              this.activeInstrIndex = target;
              this.activePhaseIndex = 0;
              this._condState = null;
              const ai = this.compiledProgram[this.activeInstrIndex];
              const ap = ai?.phases?.[this.activePhaseIndex];
              hlFrom(ap ?? ai);
            } else {
              this.addLog(`Skok poza zakres programu: PC=${target}`, 'Błąd');
              this.uncompileCode();
            }
            return;
          }

          st.idx += 1;

          // Jeśli skończyły się podfazy, zamknij warunkową
          if (st.idx >= st.list.length) {
            this._condState = null;
            this.activePhaseIndex += 1;

            if (this.activePhaseIndex >= (instr.phases?.length || 0)) {
              this.activeInstrIndex += 1;
              this.activePhaseIndex = 0;
            }

            if (this.activeInstrIndex < this.compiledProgram.length) {
              const ni = this.compiledProgram[this.activeInstrIndex];
              const np = ni?.phases?.[this.activePhaseIndex];
              hlFrom(np ?? ni);
            } else {
              this.uncompileCode();
              this.addLog('Kod zakończony', 'kompilator rozkazów');
            }
            return;
          }

          // Podświetl następną podfazę (wykona się w kolejnym kroku)
          const nextSub = st.list[st.idx];
          hlFrom(nextSub, st.phaseRef, st.pick);
          return;
        }

        // STOP - zatrzymaj program
        if (rawPhase.stop === true) {
          hlFrom(phase);
          this.uncompileCode();
          this.addLog('STOP - program zatrzymany', 'kompilator rozkazów');
          return;
        }

        // Pauza na breakpoint PRZED wykonaniem zwykłej fazy
        {
          const nextSrc = Number.isFinite(rawPhase?.srcLine) ? rawPhase.srcLine : undefined;
          if (shouldPauseOn(nextSrc)) {
            if (Number.isFinite(nextSrc)) this.activeLine = nextSrc;
            this.addLog(`Pauza na breakpoint @${nextSrc}`, 'system');
            this._stopRun();
            return;
          }
        }

        // Podświetl i wykonaj
        hlFrom(rawPhase);
        {
          const signalsSet = new Set(Object.keys(rawPhase).filter((k) => rawPhase[k] === true));
          this.nextLine = signalsSet;
          this.executeSignalsFromNextLine();
        }

        // Jeśli faza zawierała 'wel', programCounter został zmieniony
        if (rawPhase.wel === true) {
          // PC w kontekście compiledProgram[] to indeks instrukcji, nie adres pamięci
          const target = this.programCounter;
          if (target >= 0 && target < this.compiledProgram.length) {
            this.activeInstrIndex = target;
            this.activePhaseIndex = 0;
            const ai = this.compiledProgram[this.activeInstrIndex];
            const ap = ai?.phases?.[this.activePhaseIndex];
            hlFrom(ap ?? ai);
          } else {
            this.addLog(`Skok poza zakres programu: PC=${target}`, 'Błąd');
            this.uncompileCode();
          }
          return;
        }

        // Przejdź do następnej fazy
        this.activePhaseIndex += 1;

        // Koniec faz tej instrukcji? Przejdź do następnej
        if (this.activePhaseIndex >= (instr.phases?.length || 0)) {
          this.activeInstrIndex += 1;
          this.activePhaseIndex = 0;
        }

        // Sprawdź czy nie wyszliśmy poza program
        if (this.activeInstrIndex >= this.compiledProgram.length) {
          this.uncompileCode();
          this.addLog('Kod zakończony', 'kompilator rozkazów');
          return;
        }

        // Podświetl następną fazę
        const ni = this.compiledProgram[this.activeInstrIndex];
        const np = ni?.phases?.[this.activePhaseIndex];
        hlFrom(np ?? ni);
        return;
      }

      //  (tekstowe fazy po średnikach) ---
      if (!this.manualMode) {
        if (this.activeLine < 0) this.activeLine = 0;
        if (this.activeLine >= this.compiledCode.length) {
          this.uncompileCode();
          this.addLog('Kod zakończony', 'kompilator rozkazów');
          return;
        }

        // Pauza na breakpoint PRZED wykonaniem tej linii
        const nextSrc = this.activeLine; // za chwilę będzie wykonana
        if (shouldPauseOn(nextSrc)) {
          this.addLog(`Pauza na breakpoint @${nextSrc}`, 'system');
          this._stopRun();
          this.activeLine = nextSrc; // zostaw highlight na tej linii
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
          this.addLog('Kod zakończony', 'kompilator rozkazów');
        } else if (!this._headless) {
          this._refreshHighlight();
        }
      } else {
        // Tryb ręczny – ignorujemy breakpointy (użytkownik sam decyduje o kroku)
        this.executeSignalsFromNextLine();
        if (!this._headless) this._refreshHighlight();
      }
    },

    _refreshHighlight() {
      if (!this.codeCompiled) return;

      if (this._condState) {
        const st = this._condState;
        // 1) pierwszy klik – SHOW_IF
        if (st.stage === 'SHOW_IF') {
          if (Number.isFinite(st.phaseRef?.srcLine)) {
            this.activeLine = st.phaseRef.srcLine;
            return;
          }
        }
        // 2) drugi i kolejne – RUN_BRANCH
        const idx = Math.min(st.idx ?? 0, (st.list?.length ?? 1) - 1);
        const curr = st.list?.[idx];
        if (curr && Number.isFinite(curr.srcLine)) {
          this.activeLine = curr.srcLine;
          return;
        }
        // awaryjnie – offset względem IF
        if (Number.isFinite(st.phaseRef?.srcLine)) {
          this.activeLine = st.phaseRef.srcLine + (st.pick === 'T' ? 1 : 2);
          return;
        }
      }

      // Jeżeli mamy przypięte srcLine — to ich używamy.
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

      // awaryjnie: licznik faz „na piechotę”
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

      // legacy zakres
      const max = (this.compiledCode?.length || 1) - 1;
      this.activeLine = Math.max(0, Math.min(this.activeLine || 0, max));
    },

    detectAndHandleStackOperations() {
      const signals = this.nextLine;

      // DNS wyws wea wyak wes
      if (signals.has('wyws') && signals.has('wea') && signals.has('wyak') && signals.has('wes')) {
        this.stackPush('Data', this.ACC);
        return;
      }

      // PZS - zdejmij dane ze stosu
      if (
        signals.has('czyt') &&
        signals.has('wys') &&
        signals.has('weja') &&
        signals.has('przep') &&
        signals.has('weak') &&
        signals.has('iws') &&
        signals.has('wyl') &&
        signals.has('wea')
      ) {
        console.log('PZS: popping stack to ACC');
        // Zapisz adres przed zwiększeniem WS (iws wykona się później w executeSignalsFromNextLine)
        const memAddrToClear = this.WS & this.addrMask();

        // Zdejmij wartość z logicznego stosu
        this.stackPop('Data');

        // Zaplanuj wyczyszczenie pamięci po wykonaniu wszystkich sygnałów
        this._pendingMemoryClear = memAddrToClear;
        return;
      }

      // SDP
      if (signals.has('dws') && signals.has('wyws') && signals.has('wyls') && signals.has('pisz')) {
        this.stackPush('Address', this.programCounter);
        return;
      }

      // PWR - powrót z podprogramu (zdejmij adres ze stosu)
      if (signals.has('czyt') && signals.has('wys') && signals.has('sa') && signals.has('wel') && signals.has('iws')) {
        console.log('PWR: powrót z podprogramu');
        const memAddrToClear = this.WS & this.addrMask();

        const returnAddr = this.stackPop('Address');
        console.log('PWR: returnAddr=', returnAddr);

        this._pendingMemoryClear = memAddrToClear;
        return;
      }
    },

    executeSignalsFromNextLine() {
      // Clear all active timeouts to prevent signal overlap
      if (!this.isFastRunning) this.clearActiveTimeouts();

      // Debug: log all signals in this phase
      // console.log('executeSignalsFromNextLine: signals=', Array.from(this.nextLine));

      // Detect stack operations based on signal combinations
      this.detectAndHandleStackOperations();

      // all wy's first
      if (this.nextLine.has('wyl')) this.wyl();
      if (this.nextLine.has('czyt')) this.czyt();
      if (this.nextLine.has('pisz')) this.pisz();
      if (this.nextLine.has('wys')) this.wys();
      if (this.nextLine.has('stop')) this.stop();
      if (this.nextLine.has('wyad')) this.wyad();
      if (this.nextLine.has('wyak')) this.wyak();
      if (this.nextLine.has('wyx')) this.wyx();
      if (this.nextLine.has('wyy')) this.wyy();
      if (this.nextLine.has('wyws')) this.wyws();
      if (this.nextLine.has('wyls')) this.wyls();
      if (this.nextLine.has('wyg')) this.wyg();
      if (this.nextLine.has('wyrb')) this.wyrb();
      if (this.nextLine.has('wyap')) this.wyap();
      if (this.nextLine.has('wyrm')) this.wyrm();
      if (this.nextLine.has('wyrz')) this.wyrz();
      if (this.nextLine.has('wyrp')) this.wyrp();

      if (this.nextLine.has('sa')) this.sa();
      if (this.nextLine.has('as')) this.as();

      // then all we's
      if (this.nextLine.has('wea')) this.wea();
      if (this.nextLine.has('weja')) this.weja();
      if (this.nextLine.has('wex')) this.wex();
      if (this.nextLine.has('wey')) this.wey();
      if (this.nextLine.has('wes')) this.wes();
      if (this.nextLine.has('wei')) this.wei();
      if (this.nextLine.has('wel')) this.wel();
      if (this.nextLine.has('werm')) this.werm();
      if (this.nextLine.has('weap')) this.weap();
      if (this.nextLine.has('werz')) this.werz();
      if (this.nextLine.has('werp')) this.werp();

      // all math
      if (this.nextLine.has('dod')) this.dod();
      if (this.nextLine.has('ode')) this.ode();
      if (this.nextLine.has('przep')) this.przep();
      if (this.nextLine.has('mno')) this.mno();
      if (this.nextLine.has('dziel')) this.dziel();
      if (this.nextLine.has('shr')) this.shr();
      if (this.nextLine.has('shl')) this.shl();
      if (this.nextLine.has('neg')) this.neg();
      if (this.nextLine.has('lub')) this.lub();
      if (this.nextLine.has('i')) this.i();

      if (this.nextLine.has('iak')) this.iak();
      if (this.nextLine.has('dak')) this.dak();

      if (this.nextLine.has('weak')) this.weak();

      if (this.nextLine.has('il')) this.il();
      if (this.nextLine.has('dl')) this.dl();

      if (this.nextLine.has('iws')) this.iws();
      if (this.nextLine.has('dws')) this.dws();
      if (this.nextLine.has('werb')) this.werb();
      if (this.nextLine.has('start')) this.start();
      if (this.nextLine.has('ustrm')) this.ustrm();
      if (this.nextLine.has('czrm')) this.czrm();
      this.nextLine.clear();

      // Wykonaj odroczone wyczyszczenie pamięci (po PZS/PWR)
      if (this._pendingMemoryClear !== null) {
        const idx = this._pendingMemoryClear;
        this.mem[idx] = 0;
        this.addLog(`Wyczyszczono komórkę pamięci [${idx}] po zdjęciu ze stosu`, 'stos');
        this._pendingMemoryClear = null;
      }
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

    // natychmiastowy tryb – używany przez runToEndFast (bez sygnałów i bez timeoutów)
    _instant(fn) {
      if (this.isFastRunning) {
        fn();
        return true;
      }
      return false;
    },

    /* COMMANDS */
    il() {
      if (
        this._instant(() => {
          this.programCounter++;
        })
      )
        return;
      this.signals.il = true;
      this.programCounter++;
      const timeoutId = setTimeout(() => {
        this.signals.il = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    dl() {
      if (
        this._instant(() => {
          this.programCounter--;
        })
      )
        return;
      this.signals.dl = true;
      this.programCounter--;
      const timeoutId = setTimeout(() => {
        this.signals.dl = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    wyl() {
      if (
        this._instant(() => {
          this.BusA = this.programCounter;
        })
      )
        return;
      this.signals.wyl = true;
      this.signals.busA = true;
      this.BusA = this.programCounter;
      const timeoutId = setTimeout(() => {
        this.signals.wyl = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
      this.holdBus('A');
    },
    wel() {
      if (
        this._instant(() => {
          this.programCounter = this.BusA;
        })
      )
        return;
      this.signals.wel = true;
      this.signals.busA = true;
      this.programCounter = this.BusA;
      const timeoutId = setTimeout(() => {
        this.signals.wel = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
      this.holdBus('A');
    },
    wyad() {
      if (
        this._instant(() => {
          this.BusA = this.I;
        })
      )
        return;
      this.signals.wyad = true;
      this.signals.busA = true;
      this.BusA = this.I;
      const timeoutId = setTimeout(() => {
        this.signals.wyad = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
      this.holdBus('A');
    },
    wei() {
      if (
        this._instant(() => {
          const mask = (1 << this.addresBits) - 1;
          this.I = this.BusS & mask;
        })
      )
        return;
      this.signals.wei = true;
      this.signals.busS = true;
      const mask = (1 << this.addresBits) - 1;
      this.I = this.BusS & mask;
      const timeoutId = setTimeout(() => {
        this.signals.wei = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
      this.holdBus('S');
    },

    iak() {
      if (
        this._instant(() => {
          this.ACC = this.toWord(this.ACC + 1);
        })
      )
        return;
      this.signals.iak = true;
      this.ACC = this.toWord(this.ACC + 1);
      const timeoutId = setTimeout(() => {
        this.signals.iak = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    dak() {
      if (
        this._instant(() => {
          this.ACC = this.toWord(this.ACC - 1);
        })
      )
        return;
      this.signals.dak = true;
      this.ACC = this.toWord(this.ACC - 1);
      const timeoutId = setTimeout(() => {
        this.signals.dak = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },

    weak() {
      if (
        this._instant(() => {
          this.ACC = this.toWord(this.JAML);
        })
      )
        return;
      this.signals.weak = true;
      this.ACC = this.toWord(this.JAML);
      const timeoutId = setTimeout(() => {
        this.signals.weak = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    weja() {
      if (
        this._instant(() => {
          this.JAML = this.toWord(this.BusS);
        })
      )
        return;
      this.signals.weja = true;
      this.signals.busS = true;
      this.JAML = this.toWord(this.BusS);
      const timeoutId = setTimeout(() => {
        this.signals.weja = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
      this.holdBus('S');
    },
    wyak() {
      if (
        this._instant(() => {
          this.BusS = this.toWord(this.ACC);
        })
      )
        return;
      this.signals.wyak = true;
      this.signals.busS = true;
      this.BusS = this.toWord(this.ACC);
      const timeoutId = setTimeout(() => {
        this.signals.wyak = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
      this.holdBus('S');
    },

    dod() {
      if (
        this._instant(() => {
          this.JAML = this.toWord(this.JAML + this.ACC);
        })
      )
        return;
      this.signals.dod = true;
      this.JAML = this.toWord(this.JAML + this.ACC);
      const timeoutId = setTimeout(() => {
        this.signals.dod = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    ode() {
      if (
        this._instant(() => {
          this.JAML = this.toWord(this.ACC - this.JAML);
        })
      )
        return;
      this.signals.ode = true;
      this.JAML = this.toWord(this.ACC - this.JAML);
      const timeoutId = setTimeout(() => {
        this.signals.ode = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    przep() {
      if (
        this._instant(() => {
          this.ACC = this.toWord(this.JAML);
        })
      )
        return;
      this.signals.przep = true;
      this.ACC = this.toWord(this.JAML);
      const timeoutId = setTimeout(() => {
        this.signals.przep = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    mno() {
      if (
        this._instant(() => {
          this.JAML = this.toWord(this.ACC * this.JAML);
        })
      )
        return;
      this.signals.mno = true;
      this.JAML = this.toWord(this.ACC * this.JAML);
      const timeoutId = setTimeout(() => {
        this.signals.mno = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    dziel() {
      if (
        this._instant(() => {
          const d = this.JAML & 0xff;
          this.JAML = this.toWord(d === 0 ? 0 : Math.trunc(this.ACC / d));
        })
      )
        return;
      this.signals.dziel = true;
      const d = this.JAML & 0xff;
      this.JAML = this.toWord(d === 0 ? 0 : Math.trunc(this.ACC / d));
      const timeoutId = setTimeout(() => {
        this.signals.dziel = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    shr() {
      if (
        this._instant(() => {
          const sh = this.JAML & 7;
          this.ACC = this.toWord((this.ACC & this.wordMask()) >>> sh);
        })
      )
        return;
      this.signals.shr = true;
      const sh = this.JAML & 7;
      this.ACC = this.toWord((this.ACC & this.wordMask()) >>> sh);
      const timeoutId = setTimeout(() => {
        this.signals.shr = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    shl() {
      if (
        this._instant(() => {
          const sh = this.JAML & 7;
          this.ACC = this.toWord(this.ACC << sh);
        })
      )
        return;
      this.signals.shl = true;
      const sh = this.JAML & 7;
      this.ACC = this.toWord(this.ACC << sh);
      const timeoutId = setTimeout(() => {
        this.signals.shl = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    neg() {
      if (
        this._instant(() => {
          this.ACC = this.toWord(-this.ACC);
        })
      )
        return;
      this.signals.neg = true;
      this.ACC = this.toWord(-this.ACC);
      const timeoutId = setTimeout(() => {
        this.signals.neg = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    lub() {
      if (
        this._instant(() => {
          this.ACC = this.toWord(this.ACC | this.JAML);
        })
      )
        return;
      this.signals.lub = true;
      this.ACC = this.toWord(this.ACC | this.JAML);
      const timeoutId = setTimeout(() => {
        this.signals.lub = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    i() {
      if (
        this._instant(() => {
          this.ACC = this.toWord(this.ACC & this.JAML);
        })
      )
        return;
      this.signals.i = true;
      this.ACC = this.toWord(this.ACC & this.JAML);
      const timeoutId = setTimeout(() => {
        this.signals.i = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },

    wyx() {
      if (
        this._instant(() => {
          this.BusS = this.toWord(this.X);
        })
      )
        return;
      this.signals.wyx = true;
      this.signals.busS = true;
      this.BusS = this.toWord(this.X);
      const timeoutId = setTimeout(() => {
        this.signals.wyx = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
      this.holdBus('S');
    },
    wex() {
      if (
        this._instant(() => {
          this.X = this.toWord(this.BusS);
        })
      )
        return;
      this.signals.wex = true;
      this.signals.busS = true;
      this.X = this.toWord(this.BusS);
      const timeoutId = setTimeout(() => {
        this.signals.wex = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
      this.holdBus('S');
    },
    wyy() {
      if (
        this._instant(() => {
          this.BusS = this.toWord(this.Y);
        })
      )
        return;
      this.signals.wyy = true;
      this.signals.busS = true;
      this.BusS = this.toWord(this.Y);
      const timeoutId = setTimeout(() => {
        this.signals.wyy = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
      this.holdBus('S');
    },
    wey() {
      if (
        this._instant(() => {
          this.Y = this.toWord(this.BusS);
        })
      )
        return;
      this.signals.wey = true;
      this.signals.busS = true;
      this.Y = this.toWord(this.BusS);
      const timeoutId = setTimeout(() => {
        this.signals.wey = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
      this.holdBus('S');
    },

    wea() {
      if (
        this._instant(() => {
          this.A = this.BusA & this.addrMask();
        })
      )
        return;
      this.signals.wea = true;
      this.signals.busA = true;
      this.A = this.BusA & this.addrMask();
      const timeoutId = setTimeout(() => {
        this.signals.wea = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
      this.holdBus('A');
    },
    wes() {
      if (
        this._instant(() => {
          this.S = this.toWord(this.BusS);
        })
      )
        return;
      this.signals.wes = true;
      this.signals.busS = true;
      this.S = this.toWord(this.BusS);
      const timeoutId = setTimeout(() => {
        this.signals.wes = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
      this.holdBus('S');
    },
    wys() {
      if (
        this._instant(() => {
          this.BusS = this.toWord(this.S);
        })
      )
        return;
      this.signals.wys = true;
      this.signals.busS = true;
      this.BusS = this.toWord(this.S);
      console.log('WYS: S=', this.S, 'BusS=', this.BusS);
      const timeoutId = setTimeout(() => {
        this.signals.wys = false;
        // this.signals.busS = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
      this.holdBus('S');
    },

    stop() {
      if (
        this._instant(() => {
          // zatrzymaj natychmiast w szybkim trybie
          this._stopRun();
          this.codeCompiled = false;
          this.nextLine.clear();
        })
      )
        return;

      this.signals.stop = true;
      const id = setTimeout(() => {
        this.signals.stop = false;
      }, this.oddDelay);
      this.activeTimeouts.push(id);

      this._stopRun();
      this.codeCompiled = false;
      this.nextLine.clear();
    },

    as() {
      if (
        this._instant(() => {
          this.BusS = this.BusA;
        })
      )
        return;
      this.signals.as = true;
      this.signals.busA = true;
      this.signals.busS = true;
      this.BusS = this.BusA;
      const timeoutId = setTimeout(() => {
        this.signals.as = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
      this.holdBus('A');
      this.holdBus('S');
    },
    sa() {
      if (
        this._instant(() => {
          this.BusA = this.BusS;
        })
      )
        return;
      this.signals.sa = true;
      this.signals.busA = true;
      this.signals.busS = true;
      this.BusA = this.BusS;
      const timeoutId = setTimeout(() => {
        this.signals.sa = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
      this.holdBus('A');
      this.holdBus('S');
    },

    czyt() {
      if (
        this._instant(() => {
          const idx = this.A & this.addrMask();
          this.S = this.toWord(this.mem[idx] ?? 0);
        })
      )
        return;
      this.signals.czyt = true;
      const idx = this.A & this.addrMask();
      this.S = this.toWord(this.mem[idx] ?? 0);
      console.log('CZYT: A=', this.A, 'idx=', idx, 'mem[idx]=', this.mem[idx], 'S=', this.S);
      const timeoutId = setTimeout(() => {
        this.signals.czyt = false;
      }, this.oddDelay);

      this.activeTimeouts.push(timeoutId);
    },
    pisz() {
      if (
        this._instant(() => {
          const idx = this.A & this.addrMask();
          this.mem[idx] = this.toWord(this.S);
        })
      )
        return;
      this.signals.pisz = true;
      const idx = this.A & this.addrMask();
      this.mem[idx] = this.toWord(this.S);
      const timeoutId = setTimeout(() => {
        this.signals.pisz = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },

    wyws() {
      if (
        this._instant(() => {
          this.BusA = this.WS & this.addrMask();
        })
      )
        return;
      this.signals.wyws = true;
      this.signals.busA = true;
      this.BusA = this.WS & this.addrMask();
      const id = setTimeout(() => {
        this.signals.wyws = false;
      }, this.oddDelay);
      this.activeTimeouts.push(id);
      this.holdBus('A');
    },
    iws() {
      if (
        this._instant(() => {
          const size = 1 << this.addresBits;
          this.WS = (this.WS + 1) % size;
        })
      )
        return;
      this.signals.iws = true;
      const size = 1 << this.addresBits;
      this.WS = (this.WS + 1) % size;
      const id = setTimeout(() => {
        this.signals.iws = false;
      }, this.oddDelay);
      this.activeTimeouts.push(id);
    },
    dws() {
      if (
        this._instant(() => {
          const size = 1 << this.addresBits;
          this.WS = (this.WS - 1 + size) % size;
        })
      )
        return;
      this.signals.dws = true;
      const size = 1 << this.addresBits;
      this.WS = (this.WS - 1 + size) % size;
      const id = setTimeout(() => {
        this.signals.dws = false;
      }, this.oddDelay);
      this.activeTimeouts.push(id);
    },

    wyls() {
      if (
        this._instant(() => {
          this.BusS = this.toWord(this.programCounter);
        })
      )
        return;
      this.signals.wyls = true;
      this.signals.busS = true;
      this.BusS = this.toWord(this.programCounter);
      const id = setTimeout(() => {
        this.signals.wyls = false;
      }, this.oddDelay);
      this.activeTimeouts.push(id);
      this.holdBus('S');
    },
    wyg() {
      if (
        this._instant(() => {
          const g = this.DEV_READY ? 1 : 0;
          this.BusS = this.toWord(g);
          this.G = g;
        })
      )
        return;
      this.signals.wyg = true;
      this.signals.busS = true;
      const g = this.DEV_READY ? 1 : 0;
      this.BusS = this.toWord(this.DEV_READY ? 1 : 0);
      this.G = this.DEV_READY ? 1 : 0;
      const id = setTimeout(() => {
        this.signals.wyg = false;
      }, this.oddDelay);
      this.activeTimeouts.push(id);
      this.holdBus('S');
    },
    werb() {
      if (
        this._instant(() => {
          const v = this.ACC & this.wordMask();
          this.DEV_OUT = v;
          this.RB = v;
        })
      )
        return;
      this.signals.werb = true;
      const v = this.ACC & this.wordMask();
      this.DEV_OUT = v;
      this.RB = v;
      const id = setTimeout(() => {
        this.signals.werb = false;
      }, this.oddDelay);
      this.activeTimeouts.push(id);
    },
    wyrb() {
      if (
        this._instant(() => {
          const canRead = this.DEV_READY === 0;
          const v = canRead ? this.DEV_IN & this.wordMask() : 0;
          this.BusS = v;
          this.RB = v;
          if (canRead) {
            this.DEV_IN = 0;
            this.DEV_READY = 1;
            this.G = 1;
          }
        })
      )
        return;
      this.signals.wyrb = true;
      this.signals.busS = true;
      const canRead = this.DEV_READY === 0;
      const v = canRead ? this.DEV_IN & this.wordMask() : 0;
      this.BusS = v;
      this.RB = v;
      if (canRead) {
        this.DEV_IN = 0;
        this.DEV_READY = 1;
        this.G = 1;
      }
      const id = setTimeout(() => {
        this.signals.wyrb = false;
      }, this.oddDelay);
      this.activeTimeouts.push(id);
      this.holdBus('S');
    },
    start() {
      if (
        this._instant(() => {
          if (this.DEV_BUSY) return;
          // w szybkim trybie „symulujemy” natychmiastowe przygotowanie
          this.DEV_BUSY = true;
          this.DEV_READY = this.DEV_IN ? 0 : 1;
          this.DEV_BUSY = false;
          this.DEV_READY = this.DEV_IN ? 0 : 1;
          this.G = this.DEV_READY ? 1 : 0;
        })
      )
        return;

      if (this.DEV_BUSY) return;
      this.DEV_BUSY = true;
      this.signals.start = true;
      this.DEV_READY = this.DEV_IN ? 0 : 1;
      const id = setTimeout(() => {
        this.signals.start = false;
        this.DEV_BUSY = false;
        this.DEV_READY = this.DEV_IN ? 0 : 1;
        this.G = this.DEV_READY ? 1 : 0;
      }, this.oddDelay * 2);
      this.activeTimeouts.push(id);
    },

    // Interrupt register signals
    werm() {
      // BusS -> RM (Write to Mask Register)
      console.log('WERM called: BusS=', this.BusS, 'S=', this.S, 'A=', this.A);
      this.signals.werm = true;
      this.signals.busS = true;
      this.RM = this.BusS & 0xf; // 4-bitowa maska
      const id = setTimeout(() => {
        this.signals.werm = false;
      }, this.oddDelay);
      this.activeTimeouts.push(id);
      console.log('WERM result: RM=', this.RM);
      this.addLog(`RM ustawione na ${this.RM} (maska przerwań) [BusS=${this.BusS}]`, 'system');
    },

    wyrm() {
      // RM -> BusS (Read from Mask Register)
      this.signals.wyrm = true;
      this.signals.busS = true;
      this.BusS = this.RM & 0xf;
      const id = setTimeout(() => {
        this.signals.wyrm = false;
      }, this.oddDelay);
      this.activeTimeouts.push(id);
      this.holdBus('S');
    },

    wyap() {
      // AP -> BusA (Read from Address Pointer)
      this.signals.wyap = true;
      this.signals.busA = true;
      this.BusA = this.AP & this.addrMask();
      const id = setTimeout(() => {
        this.signals.wyap = false;
      }, this.oddDelay);
      this.activeTimeouts.push(id);
      this.holdBus('A');
    },

    weap() {
      // BusA -> AP (Write to Address Pointer)
      this.signals.weap = true;
      this.signals.busA = true;
      this.AP = this.BusA & this.addrMask();
      const id = setTimeout(() => {
        this.signals.weap = false;
      }, this.oddDelay);
      this.activeTimeouts.push(id);
    },

    wyrz() {
      // RZ -> BusS (Read from Request Register)
      this.signals.wyrz = true;
      this.signals.busS = true;
      this.BusS = this.RZ & 0xf;
      const id = setTimeout(() => {
        this.signals.wyrz = false;
      }, this.oddDelay);
      this.activeTimeouts.push(id);
      this.holdBus('S');
    },

    werz() {
      // BusS -> RZ (Write to Request Register)
      this.signals.werz = true;
      this.signals.busS = true;
      this.RZ = this.BusS & 0xf;
      const id = setTimeout(() => {
        this.signals.werz = false;
      }, this.oddDelay);
      this.activeTimeouts.push(id);
      this.addLog(`RZ ustawione na ${this.RZ} (zgłoszenia przerwań)`, 'system');
    },

    wyrp() {
      // RP -> BusS (Read from Priority Register)
      this.signals.wyrp = true;
      this.signals.busS = true;
      this.BusS = this.RP & 0xf;
      const id = setTimeout(() => {
        this.signals.wyrp = false;
      }, this.oddDelay);
      this.activeTimeouts.push(id);
      this.holdBus('S');
    },

    werp() {
      // BusS -> RP (Write to Priority Register)
      this.signals.werp = true;
      this.signals.busS = true;
      this.RP = this.BusS & 0xf;
      const id = setTimeout(() => {
        this.signals.werp = false;
      }, this.oddDelay);
      this.activeTimeouts.push(id);
      this.addLog(`RP ustawione na ${this.RP} (priorytet przerwania)`, 'system');
    },

    ustrm() {
      // Ustaw bit w RM (z magistrali A) - zablokuj przerwanie
      console.log('USTRM called, BusA=', this.BusA);
      this.signals.ustrm = true;
      this.signals.busA = true;
      const bitNum = this.BusA & 0x3; // 0-3
      this.RM |= 1 << bitNum; // Ustaw bit
      this.RM &= 0xf; // Maska 4-bitowa
      const id = setTimeout(() => {
        this.signals.ustrm = false;
      }, this.oddDelay);
      this.activeTimeouts.push(id);
      this.addLog(`Ustawiono bit ${bitNum} w RM (RM=${this.RM}) - zablokowano IRQ${bitNum + 1}`, 'przerwanie');
    },

    czrm() {
      // Wyczyść bit w RM (z magistrali A) - odblokuj przerwanie
      this.signals.czrm = true;
      this.signals.busA = true;
      const bitNum = this.BusA & 0x3; // 0-3
      this.RM &= ~(1 << bitNum); // Wyczyść bit
      this.RM &= 0xf; // Maska 4-bitowa
      const id = setTimeout(() => {
        this.signals.czrm = false;
      }, this.oddDelay);
      this.activeTimeouts.push(id);
      this.addLog(`Wyczyszczono bit ${bitNum} w RM (RM=${this.RM}) - odblokowano IRQ${bitNum + 1}`, 'przerwanie');
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
</style>
