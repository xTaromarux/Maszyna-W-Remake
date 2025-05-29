<template>
    <div :id="id" :class="[classNames]">
        <span :title="fullName">{{ label }}</span><span>:</span> 
        <div class="inputWrapper">
            <span>{{ formatNumber(model) }}</span>
            <input type="number" class="hoverInput" :value="model" @input="updateValue" />
        </div>
    </div>
</template>

<script>
export default {
    name: "RegisterComponent",
    props: {
        label: String,
        id: String,
        classNames: { 
            type: String, 
            default: 'register' 
        },
        model: [Number],
        formatNumber: {
            type: Function,
            required: true,
        }
    },
    computed: {
        fullName() {
            const names = {
                AK: 'Akumulator',
                X: 'Rejestr X',
                Y: 'Rejestr Y',
                I: 'Rejestr adresowy I',
                S: 'Rejestr S',
                A: 'Rejestr A',
                JAML: 'Rejestr JAML',
            };
            return names[this.label] || this.label;
        }
    },
    methods: {
        updateValue(event) {
            this.$emit('update:model', Number(event.target.value));
        }
    },
};
</script>

<style scoped>
.register span:first-child {
    font-weight: bold;
    position: relative;
    cursor: help;
}

.register span:first-child:hover::after {
    content: attr(title);
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 14px;
    white-space: nowrap;
    z-index: 1000;
}
</style>
