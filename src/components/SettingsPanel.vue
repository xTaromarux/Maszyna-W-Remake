<template>
  <div id="settings" :class="{ 'slide-in': isAnimated, 'slide-out': !isAnimated }" @click.stop>
    <header class="settingsHeader">
      <h1>Ustawienia</h1>
      <div class="headerBtns">
        <button class="closeBtn" @click="$emit('close')" aria-label="Zamknij ustawienia">&times;</button>
      </div>
    </header>

    <div class="settingsContent">
      <div class="flexColumn">
        <SegmentedToggle
          :options="[
            { label: 'Jasny', value: true },
            { label: 'Ciemny', value: false },
          ]"
          :model-value="lightMode"
          @update:model-value="$emit('update:lightMode', $event)"
        />
      </div>

      <div class="flexColumn">
        <label>Domyślny format liczb:</label>
        <SegmentedToggle
          :options="[
            { label: 'DEC', value: 'dec' },
            { label: 'HEX', value: 'hex' },
            { label: 'BIN', value: 'bin' },
          ]"
          :model-value="numberFormat"
          @update:model-value="$emit('update:numberFormat', $event)"
          class=""
          :class="{ active: lightMode }"
        />
      </div>
      <div class="flexColumn" v-if="numberFormat === 'dec'">
        <label>Wyświetlanie DEC:</label>
        <SegmentedToggle
          :options="[
            { label: 'Bez znaku', value: false },
            { label: 'U2 (ze znakiem)', value: true },
          ]"
          :model-value="decSigned"
          @update:model-value="$emit('update:decSigned', $event)"
        />
        <p>U2 używa szerokości słowa {{ codeBits + addresBits }} bitów (np. 4027 → −69).</p>
      </div>

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

      <div class="flexColumn">
        <label for="stepDelay">Opóźnienie kroku automatycznego (ms):</label>
        <input
          id="stepDelay"
          type="number"
          inputmode="numeric"
          pattern="[0-9]*"
          :value="stepDelay"
          min="5"
          max="10000"
          @input="updateNumber('stepDelay', $event.target.value)"
        />
        <p>Czas między kolejnymi krokami w trybie krokowym (cykle na sekundę = 1000/ms).</p>
      </div>

      <div class="extras" v-if="platform !== 'esp'">
        <label>Dodatki:</label>

        <!-- PROSTE BOOLEANY -->
        <template v-for="key in booleanKeys" :key="key">
          <div class="module-toggle-wrapper">
            <span class="module-label">{{ extrasLabels[key] }}</span>
            <label class="switch">
              <input type="checkbox" :checked="extras[key]" @change="$emit('update:extras', { [key]: $event.target.checked })" />
              <span class="slider round"></span>
            </label>
          </div>
        </template>

        <!-- GRUPY Z DZIEĆMI -->
        <div v-for="group in groupDefs" :key="group.key" class="settingsGroup" :class="{ open: isOpen(group.key) }">
          <!-- Nagłówek: rola przycisku + klawiatura -->
          <div
            class="settingsGroupHeader"
            role="button"
            :aria-expanded="isOpen(group.key)"
            tabindex="0"
            @click="toggleOpen(group.key)"
            @keydown.enter.prevent="toggleOpen(group.key)"
            @keydown.space.prevent="toggleOpen(group.key)"
          >
            <span class="chevron" aria-hidden="true"></span>
            <span class="group-title">{{ group.label }}</span>

            <!-- MASTER SWITCH -->
            <label class="switch" @click.stop>
              <input type="checkbox" :checked="isGroupAllOn(group)" @change="toggleGroup(group, $event.target.checked)" />
              <span class="slider round"></span>
            </label>
          </div>

          <!-- Płynna animacja wysokości -->
          <transition name="collapse" @enter="onEnter" @after-enter="onAfterEnter" @leave="onLeave" @after-leave="onAfterLeave">
            <div v-show="isOpen(group.key)" class="collapsible">
              <div v-for="child in group.children" :key="child.key" class="module-toggle-wrapper">
                <span class="module-label">{{ child.label }}</span>
                <label class="switch">
                  <input
                    type="checkbox"
                    :checked="extras?.[group.key]?.[child.key]"
                    @change="$emit('update:extras', { [group.key]: { [child.key]: $event.target.checked } })"
                  />
                  <span class="slider round"></span>
                </label>
              </div>
            </div>
          </transition>
        </div>
      </div>

      <div class="flexColumn">
        <label>Edytor:</label>
        <div class="module-toggle-wrapper">
          <span class="module-label">Auto-uzupełnianie (podpowiedzi)</span>
          <label class="switch">
            <input type="checkbox" :checked="autocompleteEnabled" @change="$emit('update:autocompleteEnabled', $event.target.checked)" />
            <span class="slider round"></span>
          </label>
        </div>
      </div>
      <div class="flexColumn">
        <label>Kompilacja ASM:</label>
        <div class="module-toggle-wrapper">
          <span class="module-label">Resetuj rejestry przy kompilacji</span>
          <label class="switch">
            <input
              type="checkbox"
              :checked="autoResetOnAsmCompile"
              @change="$emit('update:autoResetOnAsmCompile', $event.target.checked)"
            />
            <span class="slider round"></span>
          </label>
        </div>
        <p>Po włączeniu rejestry i pamięć są czyszczone automatycznie przed kompilacją assemblera.</p>
      </div>

      <div class="flexColumn">
        <div class="flexColumn button-column">
          <button class="SvgAndTextButton compact-button execution-btn execution-btn--step" id="resetValues" @click="$emit('resetValues')">
            <RefreshIcon />
            <span>Resetuj wartości rejestrów</span>
          </button>
          <button
            class="SvgAndTextButton compact-button execution-btn execution-btn--step"
            id="defaultSettings"
            @click="$emit('defaultSettings')"
          >
            <RefreshIcon />
            <span>Przywróć domyślne ustawienia</span>
          </button>
          <button
            class="SvgAndTextButton compact-button execution-btn execution-btn--step"
            id="openCommandList"
            @click="$emit('open-command-list')"
          >
            <CommandListIcon />
            <span>Lista rozkazów</span>
          </button>
        </div>
      </div>

      <!-- Sekcja kolorów dla ESP32 -->
      <div v-if="platform == 'esp'" class="color-section">
        <h3 class="color-section-title">Kolory LED</h3>

        <div class="color-buttons-list">
          <button class="color-selection-btn" @click="openColorPicker('signal_line')">
            <span class="color-label">Linie sygnałowe</span>
            <div class="color-dot" :style="{ backgroundColor: signalLineColor }"></div>
          </button>

          <button class="color-selection-btn" @click="openColorPicker('display')">
            <span class="color-label">Wyświetlacz</span>
            <div class="color-dot" :style="{ backgroundColor: displayColor }"></div>
          </button>

          <button class="color-selection-btn" @click="openColorPicker('bus')">
            <span class="color-label">Magistrala</span>
            <div class="color-dot" :style="{ backgroundColor: busColor }"></div>
          </button>
        </div>

        <button class="send-colors-btn" @click="sendAllColors" :disabled="!hasColorChanges">
          <span>📡 Wyślij wszystkie kolory do ESP32</span>
        </button>
      </div>

      <!-- Popup wyboru koloru -->
      <ColorPickerPopup
        :visible="colorPickerOpen"
        :title="currentColorTitle"
        :color="currentColor"
        :brightness="currentBrightness"
        @close="closeColorPicker"
        @apply="applyColor"
      />

      <PeopleSection :isMobile="isMobile" title="Opiekunowie" :people="caregivers" :showGithub="false" :columns="2" />
      <PeopleSection :isMobile="isMobile" title="Twórcy" :people="creators" :showGithub="true" :columns="2" />
    </div>
  </div>
