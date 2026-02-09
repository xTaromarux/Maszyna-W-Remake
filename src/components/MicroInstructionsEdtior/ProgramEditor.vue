<template>
  <div class="programEditor">
    <SegmentedToggle
      :options="[
        { label: $t('programEditor.modeToggle.manual'), value: true },
        { label: $t('programEditor.modeToggle.program'), value: false },
      ]"
      :model-value="manualMode"
      @update:model-value="$emit('setManualMode', $event)"
      class="toggleButtonProgram"
    />

    <IOPanel
      v-if="showIo"
      :dev-in="devIn"
      :dev-out="devOut"
      :dev-ready="devReady"
      :word-bits="wordBits"
      :format-number="formatNumber"
      @update:devIn="$emit('update:devIn', $event)"
      @update:devReady="$emit('update:devReady', $event)"
      class="mb-2"
    />

    <div class="chooseProgram">
      <slot name="chooseProgram"></slot>
    </div>

    <div v-if="manualMode" class="manualModeInstruction">
      <p>{{ $t('programEditor.manualInstruction') }}</p>
    </div>

    <CodeMirrorEditor
      v-else-if="!codeCompiled"
      v-model="codeLocal"
      language="maszynaW"
      theme="mwTheme"
      :maxHeight="showIo ? '18.3rem' : '32rem'"
    />

    <div v-else class="compiledCode" ref="compiledEl" :class="{ 'bp-disabled': !breakpointsEnabled }">
      <div v-if="!breakpointsEnabled" class="bp-disabled-banner">{{ $t('programEditor.breakpoints.disabled') }}</div>
      <span
        v-for="(line, index) in compiledCode"
        :key="index"
        class="flexRow"
        :class="{
          active: activeLine === index,
          'bp-line': breakpoints?.has(index),
        }"
        :data-row="index"
      >
        <!-- Gutter z kropkÄ… -->
        <button
          class="bp-dot gutter"
          :class="{ 'bp-dot--active': breakpoints?.has(index) }"
          :disabled="!breakpointsEnabled"
          @click.stop="emit('toggle-breakpoint', index)"
          :title="!breakpointsEnabled ? $t('programEditor.breakpoints.disabled') : breakpoints?.has(index) ? $t('programEditor.breakpoints.remove') : $t('programEditor.breakpoints.add')"
          aria-label="Toggle breakpoint"
        />
        <!-- Numer linii -->
        <span class="lineNo">{{ index }}</span>
        <span>:</span>
        <span class="codeLine">{{ line }}</span>
      </span>
    </div>

    <div class="nextLine" v-if="manualMode">
      <p class="nextLineTitle">{{ $t('programEditor.nextLineTitle') }}</p>
      <div class="flexRow">
        <div v-for="cmd in [...nextLine]" :key="cmd">
          <span>{{ cmd }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
import SegmentedToggle from '@/components/SegmentedToggle.vue';
import CodeMirrorEditor from '@/components/CodeMirrorEditor.vue';
import IOPanel from './IOPanel.vue';

const props = defineProps({
  manualMode: { type: Boolean, required: true },
  codeCompiled: { type: Boolean, required: true },
  code: { type: String, required: true },
  compiledCode: { type: Array, required: true },
  activeLine: { type: Number, required: true },
  nextLine: { type: Object, required: true },
  breakpoints: { type: Object, default: () => new Set() },
  breakpointsEnabled: { type: Boolean, default: true },
  showIo: { type: Boolean, default: false },
  devIn: { type: Number, default: 0 },
  devOut: { type: Number, default: 0 },
  devReady: { type: Number, default: 1 },
  wordBits: { type: Number, required: true },
  formatNumber: { type: Function, required: true },
});

const emit = defineEmits(['update:code', 'setManualMode', 'update:devIn', 'update:devReady', 'toggle-breakpoint']);

const codeLocal = ref(props.code);
const compiledEl = ref(null);

watch(codeLocal, (v) => emit('update:code', v));
watch(
  () => props.code,
  (v) => {
    if (v !== codeLocal.value) codeLocal.value = v;
  }
);

watch(
  () => props.activeLine,
  async (row) => {
    await nextTick();
    const rowEl = compiledEl.value?.querySelector(`[data-row="${row}"]`);
    if (rowEl?.scrollIntoView) rowEl.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }
);
</script>

<style scoped>
.toggleButtonProgram {
  width: 100%;
}

.programEditor {
  display: flex;
  flex-direction: column;
  height: 100%;
  height: 35.8rem;
  max-height: 35.8rem;
  min-height: 35.8rem;
}

@media (min-width: 675px) and (max-width: 1195px) {
  .programEditor {
    width: 40rem;
  }
}

@media (max-width: 675px) {
  .programEditor {
    width: 100%;
  }
}

.flexRow {
  max-width: 230px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.flexRow span {
  opacity: 1;
  color: var(--fontColor, black);
  font-style: italic;
  font-weight: bold;
}

.compiledCode {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 0.125rem;
  padding: 0.5rem;
  flex-grow: 1;
  margin-top: 10px;
  overflow-y: auto;
  border: 4px solid #003c7d;
  border-radius: var(--default-border-radius, 0.25rem);
  background-color: var(--panelBackgroundColor, white);
  font-family: monospace;
  font-size: 0.9rem;
}

.executed-info {
  text-align: center;
  padding-bottom: 0.5rem;
  margin-bottom: 0.5rem;
  font-style: italic;
  color: #888;
  font-size: 0.8rem;
  border-bottom: 1px solid var(--panelOutlineColor, black);
}

.compiledCode .flexRow {
  max-width: none;
  flex-wrap: nowrap;
  gap: 0.5rem;
  padding: 0.25rem;
  border-radius: 3px;
  transition: background-color 0.2s ease;
  align-items: center;
  display: flex;
  flex-direction: row;
}

.compiledCode .flexRow > span:first-child {
  min-width: 3rem;
  text-align: right;
  font-weight: bold;
  color: #666;
  flex-shrink: 0;
}

.compiledCode .flexRow > span:nth-child(2) {
  flex-shrink: 0;
  color: #666;
}

.compiledCode .flexRow:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.compiledCode .active {
  color: var(--signal-active);
  background-color: rgba(0, 170, 255, 0.1);
  font-weight: bold;
}

.compiledCode .active > span:first-child {
  color: var(--signal-active);
}

.codeLine {
  flex-grow: 1;
  text-align: left;
  white-space: pre-wrap;
  word-break: break-word;
  padding-left: 0.5rem;
  line-height: 1.4;
}

.nextLine {
  flex-grow: 1;
  width: 100%;
  min-height: 200px;
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow-y: auto;
  padding: 0.5rem;
  border: 4px solid #003c7d;
  border-radius: var(--default-border-radius, 0.25rem);
  background-color: var(--panelBackgroundColor, white);
}

.nextLine .nextLineTitle {
  display: flex;
  opacity: 0.8;
  color: var(--fontColor, black);
  font-style: italic;
  font-weight: bold;
  flex-direction: row;
  gap: 0.5rem;
}

.manualModeInstruction {
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: center;
  padding: 1rem;
  border-radius: var(--default-border-radius, 0.25rem);
  border: 4px solid #003c7d;
  background-color: var(--panelBackgroundColor, white);
  color: var(--fontColor, black);
  font-style: italic;
  font-weight: bold;
  text-align: center;
}

.manualModeInstruction p {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.8;
}

/* kolumna z numerem linii */
.compiledCode .flexRow > .lineNo {
  text-align: right;
  font-weight: 600;
  color: #8a8a8a;
  /* delikatniejszy */
}

/* dwukropek */
.compiledCode .flexRow > span:nth-child(3) {
  color: #8a8a8a;
}

/* aktywna linia (bez animacji) */
.compiledCode .active {
  color: var(--signal-active);
  transition: none !important;
  background-color: rgba(0, 170, 255, 0.1);
  font-weight: bold;
}

/* kod */
.codeLine {
  padding-left: 0.25rem;
  line-height: 1.35;
}

/* --- GUTTER DOT (maĹ‚a, intellij-owa kropka) --- */
.gutter {
  /* zajmuje caĹ‚Ä… pierwszÄ… kolumnÄ™ gridu */
  justify-self: center;
}

/* linia z breakpointem â€“ bardzo delikatne tĹ‚o */
.bp-line {
  transition: none !important;
  background-color: rgba(209, 17, 17, 0.1);
}

.bp-line.active {
  background-color: rgba(209, 17, 17, 0.16);
}

/* kropka â€“ maĹ‚a, bez animacji */
.bp-dot {
  width: 8px;
  height: 8px;
  min-width: 8px;
  min-height: 8px;
  border-radius: 50%;
  border: 1.5px solid #d11;
  background: transparent;
  cursor: pointer;
  padding: 0;
  outline: none;
  transition: none !important;
}

.bp-dot--active {
  background: #d11;
  border-color: #d11;
}

.bp-dot:hover {
  border-color: #e22;
}

/* --- STYL, GDY BREAKPOINTY SÄ„ WYĹÄ„CZONE --- */
.bp-disabled {
  position: relative;
}

/* cienki banner u gĂłry listy kodu */
.bp-disabled-banner {
  position: sticky;
  top: -0.5rem;
  /* lekko nad listÄ… */
  display: block;
  margin: -0.25rem -0.5rem 0;
  /* wyrĂłwnanie do ramki compiledCode */
  padding: 0.15rem 0.5rem;
  font-size: 0.72rem;
  letter-spacing: 0.04em;
  color: #555;
  background: linear-gradient(0deg, rgba(0, 0, 0, 0) 0%, rgba(120, 120, 120, 0.09) 100%);
  border-bottom: 1px dashed rgba(120, 120, 120, 0.5);
  text-align: center;
}

/* kropki: szare, puste, nieklikalne */
.bp-disabled .bp-dot {
  border-color: #8b8b8b !important;
  background: transparent !important;
  color: #8b8b8b;
  opacity: 0.6;
  filter: grayscale(1);
  cursor: not-allowed;
}

.bp-disabled .bp-dot.bp-dot--active {
  background: transparent !important;
  /* nie wypeĹ‚niaj, nawet jeĹ›li byĹ‚ postawiony */
  border-color: #8b8b8b !important;
}

/* linie z BP: inne (chĹ‚odniejsze) tĹ‚o, ale bardzo delikatne */
.bp-disabled .bp-line {
  background-color: rgba(120, 120, 120, 0.08) !important;
  opacity: 0.95;
}

/* numer i dwukropek lekko bledsze w trybie OFF */
.bp-disabled .lineNo,
.bp-disabled .flexRow > span:nth-child(3) {
  color: #9a9a9a !important;
}
</style>

