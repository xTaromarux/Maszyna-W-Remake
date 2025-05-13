<template>
    <div id="counter">
        <!-- Signal Button Component -->
        <SignalButton id="il" :signal="signals.il" @click="handleSignalClick('il')" label="il" spanClassNames="arrowRightOnBottom" />

        <span class="register">
            <span>L</span><span>:</span>
            <div class="inputWrapper">
                <span>{{ formatNumber(programCounter) }}</span>
                <input type="number" :value="programCounter" @input="updateProgramCounter($event.target.value)" />
            </div>
        </span>

        <SignalButton id="dl" v-if="extras.dl" :signal="signals.dl" @click="handleSignalClick('dl')" label="dl" spanClassNames="arrowLeftOnBottom" />

        <SignalButton id="wyl" :signal="signals.wyl" @click="handleSignalClick('wyl')" label="wyl"
            class="long pathDownOnLeft" spanClassNames="arrowLeftOnBottom" />

        <SignalButton id="wel" :signal="signals.wel" @click="handleSignalClick('wel')" label="wel"
            class="impulse pathUpOnRight" spanClassNames="arrowRightOnBottom" />
    </div>
</template>


<script>
import SignalButton from './SignalButton.vue';

export default {
    name: "CounterComponent",
    components: {
        SignalButton,
    },
    props: {
        signals: {
            type: Object,
            required: true
        },
        programCounter: {
            type: Number,
            required: true
        },
        extras: {
            type: Object,
            required: true
        },
        formatNumber: {
            type: Function,
            required: true,
        }
    },
    methods: {
        handleSignalClick(signal) {
            this.$emit(`${signal}Click`);
        },
        updateProgramCounter(value) {
            this.$emit("update:programCounter", Number(value));
        }
    }
};
</script>

<style scoped>
</style>