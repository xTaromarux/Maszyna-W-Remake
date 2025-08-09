<template>
  <div id="W" :class="{ manualMode: manualMode }">
    <div class="layer">
      <CounterComponent
        :signals="signals"
        :programCounter="programCounter"
        :formatNumber="formatNumber"
        :number-format="registerFormats.L"
        @update:number-format="val => $emit('update:number-format', { field: 'L', value: val })"
        :extras="extras"
        @update:programCounter="$emit('update:programCounter', $event)"
        @clickItem="name => $emit('clickItem', name)"
      />
    </div>
    <BusSignal
      :signalStatus="signals.busA"
      :busValue="BusA"
      :busName="'A'"
      :showInvisibleRegisters="extras.showInvisibleRegisters"
      :formatNumber="formatNumber"
      :number-format="registerFormats.BusA"
      @update:number-format="val => $emit('update:number-format', { field: 'BusA', value: val })"
    />

    <div class="layer">
      <RegisterISection
        :I="I"
        :signals="signals"
        :formatNumber="formatNumber"
        :number-format="registerFormats.I"
        @update:number-format="val => $emit('update:number-format', { field: 'I', value: val })"
        @update:I="$emit('update:I', $event)"
        @clickItem="name => $emit('clickItem', name)"
      />

      <CalcSection
        :signals="signals"
        :extras="extras"
        :ACC="ACC"
        :JAML="JAML"
        :formatNumber="formatNumber"
        :acc-format="registerFormats.ACC"
        @update:acc-format="val => $emit('update:number-format', { field: 'ACC', value: val })"
        :jaml-format="registerFormats.JAML"
        @update:jaml-format="val => $emit('update:number-format', { field: 'JAML', value: val })"
        @update:ACC="$emit('update:ACC', $event)"
        @update:JAML="$emit('update:JAML', $event)"
        @clickItem="name => $emit('clickItem', name)"
      />

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
        @update:a-format="val => $emit('update:number-format', { field: 'A', value: val })"
        :s-format="registerFormats.S"
        @update:s-format="val => $emit('update:number-format', { field: 'S', value: val })"
        @update:A="$emit('update:A', $event)"
        @update:S="$emit('update:S', $event)"
        @clickItem="name => $emit('clickItem', name)"
      />
    </div>

    <BusSignal
      :signalStatus="signals.busS"
      :busValue="BusS"
      :busName="'S'"
      :showInvisibleRegisters="extras.showInvisibleRegisters"
      :formatNumber="formatNumber"
      :number-format="registerFormats.BusS"
      @update:number-format="val => $emit('update:number-format', { field: 'BusS', value: val })"
    />

    <div id="layer3" class="layer">
      <XRegisterSection
        :visible="extras.xRegister"
        :X="X"
        :signals="signals"
        :formatNumber="formatNumber"
        :number-format="registerFormats.X"
        @update:number-format="val => $emit('update:number-format', { field: 'X', value: val })"
        @update:X="$emit('update:X', $event)"
        @clickItem="name => $emit('clickItem', name)"
      />

      <YRegisterSection
        :visible="extras.yRegister"
        :Y="Y"
        :signals="signals"
        :formatNumber="formatNumber"
        :number-format="registerFormats.Y"
        @update:number-format="val => $emit('update:number-format', { field: 'Y', value: val })"
        @update:Y="$emit('update:Y', $event)"
        @clickItem="name => $emit('clickItem', name)"
      />
    </div>
  </div>
</template>

<script>
import CounterComponent from '@/components/CounterComponent.vue'
import BusSignal from '@/components/BusSignal.vue'
import SignalButton from '@/components/SignalButton.vue'
import MemorySection from '@/components/MemorySection.vue'
import CalcSection from '@/components/CalcSection.vue'
import RegisterISection from '@/components/RegisterISection.vue'
import XRegisterSection from '@/components/XRegisterSection.vue'
import YRegisterSection from '@/components/YRegisterSection.vue'

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
    'update:X',
    'update:Y',
    'update:number-format',
  ],
}
</script>

<style scoped>
</style>
