<template>
  <div id="calc">
    <div v-if="extras.jamlExtras" id="flags">
      FLAGI:
      <div title="Negative number in Acc" v-if="ACC < 0">N</div>
      <div title="Zero in Acc" v-if="ACC === 0">Z</div>
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
      :model="ACC"
      @update:model="$emit('update:ACC', $event)"
      :number-format="accFormat"
      @update:number-format="$emit('update:accFormat', $event)"
    />

    <div class="jamlSignals">
      <SignalButton id="przep" :signal="signals.przep" label="przep" spanClassNames="arrowRightOnBottom" @click="handleClick('przep')" />
      <SignalButton id="dod" :signal="signals.dod" label="dod" spanClassNames="arrowRightOnBottom" @click="handleClick('dod')" />
      <SignalButton id="ode" :signal="signals.ode" label="ode" spanClassNames="arrowRightOnBottom" @click="handleClick('ode')" />
      <SignalButton id="przp" :signal="signals.przp" label="przp" spanClassNames="arrowRightOnBottom" @click="handleClick('przp')" />
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
      :number-format="jamlFormat"
      @update:number-format="$emit('update:jamlFormat', $event)"
      :show-format-selector="false"
    />

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
  </div>
</template>

<script>
import SignalButton from './SignalButton.vue';
import RegisterComponent from './RegisterComponent.vue';

export default {
  name: 'CalcSection',
  props: {
    extras: Object,
    signals: Object,
    ACC: Number,
    JAML: Number,
    accFormat: {
      type: String,
      required: true,
    },
    jamlFormat: {
      type: String,
      required: true,
    },
  },
  emits: ['clickItem', 'update:ACC', 'update:JAML', 'update:accFormat', 'update:jamlFormat'],
  components: {
    SignalButton,
    RegisterComponent,
  },
  methods: {
    handleClick(id) {
      this.$emit('clickItem', id);
    },
  },
};
</script>
