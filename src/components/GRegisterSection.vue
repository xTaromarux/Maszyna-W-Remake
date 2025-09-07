<template>
  <div v-if="visible" id="gRegister">
    <SignalButton
      id="wyg"
      :signal="signals.wyg"
      label="wyg"
      :divClassNames="isMobile ? 'pathUpOnRight' : 'pathDownOnRight'"
      spanClassNames="lineRightOnBottom"
      @click="handleClick('wyg')"
    />
    <RegisterComponent
      label="G"
      :model="G"
      @update:model="$emit('update:G', $event)"
      :number-format="numberFormat"
      @update:number-format="$emit('update:numberFormat', $event)"
    />
    <SignalButton
      id="start"
      :signal="signals.start"
      label="start"
      :divClassNames="isMobile ? 'pathDownOnLeft' : 'pathUpOnLeft'"
      spanClassNames="arrowLeftOnBottom"
      @click="handleClick('start')"
    />
  </div>
</template>

<script>
import SignalButton from './SignalButton.vue';
import RegisterComponent from './RegisterComponent.vue';

export default {
  name: 'GRegisterSection',
  props: {
    visible: Boolean,
    G: Number,
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
  emits: ['clickItem', 'update:G', 'update:numberFormat'],
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
