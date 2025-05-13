<template>
  <div class="bus signal" :class="{ active: signalStatus }">
    <div class="line" />
    <span v-if="showInvisibleRegisters">{{ busName }} : {{ formatNumber(busValue) }}</span>
    <span>{{ busName.toLowerCase() }}</span>
  </div>
</template>

<script>
export default {
  name: 'BusSignal',
  props: {
    signalStatus: {
      type: Boolean,
      required: true,
    },
    busValue: {
      type: Number,
      required: true,
    },
    showInvisibleRegisters: {
      type: Boolean,
      default: false,
    },
    busName: {
      type: String,
      required: true,
    },
    formatNumber: {
      type: Function,
      required: true,
    }
  },
};
</script>
