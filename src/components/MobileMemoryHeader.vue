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
  </div>
</template>

<script>
import SignalButton from './SignalButton.vue';
import ListLinesIcon from '@/assets/svg/ListLinesIcon.vue';

export default {
  name: 'MobileMemoryHeader',
  components: { SignalButton, ListLinesIcon },
  props: {
    signals: { type: Object, required: true },
  },
  emits: ['open', 'clickItem'],
  methods: {
    emitClick(id) {
      this.$emit('clickItem', id);
    },
  },
};
</script>
