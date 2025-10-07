<template>
  <div id="W" :class="{ manualMode: manualMode }">
    <div class="layer" v-if="hasAnyInterrupts">
      <RZRegisterSection
        :visible="extras?.interrupts?.rzRegister"
        :RZ="RZ"
        :rz-inputs="rzInputs"
        :number-format="registerFormats.RZ"
        @update:number-format="(val) => $emit('update:number-format', { field: 'RZ', value: val })"
        @update:RZ="$emit('update:RZ', $event)"
        @update:rz-inputs="$emit('update:rz-inputs', $event)"
      />
      <RPRegisterSection
        :visible="extras?.interrupts?.rpRegister"
        :RP="RP"
        :signals="signals"
        :formatNumber="formatNumber"
        :number-format="registerFormats.RP"
        @update:number-format="(val) => $emit('update:number-format', { field: 'RP', value: val })"
        @update:RP="$emit('update:RP', $event)"
        @clickItem="(name) => $emit('clickItem', name)"
      />
      <div class="additionalInterruptsSignalsConteiner">
        <SignalButton
          v-if="extras?.interrupts?.rintSignal"
          id="rint"
          :signal="signals.rint"
          label="rint"
          spanClassNames="arrowLeftOnBottom additionalInterruptsSignal"
          @click="handleClick('rint')"
        />
        <SignalButton
          v-if="extras?.interrupts?.eniSignal"
          id="eni"
          :signal="signals.eni"
          label="eni"
          spanClassNames="arrowLeftOnBottom additionalInterruptsSignal"
          @click="handleClick('eni')"
        />
      </div>
    </div>
    <div class="layer">
      <CounterComponent
        :signals="signals"
        :programCounter="programCounter"
        :formatNumber="formatNumber"
        :number-format="registerFormats.L"
        @update:number-format="(val) => $emit('update:number-format', { field: 'L', value: val })"
        :extras="extras"
        @update:programCounter="$emit('update:programCounter', $event)"
        @clickItem="(name) => $emit('clickItem', name)"
      />
      <RMRegisterSection
        :visible="extras?.interrupts?.rmRegister"
        :RM="RM"
        :signals="signals"
        :formatNumber="formatNumber"
        :number-format="registerFormats.RM"
        @update:number-format="(val) => $emit('update:number-format', { field: 'RM', value: val })"
        @update:RM="$emit('update:RM', $event)"
        @clickItem="(name) => $emit('clickItem', name)"
      />
      <APRegisterSection
        :visible="extras?.interrupts?.apRegister"
        :AP="AP"
        :signals="signals"
        :formatNumber="formatNumber"
        :number-format="registerFormats.AP"
        @update:number-format="(val) => $emit('update:number-format', { field: 'AP', value: val })"
        @update:AP="$emit('update:AP', $event)"
        @clickItem="(name) => $emit('clickItem', name)"
      />
    </div>
    <div class="wylsBusConteiner">
      <div v-if="extras?.stack?.wylsSignal" class="wylsBusDiv">
        <div class="wylsBusExt">
      </div>
      </div>
      <BusSignal
        :signalStatus="signals.busA"
        :busValue="BusA"
        :busName="'A'"
        :mobileView="isMobile"
        :showInvisibleRegisters="extras.showInvisibleRegisters"
        :formatNumber="formatNumber"
        :number-format="registerFormats.BusA"
        @update:number-format="(val) => $emit('update:number-format', { field: 'BusA', value: val })"
      />
    </div>
    <div class="layer layerNoGap">
      <div v-if="extras?.stack?.wylsSignal" class="wylsConteiner">
        <SignalButton
          id="wyls"
          :signal="signals.wyls"
          label="wyls"
          :divClassNames="isMobile ? 'impulse pathDownOnLeft': 'impulse pathDownOnRight'"
          :spanClassNames="isMobile ? 'lineLeftOnBottom' : 'lineRightOnBottom'"
          @click="handleClick('wyls')"
        />
      </div>
      <div class="layer">
        <RegisterISection
          :I="I"
          :signals="signals"
          :formatNumber="formatNumber"
          :number-format="registerFormats.I"
          @update:number-format="(val) => $emit('update:number-format', { field: 'I', value: val })"
          @update:I="$emit('update:I', $event)"
          @clickItem="(name) => $emit('clickItem', name)"
        />
        <template v-if="!isMobile">
          <CalcSection
            :signals="signals"
            :extras="extras"
            :ACC="ACC"
            :JAML="JAML"
            :WS="WS"
            :dec-signed="decSigned"
            :word-bits="wordBits"
            :formatNumber="formatNumber"
            :numberFormat="registerFormats.WS"
            :acc-format="registerFormats.ACC"
            @update:acc-format="(val) => $emit('update:number-format', { field: 'ACC', value: val })"
            :jaml-format="registerFormats.JAML"
            @update:number-format="(val) => $emit('update:number-format', { field: 'WS', value: val })"
            @update:jaml-format="(val) => $emit('update:number-format', { field: 'JAML', value: val })"
            @update:ACC="$emit('update:ACC', $event)"
            @update:JAML="$emit('update:JAML', $event)"
            @update:WS="$emit('update:WS', $event)"
            @clickItem="(name) => $emit('clickItem', name)"
          />
        </template>
        <SignalButton
          v-if="extras.busConnectors"
          id="sa"
          :signal="signals.sa"
          label="sa"
          divClassNames="pathUpOnRight"
          spanClassNames="lineRightOnBottom"
          @click="$emit('clickItem', 'sa')"
        />
        <SignalButton
          v-if="extras.busConnectors"
          id="as"
          :signal="signals.as"
          label="as"
          divClassNames="pathDownOnLeft"
          spanClassNames="lineLeftOnBottom"
          @click="$emit('clickItem', 'as')"
        />
        <MemorySection
          :A="A"
          :S="S"
          :mem="mem"
          :signals="signals"
          :formatNumber="formatNumber"
          :decToCommand="decToCommand"
          :decToArgument="decToArgument"
          :a-format="registerFormats.A"
          @update:a-format="(val) => $emit('update:number-format', { field: 'A', value: val })"
          :s-format="registerFormats.S"
          @update:s-format="(val) => $emit('update:number-format', { field: 'S', value: val })"
          @update:A="$emit('update:A', $event)"
          @update:S="$emit('update:S', $event)"
          @update:mem="$emit('update:mem', $event)"
          @clickItem="(name) => $emit('clickItem', name)"
          :mobileView="isMobile"
          :busAValue="BusA"
          :busSValue="BusS"
          :signed-dec="decSigned"
          :word-bits="wordBits"
          :showInvisibleRegisters="extras.showInvisibleRegisters"
        />
      </div>
    </div>
    <BusSignal
      :signalStatus="signals.busS"
      :busValue="BusS"
      :busName="'S'"
      :mobileView="isMobile"
      :showInvisibleRegisters="extras.showInvisibleRegisters"
      :formatNumber="formatNumber"
      :number-format="registerFormats.BusS"
      @update:number-format="(val) => $emit('update:number-format', { field: 'BusS', value: val })"
    />
    <div id="layer3" class="layer layerCenter">
      <XRegisterSection
        :visible="extras.xRegister"
        :X="X"
        :signals="signals"
        :formatNumber="formatNumber"
        :number-format="registerFormats.X"
        @update:number-format="(val) => $emit('update:number-format', { field: 'X', value: val })"
        @update:X="$emit('update:X', $event)"
        @clickItem="(name) => $emit('clickItem', name)"
      />
      <template v-if="isMobile">
        <SignalButton
          id="weja"
          :signal="signals.weja"
          label="weja"
          style="height: 91%; min-height: 40px;"
          divClassNames="pathDownOnRight"
          spanClassNames="arrowRightOnBottom"
          @click="handleClick('weja')"
        />
        <SignalButton
          id="wyak"
          :signal="signals.wyak"
          label="wyak"
          style="height: 91%; min-height: 40px;"
          divClassNames="pathUpOnLeft"
          spanClassNames="arrowLeftOnBottom"
          @click="handleClick('wyak')"
        />
      </template>
      <YRegisterSection
        :visible="extras.yRegister"
        :Y="Y"
        :signals="signals"
        :formatNumber="formatNumber"
        :number-format="registerFormats.Y"
        @update:number-format="(val) => $emit('update:number-format', { field: 'Y', value: val })"
        @update:Y="$emit('update:Y', $event)"
        @clickItem="(name) => $emit('clickItem', name)"
      />
      <RBRegisterSection
        v-if="!isMobile"
        :visible="extras?.io?.rbRegister"
        :RB="RB"
        :signals="signals"
        :formatNumber="formatNumber"
        :number-format="registerFormats.RB"
        @update:number-format="(val) => $emit('update:number-format', { field: 'RB', value: val })"
        @update:RB="$emit('update:RB', $event)"
        @clickItem="(name) => $emit('clickItem', name)"
      />
      <GRegisterSection
        v-if="!isMobile"
        :visible="extras?.io?.gRegister"
        :G="G"
        :signals="signals"
        :formatNumber="formatNumber"
        :number-format="registerFormats.G"
        @update:number-format="(val) => $emit('update:number-format', { field: 'G', value: val })"
        @update:G="$emit('update:G', $event)"
        @clickItem="(name) => $emit('clickItem', name)"
      />
    </div>
    <template v-if="isMobile">
      <div id="layer4" class="layer">
        <CalcSection
          :signals="signals"
          :extras="extras"
          :ACC="ACC"
          :JAML="JAML"
          :WS="WS"
          :dec-signed="decSigned"
          :word-bits="wordBits"
          :formatNumber="formatNumber"
          :numberFormat="registerFormats.WS"
          :acc-format="registerFormats.ACC"
          @update:acc-format="(val) => $emit('update:number-format', { field: 'ACC', value: val })"
          :jaml-format="registerFormats.JAML"
          @update:number-format="(val) => $emit('update:number-format', { field: 'WS', value: val })"
          @update:jaml-format="(val) => $emit('update:number-format', { field: 'JAML', value: val })"
          @update:ACC="$emit('update:ACC', $event)"
          @update:JAML="$emit('update:JAML', $event)"
          @update:WS="$emit('update:WS', $event)"
          @clickItem="(name) => $emit('clickItem', name)"
        />
      </div>
      <div class="layer">
        <RBRegisterSection
          :visible="extras?.io?.rbRegister"
          :RB="RB"
          :signals="signals"
          :formatNumber="formatNumber"
          :number-format="registerFormats.RB"
          @update:number-format="(val) => $emit('update:number-format', { field: 'RB', value: val })"
          @update:RB="$emit('update:RB', $event)"
          @clickItem="(name) => $emit('clickItem', name)"
        />
        <GRegisterSection
          :visible="extras?.io?.gRegister"
          :G="G"
          :signals="signals"
          :formatNumber="formatNumber"
          :number-format="registerFormats.G"
          @update:number-format="(val) => $emit('update:number-format', { field: 'G', value: val })"
          @update:G="$emit('update:G', $event)"
          @clickItem="(name) => $emit('clickItem', name)"
        />
      </div>
      <BusSignal
        v-if="extras?.stack?.wsRegister"
        :signalStatus="signals.busS"
        :busValue="BusS"
        :busName="'S'"
        :mobileView="isMobile"
        :showInvisibleRegisters="extras.showInvisibleRegisters"
        :formatNumber="formatNumber"
        :number-format="registerFormats.BusS"
        @update:number-format="(val) => $emit('update:number-format', { field: 'BusS', value: val })"
      />
      <div class="layer">
        <WSRegisterSection
          :WS="WS"
          :BusS="BusS"
          :visible="extras?.stack?.wsRegister"
          :signals="signals"
          :formatNumber="formatNumber"
          :number-format="registerFormats.WS"
          @update:number-format="(val) => $emit('update:number-format', { field: 'WS', value: val })"
          :extras="extras"
          @update:programCounter="$emit('update:programCounter', $event)"
          @clickItem="(name) => $emit('clickItem', name)"
          @update:WS="$emit('update:WS', $event)"
        />
    </div>
    </template>
  </div>
