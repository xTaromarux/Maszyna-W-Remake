<template>
  <div v-if="visible" id="rpRegister">
    <div style="height: 33px;">
      </div>
    <RegisterComponent
      label="RP"
      :model="RP"
      @update:model="$emit('update:RP', $event)"
      :number-format="numberFormat"
      @update:number-format="$emit('update:numberFormat', $event)"
    />
  </div>
</template>
<script>
import SignalButton from './SignalButton.vue';
import RegisterComponent from './RegisterComponent.vue';
export default {
  name: 'YRegisterSection',
  props: {
    visible: Boolean,
    RP: Number,
    signals: Object,
    numberFormat: {
      type: String,
      required: true,
    },
  },
  emits: ['clickItem', 'update:RP', 'update:numberFormat'],
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