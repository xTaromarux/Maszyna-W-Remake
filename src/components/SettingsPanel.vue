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
        <label for="memoryAddresBits">Bity pamięci (RAM):</label>
        <input
          id="memoryAddresBits"
          type="number"
          inputmode="numeric"
          pattern="[0-9]*"
          :value="memoryAddresBits"
          min="1"
          max="10"
          @input="updateNumber('memoryAddresBits', $event.target.value)"
        />
        <p>Rozmiar pamięci = 2^bity komórek.</p>
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

      <ColorPicker v-if="platform == 'esp'" v-model="color" v-model:brightness="ledPower" :size="260" @change="onColorChange" />
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
import ColorPicker from './ColorPicker.vue';

export default {
  name: 'SettingsPanel',
  components: { SunIcon, MoonIcon, RefreshIcon, CommandListIcon, SegmentedToggle, PeopleSection, ColorPicker },
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
    memoryAddresBits: { type: Number, required: true },
    decSigned: { type: Boolean, default: false },
  },
  data() {
    return {
      color: '#ff00ff',
      ledPower: 1,
      openMap: {}, // { [groupKey]: boolean }
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
    'update:memoryAddresBits',
    'update:autocompleteEnabled',
    'update:decSigned',
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
    onColorChange({ hex, rgb, hsv, brightness }) {
      // przykład: podbij akcent w CSS i wyślij wartości do kontrolera LED
      document.documentElement.style.setProperty('--accentColor', hex);
      // brightness = ledPower (0..1), hsv.v = jasność koloru
    },
    updateNumber(key, value) {
      const n = parseInt(value, 10);
      if (Number.isNaN(n)) return;
      const rules = {
        codeBits: { min: 1, max: 16 },
        addresBits: { min: 1, max: 32 },
        memoryAddresBits: { min: 1, max: 10 },
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
</style>
