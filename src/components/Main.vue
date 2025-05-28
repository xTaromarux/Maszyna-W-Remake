<template>
  <TopBar @open-chat="aiChatOpen = true" @open-settings="settingsOpen = true"
    @open-command-list="commandListOpen = true" />
  <div id="wLayout">
    <div id="W" :class="{ manualMode: manualMode }">
      <div id="layer1" class="layer">
        <CounterComponent
          :signals="signals"
          :programCounter="programCounter"
          :formatNumber="formatNumber"
          :extras="extras"
          @update:programCounter="programCounter = $event"
          @clickItem="handleSignalToggle"
        />
      </div>

      <BusSignal
        :signalStatus="signals.busA"
        :busValue="BusA"
        :busName="'A'"
        :showInvisibleRegisters="extras.showInvisibleRegisters"
        :formatNumber="formatNumber"
      />

      <div id="layer2" class="layer">
        <RegisterISection
          :I="I"
          :signals="signals"
          :formatNumber="formatNumber"
          @update:I="I = $event"
          @clickItem="handleSignalToggle"
        />

        <CalcSection
          :signals="signals"
          :extras="extras"
          :ACC="ACC"
          :JAML="JAML"
          :formatNumber="formatNumber"
          @update:ACC="ACC = $event"
          @clickItem="handleSignalToggle"
        />

        <SignalButton
          v-if="extras.busConnectors"
          id="sa"
          :signal="signals.sa"
          label="sa"
          divClassNames="pathUpOnRight"
          spanClassNames="lineRightOnBottom"
          @click="handleSignalToggle('sa')"
        />

        <SignalButton
          v-if="extras.busConnectors"
          id="as"
          :signal="signals.as"
          label="as"
          divClassNames="pathDownOnLeft"
          spanClassNames="lineLeftOnBottom"
          @click="handleSignalToggle('as')"
        />

        <MemorySection
          :A="A"
          :S="S"
          :mem="mem"
          :signals="signals"
          :formatNumber="formatNumber"
          :decToCommand="decToCommand"
          :decToArgument="decToArgument"
          @update:A="A = $event"
          @update:S="S = $event"
          @clickItem="handleSignalToggle"
        />
      </div>

      <BusSignal
        :signalStatus="signals.busS"
        :busValue="BusS"
        :busName="'S'"
        :showInvisibleRegisters="extras.showInvisibleRegisters"
        :formatNumber="formatNumber"
      />

      <div id="layer3" class="layer">
        <XRegisterSection
          :visible="extras.xRegister"
          :X="X"
          :signals="signals"
          :formatNumber="formatNumber"
          @update:X="X = $event"
          @clickItem="handleSignalToggle"
        />

        <YRegisterSection
          :visible="extras.yRegister"
          :Y="Y"
          :signals="signals"
          :formatNumber="formatNumber"
          @update:Y="Y = $event"
          @clickItem="handleSignalToggle"
        />
      </div>
    </div>

    <div id="inputs">
      <ProgramEditor
        :manual-mode="manualMode"
        :code-compiled="codeCompiled"
        :code="code"
        :compiled-code="compiledCode"
        :active-line="activeLine"
        :next-line="nextLine"
        @setManualMode="
          (flag) => (flag ? manualModeCheck() : manualModeUncheck())
        "
        @update:code="code = $event"
      />
      <ExecutionControls
        :manual-mode="manualMode"
        :code-compiled="codeCompiled"
        :code="code"
        @compile="compileCode"
        @edit="uncompileCode"
        @step="executeLine"
        @run="runCode"
      />
    </div>

    <ProgramSection
      :manualMode="manualMode"
      :commandList="commandList"
      @update:code="code = $event"
      @log="addLog($event.message, $event.class)"
    />

    <Console v-if="!manualMode" :logs="logs.slice().reverse()" />
    
    <div
      v-if="disappearBlour"
      @click="closePopups"
      :class="{ show: anyPopupOpen, hide: !anyPopupOpen }"
      id="popupsBackdrop"
    />

    <Settings
      :open="settingsOpen"
      :light-mode="lightMode"
      :number-format="numberFormat"
      :memory-addres-bits="memoryAddresBits"
      :code-bits="codeBits"
      :addres-bits="addresBits"
      :odd-delay="oddDelay"
      :extras="extras"
      @close="closePopups"
      @resetValues="resetValues"
      @defaultSettings="defaultSettings"
      @update:lightMode="lightMode = $event"
      @update:numberFormat="numberFormat = $event"
      @update:memoryAddresBits="memoryAddresBits = $event"
      @update:codeBits="codeBits = $event"
      @update:addresBits="addresBits = $event"
      @update:oddDelay="oddDelay = $event"
      @update:extras="extras = $event"
    />

    <CommandList
      :visible="commandListOpen"
      :commandList="commandList"
      :codeBits="codeBits"
      @update:commandList="commandList = $event"
      @close="closePopups"
    />

      <AiChat
        :visible="aiChatOpen"
        @close="closePopups"
        title="AI Assistant 🤖"
        placeholder="Type a message…"
        instruction="Describe the operation to get the machine code:"
      />
  </div>
