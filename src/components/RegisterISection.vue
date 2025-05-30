<template>
  <div id="iRegister">
    <SignalButton id="wyad" :signal="signals.wyad" label="wyad" divClassNames="long pathUpOnRight"
      spanClassNames="arrowRightOnBottom" @click="handleClick('wyad')" />
    <RegisterComponent label="I" :model="I" @update:model="$emit('update:I', $event)" :formatNumber="formatNumber" />
    <SignalButton id="wei" :signal="signals.wei" label="wei" divClassNames="impulse pathUpOnLeft"
      spanClassNames="arrowLeftOnBottom" @click="handleClick('wei')" />
  </div>
</template>

<script>
import SignalButton from './SignalButton.vue';
import RegisterComponent from './RegisterComponent.vue';

export default {
  name: "RegisterISection",
  props: {
    I: Number,
    signals: Object,
    formatNumber: Function,
  },
  components: {
    SignalButton,
    RegisterComponent,
  },
  methods: {
    handleClick(id) {
      this.$emit('clickItem', id);
    }
  }
};
</script>
