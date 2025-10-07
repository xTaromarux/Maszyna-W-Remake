<template>
  <div class="bus signal" :class="{ active: signalStatus }">
    <div class="line" />
    <BusLabel
      :busName="busName"
      :busValue="busValue"
      :showInvisibleRegisters="showInvisibleRegisters"
      :mobileView="mobileView"
      :formatNumber="formatNumber"
    />
  </div>
</template>
<script>
import BusLabel from './BusLabel.vue'
export default {
  name: 'BusSignal',
  components: { BusLabel },
  props: {
    signalStatus: { type: Boolean, required: true },
    mobileView: { type: Boolean, required: false },
    busValue: { type: Number, required: true },
    showInvisibleRegisters: { type: Boolean, default: false },
    busName: { type: String, required: true },
    formatNumber: { type: Function, required: true },
  },
};
</script>