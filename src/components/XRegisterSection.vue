<template>
  <div v-if="visible" id="xRegister">
    <SignalButton
      id="wyx"
      :signal="signals.wyx"
      label="wyx"
      divClassNames="pathUpOnRight"
      spanClassNames="arrowRightOnBottom"
      @click="handleClick('wyx')"
    />
    <RegisterComponent
      label="X"
      :model="X"
      @update:model="$emit('update:X', $event)"
      :number-format="numberFormat"
      @update:number-format="$emit('update:numberFormat', $event)"
    />
    <SignalButton
      id="wex"
      :signal="signals.wex"
      label="wex"
      divClassNames="pathDownOnLeft"
      spanClassNames="lineLeftOnBottom"
      @click="handleClick('wex')"
    />
  </div>
</template>

<script>
import SignalButton from './SignalButton.vue';
import RegisterComponent from './RegisterComponent.vue';

export default {
  name: 'XRegisterSection',
  props: {
    visible: Boolean,
    X: Number,
    signals: Object,
    numberFormat: {
      type: String,
      required: true,
    },
  },
  emits: ['clickItem', 'update:X', 'update:numberFormat'],
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
