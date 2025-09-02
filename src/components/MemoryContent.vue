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
                pattern="[0-9]*"
                type="number"
                class="hoverInput"
                :value="mem[index]"
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
    handleClick(id) {
      this.$emit('clickItem', id);
    },
    updateWindowWidth() {
      this.windowWidth = window.innerWidth;
    },
    updateMemoryValue(event, index) {
      const value = parseInt(event.target.value, 10);
      if (!isNaN(value)) {
        // Use injected validation function if available
        if (this.validateRegisterValue) {
          if (this.validateRegisterValue(value, 'memory', `Pamięć[${index}]`)) {
            // update memory by creating new array to trigger reactivity
            const newMem = [...this.mem];
            newMem[index] = value;
            this.$emit('update:mem', newMem);
          } else {
            // if validation fails, reset input to current value
            event.target.value = this.mem[index];
          }
        } else {
          // fallback validation for memory (max 255 for 8-bit)
          if (value > 255) {
            if (this.showToast) {
              this.showToast(`Wartość ${value} przekracza maksymalną dozwoloną wartość 255 dla pamięci (8 bitów).`);
            }
            event.target.value = this.mem[index];
            return;
          }
          if (value < 0) {
            if (this.showToast) {
              this.showToast(`Wartość nie może być ujemna dla pamięci.`);
            }
            event.target.value = this.mem[index];
            return;
          }

          const newMem = [...this.mem];
          newMem[index] = value;
          this.$emit('update:mem', newMem);
        }
      }
    },
    onMemoryBlur(event, index) {
      // Set to 0 if field is empty
      if (event.target.value === '' || event.target.value === null) {
        event.target.value = 0;
        const newMem = [...this.mem];
        newMem[index] = 0;
        this.$emit('update:mem', newMem);
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
