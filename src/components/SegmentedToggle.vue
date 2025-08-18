<template>
  <div class="segmented" :style="rootStyle">
    <div class="track" role="tablist" :aria-label="ariaLabel">
      <div class="thumb" aria-hidden="true"></div>
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

const props = defineProps({
  options: { type: Array, required: true },
  modelValue: { default: null },
  ariaLabel: { type: String, default: 'Segmented toggle' },
  valueKey: { type: String, default: 'value' },
  labelKey: { type: String, default: 'label' }
})
const emit = defineEmits(['update:modelValue','change'])

const values = computed(() =>
  props.options.map(o => (typeof o === 'object' ? o[props.valueKey] : o))
)

const activeIndex = computed(() => {
  const v = props.modelValue ?? values.value[0]
  const idx = values.value.findIndex(x => x === v)
  return idx < 0 ? 0 : idx
})

const rootStyle = computed(() => ({
  '--count': String(props.options.length),
  '--idx': String(activeIndex.value)
}))

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
  --radius: 999px;
  --dur: 260ms;
  --ease: cubic-bezier(.2,.8,.2,1);
}
.track {
  position: relative;
  display: grid;
  grid-template-columns: repeat(var(--count), 1fr);
  background: linear-gradient(90deg,#8a2be2,#7a2ef8,#6f2dfd);
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
  border-radius: var(--radius);
  background: #fff;
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
  border-radius: var(--radius);
  cursor: pointer;
  color: #f3e9ff;
  outline: none;
}
.seg-btn[aria-selected="true"] { color: #7a2ef8; }
</style>
