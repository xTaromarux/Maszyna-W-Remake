<!-- Settings.vue -->
<template>
  <div id="settings-overlay" v-if="open" @click.self="startClose">
    <div id="settings" :class="{ 'slide-in': isAnimated, 'slide-out': !isAnimated }" @click.stop>
      <!-- Title & Close -->
      <div class="settings-header">
        <span class="titleSpan">Ustawienia</span>
        <button class="closeBtn" @click="$emit('close')" aria-label="Zamknij ustawienia">&times;</button>
      </div>
      <div class="settings-content">
        <!-- LIGHT/DARK THEME -->
        <div class="flexColumn">
          <div class="toggleButtonDiv" :class="{ active: lightMode }">
            <span @click="setLightMode(true)"> <SunIcon /> Jasny </span>
            <span @click="setLightMode(false)"> <MoonIcon /> Ciemny </span>
          </div>
        </div>

        <!-- NUMBER FORMAT -->
        <div class="flexColumn">
          <label>Domyślny format liczb:</label>
          <div class="number-format-toggle">
            <div
              class="multiToggleButton format-toggle"
              :class="{
                'active-dec': numberFormat === 'dec',
                'active-hex': numberFormat === 'hex',
                'active-bin': numberFormat === 'bin',
              }"
            >
              <span @click="update('numberFormat', 'dec')">DEC</span>
              <span @click="update('numberFormat', 'hex')">HEX</span>
              <span @click="update('numberFormat', 'bin')">BIN</span>
            </div>
          </div>
        </div>

        <!-- CODE BITS -->
        <div class="flexColumn">
          <label for="commandBits">Bity kodu:</label>
          <input
            id="commandBits"
            type="number"
            inputmode="numeric"
            pattern="[0-9]*"
            :value="codeBits"
            min="1"
            max="16"
            @input="updateNumber('codeBits', $event.target.value)"
          />
          <p>Liczba bitów dla kodu rozkazu.</p>
        </div>

        <!-- ADDRESS BITS -->
        <div class="flexColumn">
          <label for="addresBits">Bity adresu:</label>
          <input
            id="addresBits"
            type="number"
            inputmode="numeric"
            pattern="[0-9]*"
            :value="addresBits"
            min="1"
            max="32"
            @input="updateNumber('addresBits', $event.target.value)"
          />
          <p>Liczba bitów dla argumentu.</p>
        </div>

        <!-- MICRO-STEP DELAY -->
        <div class="flexColumn">
          <label for="oddDelay">Opóźnienie mikro-kroku (ms):</label>
          <input
            id="oddDelay"
            type="number"
            inputmode="numeric"
            pattern="[0-9]*"
            :value="oddDelay"
            min="0"
            max="10000"
            @input="updateNumber('oddDelay', $event.target.value)"
          />
          <p>Opóźnienie między mikro-operacjami w milisekundach.</p>
        </div>

        <!-- EXTRAS SWITCHES -->
        <div class="extras" v-if="platform !== 'esp'">
          <label>Dodatki:</label>
          <template v-for="(label, key) in extrasLabels" :key="key">
            <div class="module-toggle-wrapper">
              <span class="module-label">{{ label }}</span>
              <label class="switch">
                <input type="checkbox" :checked="extras[key]" @change="updateExtras(key, $event.target.checked)" />
                <span class="slider round"></span>
              </label>
            </div>
          </template>
        </div>

        <!-- RESET BUTTONS -->
        <div class="flexColumn">
          <div class="flexColumn button-column">
            <button class="SvgAndTextButton compact-button action-button" id="resetValues" @click="$emit('resetValues')">
              <RefreshIcon />
              <span>Resetuj wartości rejestrów</span>
            </button>
            <button class="SvgAndTextButton compact-button action-button" id="defaultSettings" @click="$emit('defaultSettings')">
              <RefreshIcon />
              <span>Przywróć domyślne ustawienia</span>
            </button>
            <button class="SvgAndTextButton compact-button action-button" id="openCommandList" @click="emitEvents">
              <CommandListIcon />
              <span>Lista rozkazów</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- CREATOR INFO -->
    <div class="flexColumn" v-if="false">
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
import SunIcon from '@/assets/svg/SunIcon.vue';
import MoonIcon from '@/assets/svg/MoonIcon.vue';
import RefreshIcon from '@/assets/svg/RefreshIcon.vue';
import LinkedInIcon from '@/assets/svg/LinkedInIcon.vue';
import GitHubIcon from '@/assets/svg/GitHubIcon.vue';
import CommandListIcon from '@/assets/svg/CommandListIcon.vue';

