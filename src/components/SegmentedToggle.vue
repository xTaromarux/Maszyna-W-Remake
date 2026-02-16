<template>
  <div class="segmented" :style="rootStyle">
    <div class="track" role="tablist" :aria-label="ariaLabelResolved">
      <div class="thumb" v-if="activeIndex >= 0" aria-hidden="true"></div>
      <button
        v-for="(opt, i) in options"
        :key="optKey(opt, i)"
        class="seg-btn"
        role="tab"
        :aria-selected="i === activeIndex"
        :tabindex="i === activeIndex ? 0 : -1"
        @click="select(opt)"
        @keydown.left.prevent="focusPrev(i)"
        @keydown.right.prevent="focusNext(i)"
        @keydown.enter.prevent="select(opt)"
        @keydown.space.prevent="select(opt)"
      >
        <slot name="option" :option="opt" :index="i">
          {{ getLabel(opt) }}
        </slot>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  options: { type: Array, required: true },
  modelValue: { default: null },
  ariaLabel: { type: String, default: null },
  valueKey: { type: String, default: 'value' },
  labelKey: { type: String, default: 'label' }
})
const emit = defineEmits(['update:modelValue','change'])

const { t } = useI18n()

const values = computed(() =>
  props.options.map(o => (typeof o === 'object' ? o[props.valueKey] : o))
)

const activeIndex = computed(() => {
  if (props.modelValue == null) return -1
  const idx = values.value.findIndex(x => x === props.modelValue)
  return idx
})

const rootStyle = computed(() => ({
  '--count': String(props.options.length),
  '--idx': String(activeIndex.value)
}))

const ariaLabelResolved = computed(() => props.ariaLabel || t('common.segmentedToggle.aria'))

function select(opt) {
  const val = typeof opt === 'object' ? opt[props.valueKey] : opt
  emit('update:modelValue', val)
  emit('change', val)
}

function getLabel(opt) {
  return typeof opt === 'object' ? opt[props.labelKey] : String(opt)
}
function optKey(opt, i) {
  return typeof opt === 'object' ? opt[props.valueKey] ?? i : opt
}

function focusPrev(i) {
  const next = (i - 1 + props.options.length) % props.options.length
  const btns = [...document.querySelectorAll('.segmented .seg-btn')]
  btns[next]?.focus()
}
function focusNext(i) {
  const next = (i + 1) % props.options.length
  const btns = [...document.querySelectorAll('.segmented .seg-btn')]
  btns[next]?.focus()
}
</script>

<style scoped>
.segmented {
  --count: 2;
  --idx: 0;
  --radius: 0.25rem;
  --dur: 260ms;
  --ease: cubic-bezier(.2,.8,.2,1);
}
.track {
  position: relative;
  display: grid;
  margin-bottom: 10px;
  grid-template-columns: repeat(var(--count), 1fr);
  background: #003c7d;
  padding: 6px;
  border-radius: var(--radius);
  user-select: none;
}
.thumb {
  position: absolute;
  top: 6px;
  bottom: 6px;
  left: 6px;
  width: calc((100% - 12px) / var(--count));
  transform: translateX(calc(var(--idx) * 100%));
  border-radius: 0.1rem;
  background: var(--buttonBackgroundColor); 
  box-shadow: 0 4px 14px rgba(0,0,0,.15);
  transition: transform var(--dur) var(--ease);
  will-change: transform;
  z-index: 0;
  pointer-events: none;
}
.seg-btn {
  position: relative;
  z-index: 1;
  appearance: none;
  border: 0;
  background: transparent;
  padding: 10px 14px;
  font-weight: 600;
  font-size: 14px;
  line-height: 1;
  border-radius: 0.1rem;
  cursor: pointer;
  color: #f3e9ff;
  outline: none;
}
.seg-btn[aria-selected="true"] { color: var(--fontColorSelectedItem); }
.toggleButtonProgram {
  width: 100%;
}
</style>
