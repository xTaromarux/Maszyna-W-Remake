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


    <!-- CREATOR INFO -->
    <div class="flexColumn">
      <label>Created by:</label>
      <div class="creators-list">
        <div class="creator-item">
          <span class="creator-name">Paweł Linek</span>
          <div class="creator-links">
            <a href="https://www.polsl.pl" target="_blank" rel="noopener noreferrer" class="icon-link">
              <LinkedInIcon />
            </a>
            <a href="https://www.polsl.pl" target="_blank" rel="noopener noreferrer" class="icon-link">
              <GitHubIcon />
            </a>
          </div>
        </div>
        <div class="creator-item">
          <span class="creator-name">Sławomir Put</span>
          <div class="creator-links">
            <a href="https://www.polsl.pl" target="_blank" rel="noopener noreferrer" class="icon-link">
              <LinkedInIcon />
            </a>
            <a href="https://www.polsl.pl" target="_blank" rel="noopener noreferrer" class="icon-link">
              <GitHubIcon />
            </a>
          </div>
        </div>
        <div class="creator-item">
          <span class="creator-name">Maja Kucab</span>
          <div class="creator-links">
            <a href="https://www.polsl.pl" target="_blank" rel="noopener noreferrer" class="icon-link">
              <LinkedInIcon />
            </a>
            <a href="https://www.polsl.pl" target="_blank" rel="noopener noreferrer" class="icon-link">
              <GitHubIcon />
            </a>
          </div>
        </div>
        <div class="creator-item">
          <span class="creator-name">Bartek Faruga</span>
          <div class="creator-links">
            <a href="https://www.polsl.pl" target="_blank" rel="noopener noreferrer" class="icon-link">
              <LinkedInIcon />
            </a>
            <a href="https://www.polsl.pl" target="_blank" rel="noopener noreferrer" class="icon-link">
              <GitHubIcon />
            </a>
          </div>
        </div>
        <div class="creator-item">
          <span class="creator-name">Kacper Sikorski</span>
          <div class="creator-links">
            <a href="https://www.polsl.pl" target="_blank" rel="noopener noreferrer" class="icon-link">
              <LinkedInIcon />
            </a>
            <a href="https://www.polsl.pl" target="_blank" rel="noopener noreferrer" class="icon-link">
              <GitHubIcon />
            </a>
          </div>
        </div>
        <div class="creator-item">
          <span class="creator-name">Marcin Ryt</span>
          <div class="creator-links">
            <a href="https://www.polsl.pl" target="_blank" rel="noopener noreferrer" class="icon-link">
              <LinkedInIcon />
            </a>
            <a href="https://www.polsl.pl" target="_blank" rel="noopener noreferrer" class="icon-link">
              <GitHubIcon />
            </a>
          </div>
        </div>
        <div class="creator-item">
          <span class="creator-name">Michał Kostrzewski</span>
          <div class="creator-links">
            <a href="https://www.polsl.pl" target="_blank" rel="noopener noreferrer" class="icon-link">
              <LinkedInIcon />
            </a>
            <a href="https://www.polsl.pl" target="_blank" rel="noopener noreferrer" class="icon-link">
              <GitHubIcon />
            </a>
          </div>
        </div>
        <div class="creator-item">
          <span class="creator-name">Oskar Forreiter</span>
          <div class="creator-links">
            <a href="https://www.polsl.pl" target="_blank" rel="noopener noreferrer" class="icon-link">
              <LinkedInIcon />
            </a>
            <a href="https://www.polsl.pl" target="_blank" rel="noopener noreferrer" class="icon-link">
              <GitHubIcon />
            </a>
          </div>
        </div>
        <div class="creator-item">
          <span class="creator-name">Paweł Janus</span>
          <div class="creator-links">
            <a href="https://www.polsl.pl" target="_blank" rel="noopener noreferrer" class="icon-link">
              <LinkedInIcon />
            </a>
            <a href="https://www.polsl.pl" target="_blank" rel="noopener noreferrer" class="icon-link">
              <GitHubIcon />
            </a>
          </div>
        </div>
        <div class="creator-item">
          <span class="creator-name">Sebastian Legierski</span>
          <div class="creator-links">
            <a href="https://www.polsl.pl" target="_blank" rel="noopener noreferrer" class="icon-link">
              <LinkedInIcon />
            </a>
            <a href="https://www.polsl.pl" target="_blank" rel="noopener noreferrer" class="icon-link">
              <GitHubIcon />
            </a>
          </div>
        </div>
        <div class="creator-item">
          <span class="creator-name">Szymon Woźnica</span>
          <div class="creator-links">
            <a href="https://www.polsl.pl" target="_blank" rel="noopener noreferrer" class="icon-link">
              <LinkedInIcon />
            </a>
            <a href="https://www.polsl.pl" target="_blank" rel="noopener noreferrer" class="icon-link">
              <GitHubIcon />
            </a>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import SunIcon from "@/assets/svg/SunIcon.vue";
import MoonIcon from "@/assets/svg/MoonIcon.vue";
import RefreshIcon from "@/assets/svg/RefreshIcon.vue";
import LinkedInIcon from "@/assets/svg/LinkedInIcon.vue";
import GitHubIcon from "@/assets/svg/GitHubIcon.vue";

export default {
  name: "Settings",
  components: { SunIcon, MoonIcon, RefreshIcon, LinkedInIcon, GitHubIcon },

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
.creators-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 8px;
  margin-top: 8px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.creator-item {
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  font-size: 0.9em;
  text-align: center;
  color: #ddd;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.creator-item:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
}

.creator-name {
  font-weight: 500;
  line-height: 1.2;
}

.creator-links {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.icon-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: #aaa;
  transition: all 0.2s ease;
  border-radius: 4px;
  padding: 2px;
}

.icon-link:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.1);
}
</style>
