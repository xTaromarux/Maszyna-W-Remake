<template>
  <div v-if="visible" id="wsRegister">
    <SignalButton id="iws" :signal="signals.iws" @click="handleClick('iws')" label="iws" spanClassNames="arrowRightOnBottom" />
    <RegisterComponent
      label="WS"
      :model="WS"
      @update:model="$emit('update:WS', $event)"
      :number-format="numberFormat"
      @update:number-format="$emit('update:numberFormat', $event)"
    />
    <SignalButton id="dws" :signal="signals.dws" @click="handleClick('dws')" label="dws" spanClassNames="arrowLeftOnBottom" />
    <SignalButton
      id="wyws"
      :signal="signals.wyws"
      @click="handleClick('wyws')"
      label="wyws"
      class="long pathUpOnRight"
      spanClassNames="lineRightOnBottom"
    />
    <SignalButton
      id="wews"
      :signal="signals.wews"
      @click="handleClick('wews')"
      label="wews"
      class="impulse pathDownOnLeft"
      spanClassNames="arrowLeftOnBottom"
    />
    <div  id="busS" v-if="isMobile">
      <BusLabel
        busName="S"
        :busValue="BusS"
        :showInvisibleRegisters="extras.showInvisibleRegisters"
        :formatNumber="formatNumber"
      />
    </div>
  </div>
</template>
<script>
import SignalButton from './SignalButton.vue';
import RegisterComponent from './RegisterComponent.vue';
import BusLabel from '@/components/BusLabel.vue';
export default {
  name: 'WSRegisterSection',
  components: {
    SignalButton,
    RegisterComponent,
    BusLabel
  },
  props: {
    signals: {
      type: Object,
      required: true,
    },
    WS: {
      type: Number,
      required: true,
    },
    BusS: {
      type: Number,
      required: false
    },
    extras: {
      type: Object,
      required: true,
    },
    formatNumber: {
      type: Function,
      required: true,
    },
    numberFormat: {
      type: String,
      required: true,
    },
    visible: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['clickItem', 'update:WS', 'update:numberFormat'],
  methods: {
    handleClick(id) {
      this.$emit('clickItem', id);
    },
  },
  data() {
    return {
      isMobile: window.innerWidth <= 768
    }
  },
};
</script>
<style scoped></style>