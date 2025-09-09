<template>
  <div v-if="visible" id="rzRegister" class="rz-register">
    <div class="rz-inputs">
      <button
        v-for="(v, idx) in localInputs"
        :key="idx"
        class="rz-input"
        :class="{ active: !!v }"
        :aria-pressed="!!v"
        @click="toggle(idx)"
        type="button"
      >
        {{ idx + 1 }}
      </button>
    </div>

    <RegisterComponent
      label="RZ"
      :model="RZ"
      @update:model="$emit('update:RZ', $event)"
      :number-format="numberFormat"
      @update:number-format="$emit('update:numberFormat', $event)"
    />
  </div>
</template>

<script>
import RegisterComponent from './RegisterComponent.vue'

export default {
  name: 'RZRegisterSection',
  components: { RegisterComponent },
  props: {
    visible: { type: Boolean, default: true },
    RZ: { type: Number, default: 0 },
    rzInputs: { type: Array, default: () => [0,0,0,0] }, 
    numberFormat: { type: String, required: true },
  },
  emits: ['update:RZ', 'update:rzInputs', 'update:numberFormat'],
  data() {
    return {
      localInputs: [0,0,0,0],
    }
  },
  computed: {
    rzValue() {
      return (
        (this.localInputs[0] ? 1 : 0) |
        (this.localInputs[1] ? 2 : 0) |
        (this.localInputs[2] ? 4 : 0) |
        (this.localInputs[3] ? 8 : 0)
      )
    },
  },
  watch: {
    rzInputs: {
      immediate: true,
      deep: true,
      handler(arr) {
        const next = (arr || []).slice(0,4).map(x => (x ? 1 : 0))
        if (JSON.stringify(next) !== JSON.stringify(this.localInputs)) {
          this.localInputs = next
        }
      }
    },

    RZ(newVal) {
      const bits = [
        (newVal >> 0) & 1,
        (newVal >> 1) & 1,
        (newVal >> 2) & 1,
        (newVal >> 3) & 1,
      ]
      if (JSON.stringify(bits) !== JSON.stringify(this.localInputs)) {
        this.localInputs = bits
      }
    }
  },
  methods: {
    toggle(i) {
      const copy = this.localInputs.slice()
      copy[i] = copy[i] ? 0 : 1
      this.localInputs = copy

      this.$emit('update:rzInputs', copy)
      this.$emit('update:RZ', this.rzValue)
    },
  },
}
</script>

<style scoped>
.rz-register {
  display: flex;
  flex-direction: column;
  gap: .5rem;
}

.rz-inputs {
  grid-area: b;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: .25rem;
}

.rz-input {
  appearance: none;
  border: 1px solid var(--panelOutlineColor);
  background: var(--panelBackgroundColor, white);
  color: var(--fontColor, black);
  font-weight: 600;
  padding: .25rem 0;
  border-radius: 2px;
  line-height: 1;
  cursor: pointer;
  transition: background .15s ease, transform .05s ease;
}
.rz-input:active { transform: translateY(1px); }
.rz-input.active {
  background: #9fd18b; 
}

.rz-display {
  border: 2px solid #000;
  background: #fff;
  padding: .35rem .5rem;
  border-radius: 2px;
}
</style>

