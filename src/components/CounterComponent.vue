<template>
  <div id="counter">
    <!-- Signal Button Component -->
    <SignalButton id="il" :signal="signals.il" @click="handleClick('il')" label="il" spanClassNames="arrowRightOnBottom" />

    <RegisterComponent
      label="L"
      :model="programCounter"
      @update:model="$emit('update:programCounter', $event)"
      :number-format="numberFormat"
      @update:number-format="$emit('update:numberFormat', $event)"
    />

    <SignalButton id="dl" v-if="extras.dl" :signal="signals.dl" @click="handleClick('dl')" label="dl" spanClassNames="arrowLeftOnBottom" />

    <SignalButton
      id="wyl"
      :signal="signals.wyl"
      @click="handleClick('wyl')"
      label="wyl"
      class="long pathDownOnLeft"
      spanClassNames="arrowLeftOnBottom"
    />
    <div 
      class="wylsSignalsConteiner"
      :class="extras?.stack?.wylsSignal ? 'wylsSignalsConteinerContent' : 'wylsSignalsConteinerContentEnd'">
      <div v-if="extras?.stack?.wylsSignal" class="wylsSignalsExt">
      </div>
      <SignalButton
        id="wel"
        :signal="signals.wel"
        @click="handleClick('wel')"
        label="wel"
        class="impulse pathUpOnRight"
        spanClassNames="arrowRightOnBottom"
      />
    </div>
  </div>
</template>

<script>
import SignalButton from './SignalButton.vue';
import RegisterComponent from './RegisterComponent.vue';

export default {
  name: 'CounterComponent',
  components: {
    SignalButton,
    RegisterComponent,
  },
  props: {
    signals: {
      type: Object,
      required: true,
    },
    programCounter: {
      type: Number,
      required: true,
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
  },
  emits: ['clickItem', 'update:programCounter', 'update:numberFormat'],
  methods: {
    handleClick(id) {
      this.$emit('clickItem', id);
    },
  },
};
</script>

<style scoped></style>
