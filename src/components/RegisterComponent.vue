<template>
    <div :id="id" :class="[classNames]">
        <span>{{ label }}</span><span>:</span>
        <div class="inputWrapper">
            <span>{{ formatNumber(model) }}</span>
            <input type="number" :value="model" @input="updateValue" />
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
}
</style>
