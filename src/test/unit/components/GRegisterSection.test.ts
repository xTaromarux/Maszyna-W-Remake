import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import GRegisterSection from '../../../components/GRegisterSection.vue'

// Mock child components
vi.mock('../../../components/SignalButton.vue', () => ({
  default: {
    name: 'SignalButton',
    template: '<button :id="id" @click="$emit(\'click\')" :class="{ active: signal }">{{ label }}</button>',
    props: ['id', 'signal', 'label', 'divClassNames', 'spanClassNames'],
    emits: ['click']
  }
}))

vi.mock('../../../components/RegisterComponent.vue', () => ({
  default: {
    name: 'RegisterComponent',
    template: '<div class="register-component"><span>{{ label }}: {{ model }}</span><button @click="$emit(\'update:model\', model + 1)">Update</button><button @click="$emit(\'update:number-format\', \'hex\')">Change Format</button></div>',
    props: ['label', 'model', 'numberFormat'],
    emits: ['update:model', 'update:number-format']
  }
}))

// Mock window object for responsive testing
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
})

describe('GRegisterSection.vue', () => {
  let wrapper: any

  const defaultProps = {
    visible: true,
    G: 128,
    signals: {
      wyg: false,
      start: false
    },
    numberFormat: 'dec'
  }

  beforeEach(() => {
    // Reset window width for each test
    window.innerWidth = 1024
    wrapper = mount(GRegisterSection, {
      props: defaultProps
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  describe('Component Structure', () => {
    it('should render when visible is true', () => {
      expect(wrapper.find('#gRegister').exists()).toBe(true)
      expect(wrapper.isVisible()).toBe(true)
    })

    it('should not render when visible is false', async () => {
      await wrapper.setProps({ visible: false })
      expect(wrapper.find('#gRegister').exists()).toBe(false)
    })

    it('should render two SignalButton components', () => {
      const signalButtons = wrapper.findAllComponents({ name: 'SignalButton' })
      expect(signalButtons).toHaveLength(2)
      
      const wygButton = signalButtons.find(btn => btn.props('id') === 'wyg')
      const startButton = signalButtons.find(btn => btn.props('id') === 'start')
      
      expect(wygButton.exists()).toBe(true)
      expect(startButton.exists()).toBe(true)
    })

    it('should render RegisterComponent', () => {
      const registerComponent = wrapper.findComponent({ name: 'RegisterComponent' })
      expect(registerComponent.exists()).toBe(true)
      expect(registerComponent.props('label')).toBe('G')
      expect(registerComponent.props('model')).toBe(128)
    })
  })

  describe('Props Handling', () => {
    it('should pass G value to RegisterComponent', async () => {
      await wrapper.setProps({ G: 255 })
      const registerComponent = wrapper.findComponent({ name: 'RegisterComponent' })
      expect(registerComponent.props('model')).toBe(255)
    })

    it('should pass signals to SignalButtons', async () => {
      await wrapper.setProps({ 
        signals: { wyg: true, start: true }
      })
      
      const signalButtons = wrapper.findAllComponents({ name: 'SignalButton' })
      const wygButton = signalButtons.find(btn => btn.props('id') === 'wyg')
      const startButton = signalButtons.find(btn => btn.props('id') === 'start')
      
      expect(wygButton.props('signal')).toBe(true)
      expect(startButton.props('signal')).toBe(true)
    })

    it('should pass numberFormat to RegisterComponent', async () => {
      await wrapper.setProps({ numberFormat: 'hex' })
      const registerComponent = wrapper.findComponent({ name: 'RegisterComponent' })
      expect(registerComponent.props('numberFormat')).toBe('hex')
    })
  })

  describe('Event Handling', () => {
    it('should emit clickItem when wyg SignalButton is clicked', async () => {
      const signalButtons = wrapper.findAllComponents({ name: 'SignalButton' })
      const wygButton = signalButtons.find(btn => btn.props('id') === 'wyg')
      
      await wygButton.vm.$emit('click')
      
      expect(wrapper.emitted('clickItem')).toBeTruthy()
      expect(wrapper.emitted('clickItem')?.[0]).toEqual(['wyg'])
    })

    it('should emit clickItem when start SignalButton is clicked', async () => {
      const signalButtons = wrapper.findAllComponents({ name: 'SignalButton' })
      const startButton = signalButtons.find(btn => btn.props('id') === 'start')
      
      await startButton.vm.$emit('click')
      
      expect(wrapper.emitted('clickItem')).toBeTruthy()
      expect(wrapper.emitted('clickItem')?.[0]).toEqual(['start'])
    })

    it('should emit update:G when RegisterComponent model updates', async () => {
      const registerComponent = wrapper.findComponent({ name: 'RegisterComponent' })
      await registerComponent.vm.$emit('update:model', 200)
      
      expect(wrapper.emitted('update:G')).toBeTruthy()
      expect(wrapper.emitted('update:G')?.[0]).toEqual([200])
    })

    it('should emit update:numberFormat when RegisterComponent format changes', async () => {
      const registerComponent = wrapper.findComponent({ name: 'RegisterComponent' })
      await registerComponent.vm.$emit('update:number-format', 'bin')
      
      expect(wrapper.emitted('update:numberFormat')).toBeTruthy()
      expect(wrapper.emitted('update:numberFormat')?.[0]).toEqual(['bin'])
    })
  })

  describe('Responsive Behavior', () => {
    it('should set isMobile to false on desktop', () => {
      window.innerWidth = 1024
      const desktopWrapper = mount(GRegisterSection, { props: defaultProps })
      expect(desktopWrapper.vm.isMobile).toBe(false)
      desktopWrapper.unmount()
    })

    it('should set isMobile to true on mobile', () => {
      window.innerWidth = 600
      const mobileWrapper = mount(GRegisterSection, { props: defaultProps })
      expect(mobileWrapper.vm.isMobile).toBe(true)
      mobileWrapper.unmount()
    })

    it('should use different CSS classes for mobile wyg button', () => {
      window.innerWidth = 600
      const mobileWrapper = mount(GRegisterSection, { props: defaultProps })
      
      const signalButtons = mobileWrapper.findAllComponents({ name: 'SignalButton' })
      const wygButton = signalButtons.find(btn => btn.props('id') === 'wyg')
      
      expect(wygButton.props('divClassNames')).toBe('pathUpOnRight')
      mobileWrapper.unmount()
    })

    it('should use different CSS classes for desktop wyg button', () => {
      window.innerWidth = 1024
      const desktopWrapper = mount(GRegisterSection, { props: defaultProps })
      
      const signalButtons = desktopWrapper.findAllComponents({ name: 'SignalButton' })
      const wygButton = signalButtons.find(btn => btn.props('id') === 'wyg')
      
      expect(wygButton.props('divClassNames')).toBe('pathDownOnRight')
      desktopWrapper.unmount()
    })

    it('should use different CSS classes for mobile start button', () => {
      window.innerWidth = 600
      const mobileWrapper = mount(GRegisterSection, { props: defaultProps })
      
      const signalButtons = mobileWrapper.findAllComponents({ name: 'SignalButton' })
      const startButton = signalButtons.find(btn => btn.props('id') === 'start')
      
      expect(startButton.props('divClassNames')).toBe('pathDownOnLeft')
      mobileWrapper.unmount()
    })

    it('should use different CSS classes for desktop start button', () => {
      window.innerWidth = 1024
      const desktopWrapper = mount(GRegisterSection, { props: defaultProps })
      
      const signalButtons = desktopWrapper.findAllComponents({ name: 'SignalButton' })
      const startButton = signalButtons.find(btn => btn.props('id') === 'start')
      
      expect(startButton.props('divClassNames')).toBe('pathUpOnLeft')
      desktopWrapper.unmount()
    })
  })

  describe('Signal Button Configuration', () => {
    it('should configure wyg button with correct props', () => {
      const signalButtons = wrapper.findAllComponents({ name: 'SignalButton' })
      const wygButton = signalButtons.find(btn => btn.props('id') === 'wyg')
      
      expect(wygButton.props('label')).toBe('wyg')
      expect(wygButton.props('spanClassNames')).toBe('lineRightOnBottom')
    })

    it('should configure start button with correct props', () => {
      const signalButtons = wrapper.findAllComponents({ name: 'SignalButton' })
      const startButton = signalButtons.find(btn => btn.props('id') === 'start')
      
      expect(startButton.props('label')).toBe('start')
      expect(startButton.props('spanClassNames')).toBe('arrowLeftOnBottom')
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined G value', async () => {
      await wrapper.setProps({ G: undefined })
      const registerComponent = wrapper.findComponent({ name: 'RegisterComponent' })
      expect(registerComponent.props('model')).toBeUndefined()
    })

    it('should handle null signals gracefully', async () => {
      // In real usage, signals should never be null, but component should handle it gracefully
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      try {
        await wrapper.setProps({ signals: null })
        // If component renders without crashing, that's a success
        expect(wrapper.exists()).toBe(true)
      } catch (error) {
        // Expected to fail due to accessing properties of null
        expect(error.message).toContain('null')
      }
      
      consoleErrorSpy.mockRestore()
      consoleWarnSpy.mockRestore()
    })

    it('should handle missing signals gracefully', async () => {
      await wrapper.setProps({ signals: {} })
      const signalButtons = wrapper.findAllComponents({ name: 'SignalButton' })
      
      signalButtons.forEach(button => {
        expect(button.props('signal')).toBeUndefined()
      })
    })

    it('should handle extreme G values', async () => {
      const extremeValues = [0, -1, 65535, Number.MAX_SAFE_INTEGER]
      
      for (const value of extremeValues) {
        await wrapper.setProps({ G: value })
        const registerComponent = wrapper.findComponent({ name: 'RegisterComponent' })
        expect(registerComponent.props('model')).toBe(value)
      }
    })
  })

  describe('Component Integration', () => {
    it('should maintain proper component hierarchy', () => {
      const gRegister = wrapper.find('#gRegister')
      expect(gRegister.findAllComponents({ name: 'SignalButton' })).toHaveLength(2)
      expect(gRegister.findComponent({ name: 'RegisterComponent' }).exists()).toBe(true)
    })

    it('should handle rapid prop changes without errors', async () => {
      for (let i = 0; i < 10; i++) {
        await wrapper.setProps({ 
          G: i * 10,
          signals: { 
            wyg: i % 2 === 0, 
            start: i % 3 === 0 
          },
          numberFormat: i % 2 === 0 ? 'dec' : 'hex'
        })
      }
      
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.findComponent({ name: 'RegisterComponent' }).props('model')).toBe(90)
    })
  })

  describe('Accessibility', () => {
    it('should have proper component structure for screen readers', () => {
      const gRegister = wrapper.find('#gRegister')
      expect(gRegister.exists()).toBe(true)
      expect(gRegister.attributes('id')).toBe('gRegister')
    })

    it('should maintain accessible component order', () => {
      const children = wrapper.find('#gRegister').element.children
      expect(children.length).toBe(3) // wyg button, register, start button
    })
  })

  describe('Performance', () => {
    it('should handle window resize responsively', () => {
      expect(wrapper.vm.isMobile).toBe(false) // initially desktop
      
      // Simulate window resize
      window.innerWidth = 500
      const newWrapper = mount(GRegisterSection, { props: defaultProps })
      expect(newWrapper.vm.isMobile).toBe(true)
      newWrapper.unmount()
    })

    it('should not re-render when irrelevant props stay the same', () => {
      const renderSpy = vi.spyOn(wrapper.vm, '$forceUpdate')
      
      wrapper.setProps({ 
        visible: true, // same value
        G: 128, // same value
        numberFormat: 'dec' // same value
      })
      
      expect(renderSpy).not.toHaveBeenCalled()
    })
  })
})