</template>

<script>
import SunIcon from '@/assets/svg/SunIcon.vue';
import MoonIcon from '@/assets/svg/MoonIcon.vue';
import RefreshIcon from '@/assets/svg/RefreshIcon.vue';
import CommandListIcon from '@/assets/svg/CommandListIcon.vue';
import SegmentedToggle from './SegmentedToggle.vue';
import PeopleSection from './PeopleSection.vue';
import ColorPickerPopup from './ColorPickerPopup.vue';

export default {
  name: 'SettingsPanel',
  components: { SunIcon, MoonIcon, RefreshIcon, CommandListIcon, SegmentedToggle, PeopleSection, ColorPickerPopup },
  props: {
    isAnimated: { type: Boolean, default: false },
    lightMode: { type: Boolean, required: true },
    isMobile: { type: Boolean, required: true },
    numberFormat: { type: String, required: true },
    creators: { type: Array, default: () => [] },
    caregivers: { type: Array, default: () => [] },
    codeBits: { type: Number, required: true },
    addresBits: { type: Number, required: true },
    oddDelay: { type: Number, required: true },
    stepDelay: { type: Number, required: true },
    extras: { type: Object, required: true },
    platform: { type: String, default: '' },
    autocompleteEnabled: { type: Boolean, default: true },
    decSigned: { type: Boolean, default: false },
    autoResetOnAsmCompile: { type: Boolean, default: true },
  },
  data() {
    return {
      signalLineColor: '#ff0000',
      signalLineBrightness: 1,
      displayColor: '#00ff00',
      displayBrightness: 1,
      busColor: '#0000ff',
      busBrightness: 1,

      colorPickerOpen: false,
      currentColorType: null,
      currentColorTitle: '',
      currentColor: '#ff0000',
      currentBrightness: 1,

      pendingColors: {},
      hasColorChanges: false,

      openMap: {},
    };
  },
  emits: [
    'close',
    'update:lightMode',
    'update:numberFormat',
    'update:codeBits',
    'update:addresBits',
    'update:oddDelay',
    'update:stepDelay',
    'update:extras',
    'resetValues',
    'defaultSettings',
    'open-command-list',
    'update:autocompleteEnabled',
    'update:decSigned',
    'update:autoResetOnAsmCompile',
    'color-change',
  ],
  computed: {
    extrasLabels() {
      return {
        xRegister: 'Rejestr X',
        yRegister: 'Rejestr Y',
        dl: 'DL',
        jamlExtras: 'Dodatki JAML',
        busConnectors: 'Łączniki magistrali',
        showInvisibleRegisters: 'Pokaż niewidoczne rejestry magistral',
        interrupts: 'Przerwania',
        stack: 'Obsługa stosu',
        io: 'Urządzenia wejścia/wyjścia',
      };
    },
    booleanKeys() {
      return ['xRegister', 'yRegister', 'dl', 'jamlExtras', 'busConnectors', 'showInvisibleRegisters'];
    },
    groupDefs() {
      return [
        {
          key: 'io',
          label: this.extrasLabels.io,
          children: [
            { key: 'rbRegister', label: 'Rejestr RB' },
            { key: 'gRegister', label: 'Rejestr G' },
          ],
        },
        {
          key: 'stack',
          label: this.extrasLabels.stack,
          children: [
            { key: 'wsRegister', label: 'Rejestr WS' },
            { key: 'wylsSignal', label: 'Sygnał wyls' },
          ],
        },
        {
          key: 'interrupts',
          label: this.extrasLabels.interrupts,
          children: [
            { key: 'rzRegister', label: 'Rejestr RZ' },
            { key: 'rpRegister', label: 'Rejestr RP' },
            { key: 'rmRegister', label: 'Rejestr RM' },
            { key: 'apRegister', label: 'Rejestr AP' },
            { key: 'rintSignal', label: 'Sygnał rint' },
            { key: 'eniSignal', label: 'Sygnał eni' },
          ],
        },
      ];
    },
  },
  methods: {
    openColorPicker(type) {
      this.currentColorType = type;

      const colorMap = {
        signal_line: {
          title: 'Kolor linii sygnałowych',
          color: this.signalLineColor,
          brightness: this.signalLineBrightness,
        },
        display: {
          title: 'Kolor wyświetlacza',
          color: this.displayColor,
          brightness: this.displayBrightness,
        },
        bus: {
          title: 'Kolor magistrali',
          color: this.busColor,
          brightness: this.busBrightness,
        },
      };

      const config = colorMap[type];
      this.currentColorTitle = config.title;
      this.currentColor = config.color;
      this.currentBrightness = config.brightness;
      this.colorPickerOpen = true;
    },

    closeColorPicker() {
      this.colorPickerOpen = false;
      this.currentColorType = null;
    },

    applyColor({ color, brightness, colorData }) {
      if (this.currentColorType === 'signal_line') {
        this.signalLineColor = color;
        this.signalLineBrightness = brightness;
      } else if (this.currentColorType === 'display') {
        this.displayColor = color;
        this.displayBrightness = brightness;
      } else if (this.currentColorType === 'bus') {
        this.busColor = color;
        this.busBrightness = brightness;
      }

      this.pendingColors[this.currentColorType] = {
        type: this.currentColorType + '_hex',
        color,
        brightness,
        colorData,
      };

      this.hasColorChanges = Object.keys(this.pendingColors).length > 0;
      this.closeColorPicker();
    },

    sendAllColors() {
      Object.values(this.pendingColors).forEach((colorInfo) => {
        this.$emit('color-change', {
          type: colorInfo.type,
          hex: colorInfo.colorData.hex,
          rgb: colorInfo.colorData.rgb,
          hsv: colorInfo.colorData.hsv,
          brightness: colorInfo.brightness,
          rgbScaled: colorInfo.colorData.rgbScaled,
        });
      });

      this.pendingColors = {};
      this.hasColorChanges = false;
    },
    updateNumber(key, value) {
      const n = parseInt(value, 10);
      if (Number.isNaN(n)) return;
      const rules = {
        codeBits: { min: 1, max: 16 },
        addresBits: { min: 1, max: 32 },
        oddDelay: { min: 0, max: 10000 },
        stepDelay: { min: 5, max: 10000 },
      }[key];
      if (!rules) {
        if (n >= 0) this.$emit(`update:${key}`, n);
        return;
      }
      if (n >= rules.min && n <= rules.max) this.$emit(`update:${key}`, n);
    },

    isGroupAllOn(group) {
      const obj = this.extras?.[group.key] || {};
      return group.children.every((ch) => !!obj[ch.key]);
    },
    toggleGroup(group, checked) {
      const patch = {};
      for (const ch of group.children) patch[ch.key] = !!checked;
      this.$emit('update:extras', { [group.key]: patch });
    },

    isOpen(key) {
      return !!this.openMap[key];
    },
    toggleOpen(key) {
      this.openMap = { ...this.openMap, [key]: !this.openMap[key] };
    },

    onEnter(el) {
      el.style.height = '0px';
      el.style.overflow = 'hidden';
      void el.offsetHeight;
      el.style.height = el.scrollHeight + 'px';
    },
    onAfterEnter(el) {
      el.style.height = 'auto';
      el.style.overflow = '';
    },
    onLeave(el) {
      el.style.height = el.scrollHeight + 'px';
      el.style.overflow = 'hidden';
      void el.offsetHeight;
      el.style.height = '0px';
    },
    onAfterLeave(el) {
      el.style.overflow = '';
    },
  },
};
</script>

