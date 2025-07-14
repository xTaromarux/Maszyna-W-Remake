<template>
  <div id="memorySection">
    <div v-if="isMobile" class="mobile-memory-header">
      <button @click="openMobileModal" class="mobile-memory-button">
        <ListLinesIcon />
        <span>Pamięć</span>
      </button>
    </div>

    <!-- Teleport for mobile view -->
    <teleport to="body">
      <div v-if="showMobileModal" class="mobile-memory-modal" @click.self="closeMobileModal">
        <div class="mobile-memory-content">
          <MemoryContent
            :A="A"
            :S="S"
            :mem="mem"
            :signals="signals"
            :formatNumber="formatNumber"
            :decToCommand="decToCommand"
            :decToArgument="decToArgument"
            :a-format="aFormat"
            @update:a-format="$emit('update:aFormat', $event)"
            :s-format="sFormat"
            @update:s-format="$emit('update:sFormat', $event)"
            @update:A="$emit('update:A', $event)"
            @update:S="$emit('update:S', $event)"
            @clickItem="handleClick"
          />
          <button @click="closeMobileModal" class="close-modal-button">&times;</button>
        </div>
      </div>
    </teleport>

    <!-- Desktop view -->
    <MemoryContent
      v-if="!isMobile"
      :A="A"
      :S="S"
      :mem="mem"
      :signals="signals"
      :formatNumber="formatNumber"
      :decToCommand="decToCommand"
      :decToArgument="decToArgument"
      :a-format="aFormat"
      @update:a-format="$emit('update:aFormat', $event)"
      :s-format="sFormat"
      @update:s-format="$emit('update:sFormat', $event)"
      @update:A="$emit('update:A', $event)"
      @update:S="$emit('update:S', $event)"
      @clickItem="handleClick"
    />
  </div>
</template>

<script>
import MemoryContent from './MemoryContent.vue';
import SignalButton from './SignalButton.vue';
import ListLinesIcon from '@/assets/svg/ListLinesIcon.vue';

export default {
  name: 'MemorySection',
  components: {
    MemoryContent,
    SignalButton,
    ListLinesIcon,
  },
  props: {
    A: {
      type: Number,
      required: true,
    },
    S: {
      type: Number,
      required: true,
    },
    mem: {
      type: Array,
      required: true,
    },
    signals: {
      type: Object,
      required: true,
    },
    formatNumber: {
      type: Function,
      required: true,
    },
    decToCommand: {
      type: Function,
      required: true,
    },
    decToArgument: {
      type: Function,
      required: true,
    },
    aFormat: {
      type: String,
      required: true,
    },
    sFormat: {
      type: String,
      required: true,
    },
  },
  emits: ['clickItem', 'update:A', 'update:S', 'update:aFormat', 'update:sFormat'],
  data() {
    return {
      windowWidth: window.innerWidth,
      showMobileModal: false,
    };
  },
  computed: {
    isMobile() {
      return this.windowWidth < 1080;
    },
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
    },
  },
  mounted() {
    window.addEventListener('resize', this.updateWidth);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.updateWidth);
    document.body.style.overflow = '';
  },
};
</script>
