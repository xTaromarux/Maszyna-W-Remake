<template>
    <div id="calc">
        <div v-if="extras.jamlExtras" id="flags">
            FLAGS:
            <div title="Negative number in Acc" v-if="ACC < 0">N</div>
            <div title="Zero in Acc" v-if="ACC === 0">Z</div>
        </div>

        <div class="accSignals">
            <SignalButton v-if="extras.jamlExtras" id="iak" :signal="signals.iak" label="wei"
                spanClassNames="arrowRightOnBottom" @click="handleClick('iak')" />
            <SignalButton v-if="extras.jamlExtras" id="dak" :signal="signals.dak" label="dak"
                spanClassNames="arrowRightOnBottom" @click="handleClick('dak')" />
        </div>

        <RegisterComponent id="accumulator" label="AK" :model="ACC" @update:model="$emit('update:ACC', $event)"
            :formatNumber="formatNumber" />

        <div class="jamlSignals">
            <SignalButton id="weak" :signal="signals.weak" label="weak" spanClassNames="arrowRightOnBottom"
                @click="handleClick('weak')" />
            <SignalButton id="dod" :signal="signals.dod" label="dod" spanClassNames="lineRightOnBottom"
                @click="handleClick('dod')" />
            <SignalButton id="ode" :signal="signals.ode" label="ode" spanClassNames="lineRightOnBottom"
                @click="handleClick('ode')" />
            <SignalButton id="przep" :signal="signals.przep" label="przep" spanClassNames="lineRightOnBottom"
                @click="handleClick('przep')" />
            <SignalButton v-if="extras.jamlExtras" id="mno" :signal="signals.mno" label="mno"
                spanClassNames="lineRightOnBottom" @click="handleClick('mno')" />
            <SignalButton v-if="extras.jamlExtras" id="dziel" :signal="signals.dziel" label="dziel"
                spanClassNames="lineRightOnBottom" @click="handleClick('dziel')" />
            <SignalButton v-if="extras.jamlExtras" id="shr" :signal="signals.shr" label="shr"
                spanClassNames="lineRightOnBottom" @click="handleClick('shr')" />
            <SignalButton v-if="extras.jamlExtras" id="shl" :signal="signals.shl" label="shl"
                spanClassNames="lineRightOnBottom" @click="handleClick('shl')" />
            <SignalButton v-if="extras.jamlExtras" id="neg" :signal="signals.neg" label="neg"
                spanClassNames="lineRightOnBottom" @click="handleClick('neg')" />
            <SignalButton v-if="extras.jamlExtras" id="lub" :signal="signals.lub" label="lub"
                spanClassNames="lineRightOnBottom" @click="handleClick('lub')" />
            <SignalButton v-if="extras.jamlExtras" id="i" :signal="signals.i" label="i"
                spanClassNames="lineRightOnBottom" @click="handleClick('i')" />
        </div>

        <div id="jaml" class="register">
            <span>JAML</span>
        </div>

        <!-- ??? PO CO TO JEST ??? -->

        <!-- <div v-if="extras.showInvisibleRegisters" class="inputWrapper">
              <span>{{ formatNumber(JAML) }}</span>
              <input type="number" v-model="JAML">
            </div> -->

        <SignalButton id="weja" :signal="signals.weja" label="weja" divClassNames="pathUpOnRight"
            spanClassNames="arrowRightOnBottom" @click="handleClick('weja')" />

        <SignalButton id="wyak" :signal="signals.wyak" label="wyak" divClassNames="pathDownOnRight"
            spanClassNames="arrowLeftOnBottom" @click="handleClick('wyak')" />
    </div>
</template>

<script>
import SignalButton from './SignalButton.vue';
import RegisterComponent from './RegisterComponent.vue';

export default {
    name: "CalcSection",
    props: {
        extras: Object,
        signals: Object,
        ACC: Number,
        JAML: Number,
        formatNumber: Function
    },
    components: {
        SignalButton,
        RegisterComponent
    },
    methods: {
        handleClick(id) {
            this.$emit('clickItem', id);
        }
    }
}
</script>
