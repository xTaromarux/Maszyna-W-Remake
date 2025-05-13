<template>
    <div v-if="visible" id="yRegister">
        <SignalButton id="wyy" :signal="signals.wyy" label="wyy" divClassNames="pathUpOnRight"
            spanClassNames="arrowRightOnBottom" @click="handleClick('wyy')" />
        <RegisterComponent label="Y" :model="Y" @update:model="$emit('update:Y', $event)"
            :formatNumber="formatNumber" />
        <SignalButton id="wey" :signal="signals.wey" label="wey" divClassNames="pathDownOnLeft"
            spanClassNames="lineLeftOnBottom" @click="handleClick('wey')" />
    </div>
</template>

<script>
import SignalButton from './SignalButton.vue';
import RegisterComponent from './RegisterComponent.vue';

export default {
    name: "YRegisterSection",
    props: {
        visible: Boolean,
        Y: Number,
        signals: Object,
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
};
</script>
