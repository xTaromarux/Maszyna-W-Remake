<template>
    <div class="cp-root" @dragstart.prevent>
        <div class="cp-wheel-wrap" :style="{ width: size + 'px', height: size + 'px' }">
            <canvas ref="wheel" class="cp-wheel" :width="size * scale" :height="size * scale"
                :style="{ width: size + 'px', height: size + 'px' }"></canvas>
            <div class="cp-indicator" :style="{ left: indicator.x + 'px', top: indicator.y + 'px', background: hex }">
            </div>
            <div ref="hit" class="cp-hitbox" @pointerdown="startPick" @pointermove="movePick" @pointerup="endPick"
                @pointercancel="endPick"></div>
        </div>
        <div class="cp-section">
            <div class="cp-label">Jasność koloru</div>
            <div class="cp-bar" :style="{ background: `linear-gradient(90deg, #000, ${hexPure})` }"></div>
            <input class="cp-range" type="range" min="0" max="1" step="0.001" v-model.number="hsv.v"
                @input="updateFromHSV" />
            <div class="cp-mini">{{ Math.round(hsv.v * 100) }}%</div>
        </div>
        <div class="cp-section">
            <div class="cp-label">Moc LED</div>
            <div class="cp-bar cp-bar-grey"></div>
            <input class="cp-range" type="range" min="0" max="1" step="0.001" :value="brightnessLocal"
                @input="onPowerInput($event)" />
            <div class="cp-mini">{{ Math.round(brightnessLocal * 100) }}%</div>
        </div>
        <div class="cp-swatches">
            <button v-for="c in swatches" :key="c" class="cp-swatch" :style="{ background: c }"
                @click="applyHex(c)"></button>
        </div>
        <div class="cp-readout">
            <div class="cp-current" :style="{ background: hex }"></div>
            <div class="cp-text">
                <div class="cp-line">{{ hex }}</div>
                <div class="cp-line">rgb({{ rgb.r }}, {{ rgb.g }}, {{ rgb.b }})</div>
                <div class="cp-line">
                    hsv({{ hsv.h.toFixed(0) }}, {{ Math.round(hsv.s * 100) }}%, {{ Math.round(hsv.v * 100) }}%)
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, reactive, watch, onMounted, computed } from 'vue'
const props = defineProps({
    modelValue: { type: String, default: '#ff00ff' },
    size: { type: Number, default: 240 },
    brightness: { type: Number, default: 1 }
})
const emit = defineEmits(['update:modelValue', 'update:brightness', 'change'])
const wheel = ref(null)
const hit = ref(null)
const size = props.size
const scale = window.devicePixelRatio || 1
const hsv = reactive({ h: 300, s: 0.5, v: 1 })
const rgb = reactive({ r: 255, g: 0, b: 255 })
const hex = computed(() => rgbToHex(rgb))
const hexPure = computed(() => rgbToHex(hsvToRgb(hsv.h, hsv.s, 1)))
const indicator = reactive({ x: size / 2, y: size / 2 })
let picking = false
let rafId = 0
let lastEvent = null
const swatches = [
    '#ffffff', '#000000', '#ff0000', '#ffa500', '#ffff00', '#00ff00', '#00ffff', '#0000ff',
    '#ff00ff', '#c0c0c0', '#808080', '#8b4513', '#ff69b4', '#7fff00', '#40e0d0', '#8a2be2'
]
const brightnessLocal = ref(clamp01(props.brightness))
watch(() => props.brightness, v => { brightnessLocal.value = clamp01(v) })
onMounted(() => {
    drawWheel()
    applyHex(isValidHex(props.modelValue) ? props.modelValue : '#ff00ff')
})
function drawWheel() {
    const ctx = wheel.value.getContext('2d')
    const W = Math.round(size * scale)
    const H = W
    const cx = W / 2 - 3
    const cy = H / 2 - 3
    const r  = W / 2 - 0.5   // klucz: -0.5 usuwa półprzezroczysty ring
    const img = ctx.createImageData(W, H)
    for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
            const dx = x - cx, dy = y - cy
            const dist = Math.hypot(dx, dy)
            const i = (y * W + x) * 4
            if (dist <= r) {
                let ang = Math.atan2(dy, dx); if (ang < 0) ang += Math.PI * 2
                const h = ang * 180 / Math.PI
                const s = Math.min(1, dist / r)
                const { r: rr, g: gg, b: bb } = hsvToRgb(h, s, 1)
                img.data[i] = rr; img.data[i + 1] = gg; img.data[i + 2] = bb; img.data[i + 3] = 255
            } else {
                img.data[i + 3] = 0
            }
        }
    }
    ctx.putImageData(img, 0, 0)
    updateIndicator()
}
function localPoint(e) {
    const r = (hit.value || wheel.value).getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
}
function startPick(e) {
    e.preventDefault()
    picking = true
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch { }
    lastEvent = e
    schedule()
}
function movePick(e) {
    if (!picking && e.buttons === 0) return
    e.preventDefault()
    lastEvent = e
    schedule()
}
function endPick(e) {
    picking = false
    try { e.currentTarget.releasePointerCapture(e.pointerId) } catch { }
    lastEvent = null
}
function schedule() {
    if (rafId) return
    rafId = requestAnimationFrame(() => {
        rafId = 0
        if (!lastEvent) return
        const p = localPoint(lastEvent)
        const cx = size / 2, cy = size / 2
        const dx = p.x - cx, dy = p.y - cy
        const r = size / 2
        const dist = Math.min(Math.hypot(dx, dy), r)
        let ang = Math.atan2(dy, dx); if (ang < 0) ang += Math.PI * 2
        hsv.h = ang * 180 / Math.PI
        hsv.s = dist / r
        updateFromHSV()
    })
}
function updateFromHSV() {
    const { r, g, b } = hsvToRgb(hsv.h, hsv.s, hsv.v)
    rgb.r = r; rgb.g = g; rgb.b = b
    updateIndicator()
    const out = rgbToHex(rgb)
    emit('update:modelValue', out)
    const s = brightnessLocal.value
    const rgbScaled = { r: Math.round(rgb.r * s), g: Math.round(rgb.g * s), b: Math.round(rgb.b * s) }
    emit('change', { hex: out, rgb: { ...rgb }, hsv: { ...hsv }, brightness: s, rgbScaled, pwm: rgbScaled })
}
function updateIndicator() {
    const r = (size / 2) * hsv.s
    const rad = hsv.h * Math.PI / 180
    const cx = size / 2, cy = size / 2
    indicator.x = cx + r * Math.cos(rad)
    indicator.y = cy + r * Math.sin(rad)
}
function onPowerInput(e) {
    const v = clamp01(parseFloat(e.target.value))
    brightnessLocal.value = v
    emit('update:brightness', v)
    const rgbScaled = { r: Math.round(rgb.r * v), g: Math.round(rgb.g * v), b: Math.round(rgb.b * v) }
    emit('change', { hex: hex.value, rgb: { ...rgb }, hsv: { ...hsv }, brightness: v, rgbScaled, pwm: rgbScaled })
}
function applyHex(h) {
    const parsed = hexToRgb(h); if (!parsed) return
    const hv = rgbToHsv(parsed.r, parsed.g, parsed.b)
    hsv.h = hv.h; hsv.s = hv.s; hsv.v = hv.v
    updateFromHSV()
}
function hsvToRgb(h, s, v) {
    const c = v * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = v - c
    let r = 0, g = 0, b = 0
    if (0 <= h && h < 60) { r = c; g = x; b = 0 }
    else if (60 <= h && h < 120) { r = x; g = c; b = 0 }
    else if (120 <= h && h < 180) { r = 0; g = c; b = x }
    else if (180 <= h && h < 240) { r = 0; g = x; b = c }
    else if (240 <= h && h < 300) { r = x; g = 0; b = c }
    else { r = c; g = 0; b = x }
    return { r: Math.round((r + m) * 255), g: Math.round((g + m) * 255), b: Math.round((b + m) * 255) }
}
function rgbToHsv(r, g, b) {
    r /= 255; g /= 255; b /= 255
    const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min
    let h = 0
    if (d !== 0) {
        if (max === r) h = 60 * (((g - b) / d) % 6)
        else if (max === g) h = 60 * (((b - r) / d) + 2)
        else h = 60 * (((r - g) / d) + 4)
    }
    if (h < 0) h += 360
    const s = max === 0 ? 0 : d / max, v = max
    return { h, s, v }
}
function rgbToHex({ r, g, b }) { const to = x => x.toString(16).padStart(2, '0'); return `#${to(r)}${to(g)}${to(b)}` }
function hexToRgb(h) { const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h || ''); if (!m) return null; return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } }
function isValidHex(h) { return /^#?[0-9a-fA-F]{6}$/.test(h || '') }
function clamp01(x) { return Math.max(0, Math.min(1, Number.isFinite(x) ? x : 0)) }
</script>
<style scoped>
.cp-root {
    color: var(--fontColor);
    font-family: inherit;
    user-select: none;
}
.cp-wheel-wrap{
  position: relative;
  margin: 0 auto 12px auto;
  cursor: crosshair;
  border: 3px solid #003c7d;
  border-radius: 50%;
  overflow: hidden;
  background-clip: padding-box;
}
.cp-wheel{
  display:block;
  border: none;
  border-radius: 0;
}
.cp-hitbox {
    position: absolute;
    inset: 0;
    touch-action: none;
}
.cp-indicator {
    position: absolute;
    width: 14px;
    height: 14px;
    border: 3px solid #003c7d;
    box-shadow: 0 0 0 1px rgba(0, 0, 0, .6);
    border-radius: 9999px;
    transform: translate(-50%, -50%);
    pointer-events: none;
}
.cp-section {
    margin-top: 14px;
}
.cp-label {
    font-size: 12px;
    opacity: .85;
    margin-bottom: 6px;
}
.cp-bar {
    height: 8px;
    border-radius: 9999px;
    box-shadow: inset 0 0 0 1px var(--panelOutlineColor);
}
.cp-bar-grey {
    background: linear-gradient(90deg, #222, #eee);
}
.cp-mini {
    font-size: 12px;
    opacity: .8;
    margin-top: 6px;
}
.cp-range {
    width: 100%;
    margin-top: 8px;
    appearance: none;
    height: 8px;
    background: transparent;
}
.cp-range::-webkit-slider-runnable-track {
    height: 8px;
    border-radius: 9999px;
    background: transparent;
}
.cp-range::-webkit-slider-thumb {
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 9999px;
    background: #fff;
    border: 3px solid #003c7d;
    margin-top: -5px;
}
.cp-range::-moz-range-track {
    height: 8px;
    border-radius: 9999px;
    background: transparent;
}
.cp-range::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 9999px;
    background: #fff;
    border: 2px solid #003c7d;
}
.cp-swatches {
    margin-top: 14px;
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 8px;
}
.cp-swatch {
    width: 26px;
    height: 26px;
    border-radius: 9999px;
    border: 3px solid #003c7d;
    cursor: pointer;
}
.cp-readout {
    margin-top: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
}
.cp-current {
    width: 28px;
    height: 28px;
    border-radius: 9999px;
    border: 1px solid var(--panelOutlineColor);
}
.cp-text {
    font-size: 12px;
    line-height: 1.25;
}
.cp-line {
    opacity: .9;
}
</style>