<style scoped>
#settings {
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  width: 400px;
  max-width: 90vw;
  z-index: 101;
  background-color: var(--panelBackgroundColor);
  border-left: 1px solid var(--panelOutlineColor);
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

#settings.slide-in {
  transform: translateX(0);
}

#settings.slide-out {
  transform: translateX(100%);
}

.settingsContent {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.settingsHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: #003c7d;
  color: #fff;
}

.settingsGroup {
  text-align: start;
}

.settingsGroup.open .chevron {
  transform: rotate(90deg);
}

.settingsGroupHeader {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.5rem;
  padding: 8px 0;
  cursor: pointer;
  user-select: none;
}

.settingsGroupHeader .chevron {
  width: 0;
  height: 0;
  border-left: 6px solid var(--fontColor);
  border-top: 4px solid transparent;
  border-bottom: 4px solid transparent;
  transition: transform 0.22s ease;
  margin-right: 2px;
}

.settingsGroupHeader .group-title {
  color: var(--fontColor);
  font-weight: 600;
}

.collapse-enter-active,
.collapse-leave-active {
  transition: height 0.25s ease;
}

.collapsible {
  overflow: hidden;
}

.settingsHeader h1 {
  font-size: 1.25rem;
  color: #fff;
  margin: 0;
}

.switch {
  position: relative;
  display: inline-block;
  width: 70px;
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
  inset: 0;
  background: var(--backgroundColorItem);
  transition: 0.4s;
}

