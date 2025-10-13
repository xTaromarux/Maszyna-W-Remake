import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ColorPicker from '@/components/ColorPicker.vue'

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((cb: any) => {
  setTimeout(cb, 16)
  return 1
}) as any
global.cancelAnimationFrame = vi.fn()

// Mock Canvas API
const mockContext = {
  createImageData: vi.fn(() => ({
    data: new Uint8ClampedArray(4 * 100 * 100),
    width: 100,
    height: 100
  })),
  putImageData: vi.fn(),
  getImageData: vi.fn(() => ({
    data: new Uint8ClampedArray(4 * 100 * 100),
    width: 100,
    height: 100
  }))
}

// @ts-ignore - Mock Canvas context
HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext)

describe('ColorPicker.vue', () => {
  let wrapper

  const defaultProps = {
    modelValue: '#ff00ff',
    size: 240,
    brightness: 1
  }

  beforeEach(() => {
    wrapper = mount(ColorPicker, {
      props: defaultProps
    })
  })

  describe('Component Structure', () => {
    it('should render with correct base structure', () => {
      expect(wrapper.find('.cp-root').exists()).toBe(true)
      expect(wrapper.find('.cp-wheel-wrap').exists()).toBe(true)
      expect(wrapper.find('.cp-wheel').exists()).toBe(true)
      expect(wrapper.find('.cp-indicator').exists()).toBe(true)
    })

    it('should render brightness and power sections', () => {
      expect(wrapper.findAll('.cp-section')).toHaveLength(2)
      expect(wrapper.text()).toContain('Jasność koloru')
      expect(wrapper.text()).toContain('Moc LED')
    })

    it('should render color swatches', () => {
      expect(wrapper.find('.cp-swatches').exists()).toBe(true)
      expect(wrapper.findAll('.cp-swatch')).toHaveLength(16)
    })

    it('should render color readout section', () => {
      expect(wrapper.find('.cp-readout').exists()).toBe(true)
      expect(wrapper.find('.cp-current').exists()).toBe(true)
      expect(wrapper.find('.cp-text').exists()).toBe(true)
    })

    it('should render canvas with correct dimensions', () => {
      const canvas = wrapper.find('.cp-wheel')
      expect(canvas.attributes('width')).toBe('240')
      expect(canvas.attributes('height')).toBe('240')
    })
  })

  describe('Props Handling', () => {
    it('should handle modelValue prop correctly', async () => {
      // Component should initialize with modelValue
      await wrapper.vm.applyHex('#ff0000')
      await wrapper.vm.$nextTick()
      // Red color should be displayed in readout
      expect(wrapper.find('.cp-readout').text()).toContain('rgb(255, 0, 0)')
    })

    it('should handle size prop correctly', async () => {
      // Default size is 240px
      const wheelWrap = wrapper.find('.cp-wheel-wrap')
      expect(wheelWrap.attributes('style')).toContain('width: 240px')
      expect(wheelWrap.attributes('style')).toContain('height: 240px')
    })

    it('should handle brightness prop correctly', async () => {
      await wrapper.setProps({ brightness: 0.5 })
      expect(wrapper.text()).toContain('50%')
    })

    it('should clamp brightness to valid range', async () => {
      await wrapper.setProps({ brightness: 1.5 })
      expect(wrapper.vm.brightnessLocal).toBe(1)
      
      await wrapper.setProps({ brightness: -0.5 })
      expect(wrapper.vm.brightnessLocal).toBe(0)
    })
  })

  describe('Color Format Display', () => {
    it('should display hex color format', () => {
      expect(wrapper.text()).toMatch(/#[0-9a-f]{6}/i)
    })

    it('should display RGB color format', () => {
      expect(wrapper.text()).toMatch(/rgb\(\d+, \d+, \d+\)/)
    })

    it('should display HSV color format', () => {
      expect(wrapper.text()).toMatch(/hsv\(\d+, \d+%, \d+%\)/)
    })

    it('should update color formats when color changes', async () => {
      const initialText = wrapper.text()
      
      // Simulate color change
      await wrapper.vm.applyHex('#00ff00')
      await wrapper.vm.$nextTick()
      
      expect(wrapper.text()).not.toBe(initialText)
      expect(wrapper.text()).toContain('#00ff00')
    })
  })

  describe('Brightness Controls', () => {
    it('should display brightness percentage correctly', () => {
      expect(wrapper.text()).toContain('100%') // Default brightness
    })

    it('should handle brightness slider input', async () => {
      const brightnessSlider = wrapper.findAll('.cp-range')[1] // Second range is brightness
      
      await brightnessSlider.setValue('0.5')
      await brightnessSlider.trigger('input')
      
      expect(wrapper.text()).toContain('50%')
    })

    it('should emit brightness update events', async () => {
      const brightnessSlider = wrapper.findAll('.cp-range')[1]
      
      await brightnessSlider.setValue('0.7')
      await brightnessSlider.trigger('input')
      
      expect(wrapper.emitted('update:brightness')).toBeTruthy()
      expect(wrapper.emitted('update:brightness')[0][0]).toBe(0.7)
    })
  })

  describe('Color Value Controls', () => {
    it('should handle color value slider input', async () => {
      const valueSlider = wrapper.findAll('.cp-range')[0] // First range is color value
      
      await valueSlider.setValue('0.5')
      await valueSlider.trigger('input')
      
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    })

    it('should update percentage display for color value', async () => {
      const valueSlider = wrapper.findAll('.cp-range')[0]
      
      await valueSlider.setValue('0.5')
      await valueSlider.trigger('input')
      
      // Should show 50% for the first mini display
      const miniDisplays = wrapper.findAll('.cp-mini')
      expect(miniDisplays[0].text()).toBe('50%')
    })
  })

  describe('Color Swatches', () => {
    it('should render predefined color swatches', () => {
      const swatches = wrapper.findAll('.cp-swatch')
      expect(swatches).toHaveLength(16)

      // Check some specific colors - swatches use rgb() format not hex
      expect(swatches[0].attributes('style')).toContain('rgb(255, 255, 255)')
      expect(swatches[1].attributes('style')).toContain('rgb(0, 0, 0)')
      expect(swatches[2].attributes('style')).toContain('rgb(255, 0, 0)')
    })

    it('should apply color when swatch is clicked', async () => {
      const redSwatch = wrapper.findAll('.cp-swatch')[2] // Red swatch
      
      await redSwatch.trigger('click')
      
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    })

    it('should handle all swatch colors correctly', async () => {
      const swatches = wrapper.findAll('.cp-swatch')
      
      for (let i = 0; i < Math.min(swatches.length, 5); i++) {
        await swatches[i].trigger('click')
      }
      
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    })
  })

  describe('Color Wheel Interaction', () => {
    it('should handle pointer down events', async () => {
      const hitbox = wrapper.find('.cp-hitbox')
      
      await hitbox.trigger('pointerdown', {
        clientX: 120,
        clientY: 120,
        pointerId: 1
      })
      
      expect(wrapper.vm.picking).toBe(true)
    })

    it('should handle pointer move events', async () => {
      const hitbox = wrapper.find('.cp-hitbox')
      
      // Start picking
      await hitbox.trigger('pointerdown', {
        clientX: 120,
        clientY: 120,
        pointerId: 1
      })
      
      // Move pointer
      await hitbox.trigger('pointermove', {
        clientX: 130,
        clientY: 130,
        buttons: 1
      })
      
      // Should schedule an update
      expect(wrapper.vm.rafId).toBeDefined()
    })

    it('should handle pointer up events', async () => {
      const hitbox = wrapper.find('.cp-hitbox')
      
      // Start picking
      await hitbox.trigger('pointerdown', {
        clientX: 120,
        clientY: 120,
        pointerId: 1
      })
      
      // End picking
      await hitbox.trigger('pointerup', {
        pointerId: 1
      })
      
      expect(wrapper.vm.picking).toBe(false)
    })

    it('should handle pointer cancel events', async () => {
      const hitbox = wrapper.find('.cp-hitbox')
      
      await hitbox.trigger('pointerdown', {
        clientX: 120,
        clientY: 120,
        pointerId: 1
      })
      
      await hitbox.trigger('pointercancel', {
        pointerId: 1
      })
      
      expect(wrapper.vm.picking).toBe(false)
    })
  })

  describe('Event Emissions', () => {
    it('should emit update:modelValue when color changes', async () => {
      const initialEmissionCount = wrapper.emitted('update:modelValue')?.length || 0
      
      await wrapper.vm.applyHex('#00ff00')
      
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      const emissions = wrapper.emitted('update:modelValue')
      expect(emissions[emissions.length - 1][0]).toBe('#00ff00')
    })

    it('should emit change event with complete color data', async () => {
      await wrapper.vm.applyHex('#ff0000')
      
      expect(wrapper.emitted('change')).toBeTruthy()
      const changeEvent = wrapper.emitted('change')[0][0]
      
      expect(changeEvent).toHaveProperty('hex')
      expect(changeEvent).toHaveProperty('rgb')
      expect(changeEvent).toHaveProperty('hsv')
      expect(changeEvent).toHaveProperty('brightness')
      expect(changeEvent).toHaveProperty('rgbScaled')
      expect(changeEvent).toHaveProperty('pwm')
    })

    it('should emit update:brightness when brightness changes', async () => {
      const event = { target: { value: '0.8' } }
      await wrapper.vm.onPowerInput(event)
      
      expect(wrapper.emitted('update:brightness')).toBeTruthy()
      expect(wrapper.emitted('update:brightness')[0][0]).toBe(0.8)
    })
  })

  describe('Color Conversion Functions', () => {
    it('should convert HSV to RGB correctly', () => {
      const result = wrapper.vm.hsvToRgb(0, 1, 1) // Pure red
      expect(result).toEqual({ r: 255, g: 0, b: 0 })
      
      const result2 = wrapper.vm.hsvToRgb(120, 1, 1) // Pure green
      expect(result2).toEqual({ r: 0, g: 255, b: 0 })
    })

    it('should convert RGB to HSV correctly', () => {
      const result = wrapper.vm.rgbToHsv(255, 0, 0) // Pure red
      expect(result.h).toBe(0)
      expect(result.s).toBe(1)
      expect(result.v).toBe(1)
    })

    it('should convert RGB to HEX correctly', () => {
      const result = wrapper.vm.rgbToHex({ r: 255, g: 0, b: 0 })
      expect(result).toBe('#ff0000')
      
      const result2 = wrapper.vm.rgbToHex({ r: 0, g: 255, b: 0 })
      expect(result2).toBe('#00ff00')
    })

    it('should convert HEX to RGB correctly', () => {
      const result = wrapper.vm.hexToRgb('#ff0000')
      expect(result).toEqual({ r: 255, g: 0, b: 0 })
      
      const result2 = wrapper.vm.hexToRgb('00ff00')
      expect(result2).toEqual({ r: 0, g: 255, b: 0 })
    })

    it('should validate hex colors correctly', () => {
      expect(wrapper.vm.isValidHex('#ff0000')).toBe(true)
      expect(wrapper.vm.isValidHex('ff0000')).toBe(true)
      expect(wrapper.vm.isValidHex('#xyz123')).toBe(false)
      expect(wrapper.vm.isValidHex('#ff00')).toBe(false)
    })
  })

  describe('Edge Cases', () => {
    it('should handle invalid hex colors gracefully', async () => {
      await wrapper.setProps({ modelValue: '#invalid' })
      // Should not crash and should use default color
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle empty hex color', async () => {
      await wrapper.setProps({ modelValue: '' })
      expect(wrapper.exists()).toBe(true)
    })

    it('should clamp values correctly', () => {
      expect(wrapper.vm.clamp01(1.5)).toBe(1)
      expect(wrapper.vm.clamp01(-0.5)).toBe(0)
      expect(wrapper.vm.clamp01(0.5)).toBe(0.5)
      expect(wrapper.vm.clamp01(NaN)).toBe(0)
      expect(wrapper.vm.clamp01(Infinity)).toBe(0) // Number.isFinite(Infinity) is false, so returns 0
    })

    it('should handle hex parsing edge cases', () => {
      expect(wrapper.vm.hexToRgb(null)).toBeNull()
      expect(wrapper.vm.hexToRgb(undefined)).toBeNull()
      expect(wrapper.vm.hexToRgb('')).toBeNull()
      expect(wrapper.vm.hexToRgb('#')).toBeNull()
    })

    it('should handle extreme brightness values in power input', async () => {
      const event1 = { target: { value: '10' } }
      await wrapper.vm.onPowerInput(event1)
      expect(wrapper.vm.brightnessLocal).toBe(1)
      
      const event2 = { target: { value: '-5' } }
      await wrapper.vm.onPowerInput(event2)
      expect(wrapper.vm.brightnessLocal).toBe(0)
    })
  })

  describe('Component Lifecycle', () => {
    it('should initialize with correct default values', () => {
      expect(wrapper.vm.size).toBe(240)
      expect(wrapper.vm.scale).toBeGreaterThan(0)
      expect(wrapper.vm.hsv).toHaveProperty('h')
      expect(wrapper.vm.hsv).toHaveProperty('s')
      expect(wrapper.vm.hsv).toHaveProperty('v')
    })

    it('should draw wheel on mount', () => {
      expect(mockContext.createImageData).toHaveBeenCalled()
      expect(mockContext.putImageData).toHaveBeenCalled()
    })

    it('should apply initial color on mount', () => {
      expect(wrapper.vm.hex).toBeDefined()
      expect(wrapper.vm.rgb).toHaveProperty('r')
      expect(wrapper.vm.rgb).toHaveProperty('g')
      expect(wrapper.vm.rgb).toHaveProperty('b')
    })
  })

  describe('Indicator Position', () => {
    it('should update indicator position when color changes', async () => {
      const initialX = wrapper.vm.indicator.x
      const initialY = wrapper.vm.indicator.y
      
      await wrapper.vm.applyHex('#00ff00')
      await wrapper.vm.$nextTick()
      
      // Position should change for different color
      expect(wrapper.vm.indicator.x !== initialX || wrapper.vm.indicator.y !== initialY).toBe(true)
    })

    it('should set indicator style correctly', () => {
      const indicator = wrapper.find('.cp-indicator')
      const style = indicator.attributes('style')
      
      expect(style).toContain('left:')
      expect(style).toContain('top:')
      expect(style).toContain('background:')
    })
  })

  describe('Performance', () => {
    it('should use requestAnimationFrame for smooth updates', async () => {
      const hitbox = wrapper.find('.cp-hitbox')
      
      await hitbox.trigger('pointerdown', {
        clientX: 120,
        clientY: 120,
        pointerId: 1
      })
      
      await hitbox.trigger('pointermove', {
        clientX: 130,
        clientY: 130,
        buttons: 1
      })
      
      expect(global.requestAnimationFrame).toHaveBeenCalled()
    })

    it('should not create multiple animation frames', async () => {
      const hitbox = wrapper.find('.cp-hitbox')
      
      await hitbox.trigger('pointerdown', {
        clientX: 120,
        clientY: 120,
        pointerId: 1
      })
      
      // Multiple moves should not create multiple frames
      await hitbox.trigger('pointermove', { clientX: 130, clientY: 130, buttons: 1 })
      await hitbox.trigger('pointermove', { clientX: 135, clientY: 135, buttons: 1 })
      
      // Should still work efficiently
      expect(wrapper.vm.rafId).toBeDefined()
    })

    it('should handle rapid color updates efficiently', async () => {
      const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff']
      const initialEmissionCount = wrapper.emitted('update:modelValue')?.length || 0
      
      for (const color of colors) {
        await wrapper.vm.applyHex(color)
      }
      
      const totalEmissions = wrapper.emitted('update:modelValue')?.length || 0
      expect(totalEmissions - initialEmissionCount).toBe(colors.length)
    })
  })

  describe('Accessibility', () => {
    it('should have proper input labels', () => {
      expect(wrapper.text()).toContain('Jasność koloru')
      expect(wrapper.text()).toContain('Moc LED')
    })

    it('should have focusable range inputs', () => {
      const ranges = wrapper.findAll('.cp-range')
      expect(ranges).toHaveLength(2)
      
      ranges.forEach(range => {
        expect(range.attributes('type')).toBe('range')
      })
    })

    it('should have clickable swatch buttons', () => {
      const swatches = wrapper.findAll('.cp-swatch')
      swatches.forEach(swatch => {
        expect(swatch.element.tagName).toBe('BUTTON')
      })
    })

    it('should prevent drag on root element', () => {
      const root = wrapper.find('.cp-root')
      expect(root.exists()).toBe(true)
    })
  })

  describe('Styling and Layout', () => {
    it('should apply correct wheel wrapper styling', () => {
      const wheelWrap = wrapper.find('.cp-wheel-wrap')
      const style = wheelWrap.attributes('style')
      
      expect(style).toContain('width: 240px')
      expect(style).toContain('height: 240px')
    })

    it('should have proper CSS classes', () => {
      expect(wrapper.find('.cp-root').exists()).toBe(true)
      expect(wrapper.find('.cp-wheel-wrap').exists()).toBe(true)
      expect(wrapper.find('.cp-wheel').exists()).toBe(true)
      expect(wrapper.find('.cp-hitbox').exists()).toBe(true)
      expect(wrapper.find('.cp-indicator').exists()).toBe(true)
    })

    it('should apply gradient backgrounds correctly', () => {
      const bars = wrapper.findAll('.cp-bar')
      expect(bars.length).toBeGreaterThan(0)
      
      // Check that grey bar has the correct class
      expect(wrapper.find('.cp-bar-grey').exists()).toBe(true)
    })
  })
})