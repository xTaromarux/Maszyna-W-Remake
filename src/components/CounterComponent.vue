<template>
    <div id="counter">
        <!-- Signal Button Component -->
        <SignalButton id="il" :signal="signals.il" @click="handleClick('il')" label="il"
            spanClassNames="arrowRightOnBottom" />

        <RegisterComponent label="L" :model="programCounter" @update:model="$emit('update:programCounter', $event)" :formatNumber="formatNumber" />


        <SignalButton id="dl" v-if="extras.dl" :signal="signals.dl" @click="handleClick('dl')" label="dl"
            spanClassNames="arrowLeftOnBottom" />

        <SignalButton id="wyl" :signal="signals.wyl" @click="handleClick('wyl')" label="wyl"
            class="long pathDownOnLeft" spanClassNames="arrowLeftOnBottom" />

        <SignalButton id="wel" :signal="signals.wel" @click="handleClick('wel')" label="wel"
            class="impulse pathUpOnRight" spanClassNames="arrowRightOnBottom" />
    </div>
</template>


<script>
import SignalButton from './SignalButton.vue';
import RegisterComponent from './RegisterComponent.vue';

export default {
    name: "CounterComponent",
    components: {
        SignalButton,
        RegisterComponent
    },
    props: {
        L: {
            type: Number,
            required: true
        },
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
        handleClick(id) {
            this.$emit('clickItem', id);
        },
    }
};
</script>

<style scoped></style>