<template>
    <div class="register">
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
        model: [Number],
        formatNumber: {
            type: Function,
            required: true,
        }
    },
    methods: {
        updateValue(event) {
            this.$emit('update:model', event.target.value);
        }
    },
};
</script>
