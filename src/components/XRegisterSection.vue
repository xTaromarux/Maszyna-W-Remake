
<template>
  <div v-if="visible" id="xRegister">
    <SignalButton
      id="wyx"
      :signal="signals.wyx"
      label="wyx"
      divClassNames="pathUpOnRight"
      spanClassNames="arrowRightOnBottom"
      @wyxClick="$emit('wyxClick')"
    />
    <RegisterComponent
      label="X"
      :model="X"
      @update:model="$emit('update:X', $event)"
      :formatNumber="formatNumber"
    />
    <SignalButton
      id="wex"
      :signal="signals.wex"
      label="wex"
      divClassNames="pathDownOnLeft"
      spanClassNames="lineLeftOnBottom"
      @wexClick="$emit('wexClick')"
    />
  </div>
</template>

<script>
import SignalButton from './SignalButton.vue';
import RegisterComponent from './RegisterComponent.vue';

export default {
  name: "XRegisterSection",
  props: {
    visible: Boolean,
    X: Number,
    signals: Object,
    formatNumber: Function
  },
  components: {
    SignalButton,
    RegisterComponent
  }
};
</script>
