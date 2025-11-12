<template>
  <div id="memory">
    <SignalButton
      id="wea"
      v-if="!isMobile"
      :signal="signals.wea"
      label="wea"
      divClassNames="pathDownOnRight"
      spanClassNames="arrowRightOnBottom"
      @click="handleClick('wea')"
    />

    <RegisterComponent
      classNames="register"
      id="aRegister"
      label="A"
      :model="A"
      @update:model="$emit('update:A', $event)"
      :number-format="aFormat"
      @update:number-format="$emit('update:aFormat', $event)"
    />

    <div id="memoryTable">
      <div class="scrollWrapper">
        <div class="memoryContainer">
          <span class="label">{{ memoryLabel }}</span>
          <span class="label">Wartość</span>
          <span class="label">Kod</span>
          <span class="label">Adres</span>

          <template v-for="(value, index) in mem" :key="index">
            <span :class="{ selected: A === index }">{{ formatNumber(index) }}</span>
            <div :class="{ selected: A === index }" class="inputWrapper">
              <span>{{ formatNumber(mem[index]) }}</span>
              <input
                inputmode="numeric"
                type="number"
                class="hoverInput"
                :value="displayValue(mem[index])"
                :min="signedDec ? -(1 << (wordBits - 1)) : 0"
                :max="signedDec ? (1 << (wordBits - 1)) - 1 : wordMask()"
                @input="updateMemoryValue($event, index)"
                @blur="onMemoryBlur($event, index)"
              />
            </div>
            <span :class="{ selected: A === index }">
              {{ decToCommand(value) ? decToCommand(value).name : 'EMPTY' }}
            </span>
            <span :class="{ selected: A === index }">
              {{ formatNumber(decToArgument(value)) }}
            </span>
          </template>
        </div>
      </div>
    </div>

    <RegisterComponent
      classNames="register"
      id="sRegister"
      label="S"
      :model="S"
      @update:model="$emit('update:S', $event)"
      :number-format="sFormat"
      @update:number-format="$emit('update:sFormat', $event)"
    />

    <div id="operations" v-if="!isMobile">
      <SignalButton id="czyt" :signal="signals.czyt" label="czyt" spanClassNames="lineLeftOnBottom" @click="handleClick('czyt')" />
      <SignalButton id="pisz" :signal="signals.pisz" label="pisz" spanClassNames="lineLeftOnBottom" @click="handleClick('pisz')" />
    </div>

    <div class="signals" v-if="!isMobile">
      <SignalButton
        id="wes"
        v-if="!isMobile"
        :signal="signals.wes"
        label="wes"
        divClassNames="pathUpOnRight"
        spanClassNames="arrowRightOnBottom"
        @click="handleClick('wes')"
      />
      <SignalButton
        id="wys"
        v-if="!isMobile"
        :signal="signals.wys"
        label="wys"
        divClassNames="pathDownOnLeft"
        spanClassNames="lineLeftOnBottom"
        @click="handleClick('wys')"
      />
    </div>
  </div>
</template>

<script>
import SignalButton from './SignalButton.vue';
import RegisterComponent from './RegisterComponent.vue';
export default {
  name: 'MemoryContent',
  inject: {
    validateRegisterValue: {
      default: null,
    },
    showToast: {
      default: null,
    },
    getMaxValueForRegister: {
      default: null,
    },
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
    signedDec: {
      type: Boolean,
      default: false,
    },
    wordBits: {
      type: Number,
      default: 8,
    },
  },
  emits: ['update:A', 'update:S', 'update:mem', 'clickItem', 'update:aFormat', 'update:sFormat'],
  components: {
    SignalButton,
    RegisterComponent,
  },
  data() {
    return {
      windowWidth: window.innerWidth,
    };
  },
  computed: {
    isMobile() {
      return this.windowWidth < 1080;
    },
    memoryLabel() {
      return this.windowWidth < 1400 ? 'Adr.' : 'Adres pamięci';
    },
  },
  methods: {
    wordMask() {
      return (1 << this.wordBits) - 1;
    },
    toSigned(v) {
      const mod = 1 << this.wordBits;
      const sign = 1 << (this.wordBits - 1);
      const m = v & (mod - 1);
      return m & sign ? m - mod : m;
    },
    displayValue(raw) {
      return this.signedDec ? this.toSigned(raw) : raw & this.wordMask();
    },
    handleClick(id) {
      this.$emit('clickItem', id);
    },
    updateWindowWidth() {
      this.windowWidth = window.innerWidth;
    },
    updateMemoryValue(event, index) {
      const txt = String(event.target.value).trim();
      if (txt === '' || txt === '-') return;

      const val = parseInt(txt, 10);
      if (Number.isNaN(val)) {
        event.target.value = this.displayValue(this.mem[index]);
        return;
      }

      if (this.validateRegisterValue) {
        const ok = this.validateRegisterValue(val, 'memory', `Pamięć[${index}]`);
        if (!ok) {
          event.target.value = this.displayValue(this.mem[index]);
          return;
        }
      } else {
        const min = this.signedDec ? -(1 << (this.wordBits - 1)) : 0;
        const max = this.signedDec ? (1 << (this.wordBits - 1)) - 1 : this.wordMask();
        if (val < min || val > max) {
          if (this.showToast) {
            this.showToast(
              `Wartość ${val} poza zakresem ${min}..${max} (słowo ${this.wordBits}-bit${this.wordBits === 1 ? 'owe' : 'owe'}).`
            );
          }
          event.target.value = this.displayValue(this.mem[index]);
          return;
        }
      }

      let stored;
      if (this.signedDec && val < 0) {
        stored = (val + (1 << this.wordBits)) & this.wordMask();
      } else {
        stored = val & this.wordMask();
      }

      const newMem = [...this.mem];
      newMem[index] = stored;
      this.$emit('update:mem', newMem);
    },
    onMemoryBlur(event, index) {
      const txt = String(event.target.value).trim();
      if (txt === '' || txt === '-') {
        const newMem = [...this.mem];
        newMem[index] = 0;
        this.$emit('update:mem', newMem);
        event.target.value = this.displayValue(0);
      } else {
        // wyrównaj prezentację do trybu signed/unsigned
        event.target.value = this.displayValue(this.mem[index]);
      }
    },
  },
  mounted() {
    window.addEventListener('resize', this.updateWindowWidth);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.updateWindowWidth);
  },
};
</script>
