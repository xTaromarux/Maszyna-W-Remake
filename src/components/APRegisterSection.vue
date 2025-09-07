<template>
  <div v-if="visible" id="apRegister">
    <SignalButton
      id="wyap"
      :signal="signals.wyap"
      label="wyap"
      divClassNames="pathDownOnRight"
      spanClassNames="lineRightOnBottom"
      @click="handleClick('wyap')"
    />
    <RegisterComponent
      label="AP"
      :model="AP"
      @update:model="$emit('update:AP', $event)"
      :number-format="numberFormat"
      @update:number-format="$emit('update:numberFormat', $event)"
    />
  </div>
</template>

<script>
import SignalButton from './SignalButton.vue';
import RegisterComponent from './RegisterComponent.vue';

export default {
  name: 'APRegisterSection',
  props: {
    visible: Boolean,
    AP: Number,
    signals: Object,
    numberFormat: {
      type: String,
      required: true,
    },
  },
  emits: ['clickItem', 'update:AP', 'update:numberFormat'],
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
