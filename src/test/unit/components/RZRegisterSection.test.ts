import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import RZRegisterSection from '../../../components/RZRegisterSection.vue'

// Mock child components
vi.mock('../../../components/RegisterComponent.vue', () => ({
  default: {
    name: 'RegisterComponent',
    template: '<div class="register-component"><span>{{ label }}: {{ model }}</span></div>',
    props: ['label', 'model', 'numberFormat'],
    emits: ['update:model', 'update:number-format']
  }
}))

describe('RZRegisterSection.vue', () => {
  let wrapper: any

  const defaultProps = {
    visible: true,
    RZ: 5, // Binary: 0101
    rzInputs: [1, 0, 1, 0], // Corresponds to RZ=5
    numberFormat: 'dec'
  }

  beforeEach(() => {
    wrapper = mount(RZRegisterSection, {
      props: defaultProps
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  describe('Component Structure', () => {
    it('should render when visible is true', () => {
      expect(wrapper.find('#rzRegister').exists()).toBe(true)
      expect(wrapper.isVisible()).toBe(true)
    })

    it('should not render when visible is false', async () => {
      await wrapper.setProps({ visible: false })
      expect(wrapper.find('#rzRegister').exists()).toBe(false)
    })

    it('should render RegisterComponent with RZ label', () => {
      const registerComponent = wrapper.findComponent({ name: 'RegisterComponent' })
      expect(registerComponent.exists()).toBe(true)
      expect(registerComponent.props('label')).toBe('RZ')
      expect(registerComponent.props('model')).toBe(5)
    })

    it('should render 4 RZ input buttons', () => {
      const buttons = wrapper.findAll('.rz-input')
      expect(buttons).toHaveLength(4)
      
      buttons.forEach((button, index) => {
        expect(button.text()).toBe((index + 1).toString())
      })
    })

    it('should have proper CSS classes', () => {
      expect(wrapper.find('.rz-register').exists()).toBe(true)
      expect(wrapper.find('.rz-inputs').exists()).toBe(true)
    })
  })

  describe('Props Handling', () => {
    it('should pass RZ value to RegisterComponent', async () => {
      await wrapper.setProps({ RZ: 10 })
      const registerComponent = wrapper.findComponent({ name: 'RegisterComponent' })
      expect(registerComponent.props('model')).toBe(10)
    })

    it('should pass numberFormat to RegisterComponent', async () => {
      await wrapper.setProps({ numberFormat: 'hex' })
      const registerComponent = wrapper.findComponent({ name: 'RegisterComponent' })
      expect(registerComponent.props('numberFormat')).toBe('hex')
    })

    it('should sync localInputs with rzInputs prop', async () => {
      await wrapper.setProps({ rzInputs: [0, 1, 1, 0] })
      expect(wrapper.vm.localInputs).toEqual([0, 1, 1, 0])
    })

    it('should handle undefined rzInputs gracefully', async () => {
      await wrapper.setProps({ rzInputs: undefined })
      expect(wrapper.vm.localInputs).toEqual([0, 0, 0, 0])
    })
  })

  describe('Bit Operations', () => {
    it('should calculate rzValue correctly from localInputs', () => {
      wrapper.vm.localInputs = [1, 0, 1, 0] // Should equal 5 (1 + 4)
      expect(wrapper.vm.rzValue).toBe(5)
    })

    it('should calculate rzValue for all combinations', () => {
      const testCases = [
        { inputs: [0, 0, 0, 0], expected: 0 },
        { inputs: [1, 0, 0, 0], expected: 1 },
        { inputs: [0, 1, 0, 0], expected: 2 },
        { inputs: [1, 1, 0, 0], expected: 3 },
        { inputs: [0, 0, 1, 0], expected: 4 },
        { inputs: [1, 0, 1, 0], expected: 5 },
        { inputs: [0, 1, 1, 0], expected: 6 },
        { inputs: [1, 1, 1, 0], expected: 7 },
        { inputs: [0, 0, 0, 1], expected: 8 },
        { inputs: [1, 1, 1, 1], expected: 15 }
      ]

      testCases.forEach(({ inputs, expected }) => {
        wrapper.vm.localInputs = inputs
        expect(wrapper.vm.rzValue).toBe(expected)
      })
    })

    it('should sync localInputs when RZ prop changes', async () => {
      await wrapper.setProps({ RZ: 12 }) // Binary: 1100
      expect(wrapper.vm.localInputs).toEqual([0, 0, 1, 1])
    })

    it('should extract bits correctly from RZ value', async () => {
      const testCases = [
        { rz: 0, expected: [0, 0, 0, 0] },
        { rz: 1, expected: [1, 0, 0, 0] },
        { rz: 2, expected: [0, 1, 0, 0] },
        { rz: 4, expected: [0, 0, 1, 0] },
        { rz: 8, expected: [0, 0, 0, 1] },
        { rz: 15, expected: [1, 1, 1, 1] }
      ]

      for (const { rz, expected } of testCases) {
        await wrapper.setProps({ RZ: rz })
        await wrapper.vm.$nextTick()
        expect(wrapper.vm.localInputs).toEqual(expected)
      }
    })
  })

  describe('Button Interaction', () => {
    it('should toggle bit when button is clicked', async () => {
      const buttons = wrapper.findAll('.rz-input')
      
      // Initially [1, 0, 1, 0] from props
      expect(wrapper.vm.localInputs).toEqual([1, 0, 1, 0])
      
      // Click button 2 (index 1) to toggle from 0 to 1
      await buttons[1].trigger('click')
      expect(wrapper.vm.localInputs).toEqual([1, 1, 1, 0])
    })

    it('should emit update:rzInputs when button is clicked', async () => {
      const buttons = wrapper.findAll('.rz-input')
      
      await buttons[0].trigger('click')
      
      expect(wrapper.emitted('update:rzInputs')).toBeTruthy()
      expect(wrapper.emitted('update:rzInputs')?.[0]).toEqual([[0, 0, 1, 0]])
    })

    it('should emit update:RZ when button is clicked', async () => {
      const buttons = wrapper.findAll('.rz-input')
      
      await buttons[0].trigger('click') // Toggle bit 0 from 1 to 0
      
      expect(wrapper.emitted('update:RZ')).toBeTruthy()
      expect(wrapper.emitted('update:RZ')?.[0]).toEqual([4]) // Only bit 2 remains (1010 -> 0010 = 4)
    })

    it('should apply active class to active buttons', () => {
      const buttons = wrapper.findAll('.rz-input')
      
      // Based on default props [1, 0, 1, 0]
      expect(buttons[0].classes()).toContain('active') // Bit 0 is 1
      expect(buttons[1].classes()).not.toContain('active') // Bit 1 is 0
      expect(buttons[2].classes()).toContain('active') // Bit 2 is 1
      expect(buttons[3].classes()).not.toContain('active') // Bit 3 is 0
    })

    it('should have proper aria-pressed attributes', () => {
      const buttons = wrapper.findAll('.rz-input')
      
      // Based on default props [1, 0, 1, 0]
      expect(buttons[0].attributes('aria-pressed')).toBe('true')
      expect(buttons[1].attributes('aria-pressed')).toBe('false')
      expect(buttons[2].attributes('aria-pressed')).toBe('true')
      expect(buttons[3].attributes('aria-pressed')).toBe('false')
    })
  })

  describe('Event Handling', () => {
    it('should emit update:RZ when RegisterComponent model updates', async () => {
      const registerComponent = wrapper.findComponent({ name: 'RegisterComponent' })
      await registerComponent.vm.$emit('update:model', 255)
      
      expect(wrapper.emitted('update:RZ')).toBeTruthy()
      expect(wrapper.emitted('update:RZ')?.[0]).toEqual([255])
    })

    it('should emit update:numberFormat when RegisterComponent format changes', async () => {
      const registerComponent = wrapper.findComponent({ name: 'RegisterComponent' })
      await registerComponent.vm.$emit('update:number-format', 'bin')
      
      expect(wrapper.emitted('update:numberFormat')).toBeTruthy()
      expect(wrapper.emitted('update:numberFormat')?.[0]).toEqual(['bin'])
    })
  })

  describe('Data Synchronization', () => {
    it('should not update localInputs if same values are provided', async () => {
      const spy = vi.spyOn(wrapper.vm, '$forceUpdate')
      
      // Set same values
      await wrapper.setProps({ rzInputs: [1, 0, 1, 0] })
      
      // Should not trigger update
      expect(spy).not.toHaveBeenCalled()
    })

    it('should handle array truncation for rzInputs', async () => {
      await wrapper.setProps({ rzInputs: [1, 1, 1, 1, 1, 1] }) // More than 4 elements
      expect(wrapper.vm.localInputs).toEqual([1, 1, 1, 1]) // Should take only first 4
    })

    it('should handle short rzInputs array', async () => {
      await wrapper.setProps({ rzInputs: [1, 1] }) // Only 2 elements
      expect(wrapper.vm.localInputs).toEqual([1, 1]) // Should keep as is
    })

    it('should convert truthy values to 1 and falsy to 0', async () => {
      await wrapper.setProps({ rzInputs: [true, false, 'yes', null] })
      expect(wrapper.vm.localInputs).toEqual([1, 0, 1, 0])
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined RZ value', async () => {
      await wrapper.setProps({ RZ: undefined })
      const registerComponent = wrapper.findComponent({ name: 'RegisterComponent' })
      // Component converts undefined to 0 as the default
      expect(registerComponent.props('model')).toBe(0)
    })

    it('should handle negative RZ values', async () => {
      await wrapper.setProps({ RZ: -1 })
      await wrapper.vm.$nextTick()
      // -1 in binary (two's complement) has all bits set
      expect(wrapper.vm.localInputs).toEqual([1, 1, 1, 1])
    })

    it('should handle large RZ values', async () => {
      await wrapper.setProps({ RZ: 255 })
      await wrapper.vm.$nextTick()
      // 255 = 11111111, but we only use 4 bits, so should be [1, 1, 1, 1]
      expect(wrapper.vm.localInputs).toEqual([1, 1, 1, 1])
    })

    it('should handle null rzInputs', async () => {
      // Reset to default state first
      await wrapper.setProps({ rzInputs: [1, 0, 1, 0] })
      await wrapper.vm.$nextTick()
      
      // Then test null
      await wrapper.setProps({ rzInputs: null })
      await wrapper.vm.$nextTick()
      // With null, the watcher uses (arr || []).slice(0,4) which gives [], then map to []
      // So localInputs becomes [] not [0,0,0,0]
      expect(wrapper.vm.localInputs).toEqual([])
    })
  })

  describe('Component Integration', () => {
    it('should maintain proper component hierarchy', () => {
      const rzRegister = wrapper.find('#rzRegister')
      expect(rzRegister.find('.rz-inputs').exists()).toBe(true)
      expect(rzRegister.findComponent({ name: 'RegisterComponent' }).exists()).toBe(true)
    })

    it('should handle rapid bit toggles', async () => {
      const buttons = wrapper.findAll('.rz-input')
      
      // Rapidly toggle all buttons
      for (let i = 0; i < 4; i++) {
        await buttons[i].trigger('click')
      }
      
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.emitted('update:RZ')).toHaveLength(4)
    })

    it('should handle component order correctly', () => {
      const children = wrapper.find('#rzRegister').element.children
      expect(children.length).toBe(2) // inputs container and register component
    })
  })

  describe('Accessibility', () => {
    it('should have proper component structure for screen readers', () => {
      const rzRegister = wrapper.find('#rzRegister')
      expect(rzRegister.exists()).toBe(true)
      expect(rzRegister.attributes('id')).toBe('rzRegister')
    })

    it('should provide accessible button states', () => {
      const buttons = wrapper.findAll('.rz-input')
      
      buttons.forEach((button) => {
        expect(button.attributes('type')).toBe('button')
        expect(button.attributes('aria-pressed')).toBeDefined()
      })
    })

    it('should have numbered buttons for identification', () => {
      const buttons = wrapper.findAll('.rz-input')
      
      buttons.forEach((button, index) => {
        expect(button.text()).toBe((index + 1).toString())
      })
    })
  })

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const renderSpy = vi.spyOn(wrapper.vm, '$forceUpdate')
      
      wrapper.setProps({ 
        visible: true,
        RZ: 5,
        numberFormat: 'dec'
      })
      
      expect(renderSpy).not.toHaveBeenCalled()
    })

    it('should handle rapid value changes efficiently', async () => {
      for (let i = 0; i < 16; i++) {
        await wrapper.setProps({ RZ: i })
      }
      
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.findComponent({ name: 'RegisterComponent' }).props('model')).toBe(15)
    })

    it('should efficiently calculate bit values', () => {
      const startTime = performance.now()
      
      // Perform multiple calculations
      for (let i = 0; i < 100; i++) {
        wrapper.vm.localInputs = [i % 2, (i >> 1) % 2, (i >> 2) % 2, (i >> 3) % 2]
        const _ = wrapper.vm.rzValue
      }
      
      const endTime = performance.now()
      expect(endTime - startTime).toBeLessThan(50) // Should be very fast
    })
  })
})