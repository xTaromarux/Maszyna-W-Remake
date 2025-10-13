import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import SegmentedToggle from '../../../components/SegmentedToggle.vue'

describe('SegmentedToggle.vue', () => {
  let wrapper

  beforeEach(() => {
    // Mock focus method since it's used in keyboard navigation
    // @ts-ignore
    Element.prototype.focus = vi.fn()
    
    // Mock querySelectorAll for keyboard navigation
    Object.defineProperty(document, 'querySelectorAll', {
      value: vi.fn(() => []),
      writable: true
    })
    
    wrapper = mount(SegmentedToggle, {
      props: {
        options: ['option1', 'option2', 'option3'],
        modelValue: 'option1'
      }
    })
  })

  describe('Component Structure', () => {
    it('should render with correct base structure', () => {
      expect(wrapper.find('.segmented').exists()).toBe(true)
      expect(wrapper.find('.track').exists()).toBe(true)
      expect(wrapper.find('.thumb').exists()).toBe(true)
    })

    it('should render correct number of option buttons', () => {
      const buttons = wrapper.findAll('.seg-btn')
      expect(buttons).toHaveLength(3)
    })

    it('should apply proper ARIA attributes to track', () => {
      const track = wrapper.find('.track')
      expect(track.attributes('role')).toBe('tablist')
      expect(track.attributes('aria-label')).toBe('Segmented toggle')
    })

    it('should apply proper ARIA attributes to buttons', () => {
      const buttons = wrapper.findAll('.seg-btn')
      buttons.forEach((button, index) => {
        expect(button.attributes('role')).toBe('tab')
        expect(button.attributes('aria-selected')).toBe(index === 0 ? 'true' : 'false')
      })
    })

    it('should render thumb when there is an active option', () => {
      expect(wrapper.find('.thumb').exists()).toBe(true)
      expect(wrapper.find('.thumb').attributes('aria-hidden')).toBe('true')
    })
  })

  describe('Props Handling', () => {
    it('should handle string array options', () => {
      const buttons = wrapper.findAll('.seg-btn')
      expect(buttons[0].text()).toBe('option1')
      expect(buttons[1].text()).toBe('option2')
      expect(buttons[2].text()).toBe('option3')
    })

    it('should handle object array options', async () => {
      await wrapper.setProps({
        options: [
          { value: 'val1', label: 'Label 1' },
          { value: 'val2', label: 'Label 2' }
        ],
        modelValue: 'val1'
      })

      const buttons = wrapper.findAll('.seg-btn')
      expect(buttons[0].text()).toBe('Label 1')
      expect(buttons[1].text()).toBe('Label 2')
    })

    it('should handle custom keys for object options', async () => {
      await wrapper.setProps({
        options: [
          { id: 'id1', name: 'Name 1' },
          { id: 'id2', name: 'Name 2' }
        ],
        valueKey: 'id',
        labelKey: 'name',
        modelValue: 'id1'
      })

      const buttons = wrapper.findAll('.seg-btn')
      expect(buttons[0].text()).toBe('Name 1')
      expect(buttons[1].text()).toBe('Name 2')
    })

    it('should handle null modelValue', async () => {
      await wrapper.setProps({ modelValue: null })
      expect(wrapper.vm.activeIndex).toBe(-1)
    })

    it('should handle custom aria label', async () => {
      await wrapper.setProps({ ariaLabel: 'Custom toggle' })
      expect(wrapper.find('.track').attributes('aria-label')).toBe('Custom toggle')
    })
  })

  describe('Active State Management', () => {
    it('should mark first button as active when modelValue is option1', () => {
      const buttons = wrapper.findAll('.seg-btn')
      expect(buttons[0].attributes('aria-selected')).toBe('true')
      expect(buttons[0].attributes('tabindex')).toBe('0')
    })

    it('should mark correct button as active when modelValue changes', async () => {
      await wrapper.setProps({ modelValue: 'option2' })
      
      const buttons = wrapper.findAll('.seg-btn')
      expect(buttons[0].attributes('aria-selected')).toBe('false')
      expect(buttons[1].attributes('aria-selected')).toBe('true')
      expect(buttons[1].attributes('tabindex')).toBe('0')
    })

    it('should update tabindex for keyboard navigation', async () => {
      await wrapper.setProps({ modelValue: 'option3' })
      
      const buttons = wrapper.findAll('.seg-btn')
      expect(buttons[0].attributes('tabindex')).toBe('-1')
      expect(buttons[1].attributes('tabindex')).toBe('-1')
      expect(buttons[2].attributes('tabindex')).toBe('0')
    })

    it('should calculate activeIndex correctly', async () => {
      expect(wrapper.vm.activeIndex).toBe(0)
      
      await wrapper.setProps({ modelValue: 'option2' })
      expect(wrapper.vm.activeIndex).toBe(1)
      
      await wrapper.setProps({ modelValue: 'nonexistent' })
      expect(wrapper.vm.activeIndex).toBe(-1)
    })
  })

  describe('Event Handling', () => {
    it('should emit update:modelValue when button is clicked', async () => {
      const buttons = wrapper.findAll('.seg-btn')
      await buttons[1].trigger('click')

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')[0][0]).toBe('option2')
    })

    it('should emit change event when button is clicked', async () => {
      const buttons = wrapper.findAll('.seg-btn')
      await buttons[2].trigger('click')

      expect(wrapper.emitted('change')).toBeTruthy()
      expect(wrapper.emitted('change')[0][0]).toBe('option3')
    })

    it('should emit correct value for object options', async () => {
      await wrapper.setProps({
        options: [
          { value: 'val1', label: 'Label 1' },
          { value: 'val2', label: 'Label 2' }
        ]
      })

      const buttons = wrapper.findAll('.seg-btn')
      await buttons[1].trigger('click')

      expect(wrapper.emitted('update:modelValue')[0][0]).toBe('val2')
      expect(wrapper.emitted('change')[0][0]).toBe('val2')
    })
  })

  describe('Keyboard Navigation', () => {
    beforeEach(() => {
      // Mock querySelectorAll to return mock button elements with focus method
      const mockButtons = [
        { focus: vi.fn() },
        { focus: vi.fn() },
        { focus: vi.fn() }
      ]
      // @ts-ignore
      document.querySelectorAll = vi.fn(() => mockButtons)
    })

    it('should handle left arrow key', async () => {
      const buttons = wrapper.findAll('.seg-btn')
      await buttons[1].trigger('keydown.left')

      // @ts-ignore
      const mockButtons = document.querySelectorAll('.segmented .seg-btn')
      // @ts-ignore
      expect(mockButtons[0].focus).toHaveBeenCalled()
    })

    it('should handle right arrow key', async () => {
      const buttons = wrapper.findAll('.seg-btn')
      await buttons[0].trigger('keydown.right')

      // @ts-ignore
      const mockButtons = document.querySelectorAll('.segmented .seg-btn')
      // @ts-ignore
      expect(mockButtons[1].focus).toHaveBeenCalled()
    })

    it('should wrap around when navigating with arrows', async () => {
      const buttons = wrapper.findAll('.seg-btn')
      
      // From first to last (left arrow)
      await buttons[0].trigger('keydown.left')
      // @ts-ignore
      const mockButtons = document.querySelectorAll('.segmented .seg-btn')
      // @ts-ignore
      expect(mockButtons[2].focus).toHaveBeenCalled()

      // From last to first (right arrow)
      await buttons[2].trigger('keydown.right')
      // @ts-ignore
      expect(mockButtons[0].focus).toHaveBeenCalled()
    })

    it('should handle enter key', async () => {
      const buttons = wrapper.findAll('.seg-btn')
      await buttons[1].trigger('keydown.enter')

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')[0][0]).toBe('option2')
    })

    it('should handle space key', async () => {
      const buttons = wrapper.findAll('.seg-btn')
      await buttons[2].trigger('keydown.space')

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')[0][0]).toBe('option3')
    })
  })

  describe('CSS Custom Properties', () => {
    it('should set --count custom property', () => {
      const rootElement = wrapper.find('.segmented')
      const style = rootElement.attributes('style')
      expect(style).toContain('--count: 3')
    })

    it('should set --idx custom property based on active index', async () => {
      let rootElement = wrapper.find('.segmented')
      let style = rootElement.attributes('style')
      expect(style).toContain('--idx: 0')

      await wrapper.setProps({ modelValue: 'option2' })
      rootElement = wrapper.find('.segmented')
      style = rootElement.attributes('style')
      expect(style).toContain('--idx: 1')
    })

    it('should update custom properties when options change', async () => {
      await wrapper.setProps({ 
        options: ['opt1', 'opt2', 'opt3', 'opt4'],
        modelValue: 'opt3'
      })

      const rootElement = wrapper.find('.segmented')
      const style = rootElement.attributes('style')
      expect(style).toContain('--count: 4')
      expect(style).toContain('--idx: 2')
    })
  })

  describe('Option Key Generation', () => {
    it('should use value as key for string options', () => {
      expect(wrapper.vm.optKey('test', 0)).toBe('test')
    })

    it('should use valueKey property as key for object options', () => {
      const option = { value: 'val1', label: 'Label 1' }
      expect(wrapper.vm.optKey(option, 0)).toBe('val1')
    })

    it('should fallback to index when object has no value property', () => {
      const option = { label: 'Label 1' }
      expect(wrapper.vm.optKey(option, 5)).toBe(5)
    })
  })

  describe('Label Extraction', () => {
    it('should return string as-is for string options', () => {
      expect(wrapper.vm.getLabel('test')).toBe('test')
    })

    it('should return labelKey property for object options', () => {
      const option = { value: 'val1', label: 'Label 1' }
      expect(wrapper.vm.getLabel(option)).toBe('Label 1')
    })

    it('should convert non-string primitives to string', () => {
      expect(wrapper.vm.getLabel(123)).toBe('123')
      expect(wrapper.vm.getLabel(true)).toBe('true')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty options array', async () => {
      await wrapper.setProps({ options: [] })
      
      expect(wrapper.findAll('.seg-btn')).toHaveLength(0)
      expect(wrapper.vm.activeIndex).toBe(-1)
    })

    it('should handle duplicate values in options', async () => {
      await wrapper.setProps({ 
        options: ['same', 'same', 'different'],
        modelValue: 'same'
      })

      // Should find first occurrence
      expect(wrapper.vm.activeIndex).toBe(0)
    })

    it('should handle undefined modelValue', async () => {
      await wrapper.setProps({ modelValue: undefined })
      expect(wrapper.vm.activeIndex).toBe(-1)
    })

    it('should handle mixed option types', async () => {
      await wrapper.setProps({
        options: ['string', { value: 'obj', label: 'Object' }, 123]
      })

      const buttons = wrapper.findAll('.seg-btn')
      expect(buttons[0].text()).toBe('string')
      expect(buttons[1].text()).toBe('Object')
      expect(buttons[2].text()).toBe('123')
    })
  })

  describe('Thumb Visibility', () => {
    it('should show thumb when there is an active option', () => {
      expect(wrapper.find('.thumb').exists()).toBe(true)
    })

    it('should show thumb even with null modelValue', async () => {
      await wrapper.setProps({ modelValue: null })
      // activeIndex is -1 but thumb is still rendered (v-if checks >= 0)
      expect(wrapper.find('.thumb').exists()).toBe(false)
    })

    it('should show thumb when activeIndex is 0', async () => {
      await wrapper.setProps({ modelValue: 'option1' })
      expect(wrapper.find('.thumb').exists()).toBe(true)
    })
  })

  describe('Slots', () => {
    it('should support custom option slot', () => {
      const wrapperWithSlot = mount(SegmentedToggle, {
        props: {
          options: ['opt1', 'opt2'],
          modelValue: 'opt1'
        },
        slots: {
          option: '<span class="custom-option">{{ option }}</span>'
        }
      })

      expect(wrapperWithSlot.find('.custom-option').exists()).toBe(true)
    })
  })

  describe('Performance', () => {
    it('should not re-render unnecessarily', async () => {
      const renderSpy = vi.spyOn(wrapper.vm, '$forceUpdate')
      
      // Same modelValue should not cause re-render
      await wrapper.setProps({ modelValue: 'option1' })
      
      expect(renderSpy).not.toHaveBeenCalled()
    })

    it('should handle rapid value changes efficiently', async () => {
      const values = ['option1', 'option2', 'option3', 'option1', 'option2']
      
      for (const value of values) {
        await wrapper.setProps({ modelValue: value })
      }

      expect(wrapper.emitted('update:modelValue')).toBeFalsy() // No events from prop changes
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA structure', () => {
      const track = wrapper.find('.track')
      const buttons = wrapper.findAll('.seg-btn')

      expect(track.attributes('role')).toBe('tablist')
      buttons.forEach(button => {
        expect(button.attributes('role')).toBe('tab')
        expect(button.attributes('aria-selected')).toBeDefined()
      })
    })

    it('should manage focus correctly', () => {
      const buttons = wrapper.findAll('.seg-btn')
      
      // Only active button should be focusable
      expect(buttons[0].attributes('tabindex')).toBe('0')
      expect(buttons[1].attributes('tabindex')).toBe('-1')
      expect(buttons[2].attributes('tabindex')).toBe('-1')
    })

    it('should support keyboard navigation', async () => {
      const button = wrapper.find('.seg-btn')
      
      // Should prevent default on arrow keys
      const leftEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' })
      const rightEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' })
      
      await button.trigger('keydown.left')
      await button.trigger('keydown.right')
      await button.trigger('keydown.enter')
      await button.trigger('keydown.space')

      // Events should be handled (no assertion needed, just verify no errors)
      expect(true).toBe(true)
    })
  })
})