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
      @update:programCounter="programCounter = $event"
      @update:I="I = $event"
      @update:ACC="ACC = $event"
      @update:JAML="JAML = $event"
      @update:A="A = $event"
      @update:S="S = $event"
      @update:X="X = $event"
      @update:Y="Y = $event"
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
      :light-mode="lightMode"
      :number-format="numberFormat"
      :code-bits="codeBits"
      :addres-bits="addresBits"
      :odd-delay="oddDelay"
      :extras="extras"
      @close="settingsOpen = false"
      @update:lightMode="lightMode = $event"
      @update:numberFormat="numberFormat = $event"
      @update:codeBits="codeBits = $event"
      @update:addresBits="addresBits = $event"
      @update:oddDelay="oddDelay = $event"
      @update:extras="extras = $event"
      @resetValues="resetValues()"
      @defaultSettings="restoreDefaults()"
      @open-command-list="openCommandList()"
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
  </div>
</template>

<script>
import MaszynaW from '@/components/MaszynaW.vue'
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
import SettingsOverlay  from '@/components/SettingsOverlay.vue';
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

      code: 'czyt wys wei il;\nwyl wea;',
      compiledCode: [],
      // Structured micro-program (preferred execution format)
      compiledProgram: [],
      activeInstrIndex: -1,
      activePhaseIndex: 0,
      activeLine: 0,
      nextLine: new Set(),

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
    };
  },
  methods: {
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
      const busASignals = ['wyl', 'wel', 'wyad', 'wea', 'as', 'sa'];

      // Sygnały używające magistrali S
      const busSSignals = ['wei', 'weja', 'wyak', 'wyx', 'wex', 'wyy', 'wey', 'wes', 'wys', 'as', 'sa'];

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
        this.code = 'czyt wys wei il;\nwyl wea;';
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
      return this.commandList[dec >> this.memoryAddresBits];
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
          if (kw === 'IF' || kw === 'THEN' || kw === 'ELSE' || kw === 'KONIEC' || kw === 'Z' || kw === 'M') continue;
          if (!signalslist.has(token)) {
            this.addLog(`Sygnał "${token}" nie został rozpoznany w linii ${lineIdx + 1}`, 'Błąd parsera kodu');
            return;
          }
        }
      }

      const program = [];
      let pc = 0;
      for (const line of rawLines) {
        const parts = line.split(/\s+/).filter(Boolean);
        if (parts.length === 0) continue;

        // strip labels
        const labels = [];
        while (parts[0] && parts[0].startsWith('@')) {
          labels.push(parts.shift().slice(1));
        }

        // treat remaining tokens as a single phase (legacy micro input)
        const phase = {};
        for (const sig of parts) {
          const kw = sig.toUpperCase();
          if (kw === 'IF' || kw === 'THEN' || kw === 'ELSE' || kw === 'KONIEC') break;
          phase[sig] = true;
        }

        const entry = {
          pc,
          asmLine: '(micro)',
          phases: [phase],
          meta: { kind: 'NONE', labels },
        };
        program.push(entry);
        pc += 1;
      }

      this.compiledProgram = program;
      this.compiledCode = rawLines; // keep for display/legacy
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
      // Structured program path
      if (this.codeCompiled && Array.isArray(this.compiledProgram) && this.compiledProgram.length > 0) {
        if (this.activeInstrIndex < 0) {
          this.activeInstrIndex = 0;
          this.activePhaseIndex = 0;
        }

        if (this.activeInstrIndex >= this.compiledProgram.length) {
          this.uncompileCode();
          this.addLog('Kod zakończony', 'kompilator rozkazów');
          return;
        }

        const instr = this.compiledProgram[this.activeInstrIndex];
        let totalPhases = 0;
        for (let i = 0; i < this.activeInstrIndex; i++) {
          totalPhases += this.compiledProgram[i].phases.length;
        }
        this.activeLine = totalPhases + this.activePhaseIndex;
        const rawPhase = instr.phases[this.activePhaseIndex];

        // Special handling for conditional jumps
        if (instr.meta?.kind === 'CJUMP') {
          // Evaluate condition and choose branch
          const flagValue = this.evaluateFlag(instr.meta.flag);
          const resolvedPhase = this.getResolvedPhase(rawPhase);
          const signalsSet = new Set(Object.keys(resolvedPhase || {}).filter((k) => resolvedPhase[k] === true));
          this.nextLine = signalsSet;
          this.executeSignalsFromNextLine();

          // Log the branch choice
          const branchChoice = flagValue ? 'PRAWDA' : 'FAŁSZ';
          const targetPc = flagValue ? instr.meta.trueTarget : instr.meta.falseTarget;
          this.addLog(`[CJUMP] Skok warunkowy ${instr.meta.flag}: ${branchChoice} -> PC=${targetPc}`, 'system');

          // Immediately jump after executing the chosen branch
          this.activeInstrIndex = targetPc ?? this.activeInstrIndex + 1;
          this.activePhaseIndex = 0;
          return;
        }

        // Normal phase execution for non-conditional instructions
        const resolvedPhase = this.getResolvedPhase(rawPhase);
        const signalsSet = new Set(Object.keys(resolvedPhase || {}).filter((k) => resolvedPhase[k] === true));
        this.nextLine = signalsSet;
        this.executeSignalsFromNextLine();

        // Handle manual mode advancement
        if (this.manualMode) {
          this.activePhaseIndex += 1;
          if (this.activePhaseIndex >= instr.phases.length) {
            // End of current instruction in manual mode - handle jumps
            if (instr.meta?.kind === 'JUMP') {
              // Unconditional jump (SOB)
              this.activeInstrIndex = instr.meta.trueTarget ?? this.activeInstrIndex + 1;
              this.activePhaseIndex = 0;
              this.addLog(`Skok bezwarunkowy -> PC=${instr.meta.trueTarget}`, 'system');
            } else {
              // Normal instruction - proceed to next
              this.activeInstrIndex += 1;
              this.activePhaseIndex = 0;
            }
          }
        }

        if (!this.manualMode) {
          this.activePhaseIndex += 1;
          if (this.activePhaseIndex >= instr.phases.length) {
            // Check if this instruction has jump metadata
            if (instr.meta?.kind === 'JUMP') {
              // Unconditional jump (SOB)
              this.activeInstrIndex = instr.meta.trueTarget ?? this.activeInstrIndex + 1;
              this.activePhaseIndex = 0;
              this.addLog(`Skok bezwarunkowy -> PC=${instr.meta.trueTarget}`, 'system');
            } else {
              // Normal instruction - proceed to next
              this.activeInstrIndex += 1;
              this.activePhaseIndex = 0;
            }
          }
          if (this.activeInstrIndex >= this.compiledProgram.length) {
            this.uncompileCode();
            this.addLog('Kod zakończony', 'kompilator rozkazów');
          }
        }
        return;
      }

      // Legacy path
      if (!this.manualMode) {
        if (this.activeLine < 0) this.activeLine = 0;
        if (this.activeLine >= this.compiledCode.length) {
          this.uncompileCode();
          this.addLog('Kod zakończony', 'kompilator rozkazów');
          return;
        }
        const commands = this.compiledCode[this.activeLine].split(' ').filter(Boolean);
        this.nextLine.clear();
        for (const c of commands) this.nextLine.add(c);
      }
      this.executeSignalsFromNextLine();
      if (!this.manualMode) {
        this.activeLine++;
        if (this.activeLine >= this.compiledCode.length) {
          this.uncompileCode();
          this.addLog('Kod zakończony', 'kompilator rozkazów');
        }
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
      switch (f) {
        case 'Z':
        case 'ZERO':
          return this.ACC === 0;
        case 'NZ':
        case 'NZERO':
          return this.ACC !== 0;
        case 'NEG':
        case 'N':
        case 'M':
          return this.ACC < 0;
        case 'POS':
        case 'P':
          return this.ACC >= 0;
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
      this.BusA = this.I;
      const timeoutId = setTimeout(() => {
        this.signals.wyad = false;
        this.signals.busA = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    wei() {
      this.signals.wei = true;
      this.signals.busS = true;
      this.I = this.BusS;
      const timeoutId = setTimeout(() => {
        this.signals.wei = false;
        this.signals.busS = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    iak() {
      this.signals.iak = true;
      this.ACC++;
      const timeoutId = setTimeout(() => {
        this.signals.iak = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    dak() {
      this.signals.dak = true;
      this.ACC--;
      const timeoutId = setTimeout(() => {
        this.signals.dak = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    weak() {
      this.signals.weak = true;
      this.ACC = this.JAML;
      const timeoutId = setTimeout(() => {
        this.signals.weak = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    weja() {
      this.signals.weja = true;
      this.signals.busS = true;
      this.JAML = this.BusS;
      const timeoutId = setTimeout(() => {
        this.signals.weja = false;
        this.signals.busS = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    wyak() {
      this.signals.wyak = true;
      this.signals.busS = true;
      this.BusS = this.ACC;
      const timeoutId = setTimeout(() => {
        this.signals.wyak = false;
        this.signals.busS = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    dod() {
      this.signals.dod = true;
      this.JAML += this.ACC;
      const timeoutId = setTimeout(() => {
        this.signals.dod = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    ode() {
      this.signals.ode = true;
      this.JAML -= this.ACC;
      const timeoutId = setTimeout(() => {
        this.signals.ode = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    przep() {
      this.signals.przep = true;
      this.ACC = this.JAML;
      const timeoutId = setTimeout(() => {
        this.signals.przep = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    mno() {
      this.signals.mno = true;
      this.ACC *= this.JAML;
      const timeoutId = setTimeout(() => {
        this.signals.mno = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    dziel() {
      this.signals.dziel = true;
      this.ACC /= this.JAML;
      const timeoutId = setTimeout(() => {
        this.signals.dziel = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    shr() {
      this.signals.shr = true;
      this.ACC >>= this.JAML;
      const timeoutId = setTimeout(() => {
        this.signals.shr = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    shl() {
      this.signals.shl = true;
      this.ACC <<= this.JAML;
      const timeoutId = setTimeout(() => {
        this.signals.shl = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    neg() {
      this.signals.neg = true;
      this.ACC = -this.ACC;
      const timeoutId = setTimeout(() => {
        this.signals.neg = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    lub() {
      this.signals.lub = true;
      this.ACC |= this.JAML;
      const timeoutId = setTimeout(() => {
        this.signals.lub = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    i() {
      this.signals.i = true;
      this.ACC &= this.JAML;
      const timeoutId = setTimeout(() => {
        this.signals.i = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    wyx() {
      this.signals.wyx = true;
      this.signals.busS = true;
      this.BusS = this.X;
      const timeoutId = setTimeout(() => {
        this.signals.wyx = false;
        this.signals.busS = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    wex() {
      this.signals.wex = true;
      this.signals.busS = true;
      this.X = this.BusS;
      const timeoutId = setTimeout(() => {
        this.signals.wex = false;
        this.signals.busS = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    wyy() {
      this.signals.wyy = true;
      this.signals.busS = true;
      this.BusS = this.Y;
      const timeoutId = setTimeout(() => {
        this.signals.wyy = false;
        this.signals.busS = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    wey() {
      this.signals.wey = true;
      this.signals.busS = true;
      this.Y = this.BusS;
      const timeoutId = setTimeout(() => {
        this.signals.wey = false;
        this.signals.busS = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },

    wea() {
      this.signals.wea = true;
      this.signals.busA = true;
      this.A = this.BusA;
      const timeoutId = setTimeout(() => {
        this.signals.wea = false;
        this.signals.busA = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    wes() {
      this.signals.wes = true;
      this.signals.busS = true;
      this.S = this.BusS;
      const timeoutId = setTimeout(() => {
        this.signals.wes = false;
        this.signals.busS = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    wys() {
      this.signals.wys = true;
      this.signals.busS = true;
      this.BusS = this.S;
      const timeoutId = setTimeout(() => {
        this.signals.wys = false;
        this.signals.busS = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    stop() {
      this.signals.stop = true;
      const timeoutId = setTimeout(() => {
        this.signals.pisz = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);

      this.codeCompiled = false;
      this.nextLine.clear();
    },
    as() {
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
      this.signals.czyt = true;
      this.S = this.mem[this.A];
      const timeoutId = setTimeout(() => {
        this.signals.czyt = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    pisz() {
      this.signals.pisz = true;
      this.mem[this.A] = this.S;
      const timeoutId = setTimeout(() => {
        this.signals.pisz = false;
      }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
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

    defaultSettings() {
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

      this.addLog('Ustawienia zostały przywrócone do wartości domyślnych', 'system');
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
</style>
