<template>
    <div :id="id" :class="[classNames, edgeClass]">
        <span :title="fullName" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">{{ label }}</span><span>:</span> 
        <div class="inputWrapper">
            <span>{{ formatNumber(model) }}</span>
            <input inputmode="numeric" pattern="[0-9]*" type="number" class="hoverInput" :value="model" @input="updateValue" />
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
    data() {
        return {
            edgeClass: ''
        }
    },
    computed: {
        fullName() {
            const names = {
                AK: 'Akumulator',
                X: 'Rejestr X',
                Y: 'Rejestr Y',
                I: 'Rejestr I (adresowy)',
                L: 'Licznik',
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
        },
        handleMouseEnter(event) {
            const element = event.target;
            const rect = element.getBoundingClientRect();
            const windowWidth = window.innerWidth;
            
            // Check if element is near right edge (within 150px)
            if (rect.right > windowWidth - 150) {
                this.edgeClass = 'edge-right';
            }
            // Check if element is near left edge (within 150px)
            else if (rect.left < 150) {
                this.edgeClass = 'edge-left';
            }
            else {
                this.edgeClass = '';
            }
        },
        handleMouseLeave() {
            this.edgeClass = '';
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
    bottom: calc(100% + 5px);
    background-color: rgba(0, 0, 0, 0.98);
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: normal;
    white-space: nowrap;
    z-index: 9999;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    
    /* Smart positioning to avoid going off screen */
    left: 50%;
    transform: translateX(-50%);
    
    /* Fallback positioning for edge cases */
    min-width: max-content;
    max-width: 180px;
    
    /* Ensure full coverage */
    backdrop-filter: blur(2px);
    border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Tooltip arrow */
.register span:first-child:hover::before {
    content: '';
    position: absolute;
    bottom: calc(100% + 1px);
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-top-color: rgba(0, 0, 0, 0.98);
    z-index: 10000;
}

/* Alternative positioning for right edge elements */
.register:last-child span:first-child:hover::after,
.register.edge-right span:first-child:hover::after {
    left: auto;
    right: 0;
    transform: none;
}

.register:last-child span:first-child:hover::before,
.register.edge-right span:first-child:hover::before {
    left: auto;
    right: 15px;
    transform: none;
}

/* Alternative positioning for left edge elements */
.register:first-child span:first-child:hover::after,
.register.edge-left span:first-child:hover::after {
    left: 0;
    right: auto;
    transform: none;
}

.register:first-child span:first-child:hover::before,
.register.edge-left span:first-child:hover::before {
    left: 15px;
    right: auto;
    transform: none;
}

/* Mobile responsive */
@media (max-width: 768px) {
    .register span:first-child:hover::after {
        position: fixed;
        bottom: auto;
        top: 50%;
        left: 50%;
        right: auto;
        transform: translate(-50%, -50%);
        max-width: 90vw;
        white-space: normal;
        text-align: center;
        z-index: 10001;
    }
    
    .register span:first-child:hover::before {
        display: none;
    }
}

/* Extra safety for very wide screens */
@media (min-width: 1200px) {
    .register span:first-child:hover::after {
        max-width: 200px;
    }
}
</style>
