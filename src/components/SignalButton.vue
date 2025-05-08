<template>
    <div
      @click="handleClick"
      :id="id"
      :class="['signal', 'impulse', classNames, { active: signal }]">
      <span>{{ label }}</span>
    </div>
  </template>
  
  <script>
  export default {
    name: "SignalButton",
    props: {
      id: {
        type: String,
        required: true
      },
      signal: {
        type: Boolean,
        required: true
      },
      label: {
        type: String,
        required: true
      },
      classNames: {
        type: String,
        default: ''
      }
    },
    methods: {
      handleClick() {
        this.$emit(`${this.id}Click`);
      }
    }
  };
  </script>
  
  <style scoped>
  /* Styles for SignalButton component */
  </style>
  