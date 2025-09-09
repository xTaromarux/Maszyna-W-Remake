<template>
  <div class="calcConteiner">
    <WSRegisterSection
      v-if="!isMobile"
      :WS="WS"
      :visible="extras?.stack?.wsRegister"
      :signals="signals"
      :formatNumber="formatNumber"
      :number-format="numberFormat"
      @update:number-format="(val) => $emit('update:number-format', { field: 'WS', value: val })"
      :extras="extras"
      @update:programCounter="$emit('update:programCounter', $event)"
      @clickItem="(name) => $emit('clickItem', name)"
      @update:WS="$emit('update:WS', $event)"
    />

    <div id="calc">
      <div v-if="extras.jamlExtras" id="flags">
        FLAGI:
        <div title="Negative number in Acc" v-if="nFlag">N</div>
        <div title="Zero in Acc" v-if="zFlag">Z</div>
      </div>

      <div class="accSignals">
        <SignalButton
          v-if="extras.jamlExtras"
          id="iak"
          :signal="signals.iak"
          label="iak"
          spanClassNames="arrowRightOnBottom"
          @click="handleClick('iak')"
        />
        <SignalButton
          v-if="extras.jamlExtras"
          id="dak"
          :signal="signals.dak"
          label="dak"
          spanClassNames="arrowRightOnBottom"
          @click="handleClick('dak')"
        />
      </div>

      <RegisterComponent 
        id="accumulator" 
        label="AK" 
        :signed-dec="decSigned"
        :word-bits="wordBits"
        :model="ACC" 
        @update:model="$emit('update:ACC', $event)" 
        :number-format="accFormat"
        @update:number-format="$emit('update:accFormat', $event)"
        />
      <div class="jamlSignals">
        <SignalButton id="weak" :signal="signals.weak" label="weak" spanClassNames="arrowRightOnBottom" @click="handleClick('weak')" />
        <SignalButton id="przep" :signal="signals.przep" label="przep" spanClassNames="arrowRightOnBottom" @click="handleClick('przep')" />
        <SignalButton id="dod" :signal="signals.dod" label="dod" spanClassNames="arrowRightOnBottom" @click="handleClick('dod')" />
        <SignalButton id="ode" :signal="signals.ode" label="ode" spanClassNames="arrowRightOnBottom" @click="handleClick('ode')" />
        <SignalButton
          v-if="extras.jamlExtras"
          id="mno"
          :signal="signals.mno"
          label="mno"
          spanClassNames="arrowRightOnBottom"
          @click="handleClick('mno')"
        />
        <SignalButton
          v-if="extras.jamlExtras"
          id="dziel"
          :signal="signals.dziel"
          label="dziel"
          spanClassNames="arrowRightOnBottom"
          @click="handleClick('dziel')"
        />
        <SignalButton
          v-if="extras.jamlExtras"
          id="shr"
          :signal="signals.shr"
          label="shr"
          spanClassNames="arrowRightOnBottom"
          @click="handleClick('shr')"
        />
        <SignalButton
          v-if="extras.jamlExtras"
          id="shl"
          :signal="signals.shl"
          label="shl"
          spanClassNames="arrowRightOnBottom"
          @click="handleClick('shl')"
        />
        <SignalButton
          v-if="extras.jamlExtras"
          id="neg"
          :signal="signals.neg"
          label="neg"
          spanClassNames="arrowRightOnBottom"
          @click="handleClick('neg')"
        />
        <SignalButton
          v-if="extras.jamlExtras"
          id="lub"
          :signal="signals.lub"
          label="lub"
          spanClassNames="arrowRightOnBottom"
          @click="handleClick('lub')"
        />
        <SignalButton
          v-if="extras.jamlExtras"
          id="i"
          :signal="signals.i"
          label="i"
          spanClassNames="arrowRightOnBottom"
          @click="handleClick('i')"
        />
      </div>

      <RegisterComponent 
        id="jaml" 
        label="JAML" 
        :model="JAML" 
        @update:model="$emit('update:JAML', $event)" 
        :formatNumber="formatNumber"
        :isEnableEditValue="false"
        :showFormatSelector="false" />

      <template v-if="!isMobile">
        <SignalButton
          id="weja"
          :signal="signals.weja"
          label="weja"
          divClassNames="pathUpOnRight"
          spanClassNames="arrowRightOnBottom"
          @click="handleClick('weja')"
        />

        <SignalButton
          id="wyak"
          :signal="signals.wyak"
          label="wyak"
          divClassNames="pathDownOnRight"
          spanClassNames="arrowLeftOnBottom"
          @click="handleClick('wyak')"
        />
      </template>
    </div>
  </div>
</template>

<script>
import SignalButton from './SignalButton.vue';
import RegisterComponent from './RegisterComponent.vue';
import WSRegisterSection from './WSRegisterSection.vue';

export default {
  name: 'CalcSection',
  props: {
    extras: {
      type: Object,
      required: true,
    },
    signals: {
      type: Object,
      required: true,
    },
    ACC: {
      type: Number,
      required: true,
    },
    JAML: {
      type: Number,
      required: true,
    },
    WS: {
      type: Number,
      required: true,
    },
    decSigned: { 
      type: Boolean, 
      default: false 
    },
    wordBits: { 
      type: Number, 
      default: 12 
    }, 
    accFormat: {
      type: String,
      required: true,
    },
    numberFormat: {
      type: String,
      required: true,
    },
    formatNumber: {
      type: Function,
      required: true,
    },
    wordBits: { 
      type: Number, 
      default: 8 
    },
  },
  computed: {
    _mask()     { return (1 << this.wordBits) - 1 },
    _signMask() { return 1 << (this.wordBits - 1) },
    _accU()     { return this.ACC & this._mask },     // ACC zawinięte do wordBits
    nFlag()     { return (this._accU & this._signMask) !== 0 },
    zFlag()     { return this._accU === 0 },
  },
  data() {
    return {
      isMobile: window.innerWidth <= 768
    }
  },
  mounted() {
    window.addEventListener('resize', this.checkMobile)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkMobile)
  },
  emits: ['clickItem', 'update:ACC', 'update:JAML', 'update:WS', 'update:accFormat', 'update:jamlFormat', 'update:numberFormat'],
  components: {
    SignalButton,
    RegisterComponent,
    WSRegisterSection
  },
  methods: {
    handleClick(id) {
      this.$emit('clickItem', id);
    },
    checkMobile() {
      this.isMobile = window.innerWidth <= 768
    }
  },
};
</script>
