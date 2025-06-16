<template>
  <div class="memory-wrapper">

    <!-- ======= DESKTOP ======= -->
    <MemoryContent
      v-if="!isMobile"
      :A="A"
      :S="S"
      :mem="mem"
      :signals="signals"
      :formatNumber="formatNumber"
      :decToCommand="decToCommand"
      :decToArgument="decToArgument"
      @clickItem="$emit('clickItem', $event)"
      @update:A="$emit('update:A', $event)"
      @update:S="$emit('update:S', $event)"
    />

    <!-- ======= MOBILE ======= -->
    <div v-else class="mobile-button-wrapper">

        <SignalButton
            id="wea"
            :signal="signals.wea"
            label="wea"
            divClassNames="pathDownOnRight"
            spanClassNames="arrowRightOnBottom"
            @click="handleClick('wea')"
            />
        <div class="mobile-toggle" id="pao" @click="openMobileModal">
            PaO
        </div>
        <div id="operations">
            <SignalButton
                id="czyt"
                :signal="signals.czyt"
                label="czyt"
                spanClassNames="lineLeftOnBottom"
                @click="handleClick('czyt')"
            />
            <SignalButton
                id="pisz"
                :signal="signals.pisz"
                label="pisz"
                spanClassNames="lineLeftOnBottom"
                @click="handleClick('pisz')"
            />
        </div>
        <div class="signals">
            <SignalButton
                id="wes"
                :signal="signals.wes"
                label="wes"
                divClassNames="pathUpOnRight fullSizeArrow"
                spanClassNames="arrowRightOnBottom"
                @click="handleClick('wes')"
            />
            <SignalButton
                id="wys"
                :signal="signals.wys"
                label="wys"
                divClassNames="pathDownOnLeft fullSizeArrow"
                spanClassNames="lineLeftOnBottom"
                @click="handleClick('wys')"
            />
        </div>
      

    <!-- ======= MODAL ======= -->
      <div
        v-if="showMobileModal"
        class="mobile-overlay"
        @click.self="closeMobileModal"
      >
        <div class="mobile-modal-content">
          <MemoryContent
            :A="A"
            :S="S"
            :mem="mem"
            :signals="signals"
            :formatNumber="formatNumber"
            :decToCommand="decToCommand"
            :decToArgument="decToArgument"
            @clickItem="$emit('clickItem', $event)"
            @update:A="$emit('update:A', $event)"
            @update:S="$emit('update:S', $event)"
          />
          <button class="close-button" @click="closeMobileModal">×</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import MemoryContent from './MemoryContent.vue';
import SignalButton from './SignalButton.vue';

export default {
  name: "MemorySection",
  components: {
    MemoryContent,
    SignalButton
  },
  props: {
    A: {
      type: Number,
      required: true
    },
    S: {
      type: Number,
      required: true
    },
    mem: {
      type: Array,
      required: true
    },
    signals: {
      type: Object,
      required: true
    },
    formatNumber: {
      type: Function,
      required: true
    },
    decToCommand: {
      type: Function,
      required: true
    },
    decToArgument: {
      type: Function,
      required: true
    }
  },
  emits: ['clickItem', 'update:A', 'update:S'],
  data() {
    return {
      windowWidth: window.innerWidth,
      showMobileModal: false
    };
  },
  computed: {
    isMobile() {
      return this.windowWidth < 1080;
    }
  },
  methods: {
    updateWidth() {
      this.windowWidth = window.innerWidth;
    },
    openMobileModal() {
      this.showMobileModal = true;
      document.body.style.overflow = 'hidden';
    },
    closeMobileModal() {
      this.showMobileModal = false;
      document.body.style.overflow = '';
    },
    handleClick(id) {
      this.$emit('clickItem', id);
    }
  },
  mounted() {
    window.addEventListener('resize', this.updateWidth);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.updateWidth);
    document.body.style.overflow = '';
  }
};
</script>
