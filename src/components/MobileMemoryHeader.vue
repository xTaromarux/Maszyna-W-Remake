<template>
  <div class="mobile-memory-header" >
    <div class="memory-signal-in">
        <SignalButton
        id="wea"
        :signal="signals.wea"
        label="wea"
        divClassNames="pathDownOnRight"
        spanClassNames="arrowRightOnBottom"
        @click="emitClick('wea')"
        style="grid-area: wea"
        />
    </div>
    <div class="busLabel busLabelUp">
      <BusLabel
        busName="A"
        :busValue="busAValue"
        :showInvisibleRegisters="showInvisibleRegisters"
        :mobileView="!mobileView"
        :formatNumber="formatNumber"
      />
    </div>
    <button
      @click="$emit('open')"
      class="mobile-memory-button"
      style="grid-area: memory"
    >
      <ListLinesIcon />
      <span>Pamięć</span>
    </button>

    <div class="memory-signals-in" style="grid-area: memory-signals-in">
        <SignalButton
        id="czyt"
        :signal="signals.czyt"
        label="czyt"
        spanClassNames="lineLeftOnBottom"
        @click="emitClick('czyt')"
        />

        <SignalButton
        id="pisz"
        :signal="signals.pisz"
        label="pisz"
        spanClassNames="lineLeftOnBottom"
        @click="emitClick('pisz')"
        />
    </div>
    <div class="memory-signals-out" style="grid-area: memory-signals-out">
        <SignalButton
        id="wes"
        :signal="signals.wes"
        label="wes"
        divClassNames="pathUpOnRight"
        spanClassNames="arrowRightOnBottom"
        @click="emitClick('wes')"
        style="grid-area: wes"
        />

        <SignalButton
        id="wys"
        :signal="signals.wys"
        label="wys"
        divClassNames="pathDownOnLeft"
        spanClassNames="lineLeftOnBottom"
        @click="emitClick('wys')"
        style="grid-area: wys"
        />
    </div> 
    <div class="busLabel busLabelDown">
      <BusLabel
        busName="S"
        :busValue="busSValue"
        :showInvisibleRegisters="showInvisibleRegisters"
        :mobileView="!mobileView"
        :formatNumber="formatNumber"
      />
    </div>
  </div>
</template>

<script>
import SignalButton from './SignalButton.vue';
import ListLinesIcon from '@/assets/svg/ListLinesIcon.vue';
import BusLabel from './BusLabel.vue'
export default {
  name: 'MobileMemoryHeader',
  components: { SignalButton, ListLinesIcon, BusLabel },
  props: {
    signals: { type: Object, required: true },
    mobileView: { type: Boolean, required: true },
    busAValue: { type: Number, required: true },
    busSValue: { type: Number, required: true },
    showInvisibleRegisters: { type: Boolean, default: false },
    formatNumber: { type: Function, required: true },
  },
  emits: ['open', 'clickItem'],
  methods: {
    emitClick(id) {
      this.$emit('clickItem', id);
    },
  },
};
</script>,

<style scoped>
  .busLabel{
    display: flex;
    flex-direction: row;
    justify-content: center;
    position: relative;
    gap: 5px;
  }

  .busLabelUp{
    padding-top: 4px;
    align-items: top;
  }

  .busLabelDown{
    padding-bottom: 4px;
    align-items: end;
  }
</style>