</template>
<script>
import CounterComponent from '@/components/CounterComponent.vue';
import BusSignal from '@/components/BusSignal.vue';
import SignalButton from '@/components/SignalButton.vue';
import MemorySection from '@/components/MemorySection.vue';
import CalcSection from '@/components/CalcSection.vue';
import RegisterISection from '@/components/RegisterISection.vue';
import XRegisterSection from '@/components/XRegisterSection.vue';
import YRegisterSection from '@/components/YRegisterSection.vue';
import RBRegisterSection from '@/components/RBRegisterSection.vue';
import GRegisterSection from '@/components/GRegisterSection.vue';
import RMRegisterSection from '@/components/RMRegisterSection.vue';
import APRegisterSection from '@/components/APRegisterSection.vue';
import RZRegisterSection from '@/components/RZRegisterSection.vue';
import RPRegisterSection from '@/components/RPRegisterSection.vue';
import WSRegisterSection from '@/components/WSRegisterSection.vue';
export default {
  name: 'MaszynaW',
  components: {
    CounterComponent,
    BusSignal,
    SignalButton,
    MemorySection,
    CalcSection,
    RegisterISection,
    XRegisterSection,
    YRegisterSection,
    RBRegisterSection,
    GRegisterSection,
    RMRegisterSection,
    APRegisterSection,
    RZRegisterSection,
    RPRegisterSection,
    WSRegisterSection
  },
  data() {
    return {
      isMobile: window.innerWidth <= 768
    }
  },
  computed: {
    hasAnyInterrupts() {
      return Object.values(this.extras?.interrupts || {}).some(Boolean)
    },
  },
  methods: {
    handleClick(id) {
      this.$emit('clickItem', id);
    },
    checkMobile() {
       this.isMobile = window.innerWidth <= 768;
    },
  },
  mounted() {
    window.addEventListener('resize', this.checkMobile);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkMobile);
  },
  props: {
    manualMode: { type: Boolean, required: true },
    signals: { type: Object, required: true },
    programCounter: { type: Number, required: true },
    formatNumber: { type: Function, required: true },
    registerFormats: { type: Object, required: true },
    extras: { type: Object, required: true },
    BusA: { type: Number, required: true },
    BusS: { type: Number, required: true },
    I: { type: Number, required: true },
    ACC: { type: Number, required: true },
    JAML: { type: Number, required: true },
    A: { type: Number, required: true },
    S: { type: Number, required: true },
    mem: { type: Array, required: true },
    X: { type: Number, required: true },
    Y: { type: Number, required: true },
    RB: { type: Number, required: true },
    G: { type: Number, required: true },
    RM: { type: Number, required: true },
    AP: { type: Number, required: true },
    RZ: { type: Number, required: true },
    RP: { type: Number, required: true },
    WS: { type: Number, required: true },
    rzInputs: { type: Array, default: () => [0,0,0,0] },
    wordBits: { type: Number, default: 8 },
    decSigned: { type: Boolean, default: false },
    decToCommand: { type: Function, required: true },
    decToArgument: { type: Function, required: true },
  },
  emits: [
    'clickItem',
    'update:programCounter',
    'update:I',
    'update:ACC',
    'update:JAML',
    'update:A',
    'update:S',
    'update:mem',
    'update:X',
    'update:Y',
    'update:RB',
    'update:G',
    'update:WS',
    'update:RM',
    'update:RP',
    'update:AP',
    'update:RZ',
    'update:rz-inputs',
    'update:number-format',
  ],
};
</script>
<style scoped>
</style>