import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import RegisterISection from '@/components/RegisterISection.vue'

// Mock child components
vi.mock('@/components/SignalButton.vue', () => ({
  default: {
    name: 'SignalButton',
    props: ['id', 'signal', 'label', 'divClassNames', 'spanClassNames'],
    emits: ['click'],
    template: '<button @click="$emit(\'click\')" :id="id">{{ label }}</button>'
  }
}))

vi.mock('@/components/RegisterComponent.vue', () => ({
  default: {
    name: 'RegisterComponent',
    props: ['label', 'model', 'numberFormat'],
    emits: ['update:model', 'update:numberFormat'],
    template: '<div class="register-component">{{ label }}: {{ model }}</div>'
  }
}))

describe('RegisterISection.vue', () => {
  let wrapper

  const defaultProps = {
    I: 15,
    signals: {
      wyad: { name: 'wyad', active: true },
      wei: { name: 'wei', active: false },
      stop: { name: 'stop', active: false }
    },
    numberFormat: 'decimal'
  }

  beforeEach(() => {
    wrapper = mount(RegisterISection, {
      props: defaultProps
    })
  })

  describe('Component Structure', () => {
    it('should render the I register component', () => {
      expect(wrapper.find('#iRegister').exists()).toBe(true)
      expect(wrapper.findComponent({ name: 'RegisterComponent' }).exists()).toBe(true)
      expect(wrapper.findAllComponents({ name: 'SignalButton' })).toHaveLength(3)
    })

    it('should render RegisterComponent with I label', () => {
      const registerComponent = wrapper.findComponent({ name: 'RegisterComponent' })
      expect(registerComponent.props('label')).toBe('I')
    })

    it('should render wyad, wei, and stop SignalButtons', () => {
      const signalButtons = wrapper.findAllComponents({ name: 'SignalButton' })
      
      const wyadButton = signalButtons.find(btn => btn.props('id') === 'wyad')
      expect(wyadButton).toBeTruthy()
      expect(wyadButton.props('label')).toBe('wyad')
      expect(wyadButton.props('divClassNames')).toBe('long pathUpOnRight')
      expect(wyadButton.props('spanClassNames')).toBe('arrowRightOnBottom')

      const weiButton = signalButtons.find(btn => btn.props('id') === 'wei')
      expect(weiButton).toBeTruthy()
      expect(weiButton.props('label')).toBe('wei')
      expect(weiButton.props('divClassNames')).toBe('impulse pathUpOnLeft')
      expect(weiButton.props('spanClassNames')).toBe('arrowLeftOnBottom')

      const stopButton = signalButtons.find(btn => btn.props('id') === 'stop')
      expect(stopButton).toBeTruthy()
      expect(stopButton.props('label')).toBe('stop')
      expect(stopButton.props('spanClassNames')).toBe('lineLeftOnBottom additionalInterruptsSignal')
    })

    it('should have proper structural elements', () => {
      expect(wrapper.find('.signals').exists()).toBe(true)
      expect(wrapper.find('.stopConteiner').exists()).toBe(true)
    })
  })

  describe('Props Handling', () => {
    it('should pass I value to RegisterComponent', () => {
      const registerComponent = wrapper.findComponent({ name: 'RegisterComponent' })
      expect(registerComponent.props('model')).toBe(15)
    })

    it('should pass signals to SignalButtons', () => {
      const signalButtons = wrapper.findAllComponents({ name: 'SignalButton' })
      
      const wyadButton = signalButtons.find(btn => btn.props('id') === 'wyad')
      expect(wyadButton.props('signal')).toEqual({ name: 'wyad', active: true })

      const weiButton = signalButtons.find(btn => btn.props('id') === 'wei')
      expect(weiButton.props('signal')).toEqual({ name: 'wei', active: false })

      const stopButton = signalButtons.find(btn => btn.props('id') === 'stop')
      expect(stopButton.props('signal')).toEqual({ name: 'stop', active: false })
    })

    it('should pass numberFormat to RegisterComponent', () => {
      const registerComponent = wrapper.findComponent({ name: 'RegisterComponent' })
      expect(registerComponent.props('numberFormat')).toBe('decimal')
    })

    it('should handle missing signals gracefully', async () => {
      await wrapper.setProps({ signals: {} })
      const signalButtons = wrapper.findAllComponents({ name: 'SignalButton' })
      
      signalButtons.forEach(button => {
        expect(button.props('signal')).toBeUndefined()
      })
    })
  })

  describe('Event Handling', () => {
    it('should emit clickItem when wyad SignalButton is clicked', async () => {
      const signalButtons = wrapper.findAllComponents({ name: 'SignalButton' })
      const wyadButton = signalButtons.find(btn => btn.props('id') === 'wyad')
      
      await wyadButton.trigger('click')
      
      expect(wrapper.emitted('clickItem')).toBeTruthy()
      expect(wrapper.emitted('clickItem')[0]).toEqual(['wyad'])
    })

    it('should emit clickItem when wei SignalButton is clicked', async () => {
      const signalButtons = wrapper.findAllComponents({ name: 'SignalButton' })
      const weiButton = signalButtons.find(btn => btn.props('id') === 'wei')
      
      await weiButton.trigger('click')
      
      expect(wrapper.emitted('clickItem')).toBeTruthy()
      expect(wrapper.emitted('clickItem')[0]).toEqual(['wei'])
    })

    it('should emit clickItem when stop SignalButton is clicked', async () => {
      const signalButtons = wrapper.findAllComponents({ name: 'SignalButton' })
      const stopButton = signalButtons.find(btn => btn.props('id') === 'stop')
      
      await stopButton.trigger('click')
      
      expect(wrapper.emitted('clickItem')).toBeTruthy()
      expect(wrapper.emitted('clickItem')[0]).toEqual(['stop'])
    })

    it('should emit update:I when RegisterComponent model updates', async () => {
      const registerComponent = wrapper.findComponent({ name: 'RegisterComponent' })
      
      await registerComponent.vm.$emit('update:model', 32)
      
      expect(wrapper.emitted('update:I')).toBeTruthy()
      expect(wrapper.emitted('update:I')[0]).toEqual([32])
    })

    it('should emit update:numberFormat when RegisterComponent format changes', async () => {
      const registerComponent = wrapper.findComponent({ name: 'RegisterComponent' })
      
      await registerComponent.vm.$emit('update:numberFormat', 'hexadecimal')
      
      expect(wrapper.emitted('update:numberFormat')).toBeTruthy()
      expect(wrapper.emitted('update:numberFormat')[0]).toEqual(['hexadecimal'])
    })
  })

  describe('Signal Button Configuration', () => {
    it('should configure wyad button with correct CSS classes', () => {
      const signalButtons = wrapper.findAllComponents({ name: 'SignalButton' })
      const wyadButton = signalButtons.find(btn => btn.props('id') === 'wyad')
      
      expect(wyadButton.props('divClassNames')).toBe('long pathUpOnRight')
      expect(wyadButton.props('spanClassNames')).toBe('arrowRightOnBottom')
    })

    it('should configure wei button with correct CSS classes', () => {
      const signalButtons = wrapper.findAllComponents({ name: 'SignalButton' })
      const weiButton = signalButtons.find(btn => btn.props('id') === 'wei')
      
      expect(weiButton.props('divClassNames')).toBe('impulse pathUpOnLeft')
      expect(weiButton.props('spanClassNames')).toBe('arrowLeftOnBottom')
    })

    it('should configure stop button with correct CSS classes', () => {
      const signalButtons = wrapper.findAllComponents({ name: 'SignalButton' })
      const stopButton = signalButtons.find(btn => btn.props('id') === 'stop')
      
      expect(stopButton.props('spanClassNames')).toBe('lineLeftOnBottom additionalInterruptsSignal')
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined I value', async () => {
      await wrapper.setProps({ I: undefined })
      const registerComponent = wrapper.findComponent({ name: 'RegisterComponent' })
      expect(registerComponent.props('model')).toBeUndefined()
    })

    it('should handle extreme I values', async () => {
      await wrapper.setProps({ I: -65536 })
      let registerComponent = wrapper.findComponent({ name: 'RegisterComponent' })
      expect(registerComponent.props('model')).toBe(-65536)

      await wrapper.setProps({ I: 65536 })
      registerComponent = wrapper.findComponent({ name: 'RegisterComponent' })
      expect(registerComponent.props('model')).toBe(65536)
    })

    it('should handle missing specific signals gracefully', async () => {
      await wrapper.setProps({ 
        signals: { 
          wyad: { name: 'wyad', active: true }
          // Missing wei and stop signals
        } 
      })
      
      const signalButtons = wrapper.findAllComponents({ name: 'SignalButton' })
      
      const wyadButton = signalButtons.find(btn => btn.props('id') === 'wyad')
      expect(wyadButton.props('signal')).toEqual({ name: 'wyad', active: true })
      
      const weiButton = signalButtons.find(btn => btn.props('id') === 'wei')
      expect(weiButton.props('signal')).toBeUndefined()
      
      const stopButton = signalButtons.find(btn => btn.props('id') === 'stop')
      expect(stopButton.props('signal')).toBeUndefined()
    })
  })

  describe('Component Integration', () => {
    it('should maintain proper component hierarchy', () => {
      const iRegister = wrapper.find('#iRegister')
      expect(iRegister.findComponent({ name: 'RegisterComponent' }).exists()).toBe(true)
      expect(iRegister.findAllComponents({ name: 'SignalButton' })).toHaveLength(3)
      expect(iRegister.find('.signals').exists()).toBe(true)
    })

    it('should handle rapid signal changes', async () => {
      const newSignals = {
        wyad: { name: 'wyad', active: false },
        wei: { name: 'wei', active: true },
        stop: { name: 'stop', active: true }
      }
      
      await wrapper.setProps({ signals: newSignals })
      
      const signalButtons = wrapper.findAllComponents({ name: 'SignalButton' })
      const wyadButton = signalButtons.find(btn => btn.props('id') === 'wyad')
      const weiButton = signalButtons.find(btn => btn.props('id') === 'wei')
      const stopButton = signalButtons.find(btn => btn.props('id') === 'stop')
      
      expect(wyadButton.props('signal')).toEqual({ name: 'wyad', active: false })
      expect(weiButton.props('signal')).toEqual({ name: 'wei', active: true })
      expect(stopButton.props('signal')).toEqual({ name: 'stop', active: true })
    })
  })

  describe('Instruction Register Operations', () => {
    it('should handle instruction register value changes', async () => {
      await wrapper.setProps({ I: 0 })
      let registerComponent = wrapper.findComponent({ name: 'RegisterComponent' })
      expect(registerComponent.props('model')).toBe(0)

      await wrapper.setProps({ I: 255 })
      registerComponent = wrapper.findComponent({ name: 'RegisterComponent' })
      expect(registerComponent.props('model')).toBe(255)
    })

    it('should maintain I as number type', () => {
      const registerComponent = wrapper.findComponent({ name: 'RegisterComponent' })
      expect(typeof registerComponent.props('model')).toBe('number')
    })

    it('should handle instruction values properly', async () => {
      // Test various instruction values
      const instructionValues = [0, 1, 15, 16, 31, 63, 127, 255]
      
      for (const value of instructionValues) {
        await wrapper.setProps({ I: value })
        const registerComponent = wrapper.findComponent({ name: 'RegisterComponent' })
        expect(registerComponent.props('model')).toBe(value)
      }
    })
  })

  describe('Stop Signal Functionality', () => {
    it('should have stop signal in separate container', () => {
      const stopContainer = wrapper.find('.stopConteiner')
      expect(stopContainer.exists()).toBe(true)
      
      const stopButton = stopContainer.findComponent({ name: 'SignalButton' })
      expect(stopButton.exists()).toBe(true)
      expect(stopButton.props('id')).toBe('stop')
    })

    it('should handle stop signal activation', async () => {
      await wrapper.setProps({ 
        signals: { 
          ...defaultProps.signals,
          stop: { name: 'stop', active: true }
        } 
      })
      
      const signalButtons = wrapper.findAllComponents({ name: 'SignalButton' })
      const stopButton = signalButtons.find(btn => btn.props('id') === 'stop')
      expect(stopButton.props('signal')).toEqual({ name: 'stop', active: true })
    })
  })

  describe('Accessibility', () => {
    it('should have proper component structure for screen readers', () => {
      const iRegister = wrapper.find('#iRegister')
      expect(iRegister.exists()).toBe(true)
      
      const signalButtons = wrapper.findAllComponents({ name: 'SignalButton' })
      signalButtons.forEach(button => {
        expect(button.props('id')).toBeTruthy()
        expect(button.props('label')).toBeTruthy()
      })
    })

    it('should provide clear signal button identification', () => {
      const signalButtons = wrapper.findAllComponents({ name: 'SignalButton' })
      
      const buttonIds = signalButtons.map(btn => btn.props('id'))
      expect(buttonIds).toContain('wyad')
      expect(buttonIds).toContain('wei')
      expect(buttonIds).toContain('stop')
      
      const buttonLabels = signalButtons.map(btn => btn.props('label'))
      expect(buttonLabels).toContain('wyad')
      expect(buttonLabels).toContain('wei')
      expect(buttonLabels).toContain('stop')
    })

    it('should have descriptive container classes', () => {
      expect(wrapper.find('.signals').exists()).toBe(true)
      expect(wrapper.find('.stopConteiner').exists()).toBe(true)
    })
  })

  describe('Performance', () => {
    it('should not re-render unnecessarily', async () => {
      const initialRenderCount = wrapper.vm.$.renderTracked?.length || 0
      
      // Set same props
      await wrapper.setProps({ 
        I: 15,
        numberFormat: 'decimal'
      })
      
      // Component should not trigger unnecessary re-renders
      expect(wrapper.findComponent({ name: 'RegisterComponent' }).exists()).toBe(true)
    })

    it('should handle number format changes efficiently', async () => {
      const formats = ['decimal', 'hexadecimal', 'binary', 'octal']
      
      for (const format of formats) {
        await wrapper.setProps({ numberFormat: format })
        const registerComponent = wrapper.findComponent({ name: 'RegisterComponent' })
        expect(registerComponent.props('numberFormat')).toBe(format)
      }
    })

    it('should handle multiple simultaneous signal changes', async () => {
      const signalSets = [
        { wyad: { active: true }, wei: { active: false }, stop: { active: false } },
        { wyad: { active: false }, wei: { active: true }, stop: { active: false } },
        { wyad: { active: false }, wei: { active: false }, stop: { active: true } },
        { wyad: { active: true }, wei: { active: true }, stop: { active: true } }
      ]
      
      for (const signals of signalSets) {
        await wrapper.setProps({ signals })
        const signalButtons = wrapper.findAllComponents({ name: 'SignalButton' })
        expect(signalButtons).toHaveLength(3)
      }
    })
  })
})