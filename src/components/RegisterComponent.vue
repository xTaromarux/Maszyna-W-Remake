<template>
  <div :id="id" :class="[classNames, edgeClass, 'register-container']">
    <div v-if="isEnableEditValue" class="register-container">
      <span :title="fullName" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">{{ label }}</span>
      <span>:</span>
      
      <div class="inputWrapper">
        <span>{{ formattedValue }}</span>
        <input inputmode="numeric" pattern="[0-9]*" type="number" class="hoverInput" :value="model" @input="updateValue" @blur="onBlur" />
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
      };
      return typeMap[this.label] || this.label;
    },
  },
  methods: {
    updateValue(event) {
      const value = parseInt(event.target.value, 10);
      if (!isNaN(value)) {
        const registerName = this.fullName || this.label;
        const maxValue = this.getMaxValueForRegister
          ? this.getMaxValueForRegister(this.registerType)
          : null;

        if (typeof maxValue === 'number' && Number.isFinite(maxValue) && maxValue >= 0) {
          const base = maxValue + 1;
          let normalized = value;

          if (value < 0 || value > maxValue) {
            normalized = ((value % base) + base) % base;
            if (this.showToast) {
              const msg = this.$t
                ? this.$t('common.validation.registerModulo', {
                    value,
                    max: maxValue,
                    name: registerName,
                    result: normalized,
                  })
                : `Wartość ${value} przekracza zakres ${maxValue} dla ${registerName}. Zapisano ${normalized}.`;
              this.showToast(msg);
            }
          }

          if (this.validateRegisterValue) {
            const ok = this.validateRegisterValue(normalized, this.registerType, registerName);
            if (!ok) {
              event.target.value = this.model;
              return;
            }
          }

          this.$emit('update:model', normalized);
          return;
        }

        if (this.validateRegisterValue) {
          if (this.validateRegisterValue(value, this.registerType, registerName)) {
            this.$emit('update:model', value);
          } else {
            event.target.value = this.model;
          }
          return;
        }

        this.$emit('update:model', value);
      } else {
        this.$emit('update:model', null);
      }
    },
    onBlur(e) {
      // ustaw 0 tylko jeśli pole jest puste
      if (e.target.value === '' || e.target.value === null) {
        e.target.value = 0;
        this.$emit('update:model', 0);
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
