<template>
  <div v-if="visible" id="yRegister">
    <SignalButton
      id="wyy"
      :signal="signals.wyy"
      label="wyy"
      divClassNames="pathDownOnRight"
      spanClassNames="arrowRightOnBottom"
      @click="handleClick('wyy')"
    />
    <RegisterComponent
      label="Y"
      :model="Y"
      @update:model="$emit('update:Y', $event)"
      :number-format="numberFormat"
      @update:number-format="$emit('update:numberFormat', $event)"
    />
    <SignalButton
      id="wey"
      :signal="signals.wey"
      label="wey"
      divClassNames="pathUpOnLeft"
      spanClassNames="lineLeftOnBottom"
      @click="handleClick('wey')"
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
    Y: Number,
    signals: Object,
    numberFormat: {
      type: String,
      required: true,
    },
  },
  emits: ['clickItem', 'update:Y', 'update:numberFormat'],
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