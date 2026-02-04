<template>
  <div :id="id" :class="[classNames, edgeClass, 'register-container']">
    <div v-if="isEnableEditValue" class="register-container">
      <span :title="fullName" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">{{ label }}</span>
      <span>:</span>
      
      <div class="inputWrapper">
        <span>{{ formattedValue }}</span>
        <input
          :type="inputType"
          :inputmode="inputMode"
          class="hoverInput"
          :value="inputValue"
          @input="updateValue"
          @blur="onBlur"
        />
      </div>
    </div>
    <div v-if="showFormatSelector" class="format-selector" ref="formatSelector">
      <button class="format-button" @click.stop="toggleFormatMenu">
        <KogWheelIcon />
      </button>
      <div v-if="showFormatMenu" class="format-menu">
        <div @click="setFormat('dec')" :class="{ active: numberFormat === 'dec' }">DEC</div>
        <div @click="setFormat('hex')" :class="{ active: numberFormat === 'hex' }">HEX</div>
        <div @click="setFormat('bin')" :class="{ active: numberFormat === 'bin' }">BIN</div>
      </div>
    </div>
  </div>
</template>

<script>
import KogWheelIcon from '@/assets/svg/KogWheelIcon.vue';

export default {
  name: 'RegisterComponent',
  components: { KogWheelIcon },
  inject: {
    validateRegisterValue: {
      default: null,
    },
    showToast: {
      default: null,
    },
    getMaxValueForRegister: {
      default: null,
    },
  },
  props: {
    label: String,
    id: String,
    classNames: {
      type: String,
      default: 'register',
    },
    model: [Number],
    numberFormat: {
      type: String,
      default: 'dec',
    },
    signedDec: { type: Boolean, default: false },
    wordBits: { type: Number, default: 12 }, 
    showFormatSelector: {
      type: Boolean,
      default: true,
    },
    isEnableEditValue: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['update:model', 'update:numberFormat'],
  data() {
    return {
      edgeClass: '',
      showFormatMenu: false,
    };
  },
  computed: {
    fullName() {
      const names = {
        AK: 'Akumulator',
        X: 'Rejestr X',
        Y: 'Rejestr Y',
        I: 'Rejestr I (adresowy)',
        L: 'Licznik',
        S: 'Rejestr S',
        A: 'Rejestr A',
        JAML: 'Rejestr JAL',
        JAL: 'Rejestr JAL',
        RZ: 'Rejestr zgłoszeń przerwań',
        RP: 'Rejestr priorytetów przerwań',
        AP: 'Rejestr adresu przerwania',
        RM: 'Rejestr maski przerwań',
        G:  'Rejestr gotowości urządzenia',
        RB: 'Rejestr bufora urządzenia',
        WS: 'Wskaźnik stosu', 
      };
      return names[this.label] || this.label;
    },
    formattedValue() {
      if (typeof this.model !== 'number' || isNaN(this.model)) {
        return 'Błąd';
      }
      
      const toSigned = (value, bits) => {
        const mod = 1 << bits;
        const mask = mod - 1;
         const sign = 1 << (bits - 1);
         const v = value & mask;
         return (v & sign) ? v - mod : v;
       };
       
      const formatters = {
        dec: (num) => (this.signedDec ? toSigned(num, this.wordBits) : num).toString(),
        hex: (num) => '0x' + num.toString(16).toUpperCase(),
        bin: (num) => '0b' + num.toString(2),
      };
      return (formatters[this.numberFormat] || formatters.dec)(this.model);
    },
    inputType() {
      return this.numberFormat === 'dec' ? 'number' : 'text';
    },
    inputMode() {
      if (this.numberFormat === 'hex') return 'text';
      return 'numeric';
    },
    inputValue() {
      if (typeof this.model !== 'number' || isNaN(this.model)) {
        return '';
      }
      switch (this.numberFormat) {
        case 'hex':
          return Math.floor(this.model).toString(16).toUpperCase();
        case 'bin':
          return Math.floor(this.model).toString(2);
        default:
          return String(this.model);
      }
    },
     registerType() {
      // Map label to register type for validation
      const typeMap = {
        AK: 'ACC',
        X: 'X',
        Y: 'Y',
        I: 'I',
        L: 'programCounter',
        S: 'S',
        A: 'A',
        WS: 'WS', 
        RZ: 'RZ', 
        RP: 'RP', 
        AP: 'AP', 
        RM: 'RM', 
        G: 'G', 
        RB: 'RB', 
        JAML: 'JAL',
        JAL: 'JAL',
      };
      return typeMap[this.label] || this.label;
    },
  },
  methods: {
    parseInputValue(raw) {
      const txt = String(raw ?? '').trim();
      if (txt === '' || txt === '-') return null;

      let sign = 1n;
      let body = txt;
      if (body.startsWith('-')) {
        sign = -1n;
        body = body.slice(1);
      }

      body = body.replace(/_/g, '');
      if (!body) return null;

      let base = 10;
      if (this.numberFormat === 'hex') base = 16;
      if (this.numberFormat === 'bin') base = 2;

      if (/^0x/i.test(body)) {
        base = 16;
        body = body.slice(2);
      } else if (/^0b/i.test(body)) {
        base = 2;
        body = body.slice(2);
      }

      if (!body) return null;
      if (base === 2 && /[^01]/.test(body)) return null;
      if (base === 16 && /[^0-9a-f]/i.test(body)) return null;
      if (base === 10 && /[^0-9]/.test(body)) return null;

      try {
        let big;
        if (base === 16) big = BigInt(`0x${body}`);
        else if (base === 2) big = BigInt(`0b${body}`);
        else big = BigInt(body);
        return { big: sign < 0n ? -big : big };
      } catch {
        return null;
      }
    },
    formatInputValue(value) {
      if (typeof value !== 'number' || Number.isNaN(value)) return '';
      switch (this.numberFormat) {
        case 'hex':
          return Math.floor(value).toString(16).toUpperCase();
        case 'bin':
          return Math.floor(value).toString(2);
        default:
          return String(value);
      }
    },
    updateValue(event) {
      const raw = event.target.value;
      const parsed = this.parseInputValue(raw);
      if (parsed === null) {
        const trimmed = String(raw ?? '').trim();
        if (trimmed === '' || trimmed === '-') return;
        event.target.value = this.inputValue;
        return;
      }

        const registerName = this.fullName || this.label;
        const maxValue = this.getMaxValueForRegister
          ? this.getMaxValueForRegister(this.registerType)
          : null;

        if (typeof maxValue === 'number' && Number.isFinite(maxValue) && maxValue >= 0) {
          const base = BigInt(maxValue) + 1n;
          let normalizedBig = parsed.big;

          if (parsed.big < 0n || parsed.big > BigInt(maxValue)) {
            normalizedBig = ((parsed.big % base) + base) % base;
            if (this.showToast) {
              const msg = this.$t
                ? this.$t('common.validation.registerModulo', {
                    value: String(parsed.big),
                    max: maxValue,
                    name: registerName,
                    result: Number(normalizedBig),
                  })
                : `Wartość ${parsed.big} przekracza zakres ${maxValue} dla ${registerName}. Zapisano ${Number(normalizedBig)}.`;
              this.showToast(msg);
            }
          }

          const normalized = Number(normalizedBig);
          if (this.validateRegisterValue) {
            const ok = this.validateRegisterValue(normalized, this.registerType, registerName);
            if (!ok) {
              event.target.value = this.model;
              return;
            }
          }

          this.$emit('update:model', normalized);
          event.target.value = this.formatInputValue(normalized);
          return;
        }

        if (this.validateRegisterValue) {
          if (this.validateRegisterValue(Number(parsed.big), this.registerType, registerName)) {
            this.$emit('update:model', Number(parsed.big));
          } else {
            event.target.value = this.model;
          }
          return;
        }

        this.$emit('update:model', Number(parsed.big));
    },
    onBlur(e) {
      // ustaw 0 tylko jeśli pole jest puste
      if (e.target.value === '' || e.target.value === null) {
        e.target.value = 0;
        this.$emit('update:model', 0);
      } else {
        e.target.value = this.inputValue;
      }
    },
    handleMouseEnter() {
      const rect = this.$el.getBoundingClientRect();
      if (rect.left < 50) this.edgeClass = 'edge-left';
      else if (rect.right > window.innerWidth - 50) this.edgeClass = 'edge-right';
      else this.edgeClass = '';
    },
    handleMouseLeave() {
      this.edgeClass = '';
    },
    toggleFormatMenu() {
      this.showFormatMenu = !this.showFormatMenu;
    },
    setFormat(format) {
      this.$emit('update:numberFormat', format);
      this.showFormatMenu = false;
    },
    closeMenu(event) {
      if (this.showFormatMenu && !this.$refs.formatSelector.contains(event.target)) {
        this.showFormatMenu = false;
      }
    },
  },
  mounted() {
    document.addEventListener('click', this.closeMenu);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.closeMenu);
  },
};
</script>

<style scoped>
.register-container {
  position: relative;
  display: flex;
  align-items: center;
}

.inputWrapper {
  position: relative;
}

.format-selector {
  position: relative;
  margin-left: 4px;
}

.format-button {
  background: none;
  border: none;
  padding: 2px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.format-button:hover {
  background-color: rgba(128, 128, 128, 0.2);
}

.format-button svg {
  width: 16px;
  height: 16px;
  fill: var(--fontColor);
}

.format-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: var(--backgroundColor);
  border: 1px solid var(--panelOutlineColor);
  border-radius: var(--default-border-radius);
  padding: 4px;
  z-index: 1000;
  min-width: 60px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.format-menu div {
  padding: 6px 10px;
  cursor: pointer;
  border-radius: 4px;
  font-size: 0.85rem;
  text-align: center;
}

.format-menu div:hover {
  background-color: var(--buttonHoverColor);
}

.format-menu div.active {
  background-color: var(--signal-active);
  color: white;
}
</style>