.slider:before {
  content: '';
  position: absolute;
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background: var(--backgroundColorPartOfItem);
  transition: 0.4s;
}

input:checked + .slider {
  background: #003c7d;
}

input:focus + .slider {
  box-shadow: 0 0 1px #003c7d;
}

input:checked + .slider:before {
  transform: translateX(36px);
}

.slider.round {
  border-radius: 0.25rem;
}

.slider.round:before {
  border-radius: 0.25rem;
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
  background: var(--buttonBackgroundColor);
  color: var(--buttonTextColor);
  transition: 0.2s;
  font-size: 0.9rem;
}

.multiToggleButton span:hover {
  background: var(--buttonHoverColor);
}

.format-toggle {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  min-width: 180px;
}

.format-toggle span {
  background: var(--buttonBackgroundColor);
  color: var(--buttonTextColor, black);
}

.format-toggle.active-dec span:nth-child(1),
.format-toggle.active-hex span:nth-child(2),
.format-toggle.active-bin span:nth-child(3) {
  background: var(--signal-active);
  color: #fff;
}

.format-toggle.active-dec span:nth-child(1):hover,
.format-toggle.active-hex span:nth-child(2):hover,
.format-toggle.active-bin span:nth-child(3):hover {
  background: var(--signal-active);
}

