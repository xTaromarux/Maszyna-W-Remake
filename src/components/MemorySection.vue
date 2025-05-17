<template>
    <div id="memory">
        <SignalButton id="wea" :signal="signals.wea" label="wea" divClassNames="pathDownOnRight"
            spanClassNames="arrowRightOnBottom" @click="handleClick('wea')" />

        <RegisterComponent classNames="register" id="aRegister" label="A" :model="A"
            @update:model="$emit('update:A', $event)" :formatNumber="formatNumber" />

        <div id="memoryTable">
            <span class="label">Mem Address</span>
            <span class="label">Value</span>
            <span class="label">Code</span>
            <span class="label">Address</span>
            <template v-for="(value, index) in mem" :key="index">
                <span :class="{ selected: A === index }">{{ formatNumber(index) }}</span>
                <div :class="{ selected: A === index }" class="inputWrapper">
                    <span>{{ formatNumber(mem[index]) }}</span>
                    <input type="number" v-model="mem[index]" />
                </div>
                <span :class="{ selected: A === index }">
                    {{ decToCommand(value) ? decToCommand(value).name : "EMPTY" }}
                </span>
                <span :class="{ selected: A === index }">
                    {{ formatNumber(decToArgument(value)) }}
                </span>
            </template>
        </div>

        <div id="operations">
            <SignalButton id="czyt" :signal="signals.czyt" label="czyt" spanClassNames="lineLeftOnBottom"
                @click="handleClick('czyt')" />
            <SignalButton id="pisz" :signal="signals.pisz" label="pisz" spanClassNames="lineLeftOnBottom"
                @click="handleClick('pisz')" />
        </div>

        <RegisterComponent id="sRegister" label="S" :model="S" @update:model="$emit('update:S', $event)"
            :formatNumber="formatNumber" />

        <div class="signals">
            <SignalButton id="wes" :signal="signals.wes" label="wes" divClassNames="pathUpOnRight"
                spanClassNames="arrowRightOnBottom" @click="handleClick('wes')" />
            <SignalButton id="wys" :signal="signals.wys" label="wys" divClassNames="pathDownOnLeft"
                spanClassNames="lineLeftOnBottom" @click="handleClick('wys')" />
        </div>
    </div>
</template>

<script>
import SignalButton from './SignalButton.vue';
import RegisterComponent from './RegisterComponent.vue';

export default {
    name: "MemorySection",
    props: {
        A: Number,
        S: Number,
        mem: Array,
        signals: Object,
        formatNumber: Function,
        decToCommand: Function,
        decToArgument: Function
    },
    emits: ['update:A', 'update:S'],
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
