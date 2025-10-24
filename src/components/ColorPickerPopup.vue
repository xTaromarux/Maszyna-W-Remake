<template>
  <div v-if="visible" class="color-popup-overlay" @click.self="close">
    <div class="color-popup" @click.stop>
      <div class="color-popup-header">
        <h3>{{ title }}</h3>
        <button class="close-btn" @click="close">&times;</button>
      </div>
      
      <div class="color-popup-content">
        <ColorPicker 
          v-model="localColor" 
          v-model:brightness="localBrightness" 
          :size="260" 
          @change="onColorChange" 
        />
        
        <div class="color-preview">
          <div class="preview-box" :style="{ backgroundColor: localColor }"></div>
          <div class="color-info">
            <span>{{ localColor }}</span>
            <span>Jasność: {{ Math.round(localBrightness * 100) }}%</span>
          </div>
        </div>
      </div>
      
      <div class="color-popup-footer">
        <button class="cancel-btn" @click="close">Anuluj</button>
        <button class="apply-btn" @click="apply">Zastosuj</button>
      </div>
    </div>
  </div>
</template>

<script>
import ColorPicker from './ColorPicker.vue';

export default {
  name: 'ColorPickerPopup',
  components: { ColorPicker },
  props: {
    visible: { type: Boolean, default: false },
    title: { type: String, required: true },
    color: { type: String, default: '#ff0000' },
    brightness: { type: Number, default: 1 }
  },
  emits: ['close', 'apply'],
  data() {
    return {
      localColor: this.color,
      localBrightness: this.brightness,
      currentColorData: null
    };
  },
  watch: {
    color(newVal) {
      this.localColor = newVal;
    },
    brightness(newVal) {
      this.localBrightness = newVal;
    },
    visible(newVal) {
      if (newVal) {
        // Reset do wartości props przy otwieraniu
        this.localColor = this.color;
        this.localBrightness = this.brightness;
      }
    }
  },
  methods: {
    onColorChange(colorData) {
      this.currentColorData = colorData;
    },
    
    close() {
      this.$emit('close');
    },
    
    apply() {
      if (this.currentColorData) {
        this.$emit('apply', {
          color: this.localColor,
          brightness: this.localBrightness,
          colorData: this.currentColorData
        });
      }
      this.close();
    }
  }
};
</script>

<style scoped>
.color-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.color-popup {
  background: var(--panelBackgroundColor);
  border-radius: var(--default-border-radius);
  border: 1px solid var(--panelOutlineColor);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  width: 90vw;
  max-height: 90vh;
  overflow: hidden;
  animation: popupSlideIn 0.3s ease-out;
}

@keyframes popupSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.color-popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  border-bottom: 1px solid var(--panelOutlineColor);
  background: var(--panelBackgroundColorSecondary, rgba(0, 0, 0, 0.1));
}

.color-popup-header h3 {
  margin: 0;
  color: var(--fontColor);
  font-size: 1.1rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: var(--fontColor);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;
}

.close-btn:hover {
  background: var(--buttonHoverColor);
}

.color-popup-content {
  padding: 20px;
  overflow-y: auto;
  max-height: 60vh;
}

.color-preview {
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: var(--panelBackgroundColorSecondary, rgba(0, 0, 0, 0.1));
  border-radius: var(--default-border-radius);
  border: 1px solid var(--panelOutlineColor);
}

.preview-box {
  width: 60px;
  height: 60px;
  border-radius: var(--default-border-radius);
  border: 2px solid var(--panelOutlineColor);
  flex-shrink: 0;
}

.color-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
  color: var(--fontColor);
  font-size: 0.9rem;
}

.color-popup-footer {
  display: flex;
  gap: 10px;
  padding: 15px 20px;
  border-top: 1px solid var(--panelOutlineColor);
  background: var(--panelBackgroundColorSecondary, rgba(0, 0, 0, 0.1));
}

.cancel-btn,
.apply-btn {
  flex: 1;
  padding: 10px 20px;
  border-radius: var(--default-border-radius);
  border: 1px solid var(--panelOutlineColor);
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.cancel-btn {
  background: var(--buttonBackgroundColor);
  color: var(--buttonTextColor);
}

.cancel-btn:hover {
  background: var(--buttonHoverColor);
}

.apply-btn {
  background: #003c7d;
  color: white;
  border-color: #003c7d;
}

.apply-btn:hover {
  background: #0056b3;
  border-color: #0056b3;
}
</style>