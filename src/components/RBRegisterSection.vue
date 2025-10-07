<template>
  <div v-if="visible" id="rbRegister">
    <SignalButton
      id="wyrb"
      :signal="signals.wyrb"
      label="wyrb"
      :divClassNames="isMobile ? 'pathDownOnRight' : 'pathUpOnRight'"
      spanClassNames="lineRightOnBottom"
      @click="handleClick('wyrb')"
    />
    <RegisterComponent
      label="RB"
      :model="RB"
      @update:model="$emit('update:RB', $event)"
      :number-format="numberFormat"
      @update:number-format="$emit('update:numberFormat', $event)"
    />
    <SignalButton
      id="werb"
      :signal="signals.werb"
      label="werb"
      :divClassNames="isMobile ? 'pathUpOnLeft' : 'pathDownOnLeft'"
      spanClassNames="arrowLeftOnBottom"
      @click="handleClick('werb')"
    />
  </div>
</template>
<script>
import SignalButton from './SignalButton.vue';
import RegisterComponent from './RegisterComponent.vue';
export default {
  name: 'RBRegisterSection',
  props: {
    visible: Boolean,
    RB: Number,
    signals: Object,
    numberFormat: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      isMobile: window.innerWidth <= 768
    }
  },
  emits: ['clickItem', 'update:RB', 'update:numberFormat'],
  components: {
    SignalButton,
    RegisterComponent,
  },
  methods: {
    handleClick(id) {
      this.$emit('clickItem', id);
    },
  },
};
</script>