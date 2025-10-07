<template>
  <span v-if="showInvisibleRegisters && !mobileView" style="margin-right: 5px;">
    {{ busName }} : {{ formatNumber(busValue) }}
  </span>
  <span v-if="!mobileView">
    {{ busName.toLowerCase() }}
  </span>
</template>
<script>
export default {
  name: 'BusLabel',
  props: {
    busName: { type: String, required: true },
    busValue: { type: Number, required: true },
    showInvisibleRegisters: { type: Boolean, default: false },
    mobileView: { type: Boolean, required: false },
    formatNumber: { type: Function, required: true },
  },
};
</script>