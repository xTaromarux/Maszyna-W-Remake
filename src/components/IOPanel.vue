<template>
    <div class="io-card">
        <h3>{{ $t('ioPanel.title') }}</h3>

        <div class="row">
            <label for="devin">{{ $t('ioPanel.inputLabel') }}</label>
            <input id="devin" ref="inputEl" type="text" maxlength="1" :placeholder="$t('ioPanel.inputPlaceholder')" @input="onInput" />
        </div>

        <div class="row hint">
            <label for="devin" class="hint-label">{{ $t('ioPanel.currentInput') }}</label>
            <span class="hint-value">{{ formatNumber(devIn) }}</span>
        </div>

        <div class="row">
            <label>{{ $t('ioPanel.outputLabel') }}</label>
            <div class="value-box">
                {{ formatNumber(devOut) }} ({{ String.fromCharCode(devOut || 32) }})
            </div>
        </div>

        <div class="row">
            <label>{{ $t('ioPanel.statusLabel') }}</label>
            <div class="status" :class="devReady ? 'ready' : 'busy'">
                {{ devReady ? $t('ioPanel.statusReady') : $t('ioPanel.statusBusy') }}
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
    devIn: { type: Number, required: true },
    devOut: { type: Number, required: true },
    devReady: { type: Number, required: true },
    wordBits: { type: Number, required: true },
    formatNumber: { type: Function, required: true }
})

const emit = defineEmits(['update:devIn', 'update:devReady'])

const mask = bits => (1 << bits) - 1
const inputEl = ref(null)

const onInput = (e) => {
    const v = (e.target.value?.charCodeAt(0) || 0) & mask(props.wordBits)
    emit('update:devIn', v)
    emit('update:devReady', v ? 0 : 1)
    if (inputEl.value) inputEl.value.value = ''
}
</script>

<style scoped>
.io-card {
    width: 100%;
    border: 4px solid #003c7d;
    border-radius: var(--default-border-radius, 0.25rem);
    padding: 14px 16px;
    background: var(--panelBackgroundColor, white);
    margin-bottom: 10px;
}

.io-card h3 {
    margin: 0 0 10px 0;
    font-size: 1.35rem;
    font-weight: 800;
    text-align: start;
}

.row {
    display: grid;
    grid-template-columns: 150px 1fr;
    align-items: center;
    gap: 10px;
    margin: 6px 0;
}

.row.hint {
    grid-template-columns: 150px 1fr;
}

.hint-label {
    color: var(--fontColor);
}

.hint-value {
    font-weight: 700;
}

label {
    text-align: start;
    font-size: .90rem;
    font-weight: 600;
}

input {
    height: 28px;
    padding: 2px 8px;
    width: 100%;
    background-color: var(--backgroundColor);
    border: 1px solid var(--panelOutlineColor);
    border-radius: 4px;
    outline: none;
}

input:focus {
    border-color: #0b74ff;
}

.value-box {
    border: 1px solid var(--panelOutlineColor);
    border-radius: 4px;
    height: 32px;
    background-color: var(--backgroundColor);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: monospace;
}

.status {
    display: inline-block;
    text-align: center;
    width: 120px;
    padding: 4px 10px;
    border-radius: 6px;
    color: #fff;
    font-weight: 800;
}

.status.ready {
    background: var(--primaryColor, #003c7d);
}

.status.busy {
    background: #c33636;
}
</style>
