<template>
    <div
      :id="id"
      :class="['signal', 'impulse', divClassNames, { active: signal }]">
      <span :class="[spanClassNames]">{{ label }}</span>
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
      divClassNames: {
        type: String,
        default: ''
      },
      spanClassNames: {
        type: String,
        default: ''
      }
    },
  };
  </script>