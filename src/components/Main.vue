<template>
  <TopBar
    @open-chat="aiChatOpen = true"
    @open-settings="settingsOpen = true"
    @toggle-console="toggleConsole"
    :hasConsoleErrors="hasConsoleErrors"
  />

  <div id="wLayout">
    <MaszynaW
      :manual-mode="manualMode"
      :signals="signals"
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
      :decToCommand="decToCommand"
      :decToArgument="decToArgument"
      @clickItem="handleSignalToggle"
      @update:programCounter="handleProgramCounterUpdate"
      @update:I="handleIUpdate"
      @update:ACC="handleACCUpdate"
      @update:JAML="handleJAMLUpdate"
      @update:A="handleAUpdate"
      @update:S="handleSUpdate"
      @update:mem="handleMemUpdate"
      @update:X="handleXUpdate"
      @update:Y="handleYUpdate"
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
        @setManualMode="(flag) => (flag ? manualModeCheck() : manualModeUncheck())"
        @update:code="(code) => (this.code = code)"
      />
      <!--HACK WITH COMPILE CODE 2, it is an old version of the compile code function-->
      <ExecutionControls
        :manual-mode="manualMode"
        :code-compiled="codeCompiled"
        :code="code"
        @compile="compileCode2"
        @edit="uncompileCode"
        @step="executeLine"
        @run="runCode"
      />
    </div>

    <ProgramSection
      :manualMode="manualMode"
      :commandList="commandList"
      :program="program"
      :autocompleteEnabled="autocompleteEnabled"
      @update:code="handleProgramSectionCompile($event)"
      @log="addLog($event.message, $event.class, $event.error)"
      @initMemory="applyInitMemory($event)"
    />

    <Console
      ref="console"
      :logs="logs.slice().reverse()"
      :class="{ 'console-collapsed': !consoleOpen }"
      @close="closeConsole"
      @clear="clearConsole"
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
      :number-format="numberFormat"
      :code-bits="codeBits"
      :addres-bits="addresBits"
      :odd-delay="oddDelay"
      :extras="extras"
      :autocomplete-enabled="autocompleteEnabled"
      :memory-addres-bits="memoryAddresBits"
      @close="closePopups('settingsOpen')"
      @update:lightMode="lightMode = $event"
      @update:numberFormat="numberFormat = $event"
      @update:codeBits="codeBits = $event"
      @update:addresBits="addresBits = $event"
      @update:oddDelay="oddDelay = $event"
      @update:extras="extras = $event"
      @resetValues="resetValues()"
      @defaultSettings="restoreDefaults()"
      @open-command-list="openCommandList()"
      @update:memoryAddresBits="memoryAddresBits = $event"
      @update:autocompleteEnabled="autocompleteEnabled = $event"
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
      title="Asystent AI 🤖"
      placeholder="Wpisz wiadomość…"
      instruction="Opisz operację uzyskania kodu maszynowego:"
    />

    <!-- Toast notification -->
    <div v-if="toastVisible" class="toast-notification" @click="hideToast">
      <span class="toast-message">{{ toastMessage }}</span>
      <button class="toast-close" @click.stop="hideToast" aria-label="Zamknij powiadomienie">×</button>
    </div>
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
import Console from '@/components/Console.vue';
import SettingsOverlay from '@/components/SettingsOverlay.vue';
import ExecutionControls from './ExecutionControls.vue';
import ProgramEditor from './ProgramEditor.vue';
import { commandList } from '@/utils/data/commands.js';
import { parse } from '@/WLAN/parser';

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
    Console,
    SettingsOverlay,
    ExecutionControls,
    ProgramEditor,
  },

  computed: {
    anyPopupOpen() {
      return this.commandListOpen || this.aiChatOpen || this.settingsOpen;
    },
  },

  created() {
    this.ws = null;
  },

  data() {
    return {
      autocompleteEnabled: true,
      isMobile: window.innerWidth <= 768,
      suppressBroadcast: false,
      prevSignals: {},
      prevMem: [],
      addresBits: 4,
      codeBits: 6,
      memoryAddresBits: 6,
      JAML: 0,
      mem: [0b000001, 0b000010, 0b000100, 0b001000, 0b010001, 0b100010, 0b100100, 0b111000],
      programCounter: 0,
      JAML: 0,

      X: 0,
      Y: 0,
      ACC: 0,
      I: 0,
      A: 0,
      S: 0,
      BusA: 0,
      BusS: 0,
      WS: 0,
      DEV_READY: 0,
      DEV_IN: 0,
      DEV_OUT: 0,

      code: 'czyt wys wei il;\nwyad wea;\nczyt wys weja dod weak wyl wea;',
      program: 'DOD',
      compiledCode: [],
      // Structured micro-program (preferred execution format)
      compiledProgram: [],
      activeInstrIndex: -1,
      activePhaseIndex: 0,
      activeLine: 0,
      nextLine: new Set(),
      _stepGuard: 0, // licznik anty-pętli
      _branchJoin: null, // punkt złączenia po CJUMP (compileCode2)
      // Array to store active timeout IDs for signal management
      activeTimeouts: [],

      // DEFAULT IS 100ms
      oddDelay: 100, // Delay for odd commands in ms

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
          'przp',
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
        przp: false,
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
        wyls: false,
        wyg: false,
        werb: false,
        wyrb: false,
        start: false,
      },
      extras: {
        xRegister: false,
        yRegister: false,
        dl: false,
        jamlExtras: false,
        busConnectors: false,
        showInvisibleRegisters: false,
      },
      logs: [],

      manualMode: true,
      codeCompiled: false,

      disappearBlour: false,
      settingsOpen: false,
      commandListOpen: false,
      aiChatOpen: false,

      lightMode: true,

      consoleOpen: false,
      hasConsoleErrors: false,

      // Toast notifications
      toastMessage: '',
      toastVisible: false,
      toastTimeoutId: null,
    };
  },
  provide() {
    return {
      validateRegisterValue: this.validateRegisterValue,
      showToast: this.showToast,
      getMaxValueForRegister: this.getMaxValueForRegister,
    };
  },
  methods: {
    // Validation functions
    getMaxValueForRegister(registerType) {
      const wordSize = this.codeBits + this.addresBits; // Dynamic word size
      const maxWordValue = (1 << wordSize) - 1;

      switch (registerType) {
        case 'ACC':
        case 'S':
        case 'X':
        case 'Y':
        case 'JAML':
        case 'BusA':
        case 'BusS':
          return maxWordValue; // Full word size (codeBits + addresBits)
        case 'I':
          return (1 << this.addresBits) - 1; // Address bits only
        case 'A':
        case 'programCounter':
          return (1 << this.memoryAddresBits) - 1; // Memory address bits
        case 'memory':
          return maxWordValue; // Memory values use full word size too
        default:
          return maxWordValue;
      }
    },

    validateRegisterValue(value, registerType, registerName) {
      const numValue = parseInt(value, 10);

      if (isNaN(numValue)) {
        this.showToast(`Wartość "${value}" nie jest prawidłową liczbą dla rejestru ${registerName}.`);
        return false;
      }

      // if (numValue < 0) {
      //   this.showToast(`Wartość nie może być ujemna dla rejestru ${registerName}.`);
      //   return false;
      // }

      const maxValue = this.getMaxValueForRegister(registerType);
      if (numValue > maxValue) {
        let maxBits;
        if (registerType === 'I') {
          maxBits = this.addresBits;
        } else if (registerType === 'A' || registerType === 'programCounter') {
          maxBits = this.memoryAddresBits;
        } else {
          maxBits = this.codeBits + this.addresBits;
        }
        this.showToast(
          `Wartość ${numValue} przekracza maksymalną dozwoloną wartość ${maxValue} dla rejestru ${registerName} (${maxBits} bitów).`
        );
        return false;
      }

      return true;
    },

    // Toast notification system
    showToast(message, duration = 3000) {
      // Clear existing toast timeout
      if (this.toastTimeoutId) {
        clearTimeout(this.toastTimeoutId);
      }

      this.toastMessage = message;
      this.toastVisible = true;

      this.toastTimeoutId = setTimeout(() => {
        this.hideToast();
      }, duration);
    },

    hideToast() {
      this.toastVisible = false;
      if (this.toastTimeoutId) {
        clearTimeout(this.toastTimeoutId);
        this.toastTimeoutId = null;
      }
    },

    // Validated register update methods
    updateRegisterWithValidation(value, registerType, registerName, updateCallback) {
      if (this.validateRegisterValue(value, registerType, registerName)) {
        const numValue = parseInt(value, 10);
        updateCallback(numValue);
        return true;
      }
      return false;
    },

    // Register update handlers with validation
    handleProgramCounterUpdate(value) {
      this.updateRegisterWithValidation(value, 'programCounter', 'Licznik programu', (val) => {
        this.programCounter = val;
      });
    },

    handleIUpdate(value) {
      this.updateRegisterWithValidation(value, 'I', 'Rejestr I', (val) => {
        this.I = val;
      });
    },

    handleACCUpdate(value) {
      this.updateRegisterWithValidation(value, 'ACC', 'Akumulator', (val) => {
        this.ACC = val;
      });
    },

    handleJAMLUpdate(value) {
      this.updateRegisterWithValidation(value, 'JAML', 'Rejestr JAML', (val) => {
        this.JAML = val;
      });
    },

    handleAUpdate(value) {
      this.updateRegisterWithValidation(value, 'A', 'Rejestr A', (val) => {
        this.A = val;
      });
    },

    handleSUpdate(value) {
      this.updateRegisterWithValidation(value, 'S', 'Rejestr S', (val) => {
        this.S = val;
      });
    },

    handleXUpdate(value) {
      this.updateRegisterWithValidation(value, 'X', 'Rejestr X', (val) => {
        this.X = val;
      });
    },

    handleYUpdate(value) {
      this.updateRegisterWithValidation(value, 'Y', 'Rejestr Y', (val) => {
        this.Y = val;
      });
    },

    handleMemUpdate(newMemArray) {
      // Memory validation is handled in MemoryContent component
      // Here we just update the memory array
      this.mem = newMemArray;
    },

    _refreshHighlight() {
      if (!this.codeCompiled) return;

      // STRUKTURALNY mikro-program (compileCode2 / generator)
      if (Array.isArray(this.compiledProgram) && this.compiledProgram.length > 0) {
        let line = 0;
        const instrIdx = Math.max(0, this.activeInstrIndex);
        for (let i = 0; i < instrIdx; i++) {
          const phasesLen = this.compiledProgram[i]?.phases?.length || 1;
          line += phasesLen;
        }
        const phaseIdx = Math.max(0, this.activePhaseIndex || 0);
        this.activeLine = line + phaseIdx;
        return;
      }

      // ŚCIEŻKA LEGACY (compileCode): aktywna linia nie może wyjść poza zakres
      const max = (this.compiledCode?.length || 1) - 1;
      this.activeLine = Math.max(0, Math.min(this.activeLine || 0, max));
    },

    to8(v) {
      return v & 0xff;
    },

    addrMask() {
      return (1 << this.memoryAddresBits) - 1;
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

    applyInitMemory(assignments) {
      // assignments: Array<{ addr:number, val:number }>
      const size = 1 << this.memoryAddresBits;
      const nextMem = new Array(size).fill(0);
      // start from current mem to preserve any manual setup
      for (let i = 0; i < Math.min(this.mem.length, size); i++) nextMem[i] = this.mem[i];
      for (const { addr, val } of assignments) {
        if (addr >= 0 && addr < size) {
          nextMem[addr] = val & 0xff;
        } else {
          this.addLog(`Adres poza zakresem pamięci przy inicjalizacji: ${addr}`, 'Error');
        }
      }
      this.mem = nextMem;
      this.addLog(`Zastosowano inicjalizację pamięci (${assignments.length} wpisów)`, 'system');
    },
    initWebsocket() {
      // Local Test
      this.ws = new WebSocket('ws://localhost:8080');
      // ESP32
      // this.ws = new WebSocket('ws://192.168.4.1:80/ws');
      this.ws.binaryType = 'arraybuffer';
      this.ws.addEventListener('open', () => {
        console.log('[WS] Connected to server');
        this.sendFullDataToESP();
      });

      this.ws.addEventListener('error', (err) => {
        console.error('[WS] Connection error', err);
      });

      this.ws.addEventListener('message', async ({ data }) => {
        let text;
        if (data instanceof Blob) {
          text = await data.text();
        } else if (data instanceof ArrayBuffer) {
          text = new TextDecoder().decode(data);
        } else {
          text = data;
        }

        console.log('[WS] Text received:', text);
        let msg;
        try {
          msg = JSON.parse(text);
        } catch (e) {
          console.warn('[WS] Nieprawidłowy JSON:', text);
          return;
        }

        // Local Test
        // if (msg.type === 'signal-toggle') {
        //   console.log('[WS] Received toggle:', msg.id, msg.value);
        //   this.handleRemoteToggleLocalWebSocket(msg.id, msg.value);
        // } else if (msg.type === 'mem-update') {
        //   this.handleRemoteMemUpdate(msg.index, msg.value);
        // }

        // ESP32
        if (msg.type === 'button_press') {
          console.log('[WS] Received toggle:', msg);
          this.handleRemoteToggleESPWebSocket(msg.buttonName);
        }
      });
    },

    handleRemoteToggleLocalWebSocket(id, value) {
      this.suppressBroadcast = true;
      if (value) {
        this.nextLine.add(id);
      } else {
        this.nextLine.delete(id);
      }
      this.signals[id] = value;
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
      const busASignals = ['wyl', 'wel', 'wyad', 'wea', 'as', 'sa', 'wyws'];

      // Sygnały używające magistrali S
      const busSSignals = ['wei', 'weja', 'wyak', 'wyx', 'wex', 'wyy', 'wey', 'wes', 'wys', 'as', 'sa', 'wyls', 'wyg', 'wyrb'];

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
          'memoryAddresBits',
          'oddDelay',
          'numberFormat',
          'extras',
          'lightMode',
          'registerFormats',
          'autocompleteEnabled',
        ];

        settingsToRestore.forEach((setting) => {
          if (parsed[setting] !== undefined) {
            this[setting] = parsed[setting];
          }
        });

        // Validate memoryAddresBits to ensure it doesn't exceed the limit of 10 (2^10 = 1024 cells)
        if (this.memoryAddresBits > 10) {
          this.memoryAddresBits = 10;
          this.addLog('Rozmiar pamięci został ograniczony do maksymalnie 1024 komórek (10 bitów)', 'system');
        }

        // Always reset to default values for registers and program state
        this.A = 0;
        this.ACC = 0;
        this.JAML = 0;
        this.programCounter = 0;
        this.I = 0;
        this.X = 0;
        this.Y = 0;
        this.S = 0;
        this.BusA = 0;
        this.BusS = 0;

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
    },
    saveToLS() {
      // Create a copy of data without logs
      const dataToSave = { ...this.$data };
      delete dataToSave.logs;
      delete dataToSave.hasConsoleErrors;
      localStorage.setItem('W', JSON.stringify(dataToSave));
    },
    addLog(message, classification = 'info', errorObj = null) {
      const timestamp = new Date();

      // Enhanced log entry structure that supports both legacy and new error formats
      const logEntry = {
        timestamp,
        message,
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
    formatNumber(number) {
      if (typeof number !== 'number' || isNaN(number)) {
        return 'Błąd: Nieprawidłowa liczba.';
      }

      const formatters = {
        dec: () => number,
        hex: () => '0x' + Math.floor(number).toString(16).toUpperCase(),
        bin: () => '0b' + Math.floor(number).toString(2),
      };

      return formatters[this.numberFormat]?.() ?? `EE${number}`;
    },
    decToCommand(dec) {
      return this.commandList[dec >> this.addresBits];
    },
    decToArgument(dec) {
      return dec & ((1 << this.memoryAddresBits) - 1);
    },

    resizeMemory() {
      const newSize = 1 << this.memoryAddresBits;
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

      if (!this.manualMode) {
        this.uncompileCode();
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

    compileCode2() {
      if (!this.code) {
        this.addLog('Brak kodu do kompilacji', 'Błąd');
        return;
      }

      let signalslist = new Set([
        ...this.avaiableSignals.always,
        ...(this.extras.xRegister ? this.avaiableSignals.xRegister : []),
        ...(this.extras.yRegister ? this.avaiableSignals.yRegister : []),
        ...(this.extras.dl ? this.avaiableSignals.dl : []),
        ...(this.extras.jamlExtras ? this.avaiableSignals.jamlExtras : []),
        ...(this.extras.busConnectors ? this.avaiableSignals.busConnectors : []),
      ]);

      // Build structured micro-program from simple micro lines separated by ';'
      const rawLines = this.code
        .split(';')
        .map((l) => l.replace(/\n/g, ' ').trim())
        .filter((l) => l.length > 0);

      // Basic validation (ignore labels that start with '@' and IF/THEN/ELSE tokens)
      for (let [lineIdx, line] of rawLines.entries()) {
        const parts = line.split(/\s+/).filter(Boolean);
        for (const token of parts) {
          if (token.startsWith('@')) continue;
          const kw = token.toUpperCase();
          // temp solution, for now will do
          // TODO: change to something more robust in the future
          const control = new Set(['IF', 'THEN', 'ELSE', 'KONIEC', 'Z', 'N', 'M', 'ZERO', 'NEG']);
          if (control.has(kw)) continue;
          if (!signalslist.has(token)) {
            this.addLog(`Sygnał "${token}" nie został rozpoznany w linii ${lineIdx + 1}`, 'Błąd parsera kodu');
            return;
          }
        }
      }

      const program = [];
      let pc = 0;

      // zbierz etykiety -> pc po zbudowaniu programu
      const labelsOfEntry = []; // parallel array do program: labels z tej linii
      const pendingJumps = []; // wpisy CJUMP do późniejszej rezolucji

      for (const line of rawLines) {
        const parts = line.split(/\s+/).filter(Boolean);
        if (parts.length === 0) continue;

        // 1) IF <flag> THEN @t [ELSE @f]
        if (/^IF$/i.test(parts[0])) {
          const flag = (parts[1] || '').toUpperCase(); // 'Z' | 'N' | 'M'...
          const thenIdx = parts.findIndex((t) => /^THEN$/i.test(t));
          const elseIdx = parts.findIndex((t) => /^ELSE$/i.test(t));
          const tTok = thenIdx >= 0 ? parts[thenIdx + 1] : null;
          const fTok = elseIdx >= 0 ? parts[elseIdx + 1] : null;
          const trueLabel = tTok ? String(tTok).replace(/^@/, '') : null;
          const falseLabel = fTok ? String(fTok).replace(/^@/, '') : null;

          const entry = {
            pc,
            asmLine: line,
            phases: [{}], // brak sygnałów – to tylko decyzja skoku
            meta: { kind: 'CJUMP', flag, trueLabel, falseLabel },
          };
          program.push(entry);
          labelsOfEntry.push([]); // ta linia sama nie definiuje etykiet
          pc += 1;
          continue;
        }

        // 2) Normalna linia mikro (opcjonalne etykiety na początku)
        const labels = [];
        while (parts[0] && parts[0].startsWith('@')) {
          labels.push(parts.shift().slice(1));
        }

        const phase = {};
        for (const tok of parts) {
          const kw = tok.toUpperCase();
          if (kw === 'IF' || kw === 'THEN' || kw === 'ELSE' || kw === 'KONIEC') break;
          phase[tok] = true;
        }

        const entry = { pc, asmLine: '(micro)', phases: [phase], meta: { kind: 'NONE' } };
        program.push(entry);
        labelsOfEntry.push(labels);
        pc += 1;
      }

      // 3) Rezolucja etykiet dla CJUMP
      // 3) Rezolucja etykiet dla CJUMP
      const labelToPc = new Map();
      for (let i = 0; i < program.length; i++) {
        for (const L of labelsOfEntry[i]) labelToPc.set(L.toLowerCase(), program[i].pc);
      }

      for (const entry of program) {
        if (entry.meta?.kind === 'CJUMP') {
          const t = entry.meta.trueLabel ? labelToPc.get(entry.meta.trueLabel.toLowerCase()) : undefined;
          const f = entry.meta.falseLabel ? labelToPc.get(entry.meta.falseLabel.toLowerCase()) : undefined;

          entry.meta.trueTarget = typeof t === 'number' ? t : entry.pc + 1;
          entry.meta.falseTarget = typeof f === 'number' ? f : entry.pc + 1;

          // punkt złączenia = pierwszy PC po obydwu gałęziach (zakładamy po 1 linii na gałąź)
          const jt = Math.max(entry.meta.trueTarget, entry.meta.falseTarget) + 1;
          entry.meta.joinTarget = Number.isFinite(jt) ? jt : entry.pc + 1;
        }
      }

      this.compiledProgram = program;
      this.compiledCode = rawLines;
      this.codeCompiled = true;
      this.activeInstrIndex = -1;
      this.activePhaseIndex = 0;
      this.activeLine = -1;
      this.nextLine.clear();
      this.executeLine();

      this.addLog('Kod skompilowany pomyślnie (strukturalny)', 'kompilator rozkazów');
    },

    compileCode() {
      if (!this.code) {
        this.addLog('Brak kodu do kompilacji', 'Błąd');
        return;
      }

      let ast;
      try {
        ast = parse(this.code); // parsujemy cały mikroprogram
      } catch (e) {
        const parts = [`Błąd parsera: ${e?.message || String(e)}`];
        if (e && e.frame) parts.push('\n' + e.frame);
        if (e && e.hint) parts.push(`\nPodpowiedź: ${e.hint}`);
        this.addLog(parts.join(''), 'Błąd parsera kodu');
        return;
      }

      // zbiór wszystkich dopuszczalnych sygnałów
      const signalsList = new Set([
        ...this.avaiableSignals.always,
        ...(this.extras.xRegister ? this.avaiableSignals.xRegister : []),
        ...(this.extras.yRegister ? this.avaiableSignals.yRegister : []),
        ...(this.extras.dl ? this.avaiableSignals.dl : []),
        ...(this.extras.jamlExtras ? this.avaiableSignals.jamlExtras : []),
        ...(this.extras.busConnectors ? this.avaiableSignals.busConnectors : []),
      ]);

      const compiledLines = [];

      // przejdź po każdej instrukcji w AST
      for (const node of ast.body) {
        if (node.type === 'Instruction') {
          // flatten: nazwa + wszystkie argumenty (string lub LabelRef)
          const parts = [node.name, ...node.args.map((arg) => (typeof arg === 'string' ? arg : arg.name))];

          // walidacja: każdy element musi być znanym sygnałem
          for (const sig of parts) {
            if (!signalsList.has(sig)) {
              this.addLog(`Sygnał "${sig}" nie został rozpoznany w instrukcji "${node.name}"`, 'Błąd parsera kodu');
              return;
            }
          }

          compiledLines.push(parts.join(' '));
        } else if (node.type === 'Directive') {
          // todo: dodać obsługę dyrektyw
          this.addLog(`Dyrektywa "${node.name}" nie jest obsługiwana w tej wersji`, 'Błąd parsera kodu');
          return;
        }
      }

      // ustawienie wynikowego microprogramu
      this.compiledCode = compiledLines;
      this.codeCompiled = true;
      this.activeLine = -1;
      this.nextLine.clear();
      this.executeLine();

      this.addLog('Kod skompilowany pomyślnie', 'kompilator rozkazów');
    },
    uncompileCode() {
      this.codeCompiled = false;
      this.nextLine.clear();
      this.activeInstrIndex = -1;
      this.activePhaseIndex = 0;
    },
    executeLine() {
      // --- STRUKTURALNY mikro-program ---
      if (this.codeCompiled && Array.isArray(this.compiledProgram) && this.compiledProgram.length > 0) {
        // Inicjalizacja
        if (this.activeInstrIndex < 0) {
          this.activeInstrIndex = 0;
          this.activePhaseIndex = 0;
          this._stepGuard = 0;
          this._branchJoin = null;
        }

        // Anty-pętla
        this._stepGuard = (this._stepGuard || 0) + 1;
        if (this._stepGuard > 100000) {
          this.addLog('Przerwano: przekroczono limit kroków (prawdopodobna pętla).', 'system');
          this.uncompileCode();
          return;
        }

        // Koniec programu
        if (this.activeInstrIndex >= this.compiledProgram.length) {
          this.uncompileCode();
          this.addLog('Kod zakończony', 'kompilator rozkazów');
          return;
        }

        const instr = this.compiledProgram[this.activeInstrIndex];

        // Podświetl dokładnie to, co ZARAZ wykonamy
        this._refreshHighlight();

        // 1) Skok warunkowy CJUMP (z compileCode2)
        if (instr.meta?.kind === 'CJUMP') {
          const flag = (instr.meta.flag || 'Z').toUpperCase();
          const takeTrue = this.evaluateFlag(flag);
          const target = takeTrue ? instr.meta.trueTarget : instr.meta.falseTarget;

          const joinTarget =
            instr.meta.joinTarget ??
            Math.max(
              Number(instr.meta.trueTarget ?? this.activeInstrIndex + 1),
              Number(instr.meta.falseTarget ?? this.activeInstrIndex + 1)
            ) + 1;

          this._branchJoin = Number.isFinite(joinTarget) ? joinTarget : null;
          this.addLog(`[CJUMP ${flag}] ${takeTrue ? 'TRUE' : 'FALSE'} -> PC=${target} (join=${this._branchJoin})`, 'system');

          this.activeInstrIndex = typeof target === 'number' ? target : this.activeInstrIndex + 1;
          this.activePhaseIndex = 0;

          // Po zmianie wskaźników — zaktualizuj highlight i wyjdź (kolejny krok wykona następną linię)
          this._refreshHighlight();
          return;
        }

        // 2) Zwykła faza lub faza warunkowa (generator)
        const rawPhase = instr.phases[this.activePhaseIndex] || {};

        // 2a) Faza warunkowa z listami truePhases/falsePhases
        if (rawPhase && rawPhase.conditional === true) {
          const cond = this.evaluateFlag(rawPhase.flag);
          const branch = cond ? rawPhase.truePhases : rawPhase.falsePhases;

          const hasWel = Array.isArray(branch) && branch.some((p) => p && p.wel === true);

          for (const p of branch || []) {
            const signals = new Set(Object.keys(p || {}).filter((k) => p[k] === true));
            this.nextLine = signals;
            this.executeSignalsFromNextLine();
          }

          // Przesuwamy „logicznie” o 1 fazę (sam ConditionalPhase zajmuje 1 slot)
          this.activePhaseIndex += 1;

          if (hasWel) {
            const target = Number(this.programCounter) | 0;
            if (Number.isFinite(target) && target >= 0 && target < this.compiledProgram.length) {
              this.addLog(`(branch) wel -> PC=${target}`, 'system');
              this.activeInstrIndex = target;
              this.activePhaseIndex = 0;
            } else {
              this.addLog(`(branch) wel: niepoprawny cel L=${target}`, 'Błąd');
              this.activeInstrIndex += 1;
              this.activePhaseIndex = 0;
            }
            this._refreshHighlight();
            return;
          }

          if (this.activePhaseIndex >= instr.phases.length) {
            this.activeInstrIndex += 1;
            this.activePhaseIndex = 0;
          }

          if (this.activeInstrIndex >= this.compiledProgram.length) {
            this.uncompileCode();
            this.addLog('Kod zakończony', 'kompilator rozkazów');
          } else {
            this._refreshHighlight();
          }
          return;
        }

        // 2b) Zwykła faza niewarunkowa
        if (rawPhase.END_BRANCH === true) {
          this.activeInstrIndex++;
          this.activePhaseIndex = 0;
          this._refreshHighlight();
          return;
        }
        if (rawPhase.stop === true) {
          this.uncompileCode();
          this.addLog('STOP – program zatrzymany', 'kompilator rozkazów');
          return;
        }

        {
          const signalsSet = new Set(Object.keys(rawPhase).filter((k) => rawPhase[k] === true));
          this.nextLine = signalsSet;
          this.executeSignalsFromNextLine();
        }

        // wel (skok przez PC) – tylko gdy nie jesteśmy w trakcie łączenia gałęzi
        if (rawPhase.wel === true && !this._branchJoin) {
          const target = Number(this.programCounter) | 0;
          if (Number.isFinite(target) && target >= 0 && target < this.compiledProgram.length) {
            this.addLog(`wel -> PC=${target}`, 'system');
            this.activeInstrIndex = target;
            this.activePhaseIndex = 0;
          } else {
            this.addLog(`wel: niepoprawny cel skoku L=${target} (poza programem)`, 'Błąd');
            this.activeInstrIndex += 1;
            this.activePhaseIndex = 0;
          }
          this._refreshHighlight();
          return;
        }

        // Następna faza / instrukcja
        this.activePhaseIndex += 1;

        if (this.activePhaseIndex >= instr.phases.length) {
          if (this._branchJoin != null) {
            const join = this._branchJoin | 0;
            this._branchJoin = null;
            this.addLog(`join -> PC=${join}`, 'system');
            this.activeInstrIndex = join;
            this.activePhaseIndex = 0;
          } else if (instr.meta?.kind === 'JUMP') {
            const target = instr.meta.trueTarget ?? this.activeInstrIndex + 1;
            this.activeInstrIndex = target;
            this.activePhaseIndex = 0;
            this.addLog(`Skok bezwarunkowy -> PC=${target}`, 'system');
          } else {
            this.activeInstrIndex += 1;
            this.activePhaseIndex = 0;
          }
        }

        if (this.activeInstrIndex >= this.compiledProgram.length) {
          this.uncompileCode();
          this.addLog('Kod zakończony', 'kompilator rozkazów');
          return;
        }

        this._refreshHighlight();
        return;
      }

      // --- ŚCIEŻKA LEGACY (compileCode) ---
      if (!this.manualMode) {
        if (this.activeLine < 0) this.activeLine = 0;
        if (this.activeLine >= this.compiledCode.length) {
          this.uncompileCode();
          this.addLog('Kod zakończony', 'kompilator rozkazów');
          return;
        }
        // Najpierw ustaw linie do podświetlenia -> potem wykonaj
        const commands = this.compiledCode[this.activeLine].split(' ').filter(Boolean);
        this.nextLine.clear();
        for (const c of commands) this.nextLine.add(c);

        this.executeSignalsFromNextLine();

        this.activeLine++;
        if (this.activeLine >= this.compiledCode.length) {
          this.uncompileCode();
          this.addLog('Kod zakończony', 'kompilator rozkazów');
        } else {
          this._refreshHighlight();
        }
      } else {
        // manualMode + legacy — tylko wykonaj bieżącą linię nextLine
        this.executeSignalsFromNextLine();
        this._refreshHighlight();
      }
    },

    executeSignalsFromNextLine() {
      // Clear all active timeouts to prevent signal overlap
      this.clearActiveTimeouts();

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
      this.nextLine.clear();
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
      const acc8 = this.ACC & 0xff;
      const SIGN = 0x80;

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

    runCode() {
      this.manualMode = false;
      this.clearActiveTimeouts();

      if (this.compiledProgram && this.compiledProgram.length > 0) {
        let safety = 100000;
        if (this.activeInstrIndex < 0) {
          this.activeInstrIndex = 0;
          this.activePhaseIndex = 0;
        }
        while (this.codeCompiled && this.activeInstrIndex >= 0 && this.activeInstrIndex < this.compiledProgram.length && safety-- > 0) {
          this.executeLine();
        }
      } else if (this.compiledCode && this.compiledCode.length > 0) {
        this.activeLine = Math.max(this.activeLine, 0);
        while (this.activeLine < this.compiledCode.length) {
          this.executeLine();
        }
      }
    },

    /* COMMANDS */
    il() {
      this.signals.il = true;
      this.programCounter++;
      const timeoutId = setTimeout(() => {
        this.signals.il = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    dl() {
      this.signals.dl = true;
      this.programCounter--;
      const timeoutId = setTimeout(() => {
        this.signals.dl = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    wyl() {
      this.signals.wyl = true;
      this.signals.busA = true;
      this.BusA = this.programCounter;
      const timeoutId = setTimeout(() => {
        this.signals.wyl = false;
        this.signals.busA = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    wel() {
      this.signals.wel = true;
      this.signals.busA = true;
      this.programCounter = this.BusA;
      const timeoutId = setTimeout(() => {
        this.signals.wel = false;
        this.signals.busA = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    wyad() {
      this.signals.wyad = true;
      this.signals.busA = true;
      this.BusA = this.I; // adres – bez maski 8-bit
      const timeoutId = setTimeout(() => {
        this.signals.wyad = false;
        this.signals.busA = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    wei() {
      this.signals.wei = true;
      this.signals.busS = true;
      const mask = (1 << this.addresBits) - 1;
      this.I = this.BusS & mask; // ładowanie argumentu (adresu)
      const timeoutId = setTimeout(() => {
        this.signals.wei = false;
        this.signals.busS = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },

    iak() {
      this.signals.iak = true;
      this.ACC = this.to8(this.ACC + 1);
      const timeoutId = setTimeout(() => {
        this.signals.iak = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    dak() {
      this.signals.dak = true;
      this.ACC = this.to8(this.ACC - 1);
      const timeoutId = setTimeout(() => {
        this.signals.dak = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },

    weak() {
      // JAML -> ACC (8-bit, U2)
      this.signals.weak = true;
      this.ACC = this.to8(this.JAML);
      const timeoutId = setTimeout(() => {
        this.signals.weak = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    weja() {
      // BusS -> JAML (8-bit)
      this.signals.weja = true;
      this.signals.busS = true;
      this.JAML = this.to8(this.BusS);
      const timeoutId = setTimeout(() => {
        this.signals.weja = false;
        this.signals.busS = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    wyak() {
      // ACC -> BusS (8-bit)
      this.signals.wyak = true;
      this.signals.busS = true;
      this.BusS = this.to8(this.ACC);
      const timeoutId = setTimeout(() => {
        this.signals.wyak = false;
        this.signals.busS = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },

    dod() {
      // JAML = JAML + ACC (8-bit)
      this.signals.dod = true;
      this.JAML = this.to8(this.JAML + this.ACC);
      const timeoutId = setTimeout(() => {
        this.signals.dod = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    ode() {
      this.signals.ode = true;
      this.JAML = this.to8(this.ACC - this.JAML);
      const timeoutId = setTimeout(() => {
        this.signals.ode = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    przep() {
      // JAML -> ACC (8-bit)
      this.signals.przep = true;
      this.ACC = this.to8(this.JAML);
      const timeoutId = setTimeout(() => {
        this.signals.przep = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },

    mno() {
      // ACC = ACC * JAML (8-bit)
      this.signals.mno = true;
      this.ACC = this.to8(this.ACC * this.JAML);
      const timeoutId = setTimeout(() => {
        this.signals.mno = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    dziel() {
      // ACC = ACC / JAML (całk., 8-bit; dzielenie przez 0 -> 0)
      this.signals.dziel = true;
      const d = this.JAML & 0xff;
      this.ACC = this.to8(d === 0 ? 0 : Math.trunc(this.ACC / d));
      const timeoutId = setTimeout(() => {
        this.signals.dziel = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    shr() {
      // logiczne w prawo
      this.signals.shr = true;
      const sh = this.JAML & 7;
      this.ACC = this.to8((this.ACC & 0xff) >>> sh);
      const timeoutId = setTimeout(() => {
        this.signals.shr = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    shl() {
      this.signals.shl = true;
      const sh = this.JAML & 7;
      this.ACC = this.to8(this.ACC << sh);
      const timeoutId = setTimeout(() => {
        this.signals.shl = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    neg() {
      // U2
      this.signals.neg = true;
      this.ACC = this.to8(-this.ACC);
      const timeoutId = setTimeout(() => {
        this.signals.neg = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    lub() {
      // OR (8-bit)
      this.signals.lub = true;
      this.ACC = this.to8(this.ACC | this.JAML);
      const timeoutId = setTimeout(() => {
        this.signals.lub = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    i() {
      // AND (8-bit)
      this.signals.i = true;
      this.ACC = this.to8(this.ACC & this.JAML);
      const timeoutId = setTimeout(() => {
        this.signals.i = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },

    wyx() {
      // X -> BusS (8-bit)
      this.signals.wyx = true;
      this.signals.busS = true;
      this.BusS = this.to8(this.X);
      const timeoutId = setTimeout(() => {
        this.signals.wyx = false;
        this.signals.busS = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    wex() {
      // BusS -> X (8-bit)
      this.signals.wex = true;
      this.signals.busS = true;
      this.X = this.to8(this.BusS);
      const timeoutId = setTimeout(() => {
        this.signals.wex = false;
        this.signals.busS = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    wyy() {
      // Y -> BusS (8-bit)
      this.signals.wyy = true;
      this.signals.busS = true;
      this.BusS = this.to8(this.Y);
      const timeoutId = setTimeout(() => {
        this.signals.wyy = false;
        this.signals.busS = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    wey() {
      // BusS -> Y (8-bit)
      this.signals.wey = true;
      this.signals.busS = true;
      this.Y = this.to8(this.BusS);
      const timeoutId = setTimeout(() => {
        this.signals.wey = false;
        this.signals.busS = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },

    wea() {
      // BusA -> A (adres)
      this.signals.wea = true;
      this.signals.busA = true;
      this.A = this.BusA & this.addrMask();
      const timeoutId = setTimeout(() => {
        this.signals.wea = false;
        this.signals.busA = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    wes() {
      // BusS -> S (8-bit)
      this.signals.wes = true;
      this.signals.busS = true;
      this.S = this.to8(this.BusS);
      const timeoutId = setTimeout(() => {
        this.signals.wes = false;
        this.signals.busS = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    wys() {
      // S -> BusS (8-bit)
      this.signals.wys = true;
      this.signals.busS = true;
      this.BusS = this.to8(this.S);
      const timeoutId = setTimeout(() => {
        this.signals.wys = false;
        this.signals.busS = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },

    stop() {
      this.signals.stop = true;
      const id = setTimeout(() => {
        this.signals.stop = false;
      }, this.oddDelay);
      this.activeTimeouts.push(id);
      this.codeCompiled = false;
      this.nextLine.clear();
    },

    as() {
      // przenośnik między magistralami – zostawiam bez maski, by nie ucinać adresów
      this.signals.as = true;
      this.signals.busA = true;
      this.signals.busS = true;
      this.BusS = this.BusA;
      const timeoutId = setTimeout(() => {
        this.signals.as = false;
        this.signals.busA = false;
        this.signals.busS = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    sa() {
      this.signals.sa = true;
      this.signals.busA = true;
      this.signals.busS = true;
      this.BusA = this.BusS;
      const timeoutId = setTimeout(() => {
        this.signals.sa = false;
        this.signals.busA = false;
        this.signals.busS = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },

    czyt() {
      // S = MEM[A] (8-bit, A w zakresie pamięci)
      this.signals.czyt = true;
      const idx = this.A & this.addrMask();
      this.S = this.to8(this.mem[idx] ?? 0);
      const timeoutId = setTimeout(() => {
        this.signals.czyt = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    pisz() {
      // MEM[A] = S (8-bit, A w zakresie pamięci)
      this.signals.pisz = true;
      const idx = this.A & this.addrMask();
      this.mem[idx] = this.to8(this.S);
      const timeoutId = setTimeout(() => {
        this.signals.pisz = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },

    wyws() {
      // WS -> BusA (adres)
      this.signals.wyws = true;
      this.signals.busA = true;
      const mask = this.addrMask();
      this.BusA = this.WS & mask;
      const id = setTimeout(() => {
        this.signals.wyws = false;
        this.signals.busA = false;
      }, this.oddDelay);
      this.activeTimeouts.push(id);
    },
    iws() {
      this.signals.iws = true;
      const size = 1 << this.memoryAddresBits;
      this.WS = (this.WS + 1) % size;
      const id = setTimeout(() => {
        this.signals.iws = false;
      }, this.oddDelay);
      this.activeTimeouts.push(id);
    },
    dws() {
      this.signals.dws = true;
      const size = 1 << this.memoryAddresBits;
      this.WS = (this.WS - 1 + size) % size;
      const id = setTimeout(() => {
        this.signals.dws = false;
      }, this.oddDelay);
      this.activeTimeouts.push(id);
    },

    wyls() {
      // PC -> BusS (8-bit, bo to magistrala danych)
      this.signals.wyls = true;
      this.signals.busS = true;
      this.BusS = this.to8(this.programCounter);
      const id = setTimeout(() => {
        this.signals.wyls = false;
        this.signals.busS = false;
      }, this.oddDelay);
      this.activeTimeouts.push(id);
    },
    wyg() {
      this.signals.wyg = true;
      this.signals.busS = true;
      this.BusS = this.to8(this.DEV_READY ? 1 : 0);
      const id = setTimeout(() => {
        this.signals.wyg = false;
        this.signals.busS = false;
      }, this.oddDelay);
      this.activeTimeouts.push(id);
    },
    werb() {
      this.signals.werb = true;
      this.DEV_OUT = this.ACC & 0xff;
      const id = setTimeout(() => {
        this.signals.werb = false;
      }, this.oddDelay);
      this.activeTimeouts.push(id);
    },
    wyrb() {
      this.signals.wyrb = true;
      this.signals.busS = true;
      this.BusS = this.DEV_IN & 0xff;
      const id = setTimeout(() => {
        this.signals.wyrb = false;
        this.signals.busS = false;
      }, this.oddDelay);
      this.activeTimeouts.push(id);
    },
    start() {
      this.signals.start = true;
      this.DEV_READY = 0;
      const id = setTimeout(() => {
        this.signals.start = false;
        this.DEV_READY = 1;
      }, this.oddDelay * 2);
      this.activeTimeouts.push(id);
    },
    resetValues() {
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
      this.JAML = 0;
      this.BusA = 0;
      this.BusS = 0;

      // Reset memory to all zeros
      this.mem = new Array(1 << this.memoryAddresBits).fill(0);

      // Reset all signals to false
      for (const key in this.signals) {
        this.signals[key] = false;
      }

      this.nextLine.clear();

      // Clear console logs
      this.logs = [];
      this.hasConsoleErrors = false;

      this.addLog('Wszystkie wartości rejestrów zostały zresetowane', 'system');
    },

    restoreDefaults() {
      // Reset to default settings
      this.memoryAddresBits = 6;
      this.codeBits = 6;
      this.addresBits = 4;
      this.oddDelay = 100;
      this.numberFormat = 'dec';
      this.registerFormats = {
        L: 'dec',
        I: 'dec',
        ACC: 'dec',
        A: 'dec',
        S: 'dec',
        X: 'dec',
        Y: 'dec',
        JAML: 'dec',
        BusA: 'dec',
        BusS: 'dec',
      };
      this.extras = {
        xRegister: false,
        yRegister: false,
        dl: false,
        jamlExtras: false,
        busConnectors: false,
        showInvisibleRegisters: false,
      };

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
        frame: '    3 | LAD 15\n    4 | DOD 20\n  > 5 | BŁĘDNY#ZNAK\n        |           ^\n    6 | SOB start',
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
    memoryAddresBits() {
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
    this.initWebsocket();
    this.loadFromLS();
    this.resizeMemory();

    this.addLog('System zainicjalizowany.', 'System');
    this.prevSignals = { ...this.signals };
    this.prevMem = [...this.mem];

    // Add event listener for key presses
    window.addEventListener('keydown', this.handleKeyPress);
  },

  beforeDestroy() {
    // Remove event listener for key presses
    window.removeEventListener('keydown', this.handleKeyPress);
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

/* Toast notification styles */
.toast-notification {
  position: fixed;
  top: 1rem;
  right: 1rem;
  background-color: var(--panelBackgroundColor);
  border: 0.0625rem solid var(--signal-active);
  color: var(--fontColor);
  padding: 1rem 1.5rem;
  border-radius: var(--default-border-radius);
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.15);
  z-index: 10000;
  max-width: 24rem;
  font-size: 0.875rem;
  line-height: 1.4;
  cursor: pointer;
  transform: translateX(0) translateY(0);
  transition: all 0.25s ease-out;
  backdrop-filter: blur(8px);

  /* Flexbox layout for message and close button */
  display: flex;
  align-items: center;
  gap: 0.75rem;

  /* Add subtle gradient border */
  background: linear-gradient(145deg, var(--panelBackgroundColor), var(--buttonBackgroundColor));

  /* Slide in animation */
  animation: slideInToast 0.25s ease-out;
}

@keyframes slideInToast {
  from {
    transform: translateX(100%) translateY(-50%);
    opacity: 0;
  }
  to {
    transform: translateX(0) translateY(0);
    opacity: 1;
  }
}

.toast-notification:hover {
  background: var(--buttonHoverColor);
  transform: translateY(-0.125rem) scale(1.02);
  box-shadow: 0 0.375rem 1rem rgba(0, 0, 0, 0.2);
  border-color: var(--accentColor);
}

.toast-notification:active {
  transform: translateY(0) scale(0.98);
  transition: all 0.1s ease-out;
}

/* Toast message and close button */
.toast-message {
  flex: 1;
  display: flex;
  align-items: center;
}

.toast-message::before {
  content: '⚠️';
  margin-right: 0.5rem;
  font-size: 1rem;
  opacity: 0.8;
}

.toast-close {
  all: unset;
  cursor: pointer;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background-color: var(--buttonBackgroundColor);
  color: var(--fontColor);
  font-size: 1.25rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease-out;
  flex-shrink: 0;
}

.toast-close:hover {
  background-color: var(--buttonHoverColor);
  transform: scale(1.1);
}

.toast-close:active {
  transform: scale(0.9);
}

/* Dark mode adjustments */
body.darkMode .toast-notification {
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.4);
}

body.lightMode .toast-notification {
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.1);
}
</style>
