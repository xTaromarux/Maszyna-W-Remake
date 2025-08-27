<template>
  <div :id="id" :class="[classNames, edgeClass, 'register-container']">
    <div v-if="isEnableEditValue" class="register-container">
      <span   
        :title="fullName" 
        @mouseenter="handleMouseEnter" 
        @mouseleave="handleMouseLeave">{{ label }}</span
      ><span>:</span>
      
      <div class="inputWrapper">
        <span>{{ formattedValue }}</span>
        <input
          inputmode="numeric"
          pattern="[0-9]*"
          type="number"
          class="hoverInput"
          :value="model"
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
        JAML: 'Rejestr JAML',
      };
      return names[this.label] || this.label;
    },
    formattedValue() {
      if (typeof this.model !== 'number' || isNaN(this.model)) {
        return 'Błąd';
      }
      const formatters = {
        dec: (num) => num.toString(),
        hex: (num) => '0x' + num.toString(16).toUpperCase(),
        bin: (num) => '0b' + num.toString(2),
      };
      return (formatters[this.numberFormat] || formatters.dec)(this.model);
    },
  },
  methods: {
    updateValue(event) {
      const value = parseInt(event.target.value, 10);
      if (!isNaN(value)) {
        this.$emit('update:model', value); // poprawione
      } else {
        this.$emit('update:model', null);  // pozwalamy onBlur wykryć puste
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