.toggleButtonDiv {
  display: flex;
  border-radius: var(--default-border-radius);
  overflow: hidden;
  border: 1px solid var(--panelOutlineColor);
}

.toggleButtonDiv span {
  flex: 1;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  background: var(--buttonBackgroundColor);
  color: var(--buttonTextColor);
  transition: 0.2s;
  font-size: 0.9rem;
}

.toggleButtonDiv span:hover {
  background: var(--buttonHoverColor);
}

.toggleButtonDiv.active span:first-child {
  background: var(--signal-active);
  color: #fff;
}

.toggleButtonDiv:not(.active) span:last-child {
  background: var(--signal-active);
  color: #fff;
}

.SvgAndTextButton {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 1px solid var(--panelOutlineColor);
  border-radius: var(--default-border-radius);
  background: var(--buttonBackgroundColor);
  color: var(--buttonTextColor);
  cursor: pointer;
  transition: 0.2s;
  font-size: 0.9rem;
  flex: 1;
  justify-content: center;
}

.SvgAndTextButton:hover {
  background: var(--buttonHoverColor);
  transform: translateY(-1px);
}

.SvgAndTextButton:active {
  background: var(--buttonActiveColor);
  transform: translateY(0);
}

#settings .flexColumn {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 20px;
}

#settings input[type='number'] {
  padding: 0.5rem;
  border-radius: var(--default-border-radius);
  border: 1px solid var(--panelOutlineColor);
  background: var(--backgroundColor);
  color: var(--fontColor);
  font-size: 0.9rem;
  transition: border-color 0.2s;
}