</template>

<script>
import CommandList from "./CommandList.vue";
import ProgramSection from "./ProgramSection.vue";
import CounterComponent from "@/components/CounterComponent.vue";
import BusSignal from "@/components/BusSignal.vue";
import SignalButton from "@/components/SignalButton.vue";
import MemorySection from "@/components/MemorySection.vue";
import CalcSection from "@/components/CalcSection.vue";
import RegisterISection from "@/components/RegisterISection.vue";
import XRegisterSection from "@/components/XRegisterSection.vue";
import YRegisterSection from "@/components/YRegisterSection.vue";
import TopBar from "@/components/UI/TopBar.vue";
import AiChat from "@/components/AiChat.vue";
import Console from "@/components/Console.vue";
import Settings from "@/components/Settings.vue";
import ExecutionControls from "./ExecutionControls.vue";
import ProgramEditor from "./ProgramEditor.vue";
import { commandList } from "@/utils/data/commands.js";

export default {
  name: "MainComponent",

  components: {
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
    Settings,
    ExecutionControls,
    ProgramEditor,
  },

  computed: {
    anyPopupOpen() {
      return this.settingsOpen || this.commandListOpen || this.aiChatOpen;
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
      A: 0,
      ACC: 0,
      JAML: 0,
      mem: [
        0b000001, 0b000010, 0b000100, 0b001000, 0b010001, 0b100010, 0b100100,
        0b111000,
      ],

      programCounter: 0,
      I: 0,
      X: 0,
      Y: 0,
      S: 0,

      BusA: 0,
      BusS: 0,

      code: "czyt wys wei il;\nwyl wea;",
      compiledCode: [],
      activeLine: 0,
      nextLine: new Set(),

      // DEFAULT IS 2000ms
      oddDelay: 2000, // Delay for odd commands in ms

      commandList,

      numberFormat: "dec",

      avaiableSignals: {
        always: [
          "il",
          "wyl",
          "wel",
          "wyad",
          "wei",
          "wea",
          "wes",
          "wys",
          "czyt",
          "pisz",
          "weja",
          "weak",
          "dod",
          "ode",
          "przp",
          "wyak",
          "stop",
        ],
        busConnectors: ["as", "sa"],
        dl: ["dl"],
        jamlExtras: [
          "iak",
          "dak",
          "mno",
          "dziel",
          "shr",
          "shl",
          "neg",
          "lub",
          "i",
        ],
        xRegister: ["wyx", "wex"],
        yRegister: ["wyy", "wey"],
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
    };
  },
  methods: {
    initWebsocket() {
      // Local Test
      // this.ws = new WebSocket('ws://localhost:8080');
      // ESP32
      this.ws = new WebSocket('ws://192.168.4.1:80/ws');
      this.ws.binaryType = 'arraybuffer';
      this.ws.addEventListener('open', () => {
        console.log('[WS] Connected to server');
      });

      this.ws.addEventListener('error', err => {
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
          console.warn('[WS] Invalid JSON:', text);
          return;
        }

        if (msg.type === 'signal-toggle') {
          console.log('[WS] Received toggle:', msg.id, msg.value);
          this.handleRemoteToggle(msg.id, msg.value);
        } else if (msg.type === 'mem-update') {
          this.handleRemoteMemUpdate(msg.index, msg.value);
        }
      });
    },

    handleRemoteToggle(id, value) {
      this.suppressBroadcast = true;
      if (value) {
        this.nextLine.add(id);
      } else {
        this.nextLine.delete(id);
      }
      this.signals[id] = value;
      this.suppressBroadcast = false;
    },

    handleSignalToggle(signalName) {

      if (!this.manualMode) return;
      if (this.nextLine.has(signalName)) {
        this.nextLine.delete(signalName);
        this.signals[signalName] = false;
      } else {
        this.nextLine.add(signalName);
        this.signals[signalName] = true;
      }
    },

    sendSignalToggle(id, value) {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({
          type: 'signal-toggle',
          id,
          value
        }));
      }
    },

    sendMemUpdate(idx, value) {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({
          type: 'mem-update',
          index: idx,
          value
        }));
      }
    },

    handleRemoteMemUpdate(idx, value) {
      this.suppressBroadcast = true;
      this.$set(this.mem, idx, value);
      this.suppressBroadcast = false;
    },

    loadFromLS() {
      const data = localStorage.getItem("W");
      if (data) {
        const parsed = JSON.parse(data);
        Object.assign(this, parsed);

        // Validate memoryAddresBits to ensure it doesn't exceed the limit of 10 (2^10 = 1024 cells)
        if (this.memoryAddresBits > 10) {
          this.memoryAddresBits = 10;
          this.addLog("Memory size was limited to maximum 1024 cells (10 bits)", "system");
        }

        this.nextLine = new Set();

        for (const key in this.signals) {
          this.signals[key] = false;
        }
      }
    },
    saveToLS() {
      localStorage.setItem("W", JSON.stringify(this.$data));
    },
    addLog(message, classification = "info") {
      const timestamp = new Date();
      this.logs.push({ timestamp, message, class: classification });
    },
    formatNumber(number) {
      if (typeof number !== "number" || isNaN(number)) {
        return "Error: Invalid number.";
      }

      const formatters = {
        dec: () => number,
        hex: () => "0x" + Math.floor(number).toString(16).toUpperCase(),
        bin: () => "0b" + Math.floor(number).toString(2),
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

      // DEBUG PURPOSES
      newMem[0] = 0;
      for (let i = 1; i < newMem.length; i++) {
        newMem[i] = 0;
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
      for (const key in this.signals) {
        this.signals[key] = false;
      }

      this.nextLine.clear();

      if (!this.manualMode) {
        this.uncompileCode();
      }
    },
    closePopups() {
      this.settingsOpen = false;
      this.commandListOpen = false;
      this.aiChatOpen = false;
      setTimeout(() => {
        this.disappearBlour = false;
      }, 1000);
    },

    compileCode() {
      if (!this.code) {
        this.addLog("No code to compile", "Error");
        return;
      }

      let signalslist = new Set([
        ...this.avaiableSignals.always,
        ...(this.extras.xRegister ? this.avaiableSignals.xRegister : []),
        ...(this.extras.yRegister ? this.avaiableSignals.yRegister : []),
        ...(this.extras.dl ? this.avaiableSignals.dl : []),
        ...(this.extras.jamlExtras ? this.avaiableSignals.jamlExtras : []),
        ...(this.extras.busConnectors
          ? this.avaiableSignals.busConnectors
          : []),
      ]);

      console.log(signalslist);
      for (let [index, command] of this.code.split(/[\s;]+/).entries()) {
        if (!command) continue; // Skip empty commands

        if (!signalslist.has(command)) {
          this.addLog(
            `Signal "${command}" not recognized at position ${index + 1}`,
            "Code Parser Error"
          );
          return;
        }
      }

      let code = this.code.replace(/\n/g, ""); // Remove all newline characters
      this.compiledCode = code.split(";"); // Split the cleaned code into an array by ";"
      //remove empty lines
      this.compiledCode = this.compiledCode.filter(
        (line) => line.trim() !== ""
      );

      this.codeCompiled = true;
      this.activeLine = -1;
      this.nextLine.clear();
      this.executeLine();

      this.addLog("Code compiled succesfully", "command compiler");
    },
    uncompileCode() {
      this.codeCompiled = false;
      this.nextLine.clear();
    },
    executeLine() {
      // all wy's first
      if (this.nextLine.has("wyl")) this.wyl();
      if (this.nextLine.has("czyt")) this.czyt(); // only czyt or pisz active at the same time
      if (this.nextLine.has("pisz")) this.pisz();
      if (this.nextLine.has("wys")) this.wys();
      if (this.nextLine.has("stop")) this.stop();
      if (this.nextLine.has("wyad")) this.wyad();
      if (this.nextLine.has("wyak")) this.wyak();
      if (this.nextLine.has("wyx")) this.wyx();
      if (this.nextLine.has("wyy")) this.wyy();

      if (this.nextLine.has("sa")) this.sa();
      if (this.nextLine.has("as")) this.as();

      // then all we's

      if (this.nextLine.has("wea")) this.wea();
      if (this.nextLine.has("weja")) this.weja();
      if (this.nextLine.has("wex")) this.wex();
      if (this.nextLine.has("wey")) this.wey();
      if (this.nextLine.has("wes")) this.wes();
      if (this.nextLine.has("wei")) this.wei();
      if (this.nextLine.has("wel")) this.wel();

      // all math

      if (this.nextLine.has("dod")) this.dod();
      if (this.nextLine.has("ode")) this.ode();
      if (this.nextLine.has("przep")) this.przep();
      if (this.nextLine.has("mno")) this.mno();
      if (this.nextLine.has("dziel")) this.dziel();
      if (this.nextLine.has("shr")) this.shr();
      if (this.nextLine.has("shl")) this.shl();
      if (this.nextLine.has("neg")) this.neg();
      if (this.nextLine.has("lub")) this.lub();
      if (this.nextLine.has("i")) this.i();

      if (this.nextLine.has("iak")) this.iak();
      if (this.nextLine.has("dak")) this.dak();

      if (this.nextLine.has("weak")) this.weak();

      if (this.nextLine.has("il")) this.il();
      if (this.nextLine.has("dl")) this.dl();

      this.nextLine.clear();
      if (!this.manualMode) {
        this.activeLine++;
        if (this.activeLine >= this.compiledCode.length) {
          this.uncompileCode();
          this.addLog("Code finished", "command compiler");
        } else {
          for (const command of this.compiledCode[this.activeLine].split(" ")) {
            this.nextLine.add(command);
          }
        }
      }
    },
    runCode() {
      this.manualMode = false;
      while (this.activeLine < this.compiledCode.length) {
        this.executeLine();
      }
    },

    /* COMMANDS */

    il() {
      this.signals.il = true;
      this.programCounter++;
      setTimeout(() => {
        this.signals.il = false;
      }, this.oddDelay);
    },
    dl() {
      this.signals.dl = true;
      this.programCounter--;
      setTimeout(() => {
        this.signals.dl = false;
      }, this.oddDelay);
    },
    wyl() {
      this.signals.wyl = true;
      this.signals.busA = true;
      this.BusA = this.programCounter;
      setTimeout(() => {
        this.signals.wyl = false;
        this.signals.busA = false;
      }, this.oddDelay);
    },
    wel() {
      this.signals.wel = true;
      this.signals.busA = true;
      this.programCounter = this.BusA;
      setTimeout(() => {
        this.signals.wel = false;
        this.signals.busA = false;
      }, this.oddDelay);
    },
    wyad() {
      this.signals.wyad = true;
      this.signals.busA = true;
      this.BusA = this.I;
      setTimeout(() => {
        this.signals.wyad = false;
        this.signals.busA = false;
      }, this.oddDelay);
    },
    wei() {
      this.signals.wei = true;
      this.signals.busS = true;
      this.I = this.BusS;
      setTimeout(() => {
        this.signals.wei = false;
        this.signals.busS = false;
      }, this.oddDelay);
    },
    iak() {
      this.signals.iak = true;
      this.ACC++;
      setTimeout(() => {
        this.signals.iak = false;
      }, this.oddDelay);
    },
    dak() {
      this.signals.dak = true;
      this.ACC--;
      setTimeout(() => {
        this.signals.dak = false;
      }, this.oddDelay);
    },
    weak() {
      this.signals.weak = true;
      this.ACC = this.JAML;
      setTimeout(() => {
        this.signals.weak = false;
      }, this.oddDelay);
    },
    weja() {
      this.signals.weja = true;
      this.signals.busS = true;
      this.JAML = this.BusS;
      setTimeout(() => {
        this.signals.weja = false;
        this.signals.busS = false;
      }, this.oddDelay);
    },
    wyak() {
      this.signals.wyak = true;
      this.signals.busS = true;
      this.BusS = this.ACC;
      setTimeout(() => {
        this.signals.wyak = false;
        this.signals.busS = false;
      }, this.oddDelay);
    },
    dod() {
      this.signals.dod = true;
      this.JAML += this.ACC;
      setTimeout(() => {
        this.signals.dod = false;
      }, this.oddDelay);
    },
    ode() {
      this.signals.ode = true;
      this.JAML -= this.ACC;
      setTimeout(() => {
        this.signals.ode = false;
      }, this.oddDelay);
    },
    przep() {
      this.signals.przep = true;
      this.ACC = this.JAML;
      setTimeout(() => {
        this.signals.przep = false;
      }, this.oddDelay);
    },
    mno() {
      this.signals.mno = true;
      this.ACC *= this.JAML;
      setTimeout(() => {
        this.signals.mno = false;
      }, this.oddDelay);
    },
    dziel() {
      this.signals.dziel = true;
      this.ACC /= this.JAML;
      setTimeout(() => {
        this.signals.dziel = false;
      }, this.oddDelay);
    },
    shr() {
      this.signals.shr = true;
      this.ACC >>= this.JAML;
      setTimeout(() => {
        this.signals.shr = false;
      }, this.oddDelay);
    },
    shl() {
      this.signals.shl = true;
      this.ACC <<= this.JAML;
      setTimeout(() => {
        this.signals.shl = false;
      }, this.oddDelay);
    },
    neg() {
      this.signals.neg = true;
      this.ACC = -this.ACC;
      setTimeout(() => {
        this.signals.neg = false;
      }, this.oddDelay);
    },
    lub() {
      this.signals.lub = true;
      this.ACC |= this.JAML;
      setTimeout(() => {
        this.signals.lub = false;
      }, this.oddDelay);
    },
    i() {
      this.signals.i = true;
      this.ACC &= this.JAML;
      setTimeout(() => {
        this.signals.i = false;
      }, this.oddDelay);
    },
    wyx() {
      this.signals.wyx = true;
      this.signals.busS = true;
      this.BusS = this.X;
      setTimeout(() => {
        this.signals.wyx = false;
        this.signals.busS = false;
      }, this.oddDelay);
    },
    wex() {
      this.signals.wex = true;
      this.signals.busS = true;
      this.X = this.BusS;
      setTimeout(() => {
        this.signals.wex = false;
        this.signals.busS = false;
      }, this.oddDelay);
    },
    wyy() {
      this.signals.wyy = true;
      this.signals.busS = true;
      this.BusS = this.Y;
      setTimeout(() => {
        this.signals.wyy = false;
        this.signals.busS = false;
      }, this.oddDelay);
    },
    wey() {
      this.signals.wey = true;
      this.signals.busS = true;
      this.Y = this.BusS;
      setTimeout(() => {
        this.signals.wey = false;
        this.signals.busS = false;
      }, this.oddDelay);
    },

    wea() {
      this.signals.wea = true;
      this.signals.busA = true;
      this.A = this.BusA;
      setTimeout(() => {
        this.signals.wea = false;
        this.signals.busA = false;
      }, this.oddDelay);
    },
    wes() {
      this.signals.wes = true;
      this.signals.busS = true;
      this.S = this.BusS;
      setTimeout(() => {
        this.signals.wes = false;
        this.signals.busS = false;
      }, this.oddDelay);
    },
    wys() {
      this.signals.wys = true;
      this.signals.busS = true;
      this.BusS = this.S;
      setTimeout(() => {
        this.signals.wys = false;
        this.signals.busS = false;
      }, this.oddDelay);
    },
    stop() {
      this.codeCompiled = false;
      this.nextLine.clear();
    },
    as() {
      this.signals.as = true;
      this.signals.busA = true;
      this.signals.busS = true;
      this.BusS = this.BusA;
      setTimeout(() => {
        this.signals.as = false;
        this.signals.busA = false;
        this.signals.busS = false;
      }, this.oddDelay);
    },
    sa() {
      this.signals.sa = true;
      this.signals.busA = true;
      this.signals.busS = true;
      this.BusA = this.BusS;
      setTimeout(() => {
        this.signals.sa = false;
        this.signals.busA = false;
        this.signals.busS = false;
      }, this.oddDelay);
    },
    czyt() {
      this.signals.czyt = true;
      this.S = this.mem[this.A];
      setTimeout(() => {
        this.signals.czyt = false;
      }, this.oddDelay);
    },
    pisz() {
      this.signals.pisz = true;
      this.mem[this.A] = this.S;
      setTimeout(() => {
        this.signals.pisz = false;
      }, this.oddDelay);
    },

    resetValues() {
      // Reset all register values to 0
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
      
      // Reset memory to all zeros
      this.mem = new Array(1 << this.memoryAddresBits).fill(0);
      
      // Reset all signals to false
      for (const key in this.signals) {
        this.signals[key] = false;
      }
      
      this.nextLine.clear();
      this.addLog("All register values have been reset", "system");
    },

    defaultSettings() {
      // Reset to default settings
      this.memoryAddresBits = 6;
      this.codeBits = 6;
      this.addresBits = 4;
      this.oddDelay = 2000;
      this.numberFormat = "dec";
      this.extras = {
        xRegister: false,
        yRegister: false,
        dl: false,
        jamlExtras: false,
        busConnectors: false,
        showInvisibleRegisters: false
      };
      
      // Resize memory according to new settings
      this.resizeMemory();
      
      this.addLog("Settings have been reset to default values", "system");
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
        document.body.classList.add("lightMode");
        document.body.classList.remove("darkMode");
      } else {
        document.body.classList.add("darkMode");
        document.body.classList.remove("lightMode");
      }
    },

    signals: {
      deep: true,
      handler() {
        if (this.suppressBroadcast) return;
        const curr = { ...this.signals };
        for (const key in curr) {
          if (curr[key] !== this.prevSignals[key]) {
            this.sendSignalToggle(key, curr[key]);
          }
        }
        this.prevSignals = curr;
      }
    },

    mem: {
      deep: true,
      handler() {
        if (this.suppressBroadcast) return;
        const curr = [...this.mem];
        curr.forEach((v, i) => {
          if (v !== this.prevMem[i]) {
            this.sendMemUpdate(i, v);
          }
        });
        this.prevMem = curr;
      }
    },

    anyPopupOpen: {
      handler(val) {
        if(val){
          this.disappearBlour = val;
        }
      },
      immediate: true
    }
  },

  mounted() {
    this.initWebsocket();
    this.loadFromLS();
    this.resizeMemory();

    this.addLog("System initialized.", "System");
    this.prevSignals = { ...this.signals };
    this.prevMem = [...this.mem];
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
</style>