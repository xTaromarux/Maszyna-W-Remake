<!-- Settings.vue -->
<template>
  <div id="settings" v-if="open">
    <!-- Title & Close -->
    <span class="titleSpan">Settings</span>
    <button @click="$emit('close')" id="openCloseSettings">
      <!-- SVG Close Icon -->
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
        <path d="M4 14H10M10 14V20M10 14L3 21M20 10H14M14 10V4M14 10L21 3"
              stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <!-- LIGHT/DARK THEME -->
    <div class="flexColumn">
      <div class="toggleButtonDiv" :class="{ active: lightMode }">
        <span @click="setLightMode(true)">
          <SunIcon /> Light
        </span>
        <span @click="setLightMode(false)">
          <MoonIcon /> Dark
        </span>
      </div>
    </div>

    <!-- NUMBER FORMAT -->
    <div class="flexColumn">
      <label for="numberFormat">Number Format:</label>
      <select id="numberFormat"
              :value="numberFormat"
              @change="update('numberFormat', $event.target.value)">
        <option value="dec">Decimal</option>
        <option value="hex">Hexadecimal</option>
        <option value="bin">Binary</option>
      </select>
    </div>

    <!-- MEMORY SIZE -->
    <div class="flexColumn">
      <label for="argBits">Memory Size Bits:</label>
      <input id="argBits"
             type="number"
             :value="memoryAddresBits"
             @input="updateNumber('memoryAddresBits', $event.target.value)"/>
      <p>Tyle bitów będzie mieć adres pamięci</p>
    </div>

    <!-- CODE BITS -->
    <div class="flexColumn">
      <label for="commandBits">Code Bits:</label>
      <input id="commandBits"
             type="number"
             :value="codeBits"
             @input="updateNumber('codeBits', $event.target.value)"/>
      <p>Tyle bitów będzie kod rozkazu</p>
    </div>

    <!-- ADDRESS BITS -->
    <div class="flexColumn">
      <label for="addresBits">Address Bits:</label>
      <input id="addresBits"
             type="number"
             :value="addresBits"
             @input="updateNumber('addresBits', $event.target.value)"/>
      <p>Tyle bitów będzie mieć argument</p>
    </div>

    <!-- MICRO-STEP DELAY -->
    <div class="flexColumn">
      <label for="oddDelay">Micro-step delay (ms):</label>
      <input id="oddDelay"
             type="number"
             :value="oddDelay"
             min="0"
             @input="updateNumber('oddDelay', $event.target.value)"/>
      <p>Opóźnienie pomiędzy mikro-operacjami w milisekundach</p>
    </div>

    <!-- EXTRAS SWITCHES -->
    <div class="extras">
      <label>Extras:</label>
      <template v-for="(label, key) in extrasLabels" :key="key">
        <div class="switchDiv">
          <input
            :id="key"
            type="checkbox"
            :checked="extras[key]"
            @change="updateExtras(key, $event.target.checked)"
          />
          <label :for="key">{{ label }}</label>
        </div>
      </template>
    </div>

    <!-- RESET BUTTON -->
    <div class="flexColumn">
      <div class="flexRow">
        <button class="SvgAndTextButton" id="emptyLS" @click="$emit('emptyLS')">
          <RefreshIcon />
          <span>Reset <u>EVERYTHING</u></span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import SunIcon from "@/assets/svg/SunIcon.vue";
import MoonIcon from "@/assets/svg/MoonIcon.vue";
import RefreshIcon from "@/assets/svg/RefreshIcon.vue";

export default {
  name: "Settings",
  components: { SunIcon, MoonIcon, RefreshIcon },

  props: {
    open: { type: Boolean, default: false },
    lightMode: { type: Boolean, required: true },
    numberFormat: { type: String, required: true },
    memoryAddresBits: { type: Number, required: true },
    codeBits: { type: Number, required: true },
    addresBits: { type: Number, required: true },
    oddDelay: { type: Number, required: true },
    extras: {
      type: Object,
      required: true,
      validator(obj) {
        return [
          "xRegister",
          "yRegister",
          "dl",
          "jamlExtras",
          "busConnectors",
          "showInvisibleRegisters"
        ].every((k) => k in obj);
      }
    }
  },

  emits: [
    "close",
    "emptyLS",
    "update:lightMode",
    "update:numberFormat",
    "update:memoryAddresBits",
    "update:codeBits",
    "update:addresBits",
    "update:oddDelay",
    "update:extras"
  ],

  computed: {
    extrasLabels() {
      return {
        xRegister: "X Register",
        yRegister: "Y Register",
        dl: "DL",
        jamlExtras: "JAML Extras",
        busConnectors: "Bus Connectors",
        showInvisibleRegisters: "Show Invisible Registers"
      };
    }
  },

  methods: {
    setLightMode(value) {
      this.$emit("update:lightMode", value);
    },
    update(key, value) {
      this.$emit(`update:${key}`, value);
    },
    updateNumber(key, value) {
      const n = parseInt(value, 10);
      if (!Number.isNaN(n)) this.update(key, n);
    },
    updateExtras(key, value) {
      this.$emit("update:extras", { ...this.extras, [key]: value });
    }
  }
};
</script>

<style scoped>
</style>
