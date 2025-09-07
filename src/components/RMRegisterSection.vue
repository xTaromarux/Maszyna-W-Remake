<template>
  <div v-if="visible" id="rmRegister">
    <SignalButton
      id="wyrm"
      :signal="signals.wyrm"
      label="wyrm"
      divClassNames="pathDownOnRight"
      spanClassNames="lineRightOnBottom"
      @click="handleClick('wyrm')"
    />
    <RegisterComponent
      label="RM"
      :model="RM"
      @update:model="$emit('update:RM', $event)"
      :number-format="numberFormat"
      @update:number-format="$emit('update:numberFormat', $event)"
    />
    <SignalButton
      id="werm"
      :signal="signals.werm"
      label="werm"
      divClassNames="pathUpOnLeft"
      spanClassNames="arrowLeftOnBottom"
      @click="handleClick('werm')"
    />
  </div>
</template>

<script>
import SignalButton from './SignalButton.vue';
import RegisterComponent from './RegisterComponent.vue';

export default {
  name: 'RMRegisterSection',
  props: {
    visible: Boolean,
    RM: Number,
    signals: Object,
    numberFormat: {
      type: String,
      required: true,
    },
  },
  emits: ['clickItem', 'update:RM', 'update:numberFormat'],
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