#settings input[type='number']:focus {
  border-color: var(--signal-active);
  outline: none;
}

#settings label {
  font-weight: 500;
  color: var(--fontColor);
  margin-bottom: 0.25rem;
  text-align: left !important;
}

#settings p {
  font-size: 0.85rem;
  color: var(--fontColor);
  opacity: 0.7;
  margin: 0.25rem 0 0 0;
  line-height: 1.4;
}

/* Sekcja kolorów */
.color-section {
  margin: 20px 0;
  padding: 20px 0;
  border-top: 1px solid var(--panelOutlineColor);
}

.color-section-title {
  color: var(--fontColor);
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 20px 0;
  text-align: center;
}

.color-buttons-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.color-selection-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border: 1px solid var(--panelOutlineColor);
  border-radius: var(--default-border-radius);
  background: var(--buttonBackgroundColor);
  color: var(--buttonTextColor);
  cursor: pointer;
  transition: all 0.2s ease;
}

.color-selection-btn:hover {
  background: var(--buttonHoverColor);
  border-color: #003c7d;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 60, 125, 0.15);
}

.color-label {
  font-size: 0.9rem;
  font-weight: 500;
}

.color-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid var(--panelOutlineColor);
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.send-colors-btn {
  width: 100%;
  padding: 12px 20px;
  background: #003c7d;
  color: white;
  border: 1px solid #003c7d;
  border-radius: var(--default-border-radius);
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.send-colors-btn:hover:not(:disabled) {
  background: #0056b3;
  border-color: #0056b3;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 86, 179, 0.3);
}

.send-colors-btn:disabled {
  background: var(--buttonBackgroundColor);
  color: var(--fontColor);
  border-color: var(--panelOutlineColor);
  cursor: not-allowed;
  opacity: 0.5;
}

.color-picker-group {
  margin-bottom: 25px;
  padding: 15px;
  background: var(--panelBackgroundColorSecondary, rgba(0, 0, 0, 0.1));
  border-radius: var(--default-border-radius);
  border: 1px solid var(--panelOutlineColor);
}

.color-picker-label {
  color: var(--fontColor);
  font-size: 0.95rem;
  font-weight: 500;
  margin: 0 0 15px 0;
  text-align: center;
  opacity: 0.9;
}

/* Custom scrollbar styles for settings content */
.settingsContent::-webkit-scrollbar {
  width: 12px;
}

.settingsContent::-webkit-scrollbar-track {
  background: var(--panelBackgroundColor);
  border-radius: 6px;
}

.settingsContent::-webkit-scrollbar-thumb {
  background: #003c7d;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.settingsContent::-webkit-scrollbar-thumb:hover {
  background: #0056b3;
}

.settingsContent::-webkit-scrollbar-thumb:active {
  background: #002a5c;
}

/* Scrollbar corner */
.settingsContent::-webkit-scrollbar-corner {
  background: var(--panelBackgroundColor);
}

/* Scrollbar buttons (arrows) */
.settingsContent::-webkit-scrollbar-button {
  display: block;
  height: 12px;
  width: 12px;
  background: #003c7d;
  border-radius: 0;
}

.settingsContent::-webkit-scrollbar-button:hover {
  background: #0056b3;
}

.settingsContent::-webkit-scrollbar-button:active {
  background: #002a5c;
}

/* Up arrow */
.settingsContent::-webkit-scrollbar-button:vertical:start:decrement {
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M7 14l5-5 5 5z"/></svg>');
  background-repeat: no-repeat;
  background-position: center;
  background-size: 8px;
}

/* Down arrow */
.settingsContent::-webkit-scrollbar-button:vertical:end:increment {
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M7 10l5 5 5-5z"/></svg>');
  background-repeat: no-repeat;
  background-position: center;
  background-size: 8px;
}

/* Firefox scrollbar */
.settingsContent {
  scrollbar-width: auto;
  scrollbar-color: #003c7d var(--panelBackgroundColor);
}
</style>