export default {
  name: 'Settings',
  components: { SunIcon, MoonIcon, RefreshIcon, LinkedInIcon, GitHubIcon, CommandListIcon },

  props: {
    settingsOpen: { type: Boolean, default: false },
    lightMode: { type: Boolean, required: true },
    numberFormat: { type: String, required: true },
    codeBits: { type: Number, required: true },
    addresBits: { type: Number, required: true },
    oddDelay: { type: Number, required: true },
    extras: {
      type: Object,
      required: true,
      validator(obj) {
        return ['xRegister', 'yRegister', 'dl', 'jamlExtras', 'busConnectors', 'showInvisibleRegisters'].every((k) => k in obj);
      },
    },
  },

  data() {
    return {
      isAnimated: false,
      open: false,
      platform: import.meta.env.VITE_APP_PLATFORM,
    };
  },

  emits: [
    'close',
    'update:lightMode',
    'update:numberFormat',
    'update:codeBits',
    'update:addresBits',
    'update:oddDelay',
    'update:extras',
    'resetValues',
    'defaultSettings',
    'open-command-list',
  ],

  computed: {
    extrasLabels() {
      return {
        xRegister: 'Rejestr X',
        yRegister: 'Rejestr Y',
        dl: 'DL',
        jamlExtras: 'Dodatki JAML',
        busConnectors: 'Łączniki magistrali',
        showInvisibleRegisters: 'Pokaż niewidoczne rejestry',
      };
    },
  },

  watch: {
    settingsOpen(newVal) {
      if (newVal) {
        this.open = true;
        // Small delay to ensure DOM is ready, then trigger animation
        this.$nextTick(() => {
          setTimeout(() => {
            this.isAnimated = true;
          }, 10);
        });
      } else {
        this.$nextTick(() => {
          setTimeout(() => {
            this.open = false;
          }, 400);
          setTimeout(() => {
            this.isAnimated = false;
          }, 10);
        });
      }
    },
  },

  methods: {
    startClose() {
      this.$emit('close');
      setTimeout(() => {
        this.open = false;
      }, 400);
    },
    emitEvents() {
      this.$emit('open-command-list');
      this.$emit('close');
    },
    setLightMode(value) {
      this.$emit('update:lightMode', value);
    },
    update(key, value) {
      this.$emit(`update:${key}`, value);
    },
    updateNumber(key, value) {
      const n = parseInt(value, 10);

      if (Number.isNaN(n)) return;

      const validationRules = {
        codeBits: { min: 1, max: 16 },
        addresBits: { min: 1, max: 32 },
        oddDelay: { min: 0, max: 10000 },
      };

      const rules = validationRules[key];
      if (!rules) {
        // If no rules defined, just check for non-negative
        if (n >= 0) this.update(key, n);
        return;
      }

      // Apply validation rules
      if (n >= rules.min && n <= rules.max) {
        this.update(key, n);
      }
    },
    updateExtras(key, value) {
      this.$emit('update:extras', { ...this.extras, [key]: value });
    },
    closeIfClickingOverlay(event) {
      // Only close if clicking on the overlay, not the panel itself
      if (event.target.id === 'settings-overlay') {
        this.$emit('close');
      }
    },
  },
};
</script>

<style scoped>
.settings-content {
  overflow-y: auto;
  padding-right: 10px; /* Add padding to avoid content hiding behind scrollbar */
}

/* Custom Scrollbar for Webkit browsers */
.settings-content::-webkit-scrollbar {
  width: 12px;
  background-color: var(--backgroundColor); /* Or a color from your theme */
}

.settings-content::-webkit-scrollbar-track {
  background-color: var(--backgroundColor);
  border-radius: 10px;
}

.settings-content::-webkit-scrollbar-thumb {
  background-color: var(--panelOutlineColor); /* A visible color from your theme */
  border-radius: 10px;
  border: 3px solid var(--backgroundColor); /* Padding around thumb */
}

.settings-content::-webkit-scrollbar-thumb:hover {
  background-color: var(--fontColor); /* A slightly more visible color on hover */
}

/* Simple slider switch */
.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: 0.4s;
  transition: 0.4s;
}

.slider:before {
  position: absolute;
  content: '';
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  -webkit-transition: 0.4s;
  transition: 0.4s;
}

input:checked + .slider {
  background-color: #2196f3;
}

input:focus + .slider {
  box-shadow: 0 0 1px #2196f3;
}

input:checked + .slider:before {
  -webkit-transform: translateX(26px);
  -ms-transform: translateX(26px);
  transform: translateX(26px);
}

.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}

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

.button-column {
  gap: 0.75rem;
}

.compact-button {
  width: auto !important;
  max-width: 100% !important;
  min-width: 0 !important;
  flex-shrink: 1 !important;
  padding: 0.5rem 1rem !important;
  font-size: 0.85rem !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.compact-button span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.module-toggle-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 0;
}

.module-label {
  color: var(--fontColor);
  font-weight: normal;
  flex: 1;
}

.module-toggle {
  flex-shrink: 0;
  min-width: 120px;
}

.module-toggle span {
  min-width: 60px !important;
  font-size: 0.85rem;
}

.number-format-toggle {
  width: 100%;
}

.multiToggleButton {
  display: flex;
  border-radius: var(--default-border-radius);
  overflow: hidden;
  border: 1px solid var(--panelOutlineColor);
}

.multiToggleButton span {
  flex: 1;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: var(--buttonBackgroundColor);
  color: var(--buttonTextColor);
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.multiToggleButton span:hover {
  background-color: var(--buttonHoverColor);
}

.format-toggle {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  min-width: 180px;
}

.format-toggle span {
  background-color: var(--buttonBackgroundColor);
  color: var(--buttonTextColor, black);
  transition: all 0.2s ease;
}

.format-toggle.active-dec span:nth-child(1),
.format-toggle.active-hex span:nth-child(2),
.format-toggle.active-bin span:nth-child(3) {
  background-color: var(--signal-active);
  color: white;
}

.format-toggle.active-dec span:nth-child(1):hover,
.format-toggle.active-hex span:nth-child(2):hover,
.format-toggle.active-bin span:nth-child(3):hover {
  background-color: var(--signal-active);
}

.action-button {
  background-color: #0066cc !important;
  color: white !important;
  border: 1px solid var(--panelOutlineColor) !important;
  border-radius: var(--default-border-radius) !important;
}

.action-button:hover {
  background-color: #0099ff !important;
}

.action-button:active {
  background-color: #004c99 !important;
}

.action-button svg {
  color: white !important;
  fill: white !important;
  width: 1.5rem !important;
  height: 1.5rem !important;
}

.action-button span {
  color: white !important;
}
</style>
