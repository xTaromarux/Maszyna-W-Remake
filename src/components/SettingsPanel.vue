<template>
  <div
    id="settings"
    :class="{ 'slide-in': isAnimated, 'slide-out': !isAnimated }"
    @click.stop
  >

    <header class="settingsHeader">
        <h1>Ustawienia</h1>
        <div class="headerBtns">
            <button class="closeBtn" @click="$emit('close')" aria-label="Zamknij ustawienia">
            &times;
            </button>
        </div>
    </header>

    <div class="settings-content">
      <div class="flexColumn">
        <SegmentedToggle
          :options="[
            { label: 'Jasny', value: true },
            { label: 'Ciemny', value: false }
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
            { label: 'BIN', value: 'bin' }
          ]"
          :model-value="numberFormat"
          @update:model-value="$emit('update:numberFormat', $event)"
          class=""
          :class="{ active: lightMode }"
        />
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

      <div class="extras" v-if="platform !== 'esp'">
        <label>Dodatki:</label>
        <template v-for="(label, key) in extrasLabels" :key="key">
          <div class="module-toggle-wrapper">
            <span class="module-label">{{ label }}</span>
            <label class="switch">
              <input type="checkbox" :checked="extras[key]" @change="$emit('update:extras', { ...extras, [key]: $event.target.checked })" />
              <span class="slider round"></span>
            </label>
          </div>
        </template>
      </div>

      <div class="flexColumn">
        <div class="flexColumn button-column">
          <button class="SvgAndTextButton compact-button execution-btn execution-btn--step" id="resetValues" @click="$emit('resetValues')">
            <RefreshIcon />
            <span>Resetuj wartości rejestrów</span>
          </button>
          <button class="SvgAndTextButton compact-button execution-btn execution-btn--step" id="defaultSettings" @click="$emit('defaultSettings')">
            <RefreshIcon />
            <span>Przywróć domyślne ustawienia</span>
          </button>
          <button class="SvgAndTextButton compact-button execution-btn execution-btn--step" id="openCommandList" @click="$emit('open-command-list')">
            <CommandListIcon />
            <span>Lista rozkazów</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SunIcon from '@/assets/svg/SunIcon.vue'
import MoonIcon from '@/assets/svg/MoonIcon.vue'
import RefreshIcon from '@/assets/svg/RefreshIcon.vue'
import CommandListIcon from '@/assets/svg/CommandListIcon.vue'
import SegmentedToggle from './SegmentedToggle.vue'

export default {
  name: 'SettingsPanel',
  components: { SunIcon, MoonIcon, RefreshIcon, CommandListIcon, SegmentedToggle },
  props: {
    isAnimated: { type: Boolean, default: false },
    lightMode: { type: Boolean, required: true },
    numberFormat: { type: String, required: true },
    codeBits: { type: Number, required: true },
    addresBits: { type: Number, required: true },
    oddDelay: { type: Number, required: true },
    extras: { type: Object, required: true },
    platform: { type: String, default: '' },
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
      }
    },
  },
  methods: {
    updateNumber(key, value) {
      const n = parseInt(value, 10)
      if (Number.isNaN(n)) return
      const rules = {
        codeBits: { min: 1, max: 16 },
        addresBits: { min: 1, max: 32 },
        oddDelay: { min: 0, max: 10000 },
      }[key]
      if (!rules) { if (n >= 0) this.$emit(`update:${key}`, n); return }
      if (n >= rules.min && n <= rules.max) this.$emit(`update:${key}`, n)
    },
  },
}
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
  transform: translateX(0)
}

#settings.slide-out {
  transform: translateX(100%)
}

.settings-content {
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

.settingsHeader h1 {
  font-size: 1.25rem;
  color: #FFF;
  margin: 0;
}

.switch {
  position: relative;
  display: inline-block;
  width: 70px;
  height: 34px
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0
}

.slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background: #ccc;
  transition: .4s
}

.slider:before {
  content: '';
  position: absolute;
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background: #fff;
  transition: .4s
}

