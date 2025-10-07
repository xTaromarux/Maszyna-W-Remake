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
        @update:devIn="(v) => { DEV_IN = v; DEV_READY = v ? 0 : 1 }"
        @update:devReady="(v) => { DEV_READY = v }"
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
      :autocompleteEnabled="autocompleteEnabled"
      @update:code="handleProgramSectionCompile($event)"
      @log="addLog($event.message, $event.class, $event.error)"
      @initMemory="applyInitMemory($event)"
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
      @clear-breakpoints="(() => { breakpoints.clear(); breakpoints = new Set(breakpoints); addLog('Usunięto wszystkie breakpointy', 'system'); })()"
      :class="{ 'console-collapsed': !consoleOpen }"
    />
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
      :dec-signed="decSigned"
      :odd-delay="oddDelay"
      :extras="extras"
      :autocomplete-enabled="autocompleteEnabled"
      :memory-addres-bits="memoryAddresBits"
      @close="closePopups('settingsOpen')"
      @update:lightMode="lightMode = $event"
      @update:numberFormat="numberFormat = $event"
      @update:decSigned="decSigned = $event"
      @update:codeBits="codeBits = $event"
      @update:addresBits="addresBits = $event"
      @update:oddDelay="oddDelay = $event"
      @update:extras="(patch) => extras = mergeExtras(extras, patch)"
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
      wsStatus: 'disconnected',
      wsPingTimer: null,
      decSigned: false,
      _condState: null,
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
      RZInputs: [0,0,0,0],
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
      code: 'czyt wys wei il;\nwyad wea;\nczyt wys weja dod weak wyl wea;',
      program: 'DOD',
      compiledCode: [],
      compiledProgram: [],
      activeInstrIndex: -1,
      activePhaseIndex: 0,
      activeLine: 0,
      nextLine: new Set(),
      _stepGuard: 0,
      _branchJoin: null,
      activeTimeouts: [],
      oddDelay: 400,
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
        wews: false,
        wyrm: false,
        wyls: false,
        wyg: false,
        werb: false,
        wyrb: false,
        rint: false,
        eni: false,
        start: false,
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
          try { this.ws.close(); } catch (_) {}
          this.ws = null;
        }
        this.wsStatus = 'connecting';
        setTimeout(() => this.initWebsocket(), 150);
      } catch (e) {
        this.wsStatus = 'error';
        this.addLog('[WS] Reconnect failed', 'Error', { message: String(e) });
      }
    },
    holdBus(which){
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
      return (v & sign) ? v - mod : v;
    },
    getDefaultExtras() {
      return {
        xRegister: false,
        yRegister: false,
        io: { rbRegister: false, gRegister: false },
        stack: {
          wsRegister: false,
          wylsSignal: false
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
      const p   = patch || {};
      return {
        ...base,
        ...src,
        ...p,
        io:         { ...base.io,         ...(src.io || {}),         ...(p.io || {}) },
        stack:      { ...base.stack,      ...(src.stack || {}),      ...(p.stack || {}) },
        interrupts: { ...base.interrupts, ...(src.interrupts || {}), ...(p.interrupts || {}) },
      };
    },
    to8(v) {
      return v & 0xff;
    },
    toWord(v) {
      return v & this.wordMask();
    },
    wordMask() {
      return (1 << (this.codeBits + this.addresBits)) - 1;
    },
    addrMask() {
      return (1 << this.memoryAddresBits) - 1;
    },
    handleProgramSectionCompile(payload) {
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
      const size = 1 << this.memoryAddresBits;
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
          try { msg = JSON.parse(text); } catch (_) { return; }
          if (msg.type === 'pong') return;
          if (msg.type === 'button_press') {
            this.handleRemoteToggleESPWebSocket(msg.buttonName);
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
      this.suppressBroadcast = false;
    },
    checkConflict(signalName) {
      const groups = [
        ['wyad', 'wyl'],
        ['wys', 'wyak'],
        ['il', 'wel'],
        ['czyt', 'pisz'],
        ['iak', 'dak'],
      ];
      const busASignals = ['wyl', 'wel', 'wyad', 'wea', 'as', 'sa', 'wyws', 'wyap', 'wyrm', 'werm'];
      const busSSignals = ['wei', 'weja', 'wyak', 'wyx', 'wex', 'wyy', 'wey', 'wes', 'wys', 'as', 'sa', 'wyls', 'wyg', 'wyrb', 'werb', 'start'];
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
      if (busASignals.includes(signalName)) {
        for (const other of busASignals) {
          if (other === signalName) continue;
          if (this.signals[other]) {
            return `Nie można włączyć „${signalName}" – koliduje z „${other}" (magistrala A zajęta).`;
          }
        }
      }
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
      const groups = [
        ['wyad', 'wyl'],
        ['wys', 'wyak'],
        ['il', 'wel'],
        ['czyt', 'pisz'],
        ['iak', 'dak'],
      ];
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
        if (this.memoryAddresBits > 10) {
          this.memoryAddresBits = 10;
          this.addLog('Rozmiar pamięci został ograniczony do maksymalnie 1024 komórek (10 bitów)', 'system');
        }
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
        this.code = 'czyt wys wei il;\nwyad wea;\nczyt wys weja dod weak wyl wea;';
        this.compiledCode = [];
        this.activeLine = 0;
        this.nextLine = new Set();
        this.codeCompiled = false;
        this.manualMode = true;
        for (const key in this.signals) {
          this.signals[key] = false;
        }
      }
    },
    saveToLS() {
      const dataToSave = { ...this.$data };
      delete dataToSave.logs;
      delete dataToSave.hasConsoleErrors;
      localStorage.setItem('W', JSON.stringify(dataToSave));
    },
    addLog(message, classification = 'info', errorObj = null) {
      const timestamp = new Date();
      const key = `${classification}|${message}`;
      const now = timestamp.getTime();
      if (now - (this._lastLogTs || 0) > 1000) {
        this._lastLogKey = null;
        this._lastLogCount = 0;
      }
      if (this._lastLogKey === key) {
        this._lastLogCount += 1;
        const last = this.logs[this.logs.length - 1];
        if (last) {
          last.message = `${message} ×${this._lastLogCount + 1}`;
          last.timestamp = timestamp;
        }
        this._lastLogTs = now;
        return;
      } else {
        this._lastLogKey = key;
        this._lastLogCount = 0;
        this._lastLogTs = now;
      }
      const logEntry = {
        timestamp,
        message,
        class: classification,
      };
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
      return dec & ((1 << this.memoryAddresBits) - 1);
    },
    resizeMemory() {
      const newSize = 1 << this.memoryAddresBits;
      const newMem = new Array(newSize).fill(0);
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
        this.compiledProgram = Array.isArray(program) ? program : [];
        this.compiledCode    = Array.isArray(rawLines) ? rawLines : [];
        let linePtr = 0;
        for (const entry of this.compiledProgram) {
          if (!entry || !Array.isArray(entry.phases)) continue;
          for (const phase of entry.phases) {
            if (phase && phase.conditional === true) {
              phase.srcLine = linePtr;
              const t0 = phase.truePhases && phase.truePhases[0];
              const f0 = phase.falsePhases && phase.falsePhases[0];
              if (t0) t0.srcLine = linePtr + 1;
              if (f0) f0.srcLine = linePtr + 2;
              linePtr += 3;
            } else {
              if (phase) phase.srcLine = linePtr;
              linePtr += 1;
            }
          }
          const extra = entry.meta?.postAsm;
          if (Array.isArray(extra) && extra.length) {
            linePtr += extra.length;
          }
          if (entry.phases?.length && Number.isFinite(entry.phases[0]?.srcLine)) {
            entry.srcLine = entry.phases[0].srcLine;
          } else {
            entry.srcLine = entry.srcLine ?? 0;
          }
        }
        this.codeCompiled = true;
        this.activeInstrIndex = -1;
        this.activePhaseIndex = 0;
        this.activeLine = -1;
        this._condState = null;
        this._branchJoin = null;
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
      this._branchJoin = null;
      this._stepGuard = 0;
    },
    executeLine() {
      const hlFrom = (obj) => {
        if (this._headless) return;
        if (obj && Number.isFinite(obj.srcLine)) {
          this.activeLine = obj.srcLine;
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
      if (this.codeCompiled && Array.isArray(this.compiledProgram) && this.compiledProgram.length > 0) {
        if (this.activeInstrIndex < 0) {
          this.activeInstrIndex = 0;
          this.activePhaseIndex = 0;
          this._stepGuard = 0;
          this._branchJoin = null;
          this._condState = null;
        }
        this._stepGuard = (this._stepGuard || 0) + 1;
        if (this._stepGuard > 100000) {
          this.addLog('Przerwano: przekroczono limit kroków (prawdopodobna pętla).', 'system');
          this.uncompileCode();
          return;
        }
        if (this.activeInstrIndex >= this.compiledProgram.length) {
          this.uncompileCode();
          this.addLog('Kod zakończony', 'kompilator rozkazów');
          return;
        }
        const instr = this.compiledProgram[this.activeInstrIndex];
        const rawPhase = instr.phases?.[this.activePhaseIndex] || {};
        if (rawPhase && rawPhase.conditional === true) {
          if (!this._condState) {
            const cond = this.evaluateFlag(rawPhase.flag);
            const list = (cond ? rawPhase.truePhases : rawPhase.falsePhases) || [];
            this._condState = {
              list,
              idx: 0,
              pick: cond ? 'T' : 'F',
              phaseRef: rawPhase,
              stage: 'SHOW_IF',
            };
            const nextSrc = Number.isFinite(rawPhase.srcLine) ? rawPhase.srcLine : undefined;
            if (shouldPauseOn(nextSrc)) {
              if (Number.isFinite(nextSrc)) this.activeLine = nextSrc;
              this.addLog(`Pauza na breakpoint @${nextSrc}`, 'system');
              this._stopRun();
              return;
            }
            hlFrom(rawPhase);
            return;
          }
          const st = this._condState;
          const curr = st.list[st.idx];
          if (!curr) {
            this._condState = null;
            this.activePhaseIndex += 1;
            if (this.activePhaseIndex >= (instr.phases?.length || 0)) {
              if (this._branchJoin != null) {
                const join = this._branchJoin | 0;
                this._branchJoin = null;
                this.addLog(`join -> PC=${join}`, 'system');
                this.activeInstrIndex = join;
              } else if (instr.meta?.kind === 'JUMP') {
                const target = instr.meta.trueTarget ?? this.activeInstrIndex + 1;
                this.addLog(`Skok bezwarunkowy -> PC=${target}`, 'system');
                this.activeInstrIndex = target;
              } else {
                this.activeInstrIndex += 1;
              }
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
          const fallback = Number.isFinite(st.phaseRef?.srcLine)
            ? st.phaseRef.srcLine + (st.pick === 'T' ? 1 : 2)
            : undefined;
          const nextSrc = Number.isFinite(curr?.srcLine) ? curr.srcLine : fallback;
          if (shouldPauseOn(nextSrc)) {
            if (Number.isFinite(nextSrc)) this.activeLine = nextSrc;
            this.addLog(`Pauza na breakpoint @${nextSrc}`, 'system');
            this._stopRun();
            return;
          }
          const signals = new Set(Object.keys(curr).filter(k => curr[k] === true));
          this.nextLine = signals;
          this.executeSignalsFromNextLine();
          if (curr.wel === true) {
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
            this._condState = null;
            const ai = this.compiledProgram[this.activeInstrIndex];
            const ap = ai?.phases?.[this.activePhaseIndex];
            hlFrom(ap ?? ai);
            return;
          }
          st.idx += 1;
          if (st.idx >= st.list.length) {
            this._condState = null;
            this.activePhaseIndex += 1;
            if (this.activePhaseIndex >= (instr.phases?.length || 0)) {
              if (this._branchJoin != null) {
                const join = this._branchJoin | 0;
                this._branchJoin = null;
                this.addLog(`join -> PC=${join}`, 'system');
                this.activeInstrIndex = join;
              } else if (instr.meta?.kind === 'JUMP') {
                const target = instr.meta.trueTarget ?? this.activeInstrIndex + 1;
                this.addLog(`Skok bezwarunkowy -> PC=${target}`, 'system');
                this.activeInstrIndex = target;
              } else {
                this.activeInstrIndex += 1;
              }
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
          const nextSub = st.list[st.idx];
          hlFrom(nextSub, st.phaseRef, st.pick);
          return;
        }
        if (rawPhase.END_BRANCH === true) {
          this.activeInstrIndex += 1;
          this.activePhaseIndex = 0;
          const ni = this.compiledProgram[this.activeInstrIndex];
          const np = ni?.phases?.[this.activePhaseIndex];
          hlFrom(np ?? ni);
          return;
        }
        if (rawPhase.stop === true) {
          hlFrom(rawPhase);
          this.uncompileCode();
          this.addLog('STOP – program zatrzymany', 'kompilator rozkazów');
          return;
        }
        {
          const nextSrc = Number.isFinite(rawPhase?.srcLine) ? rawPhase.srcLine : undefined;
          if (shouldPauseOn(nextSrc)) {
            if (Number.isFinite(nextSrc)) this.activeLine = nextSrc;
            this.addLog(`Pauza na breakpoint @${nextSrc}`, 'system');
            this._stopRun();
            return;
          }
        }
        hlFrom(rawPhase);
        {
          const signalsSet = new Set(Object.keys(rawPhase).filter(k => rawPhase[k] === true));
          this.nextLine = signalsSet;
          this.executeSignalsFromNextLine();
        }
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
          const ai = this.compiledProgram[this.activeInstrIndex];
          const ap = ai?.phases?.[this.activePhaseIndex];
          hlFrom(ap ?? ai);
          return;
        }
        this.activePhaseIndex += 1;
        if (this.activePhaseIndex >= (instr.phases?.length || 0)) {
          if (this._branchJoin != null) {
            const join = this._branchJoin | 0;
            this._branchJoin = null;
            this.addLog(`join -> PC=${join}`, 'system');
            this.activeInstrIndex = join;
          } else {
            this.activeInstrIndex += 1;
          }
          this.activePhaseIndex = 0;
        }
        if (this.activeInstrIndex >= this.compiledProgram.length) {
          this.uncompileCode();
          this.addLog('Kod zakończony', 'kompilator rozkazów');
          return;
        }
        const ni = this.compiledProgram[this.activeInstrIndex];
        const np = ni?.phases?.[this.activePhaseIndex];
        hlFrom(np ?? ni);
        return;
      }
      if (!this.manualMode) {
        if (this.activeLine < 0) this.activeLine = 0;
        if (this.activeLine >= this.compiledCode.length) {
          this.uncompileCode();
          this.addLog('Kod zakończony', 'kompilator rozkazów');
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
          this.addLog('Kod zakończony', 'kompilator rozkazów');
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
        for (const p of phs) line += (p && p.conditional === true) ? 3 : 1;
        const extra = this.compiledProgram[i]?.meta?.postAsm;
        if (Array.isArray(extra)) line += extra.length;
      }
      const currPh = this.compiledProgram[instrIdx]?.phases || [];
      for (let k = 0; k < Math.max(0, this.activePhaseIndex); k++) {
        const p = currPh[k];
        line += (p && p.conditional === true) ? 3 : 1;
      }
      this.activeLine = line;
      const max = (this.compiledCode?.length || 1) - 1;
      this.activeLine = Math.max(0, Math.min(this.activeLine || 0, max));
    },
    executeSignalsFromNextLine() {
      if (!this.isFastRunning) this.clearActiveTimeouts();
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
      if (this.nextLine.has('wea')) this.wea();
      if (this.nextLine.has('weja')) this.weja();
      if (this.nextLine.has('wex')) this.wex();
      if (this.nextLine.has('wey')) this.wey();
      if (this.nextLine.has('wes')) this.wes();
      if (this.nextLine.has('wei')) this.wei();
      if (this.nextLine.has('wel')) this.wel();
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
      const CHUNK = 1;
      const TICK_MS = Math.max(1, this.oddDelay);
      if (this.compiledProgram && this.compiledProgram.length > 0 && this.activeInstrIndex < 0) {
        this.activeInstrIndex = 0;
        this.activePhaseIndex = 0;
      }
      const tick = () => {
        if (!this.codeCompiled || !this.isRunning) return this._stopRun();
        let i = 0;
        while (i++ < CHUNK && stepsLeft-- > 0 && this.codeCompiled &&
              this.activeInstrIndex >= 0 && this.activeInstrIndex < this.compiledProgram.length) {
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
        if (this.isRunning) {
          this.runLoopTimer = setTimeout(tick, TICK_MS);
        } else {
          this._stopRun();
        }
      };
      this.runLoopTimer = setTimeout(tick, TICK_MS);
    },
    _stopRun() {
      if (this.runLoopTimer) { clearTimeout(this.runLoopTimer); this.runLoopTimer = null; }
      this.isRunning = false;
      this.isFastRunning = false;
      this.fastProgress = 0;
      this._skipNextBreakpoint = false;
      this._headless = false;
      this.suppressBroadcast = false;
      this.clearActiveTimeouts();
      if (this._busHoldTimers?.A) { clearTimeout(this._busHoldTimers.A); this._busHoldTimers.A = null; }
      if (this._busHoldTimers?.S) { clearTimeout(this._busHoldTimers.S); this._busHoldTimers.S = null; }
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
        const totalInstr = hasStructured ? this.compiledProgram.length : (this.compiledCode?.length || 0);
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
              this.executeLine();
            } else {
              if (this.activeLine >= this.compiledCode.length) {
                this.uncompileCode();
                break;
              }
              this.executeLine();
            }
          }
          if (hasStructured) {
            const cur = Math.max(0, Math.min(this.activeInstrIndex, totalInstr));
            this.fastProgress = totalInstr ? Math.floor((cur / totalInstr) * 100) : 0;
          } else {
            const cur = Math.max(0, Math.min(this.activeLine, totalInstr));
            this.fastProgress = totalInstr ? Math.floor((cur / totalInstr) * 100) : 0;
          }
          await new Promise(r => setTimeout(r, 0));s
          if (!this.codeCompiled) break;
          if (hasStructured && (this.activeInstrIndex < 0 || this.activeInstrIndex >= this.compiledProgram.length)) break;
          if (!hasStructured && this.activeLine >= this.compiledCode.length) break;
        }
        if (safety <= 0) this.addLog('Przerwano: limit kroków RUN-FAST osiągnięty.', 'system');
      } finally {
        this._headless = false;
        this.suppressBroadcast = false;
        this.isFastRunning = false;
        this.isRunning = false;
        this.fastProgress = 0;
        document.title = prevTitle;
      }
    },
    _instant(fn) {
      if (this.isFastRunning) { fn(); return true; }
      return false;
    },
    il() {
      if (this._instant(() => { this.programCounter++; })) return;
      this.signals.il = true;
      this.programCounter++;
      const timeoutId = setTimeout(() => { this.signals.il = false; }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    dl() {
      if (this._instant(() => { this.programCounter--; })) return;
      this.signals.dl = true;
      this.programCounter--;
      const timeoutId = setTimeout(() => { this.signals.dl = false; }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    wyl() {
      if (this._instant(() => { this.BusA = this.programCounter; })) return;
      this.signals.wyl = true;
      this.signals.busA = true;
      this.BusA = this.programCounter;
      const timeoutId = setTimeout(() => { this.signals.wyl = false; }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
      this.holdBus('A');
    },
    wel() {
      if (this._instant(() => { this.programCounter = this.BusA; })) return;
      this.signals.wel = true;
      this.signals.busA = true;
      this.programCounter = this.BusA;
      const timeoutId = setTimeout(() => { this.signals.wel = false; }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
      this.holdBus('A');
    },
    wyad() {
      if (this._instant(() => { this.BusA = this.I; })) return;
      this.signals.wyad = true;
      this.signals.busA = true;
      this.BusA = this.I;
      const timeoutId = setTimeout(() => { this.signals.wyad = false; }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
      this.holdBus('A');
    },
    wei() {
      if (this._instant(() => {
        const mask = (1 << this.addresBits) - 1;
        this.I = this.BusS & mask;
      })) return;
      this.signals.wei = true;
      this.signals.busS = true;
      const mask = (1 << this.addresBits) - 1;
      this.I = this.BusS & mask;
      const timeoutId = setTimeout(() => { this.signals.wei = false; }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
      this.holdBus('S');
    },
    iak() {
      if (this._instant(() => { this.ACC = this.toWord(this.ACC + 1); })) return;
      this.signals.iak = true;
      this.ACC = this.toWord(this.ACC + 1);
      const timeoutId = setTimeout(() => { this.signals.iak = false; }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    dak() {
      if (this._instant(() => { this.ACC = this.toWord(this.ACC - 1); })) return;
      this.signals.dak = true;
      this.ACC = this.toWord(this.ACC - 1);
      const timeoutId = setTimeout(() => { this.signals.dak = false; }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    weak() {
      if (this._instant(() => { this.ACC = this.toWord(this.JAML); })) return;
      this.signals.weak = true;
      this.ACC = this.toWord(this.JAML);
      const timeoutId = setTimeout(() => { this.signals.weak = false; }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    weja() {
      if (this._instant(() => { this.JAML = this.toWord(this.BusS); })) return;
      this.signals.weja = true;
      this.signals.busS = true;
      this.JAML = this.toWord(this.BusS);
      const timeoutId = setTimeout(() => { this.signals.weja = false; }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
      this.holdBus('S');
    },
    wyak() {
      if (this._instant(() => { this.BusS = this.toWord(this.ACC); })) return;
      this.signals.wyak = true;
      this.signals.busS = true;
      this.BusS = this.toWord(this.ACC);
      const timeoutId = setTimeout(() => { this.signals.wyak = false; }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
      this.holdBus('S');
    },
    dod() {
      if (this._instant(() => { this.JAML = this.toWord(this.JAML + this.ACC); })) return;
      this.signals.dod = true;
      this.JAML = this.toWord(this.JAML + this.ACC);
      const timeoutId = setTimeout(() => { this.signals.dod = false; }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    ode() {
      if (this._instant(() => { this.JAML = this.toWord(this.ACC - this.JAML); })) return;
      this.signals.ode = true;
      this.JAML = this.toWord(this.ACC - this.JAML);
      const timeoutId = setTimeout(() => { this.signals.ode = false; }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    przep() {
      if (this._instant(() => { this.ACC = this.toWord(this.JAML); })) return;
      this.signals.przep = true;
      this.ACC = this.toWord(this.JAML);
      const timeoutId = setTimeout(() => { this.signals.przep = false; }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    mno() {
      if (this._instant(() => { this.JAML = this.toWord(this.ACC * this.JAML); })) return;
      this.signals.mno = true;
      this.JAML = this.toWord(this.ACC * this.JAML);
      const timeoutId = setTimeout(() => { this.signals.mno = false; }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    dziel() {
      if (this._instant(() => {
        const d = this.JAML & 0xFF;
        this.JAML = this.toWord(d === 0 ? 0 : Math.trunc(this.ACC / d));
      })) return;
      this.signals.dziel = true;
      const d = this.JAML & 0xFF;
      this.JAML = this.toWord(d === 0 ? 0 : Math.trunc(this.ACC / d));
      const timeoutId = setTimeout(() => { this.signals.dziel = false; }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    shr() {
      if (this._instant(() => {
        const sh = this.JAML & 7;
        this.ACC = this.toWord((this.ACC & this.wordMask()) >>> sh);
      })) return;
      this.signals.shr = true;
      const sh = this.JAML & 7;
      this.ACC = this.toWord((this.ACC & this.wordMask()) >>> sh);
      const timeoutId = setTimeout(() => { this.signals.shr = false; }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    shl() {
      if (this._instant(() => {
        const sh = this.JAML & 7;
        this.ACC = this.toWord(this.ACC << sh);
      })) return;
      this.signals.shl = true;
      const sh = this.JAML & 7;
      this.ACC = this.toWord(this.ACC << sh);
      const timeoutId = setTimeout(() => { this.signals.shl = false; }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    neg() {
      if (this._instant(() => { this.ACC = this.toWord(-this.ACC); })) return;
      this.signals.neg = true;
      this.ACC = this.toWord(-this.ACC);
      const timeoutId = setTimeout(() => { this.signals.neg = false; }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    lub() {
      if (this._instant(() => { this.ACC = this.toWord(this.ACC | this.JAML); })) return;
      this.signals.lub = true;
      this.ACC = this.toWord(this.ACC | this.JAML);
      const timeoutId = setTimeout(() => { this.signals.lub = false; }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    i() {
      if (this._instant(() => { this.ACC = this.toWord(this.ACC & this.JAML); })) return;
      this.signals.i = true;
      this.ACC = this.toWord(this.ACC & this.JAML);
      const timeoutId = setTimeout(() => { this.signals.i = false; }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    wyx() {
      if (this._instant(() => { this.BusS = this.toWord(this.X); })) return;
      this.signals.wyx = true;
      this.signals.busS = true;
      this.BusS = this.toWord(this.X);
      const timeoutId = setTimeout(() => { this.signals.wyx = false; }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
      this.holdBus('S');
    },
    wex() {
      if (this._instant(() => { this.X = this.toWord(this.BusS); })) return;
      this.signals.wex = true;
      this.signals.busS = true;
      this.X = this.toWord(this.BusS);
      const timeoutId = setTimeout(() => { this.signals.wex = false; }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
      this.holdBus('S');
    },
    wyy() {
      if (this._instant(() => { this.BusS = this.toWord(this.Y); })) return;
      this.signals.wyy = true;
      this.signals.busS = true;
      this.BusS = this.toWord(this.Y);
      const timeoutId = setTimeout(() => { this.signals.wyy = false; }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
      this.holdBus('S');
    },
    wey() {
      if (this._instant(() => { this.Y = this.toWord(this.BusS); })) return;
      this.signals.wey = true;
      this.signals.busS = true;
      this.Y = this.toWord(this.BusS);
      const timeoutId = setTimeout(() => { this.signals.wey = false; }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
      this.holdBus('S');
    },
    wea() {
      if (this._instant(() => { this.A = this.BusA & this.addrMask(); })) return;
      this.signals.wea = true;
      this.signals.busA = true;
      this.A = this.BusA & this.addrMask();
      const timeoutId = setTimeout(() => { this.signals.wea = false; }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
      this.holdBus('A');
    },
    wes() {
      if (this._instant(() => { this.S = this.toWord(this.BusS); })) return;
      this.signals.wes = true;
      this.signals.busS = true;
      this.S = this.toWord(this.BusS);
      const timeoutId = setTimeout(() => { this.signals.wes = false; }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
      this.holdBus('S');
    },
    wys() {
      if (this._instant(() => { this.BusS = this.toWord(this.S); })) return;
      this.signals.wys = true;
      this.signals.busS = true;
      this.BusS = this.toWord(this.S);
      const timeoutId = setTimeout(() => { this.signals.wys = false; }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
      this.holdBus('S');
    },
    stop() {
      if (this._instant(() => {
        this._stopRun();
        this.codeCompiled = false;
        this.nextLine.clear();
      })) return;
      this.signals.stop = true;
      const id = setTimeout(() => { this.signals.stop = false; }, this.oddDelay);
      this.activeTimeouts.push(id);
      this._stopRun();
      this.codeCompiled = false;
      this.nextLine.clear();
    },
    as() {
      if (this._instant(() => { this.BusS = this.BusA; })) return;
      this.signals.as = true;
      this.signals.busA = true;
      this.signals.busS = true;
      this.BusS = this.BusA;
      const timeoutId = setTimeout(() => { this.signals.as = false; }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
      this.holdBus('A'); this.holdBus('S');
    },
    sa() {
      if (this._instant(() => { this.BusA = this.BusS; })) return;
      this.signals.sa = true;
      this.signals.busA = true;
      this.signals.busS = true;
      this.BusA = this.BusS;
      const timeoutId = setTimeout(() => { this.signals.sa = false; }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
      this.holdBus('A'); this.holdBus('S');
    },
    czyt() {
      if (this._instant(() => {
        const idx = this.A & this.addrMask();
        this.S = this.toWord(this.mem[idx] ?? 0);
      })) return;
      this.signals.czyt = true;
      const idx = this.A & this.addrMask();
      this.S = this.toWord(this.mem[idx] ?? 0);
      const timeoutId = setTimeout(() => { this.signals.czyt = false; }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    pisz() {
      if (this._instant(() => {
        const idx = this.A & this.addrMask();
        this.mem[idx] = this.toWord(this.S);
      })) return;
      this.signals.pisz = true;
      const idx = this.A & this.addrMask();
      this.mem[idx] = this.toWord(this.S);
      const timeoutId = setTimeout(() => { this.signals.pisz = false; }, this.oddDelay);
      this.activeTimeouts.push(timeoutId);
    },
    wyws() {
      if (this._instant(() => { this.BusA = this.WS & this.addrMask(); })) return;
      this.signals.wyws = true;
      this.signals.busA = true;
      this.BusA = this.WS & this.addrMask();
      const id = setTimeout(() => { this.signals.wyws = false; }, this.oddDelay);
      this.activeTimeouts.push(id);
      this.holdBus('A');
    },
    iws() {
      if (this._instant(() => {
        const size = 1 << this.memoryAddresBits;
        this.WS = (this.WS + 1) % size;
      })) return;
      this.signals.iws = true;
      const size = 1 << this.memoryAddresBits;
      this.WS = (this.WS + 1) % size;
      const id = setTimeout(() => { this.signals.iws = false; }, this.oddDelay);
      this.activeTimeouts.push(id);
    },
    dws() {
      if (this._instant(() => {
        const size = 1 << this.memoryAddresBits;
        this.WS = (this.WS - 1 + size) % size;
      })) return;
      this.signals.dws = true;
      const size = 1 << this.memoryAddresBits;
      this.WS = (this.WS - 1 + size) % size;
      const id = setTimeout(() => { this.signals.dws = false; }, this.oddDelay);
      this.activeTimeouts.push(id);
    },
    wyls() {
      if (this._instant(() => { this.BusS = this.toWord(this.programCounter); })) return;
      this.signals.wyls = true;
      this.signals.busS = true;
      this.BusS = this.toWord(this.programCounter);
      const id = setTimeout(() => { this.signals.wyls = false; }, this.oddDelay);
      this.activeTimeouts.push(id);
      this.holdBus('S');
    },
    wyg() {
      if (this._instant(() => {
        const g = this.DEV_READY ? 1 : 0;
        this.BusS = this.toWord(g);
        this.G = g;
      })) return;
      this.signals.wyg = true;
      this.signals.busS = true;
      const g = this.DEV_READY ? 1 : 0;
      this.BusS = this.toWord(this.DEV_READY ? 1 : 0);
      this.G = this.DEV_READY ? 1 : 0;
      const id = setTimeout(() => { this.signals.wyg = false; }, this.oddDelay);
      this.activeTimeouts.push(id);
      this.holdBus('S');
    },
    werb() {
      if (this._instant(() => {
        const v = this.ACC & this.wordMask();
        this.DEV_OUT = v; this.RB = v;
      })) return;
      this.signals.werb = true;
      const v = this.ACC & this.wordMask();
      this.DEV_OUT = v; this.RB = v;
      const id = setTimeout(() => { this.signals.werb = false; }, this.oddDelay);
      this.activeTimeouts.push(id);
    },
    wyrb() {
      if (this._instant(() => {
        const canRead = (this.DEV_READY === 0);
        const v = canRead ? (this.DEV_IN & this.wordMask()) : 0;
        this.BusS = v; this.RB = v;
        if (canRead) { this.DEV_IN = 0; this.DEV_READY = 1; this.G = 1; }
      })) return;
      this.signals.wyrb = true;
      this.signals.busS = true;
      const canRead = (this.DEV_READY === 0);
      const v = canRead ? (this.DEV_IN & this.wordMask()) : 0;
      this.BusS = v; this.RB = v;
      if (canRead) { this.DEV_IN = 0; this.DEV_READY = 1; this.G = 1; }
      const id = setTimeout(() => { this.signals.wyrb = false; }, this.oddDelay);
      this.activeTimeouts.push(id);
      this.holdBus('S');
    },
    start() {
      if (this._instant(() => {
        if (this.DEV_BUSY) return;
        this.DEV_BUSY = true;
        this.DEV_READY = this.DEV_IN ? 0 : 1;
        this.DEV_BUSY = false;
        this.DEV_READY = this.DEV_IN ? 0 : 1;
        this.G = this.DEV_READY ? 1 : 0;
      })) return;
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
    resetValues() {
      this.clearActiveTimeouts();
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
      this.mem = new Array(1 << this.memoryAddresBits).fill(0);
      for (const key in this.signals) {
        this.signals[key] = false;
      }
      this.nextLine.clear();
      this.logs = [];
      this.hasConsoleErrors = false;
      this.addLog('Wszystkie wartości rejestrów zostały zresetowane', 'system');
    },
    restoreDefaults() {
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
      this.resizeMemory();
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
      if (event.key === 'Escape' && this.consoleOpen) {
        this.consoleOpen = false;
      }
    },
    clearActiveTimeouts() {
      this.activeTimeouts.forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
      this.activeTimeouts = [];
      for (const key in this.signals) {
        this.signals[key] = false;
      }
    },
    testEnhancedConsole() {
      this.addLog('System inicjalizowany', 'system');
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
      const mockWarning = {
        message: 'Niewykorzystana etykieta',
        level: 'WARNING',
        timestamp: new Date().toISOString(),
        code: 'SEM_UNUSED_LABEL',
        hint: 'Sprawdź czy etykieta jest faktycznie potrzebna lub czy nie ma literówki w nazwie.',
      };
      this.addLog('Ostrzeżenie kompilatora', 'Warning', mockWarning);
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
    if(this.platform === 'esp'){
      this.initWebsocket();
    }
    this.loadFromLS();
    this.resizeMemory();
    this.addLog('System zainicjalizowany.', 'System');
    this.prevSignals = { ...this.signals };
    this.prevMem = [...this.mem];
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