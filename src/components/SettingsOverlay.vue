<template>
  <div id="settings-overlay" v-if="open" @click.self="startClose">
    <CreatorsPanel :is-mobile="isMobile" :is-animated="isAnimated" :creators="creators" :caregivers="caregivers" />

    <SettingsPanel
      :is-animated="isAnimated"
      :is-mobile="isMobile"
      :creators="creators"
      :caregivers="caregivers"
      :light-mode="lightMode"
      :number-format="numberFormat"
      :code-bits="codeBits"
      :addres-bits="addresBits"
      :odd-delay="oddDelay"
      :step-delay="stepDelay"
      :extras="extras"
      :platform="platform"
      :dec-signed="decSigned"
      :memory-addres-bits="memoryAddresBits"
      :autocomplete-enabled="autocompleteEnabled"
      @close="startClose"
      @update:lightMode="$emit('update:lightMode', $event)"
      @update:numberFormat="$emit('update:numberFormat', $event)"
      @update:decSigned="$emit('update:decSigned', $event)"
      @update:codeBits="$emit('update:codeBits', $event)"
      @update:addresBits="$emit('update:addresBits', $event)"
      @update:oddDelay="$emit('update:oddDelay', $event)"
      @update:stepDelay="$emit('update:stepDelay', $event)"
      @update:extras="$emit('update:extras', $event)"
      @resetValues="$emit('resetValues')"
      @defaultSettings="$emit('defaultSettings')"
      @open-command-list="$emit('open-command-list')"
      @update:autocompleteEnabled="$emit('update:autocompleteEnabled', $event)"
      @update:memoryAddresBits="$emit('update:memoryAddresBits', $event)"
      @color-change="$emit('color-change', $event)"
    />
  </div>
</template>

<script>
import SettingsPanel from './SettingsPanel.vue';
import CreatorsPanel from './CreatorsPanel.vue';

export default {
  name: 'SettingsOverlay',
  components: { SettingsPanel, CreatorsPanel },
  props: {
    settingsOpen: { type: Boolean, default: false },
    isMobile: { type: Boolean, required: true },
    lightMode: { type: Boolean, required: true },
    numberFormat: { type: String, required: true },
    codeBits: { type: Number, required: true },
    autocompleteEnabled: { type: Boolean, default: true },
    memoryAddresBits: { type: Number, required: true },
    addresBits: { type: Number, required: true },
    oddDelay: { type: Number, required: true },
    stepDelay: { type: Number, required: true },
    decSigned: { type: Boolean, default: false },
    extras: {
      type: Object,
      required: true,
      validator(obj) {
        return ['xRegister', 'yRegister', 'dl', 'jamlExtras', 'busConnectors', 'showInvisibleRegisters', 'interrupts', 'io', 'stack'].every(
          (k) => k in obj
        );
      },
    },
    creators: {
      type: Array,
      default: () => [
        { name: 'Szymon Woźnica', linkedin: 'https://pl.linkedin.com/in/szymon-wo%C5%BAnica-b46b7b201', github: '', roles: [] },
        { name: 'Maja Kucab', linkedin: '', github: '', roles: [] },
        {
          name: 'Kacper Sikorski',
          linkedin: 'https://www.linkedin.com/in/kacper-sikorski-049b4a334/',
          github: 'https://github.com/Sikor915',
          roles: [],
        },
        { name: 'Sławomir Put', linkedin: 'https://www.linkedin.com/in/slawomir-put/', github: 'https://github.com/xTaromarux', roles: [] },
        { name: 'Paweł Linek', linkedin: 'https://www.linkedin.com/in/paweloslinek/', github: 'https://github.com/pawelos231', roles: [] },
        { name: 'Bartek Faruga', linkedin: 'https://www.linkedin.com/in/bartosz-faruga/', github: 'https://github.com/MrRooby', roles: [] },
        { name: 'Marcin Ryt', linkedin: '', github: '', roles: [] },
        { name: 'Oskar Forreiter', linkedin: '', github: '', roles: [] },
        { name: 'Michał Kostrzewski', linkedin: '', github: '', roles: [] },
        { name: 'Sebastian Legierski', linkedin: '', github: '', roles: [] },
        { name: 'Paweł Janus', linkedin: '', github: '', roles: [] },
      ],
    },
    caregivers: {
      default: () => [
        { name: 'Dr inż. Robert Tutajewicz', linkedin: '', roles: [] },
        { name: 'Dr hab. inż. Krzysztof Simiński', linkedin: '', roles: [] },
        { name: 'Dr inż. Tomasz Rudnicki', linkedin: '', roles: [] },
      ],
    },
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
    'update:memoryAddresBits',
    'update:decSigned',
    'update:autocompleteEnabled',
    'color-change',
  ],
  data() {
    return {
      open: false,
      isAnimated: false,
      platform: import.meta.env.VITE_APP_PLATFORM,
    };
  },
  watch: {
    settingsOpen(newVal) {
      if (newVal) {
        this.open = true;
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
  mounted() {
    if (this.settingsOpen) {
      this.open = true;
      this.$nextTick(() =>
        setTimeout(() => {
          this.isAnimated = true;
        }, 10)
      );
    }
  },
  methods: {
    startClose() {
      this.$emit('close');
      setTimeout(() => {
        this.open = false;
      }, 400);
    },
  },
};
</script>

<style scoped>
#settings-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  opacity: 0;
  animation: fadeIn 0.3s ease-in-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (max-width: 768px) {
  :deep(#settings) {
    width: 100vw;
    max-width: 100vw;
  }
  :deep(#creators) {
    width: 85vw;
    max-width: 85vw;
  }
}
</style>
