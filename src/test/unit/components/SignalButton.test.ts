import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import SignalButton from '@/components/SignalButton.vue'

describe('SignalButton.vue', () => {
  let wrapper

  const defaultProps = {
    id: 'test-signal',
    signal: false,
    label: 'TEST'
  }

  beforeEach(() => {
    wrapper = mount(SignalButton, {
      props: defaultProps
    })
  })

  describe('Component Structure', () => {
    it('should render with correct base structure', () => {
      expect(wrapper.find('.signal').exists()).toBe(true)
      expect(wrapper.find('.impulse').exists()).toBe(true)
      expect(wrapper.find('span').exists()).toBe(true)
    })

    it('should render with correct id', () => {
      expect(wrapper.find('#test-signal').exists()).toBe(true)
    })

    it('should display the correct label', () => {
      expect(wrapper.find('span').text()).toBe('TEST')
    })

    it('should have correct component name', () => {
      expect(wrapper.vm.$options.name).toBe('SignalButton')
    })
  })

  describe('Props Handling', () => {
    it('should handle signal prop correctly', async () => {
      expect(wrapper.find('.active').exists()).toBe(false)
      
      await wrapper.setProps({ signal: true })
      expect(wrapper.find('.active').exists()).toBe(true)
    })

    it('should update label when prop changes', async () => {
      expect(wrapper.find('span').text()).toBe('TEST')
      
      await wrapper.setProps({ label: 'NEW_LABEL' })
      expect(wrapper.find('span').text()).toBe('NEW_LABEL')
    })

    it('should update id when prop changes', async () => {
      expect(wrapper.find('#test-signal').exists()).toBe(true)
      
      await wrapper.setProps({ id: 'new-signal-id' })
      expect(wrapper.find('#new-signal-id').exists()).toBe(true)
      expect(wrapper.find('#test-signal').exists()).toBe(false)
    })
  })

  describe('CSS Classes', () => {
    it('should apply default CSS classes', () => {
      const signalDiv = wrapper.find('.signal')
      expect(signalDiv.classes()).toContain('signal')
      expect(signalDiv.classes()).toContain('impulse')
    })

    it('should apply custom div class names', async () => {
      await wrapper.setProps({ divClassNames: 'custom-div-class another-class' })
      const signalDiv = wrapper.find('.signal')
      expect(signalDiv.classes()).toContain('custom-div-class')
      expect(signalDiv.classes()).toContain('another-class')
    })

    it('should apply custom span class names', async () => {
      await wrapper.setProps({ spanClassNames: 'custom-span-class span-modifier' })
      const span = wrapper.find('span')
      expect(span.classes()).toContain('custom-span-class')
      expect(span.classes()).toContain('span-modifier')
    })

    it('should apply active class when signal is true', async () => {
      await wrapper.setProps({ signal: true })
      expect(wrapper.find('.active').exists()).toBe(true)
    })

    it('should not have active class when signal is false', () => {
      expect(wrapper.find('.active').exists()).toBe(false)
    })

    it('should handle multiple div class names', async () => {
      await wrapper.setProps({ divClassNames: 'class1 class2 class3' })
      const signalDiv = wrapper.find('.signal')
      expect(signalDiv.classes()).toContain('class1')
      expect(signalDiv.classes()).toContain('class2')
      expect(signalDiv.classes()).toContain('class3')
    })
  })

  describe('Signal States', () => {
    it('should toggle active state correctly', async () => {
      // Initially false
      expect(wrapper.find('.active').exists()).toBe(false)
      
      // Set to true
      await wrapper.setProps({ signal: true })
      expect(wrapper.find('.active').exists()).toBe(true)
      
      // Set back to false
      await wrapper.setProps({ signal: false })
      expect(wrapper.find('.active').exists()).toBe(false)
    })

    it('should handle rapid signal changes', async () => {
      const states = [true, false, true, false, true]
      
      for (const state of states) {
        await wrapper.setProps({ signal: state })
        expect(wrapper.find('.active').exists()).toBe(state)
      }
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty string for optional class props', async () => {
      await wrapper.setProps({ 
        divClassNames: '',
        spanClassNames: ''
      })
      
      expect(wrapper.find('.signal').exists()).toBe(true)
      expect(wrapper.find('span').exists()).toBe(true)
    })

    it('should handle very long labels', async () => {
      const longLabel = 'A'.repeat(100)
      await wrapper.setProps({ label: longLabel })
      expect(wrapper.find('span').text()).toBe(longLabel)
    })

    it('should handle special characters in label', async () => {
      const specialLabel = '!@#$%^&*()_+{}[]|\\:";\'<>?,./'
      await wrapper.setProps({ label: specialLabel })
      expect(wrapper.find('span').text()).toBe(specialLabel)
    })

    it('should handle numeric strings as ids', async () => {
      await wrapper.setProps({ id: '12345' })
      expect(wrapper.attributes('id')).toBe('12345')
    })

    it('should handle empty label', async () => {
      await wrapper.setProps({ label: '' })
      expect(wrapper.find('span').text()).toBe('')
    })
  })

  describe('Props Validation', () => {
    it('should have correct prop definitions', () => {
      const props = wrapper.vm.$options.props
      
      expect(props.id.type).toBe(String)
      expect(props.id.required).toBe(true)
      
      expect(props.signal.type).toBe(Boolean)
      expect(props.signal.required).toBe(true)
      
      expect(props.label.type).toBe(String)
      expect(props.label.required).toBe(true)
      
      expect(props.divClassNames.type).toBe(String)
      expect(props.divClassNames.default).toBe('')
      
      expect(props.spanClassNames.type).toBe(String)
      expect(props.spanClassNames.default).toBe('')
    })

    it('should handle all required props', () => {
      const wrapper2 = mount(SignalButton, {
        props: {
          id: 'req-test',
          signal: true,
          label: 'REQUIRED'
        }
      })
      
      expect(wrapper2.exists()).toBe(true)
      expect(wrapper2.find('#req-test').exists()).toBe(true)
    })
  })

  describe('DOM Structure', () => {
    it('should have proper DOM hierarchy', () => {
      const signalDiv = wrapper.find('.signal')
      const span = signalDiv.find('span')
      
      expect(signalDiv.exists()).toBe(true)
      expect(span.exists()).toBe(true)
      expect(span.element.parentElement).toBe(signalDiv.element)
    })

    it('should maintain semantic structure', () => {
      expect(wrapper.element.tagName).toBe('DIV')
      expect(wrapper.find('span').element.tagName).toBe('SPAN')
    })
  })

  describe('Accessibility', () => {
    it('should provide accessible structure', () => {
      expect(wrapper.find('[id]').exists()).toBe(true)
      expect(wrapper.find('span').text()).toBeTruthy()
    })

    it('should be identifiable by id', () => {
      expect(wrapper.attributes('id')).toBe('test-signal')
    })

    it('should have readable text content', () => {
      expect(wrapper.text()).toBe('TEST')
    })
  })

  describe('Performance', () => {
    it('should not re-render unnecessarily', async () => {
      const initialHtml = wrapper.html()
      
      // Set same props
      await wrapper.setProps({
        id: 'test-signal',
        signal: false,
        label: 'TEST'
      })
      
      expect(wrapper.html()).toBe(initialHtml)
    })

    it('should handle frequent updates efficiently', async () => {
      const startTime = performance.now()
      
      for (let i = 0; i < 100; i++) {
        await wrapper.setProps({ signal: i % 2 === 0 })
      }
      
      const endTime = performance.now()
      expect(endTime - startTime).toBeLessThan(1000) // Should complete in less than 1 second
    })
  })

  describe('CSS Class Combinations', () => {
    it('should handle complex class combinations', async () => {
      await wrapper.setProps({
        signal: true,
        divClassNames: 'path up right',
        spanClassNames: 'arrow bold'
      })
      
      const signalDiv = wrapper.find('.signal')
      const span = wrapper.find('span')
      
      expect(signalDiv.classes()).toContain('signal')
      expect(signalDiv.classes()).toContain('impulse')
      expect(signalDiv.classes()).toContain('active')
      expect(signalDiv.classes()).toContain('path')
      expect(signalDiv.classes()).toContain('up')
      expect(signalDiv.classes()).toContain('right')
      
      expect(span.classes()).toContain('arrow')
      expect(span.classes()).toContain('bold')
    })

    it('should maintain base classes when custom classes are added', async () => {
      await wrapper.setProps({ divClassNames: 'custom-class' })
      
      const signalDiv = wrapper.find('.signal')
      expect(signalDiv.classes()).toContain('signal')
      expect(signalDiv.classes()).toContain('impulse')
      expect(signalDiv.classes()).toContain('custom-class')
    })
  })
})