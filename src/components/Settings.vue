<!-- Settings.vue -->
<template>
  <div id="settings" v-if="open">
    <!-- Title & Close -->
    <span class="titleSpan">Settings</span>
    <button @click="$emit('close')" id="openCloseSettings">
      <!-- SVG Close Icon - Changed to X -->
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
        <path d="M18 6L6 18M6 6L18 18"
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
      <div class="flexRow">
        <label for="argBits">Memory Size Bits:</label>
        <input id="argBits"
               type="number"
               :value="memoryAddresBits"
               @input="updateNumber('memoryAddresBits', $event.target.value)"/>
      </div>
      <p>Number of bits for memory address</p>
    </div>

    <!-- CODE BITS -->
    <div class="flexColumn">
      <div class="flexRow">
        <label for="commandBits">Code Bits:</label>
        <input id="commandBits"
               type="number"
               :value="codeBits"
               @input="updateNumber('codeBits', $event.target.value)"/>
      </div>
      <p>Number of bits for instruction code</p>
    </div>

    <!-- ADDRESS BITS -->
    <div class="flexColumn">
      <div class="flexRow">
        <label for="addresBits">Address Bits:</label>
        <input id="addresBits"
               type="number"
               :value="addresBits"
               @input="updateNumber('addresBits', $event.target.value)"/>
      </div>
      <p>Number of bits for argument</p>
    </div>

    <!-- MICRO-STEP DELAY -->
    <div class="flexColumn">
      <div class="flexRow">
        <label for="oddDelay">Micro-step delay (ms):</label>
        <input id="oddDelay"
               type="number"
               :value="oddDelay"
               min="0"
               @input="updateNumber('oddDelay', $event.target.value)"/>
      </div>
      <p>Delay between micro-operations in milliseconds</p>
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

    <!-- RESET BUTTONS -->
    <div class="flexColumn">
      <div class="flexRow">
        <button class="SvgAndTextButton" id="resetValues" @click="$emit('resetValues')">
          <RefreshIcon />
          <span>Reset <u>Register Values</u></span>
        </button>
        <button class="SvgAndTextButton" id="defaultSettings" @click="$emit('defaultSettings')">
          <RefreshIcon />
          <span>Default <u>Settings</u></span>
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
    "update:lightMode",
    "update:numberFormat",
    "update:memoryAddresBits",
    "update:codeBits",
    "update:addresBits",
    "update:oddDelay",
    "update:extras",
    "resetValues",
    "defaultSettings"
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
