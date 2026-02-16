<template>
  <div class="memorySection">
    <MobileMemoryHeader
      v-if="isMobile"
      :signals="signals"
      @open="openMobileModal"
      @clickItem="handleClick"
      :mobileView="mobileView"
      :busAValue="busAValue"
      :busSValue="busSValue"
      :showInvisibleRegisters="showInvisibleRegisters"
      :formatNumber="formatNumber"
    />

    <teleport to="body">
      <transition name="fade">
        <div v-if="showMobileModal" class="mobile-overlay" @click.self="closeMobileModal">
          <transition name="scale">
            <div class="mobileModalContent" role="dialog" aria-modal="true">
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
                @update:mem="$emit('update:mem', $event)"
                @clickItem="handleClick"
              />
              <button class="closeBtn closeButtonModal" @click="closeMobileModal" :aria-label="$t('memory.closeModal')">&times;</button>
            </div>
          </transition>
        </div>
      </transition>
    </teleport>

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
      :s-format="sFormat"
      :signed-dec="signedDec"
      :word-bits="wordBits"
      @update:a-format="$emit('update:aFormat', $event)"
      @update:s-format="$emit('update:sFormat', $event)"
      @update:A="$emit('update:A', $event)"
      @update:S="$emit('update:S', $event)"
      @update:mem="$emit('update:mem', $event)"
      @clickItem="handleClick"
    />
  </div>
</template>

<script>
import MemoryContent from './MemoryContent.vue';
import MobileMemoryHeader from './MobileMemoryHeader.vue';

export default {
  name: 'MemorySection',
  components: { MemoryContent, MobileMemoryHeader },
  props: {
    A: { type: Number, required: true },
    S: { type: Number, required: true },
    mem: { type: Array, required: true },
    signals: { type: Object, required: true },
    formatNumber: { type: Function, required: true },
    decToCommand: { type: Function, required: true },
    decToArgument: { type: Function, required: true },
    aFormat: { type: String, required: true },
    sFormat: { type: String, required: true },
    mobileView: { type: Boolean, required: true },
    busAValue: { type: Number, required: true },
    busSValue: { type: Number, required: true },
    showInvisibleRegisters: { type: Boolean, default: false },
    signedDec: { type: Boolean, default: false },
    wordBits: { type: Number, default: 8 },
  },
  emits: ['clickItem', 'update:A', 'update:S', 'update:mem', 'update:aFormat', 'update:sFormat'],
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
      window.addEventListener('keydown', this.onKeydown);
    },
    closeMobileModal() {
      this.showMobileModal = false;
      document.body.style.overflow = '';
      window.removeEventListener('keydown', this.onKeydown);
    },
    onKeydown(e) {
      if (e.key === 'Escape') this.closeMobileModal();
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
    window.removeEventListener('keydown', this.onKeydown);
    document.body.style.overflow = '';
  },
};
</script>
