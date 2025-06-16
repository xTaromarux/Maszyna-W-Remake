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
      :formatNumber="formatNumber"
    />

    <div id="memoryTable">
      <div class="scrollWrapper">
        <div class="memoryContainer">
            <span class="label">{{ memoryLabel }}</span>
            <span class="label">Wartość</span>
            <span class="label">Kod</span>
            <span class="label">Adres</span>

            <template v-for="(value, index) in mem" :key="index" >
              <span :class="{ selected: A === index }">{{ formatNumber(index) }}</span>
              <div :class="{ selected: A === index }" class="inputWrapper">
                <span>{{ formatNumber(mem[index]) }}</span>
                <input inputmode="numeric" pattern="[0-9]*" type="number" class="hoverInput" v-model="mem[index]" />
              </div>
              <span :class="{ selected: A === index }">
                {{ decToCommand(value) ? decToCommand(value).name : "EMPTY" }}
              </span>
              <span :class="{ selected: A === index }">
                {{ formatNumber(decToArgument(value)) }}
              </span>
            </template>
          </div>
      </div>
    </div>

    <div id="operations" v-if="!isMobile">
      <SignalButton
        id="czyt"
        :signal="signals.czyt"
        label="czyt"
        spanClassNames="lineLeftOnBottom"
        @click="handleClick('czyt')"
      />
      <SignalButton
        id="pisz"
        :signal="signals.pisz"
        label="pisz"
        spanClassNames="lineLeftOnBottom"
        @click="handleClick('pisz')"
      />
    </div>

    <RegisterComponent
      id="sRegister"
      label="S"
      :model="S"
      @update:model="$emit('update:S', $event)"
      :formatNumber="formatNumber"
    />

    <div class="signals" v-if="!isMobile">
      <SignalButton
        id="wes"
        :signal="signals.wes"
        label="wes"
        divClassNames="pathUpOnRight"
        spanClassNames="arrowRightOnBottom"
        @click="handleClick('wes')"
      />
      <SignalButton
        id="wys"
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
  name: "MemoryContent",
  props: {
    A: {
      type: Number,
      required: true
    },
    S: {
      type: Number,
      required: true
    },
    mem: {
      type: Array,
      required: true
    },
    signals: {
      type: Object,
      required: true
    },
    formatNumber: {
      type: Function,
      required: true
    },
    decToCommand: {
      type: Function,
      required: true
    },
    decToArgument: {
      type: Function,
      required: true
    }
  },
  emits: ['update:A', 'update:S', 'clickItem'],
  components: {
    SignalButton,
    RegisterComponent
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
    }
  },
  methods: {
    handleClick(id) {
      this.$emit('clickItem', id);
    },
    updateWindowWidth() {
      this.windowWidth = window.innerWidth;
    }
  },
  mounted() {
    window.addEventListener('resize', this.updateWindowWidth);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.updateWindowWidth);
  }
};
</script>