input:checked+.slider {
  background: #003c7d
}

input:focus+.slider {
  box-shadow: 0 0 1px #003c7d
}

input:checked+.slider:before {
  transform: translateX(36px)
}

.slider.round {
  border-radius: 0.25rem;
}

.slider.round:before {
  border-radius: 0.25rem;
}

.button-column {
  gap: .75rem
}

.compact-button {
  width: auto !important;
  max-width: 100% !important;
  min-width: 0 !important;
  flex-shrink: 1 !important;
  padding: .5rem 1rem !important;
  font-size: .85rem !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis
}

.compact-button span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis
}

.module-toggle-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: .5rem 0
}

.module-label {
  color: var(--fontColor)
}

.number-format-toggle {
  width: 100%
}

.multiToggleButton {
  display: flex;
  border-radius: var(--default-border-radius);
  overflow: hidden;
  border: 1px solid var(--panelOutlineColor)
}

.multiToggleButton span {
  flex: 1;
  padding: .75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: var(--buttonBackgroundColor);
  color: var(--buttonTextColor);
  transition: .2s;
  font-size: .9rem
}

.multiToggleButton span:hover {
  background: var(--buttonHoverColor)
}

.format-toggle {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  min-width: 180px
}

.format-toggle span {
  background: var(--buttonBackgroundColor);
  color: var(--buttonTextColor, black)
}

.format-toggle.active-dec span:nth-child(1),
.format-toggle.active-hex span:nth-child(2),
.format-toggle.active-bin span:nth-child(3) {
  background: var(--signal-active);
  color: #fff
}

.format-toggle.active-dec span:nth-child(1):hover,
.format-toggle.active-hex span:nth-child(2):hover,
.format-toggle.active-bin span:nth-child(3):hover {
  background: var(--signal-active)
}

.toggleButtonDiv {
  display: flex;
  border-radius: var(--default-border-radius);
  overflow: hidden;
  border: 1px solid var(--panelOutlineColor)
}

.toggleButtonDiv span {
  flex: 1;
  padding: .75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .5rem;
  cursor: pointer;
  background: var(--buttonBackgroundColor);
  color: var(--buttonTextColor);
  transition: .2s;
  font-size: .9rem
}

.toggleButtonDiv span:hover {
  background: var(--buttonHoverColor)
}

.toggleButtonDiv.active span:first-child {
  background: var(--signal-active);
  color: #fff
}

.toggleButtonDiv:not(.active) span:last-child {
  background: var(--signal-active);
  color: #fff
}

.SvgAndTextButton {
  display: flex;
  align-items: center;
  gap: .5rem;
  padding: .75rem 1rem;
  border: 1px solid var(--panelOutlineColor);
  border-radius: var(--default-border-radius);
  background: var(--buttonBackgroundColor);
  color: var(--buttonTextColor);
  cursor: pointer;
  transition: .2s;
  font-size: .9rem;
  flex: 1;
  justify-content: center
}

.SvgAndTextButton:hover {
  background: var(--buttonHoverColor);
  transform: translateY(-1px)
}

.SvgAndTextButton:active {
  background: var(--buttonActiveColor);
  transform: translateY(0)
}

#settings .flexColumn {
  display: flex;
  flex-direction: column;
  gap: .5rem
}

#settings input[type="number"] {
  padding: .5rem;
  border-radius: var(--default-border-radius);
  border: 1px solid var(--panelOutlineColor);
  background: var(--backgroundColor);
  color: var(--fontColor);
  font-size: .9rem;
  transition: border-color .2s;
}

#settings input[type="number"]:focus {
  border-color: var(--signal-active);
  outline: none
}

#settings label {
  font-weight: 500;
  color: var(--fontColor);
  margin-bottom: .25rem;
  text-align: left !important;
}

#settings p {
  font-size: .85rem;
  color: var(--fontColor);
  opacity: .7;
  margin: .25rem 0 0 0;
  line-height: 1.4
}
</style>
