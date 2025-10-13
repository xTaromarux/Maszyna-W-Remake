import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import WSRegisterSection from '../../../components/WSRegisterSection.vue'

// Mock child components
vi.mock('../../../components/SignalButton.vue', () => ({
  default: {
    name: 'SignalButton',
    template: '<button :id="id" @click="$emit(\'click\')" :class="{ active: signal }">{{ label }}</button>',
    props: ['id', 'signal', 'label', 'class', 'spanClassNames'],
    emits: ['click']
  }
}))

vi.mock('../../../components/RegisterComponent.vue', () => ({
  default: {
    name: 'RegisterComponent',
    template: '<div class="register-component"><span>{{ label }}: {{ model }}</span></div>',
    props: ['label', 'model', 'numberFormat'],
    emits: ['update:model', 'update:number-format']
  }
}))

vi.mock('../../../components/BusLabel.vue', () => ({
  default: {
    name: 'BusLabel',
    template: '<div class="bus-label">{{ busName }}</div>',
    props: ['busName']
  }
}))

// Mock window object for responsive testing
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
})

describe('WSRegisterSection.vue', () => {
  let wrapper: any

  const defaultProps = {
    visible: true,
    WS: 255,
    BusS: 128,
    signals: {
      iws: false,
      dws: false,
      wyws: false,
      wews: false
    },
    numberFormat: 'dec',
    extras: {},
    formatNumber: vi.fn((num: number) => num.toString())
  }

  beforeEach(() => {
    window.innerWidth = 1024
    wrapper = mount(WSRegisterSection, {
      props: defaultProps
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  describe('Component Structure', () => {
    it('should render when visible is true', () => {
      expect(wrapper.find('#wsRegister').exists()).toBe(true)
      expect(wrapper.isVisible()).toBe(true)
    })

    it('should not render when visible is false', async () => {
      await wrapper.setProps({ visible: false })
      expect(wrapper.find('#wsRegister').exists()).toBe(false)
    })

    it('should render RegisterComponent with WS label', () => {
      const registerComponent = wrapper.findComponent({ name: 'RegisterComponent' })
      expect(registerComponent.exists()).toBe(true)
      expect(registerComponent.props('label')).toBe('WS')
      expect(registerComponent.props('model')).toBe(255)
    })

    it('should render multiple SignalButton components', () => {
      const signalButtons = wrapper.findAllComponents({ name: 'SignalButton' })
      expect(signalButtons.length).toBeGreaterThan(2) // At least iws, dws, wyws, wews
      
      const buttonIds = signalButtons.map(btn => btn.props('id'))
      expect(buttonIds).toContain('iws')
      expect(buttonIds).toContain('dws')
      expect(buttonIds).toContain('wyws')
      expect(buttonIds).toContain('wews')
    })
  })

  describe('Props Handling', () => {
    it('should pass WS value to RegisterComponent', async () => {
      await wrapper.setProps({ WS: 128 })
      const registerComponent = wrapper.findComponent({ name: 'RegisterComponent' })
      expect(registerComponent.props('model')).toBe(128)
    })

    it('should pass signals to SignalButtons', async () => {
      await wrapper.setProps({ 
        signals: { iws: true, dws: true, wyws: true, wews: true }
      })
      
      const signalButtons = wrapper.findAllComponents({ name: 'SignalButton' })
      const iwsButton = signalButtons.find(btn => btn.props('id') === 'iws')
      const dwsButton = signalButtons.find(btn => btn.props('id') === 'dws')
      
      expect(iwsButton?.props('signal')).toBe(true)
      expect(dwsButton?.props('signal')).toBe(true)
    })

    it('should pass numberFormat to RegisterComponent', async () => {
      await wrapper.setProps({ numberFormat: 'hex' })
      const registerComponent = wrapper.findComponent({ name: 'RegisterComponent' })
      expect(registerComponent.props('numberFormat')).toBe('hex')
    })
  })

  describe('Event Handling', () => {
    it('should emit clickItem when iws SignalButton is clicked', async () => {
      const signalButtons = wrapper.findAllComponents({ name: 'SignalButton' })
      const iwsButton = signalButtons.find(btn => btn.props('id') === 'iws')
      
      await iwsButton?.vm.$emit('click')
      
      expect(wrapper.emitted('clickItem')).toBeTruthy()
      expect(wrapper.emitted('clickItem')?.[0]).toEqual(['iws'])
    })

    it('should emit clickItem when dws SignalButton is clicked', async () => {
      const signalButtons = wrapper.findAllComponents({ name: 'SignalButton' })
      const dwsButton = signalButtons.find(btn => btn.props('id') === 'dws')
      
      await dwsButton?.vm.$emit('click')
      
      expect(wrapper.emitted('clickItem')).toBeTruthy()
      expect(wrapper.emitted('clickItem')?.[0]).toEqual(['dws'])
    })

    it('should emit update:WS when RegisterComponent model updates', async () => {
      const registerComponent = wrapper.findComponent({ name: 'RegisterComponent' })
      await registerComponent.vm.$emit('update:model', 100)
      
      expect(wrapper.emitted('update:WS')).toBeTruthy()
      expect(wrapper.emitted('update:WS')?.[0]).toEqual([100])
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
      const desktopWrapper = mount(WSRegisterSection, { props: defaultProps })
      expect(desktopWrapper.vm.isMobile).toBe(false)
      desktopWrapper.unmount()
    })

    it('should set isMobile to true on mobile', () => {
      window.innerWidth = 600
      const mobileWrapper = mount(WSRegisterSection, { props: defaultProps })
      expect(mobileWrapper.vm.isMobile).toBe(true)
      mobileWrapper.unmount()
    })

    it('should show BusLabel on mobile', () => {
      window.innerWidth = 600
      const mobileWrapper = mount(WSRegisterSection, { props: defaultProps })
      
      const busLabel = mobileWrapper.findComponent({ name: 'BusLabel' })
      expect(busLabel.exists()).toBe(true)
      expect(busLabel.props('busName')).toBe('S')
      mobileWrapper.unmount()
    })

    it('should not show BusLabel on desktop', () => {
      window.innerWidth = 1024
      const desktopWrapper = mount(WSRegisterSection, { props: defaultProps })
      
      const busLabel = desktopWrapper.findComponent({ name: 'BusLabel' })
      expect(busLabel.exists()).toBe(false)
      desktopWrapper.unmount()
    })
  })

  describe('Signal Button Configuration', () => {
    it('should configure iws button with correct props', () => {
      const signalButtons = wrapper.findAllComponents({ name: 'SignalButton' })
      const iwsButton = signalButtons.find(btn => btn.props('id') === 'iws')
      
      expect(iwsButton?.props('label')).toBe('iws')
      expect(iwsButton?.props('spanClassNames')).toBe('arrowRightOnBottom')
    })

    it('should configure dws button with correct props', () => {
      const signalButtons = wrapper.findAllComponents({ name: 'SignalButton' })
      const dwsButton = signalButtons.find(btn => btn.props('id') === 'dws')
      
      expect(dwsButton?.props('label')).toBe('dws')
      expect(dwsButton?.props('spanClassNames')).toBe('arrowLeftOnBottom')
    })

    it('should configure wyws button with correct props', () => {
      const signalButtons = wrapper.findAllComponents({ name: 'SignalButton' })
      const wywsButton = signalButtons.find(btn => btn.props('id') === 'wyws')
      
      expect(wywsButton?.props('label')).toBe('wyws')
      expect(wywsButton?.props('class')).toBe('long pathUpOnRight')
      expect(wywsButton?.props('spanClassNames')).toBe('lineRightOnBottom')
    })

    it('should configure wews button with correct props', () => {
      const signalButtons = wrapper.findAllComponents({ name: 'SignalButton' })
      const wewsButton = signalButtons.find(btn => btn.props('id') === 'wews')
      
      expect(wewsButton?.props('label')).toBe('wews')
      expect(wewsButton?.props('class')).toBe('impulse pathDownOnLeft')
      expect(wewsButton?.props('spanClassNames')).toBe('arrowLeftOnBottom')
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined WS value', async () => {
      await wrapper.setProps({ WS: undefined })
      const registerComponent = wrapper.findComponent({ name: 'RegisterComponent' })
      expect(registerComponent.props('model')).toBeUndefined()
    })

    it('should handle null signals gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      try {
        await wrapper.setProps({ signals: null })
        expect(wrapper.exists()).toBe(true)
      } catch (error) {
        expect(error.message).toContain('null')
      }
      
      consoleErrorSpy.mockRestore()
      consoleWarnSpy.mockRestore()
    })

    it('should handle extreme WS values', async () => {
      const extremeValues = [0, -1, 255, 65535]
      
      for (const value of extremeValues) {
        await wrapper.setProps({ WS: value })
        const registerComponent = wrapper.findComponent({ name: 'RegisterComponent' })
        expect(registerComponent.props('model')).toBe(value)
      }
    })

    it('should handle missing specific signals gracefully', async () => {
      await wrapper.setProps({ signals: { otherSignal: true } })
      const signalButtons = wrapper.findAllComponents({ name: 'SignalButton' })
      
      signalButtons.forEach(button => {
        expect([undefined, false]).toContain(button.props('signal'))
      })
    })
  })

  describe('Component Integration', () => {
    it('should maintain proper component hierarchy', () => {
      const wsRegister = wrapper.find('#wsRegister')
      expect(wsRegister.findAllComponents({ name: 'SignalButton' }).length).toBeGreaterThan(3)
      expect(wsRegister.findComponent({ name: 'RegisterComponent' }).exists()).toBe(true)
    })

    it('should handle rapid signal changes', async () => {
      for (let i = 0; i < 5; i++) {
        await wrapper.setProps({ 
          signals: { 
            iws: i % 2 === 0, 
            dws: i % 3 === 0,
            wyws: i % 2 === 1,
            wews: i % 4 === 0
          }
        })
      }
      
      expect(wrapper.exists()).toBe(true)
      const signalButtons = wrapper.findAllComponents({ name: 'SignalButton' })
      expect(signalButtons.length).toBeGreaterThan(3)
    })
  })

  describe('Control Word Operations', () => {
    it('should handle 8-bit control word values', async () => {
      const wordValues = [0, 1, 127, 128, 255]
      
      for (const value of wordValues) {
        await wrapper.setProps({ WS: value })
        const registerComponent = wrapper.findComponent({ name: 'RegisterComponent' })
        expect(registerComponent.props('model')).toBe(value)
      }
    })

    it('should maintain WS as number type', () => {
      expect(typeof wrapper.props('WS')).toBe('number')
    })
  })

  describe('Accessibility', () => {
    it('should have proper component structure for screen readers', () => {
      const wsRegister = wrapper.find('#wsRegister')
      expect(wsRegister.exists()).toBe(true)
      expect(wsRegister.attributes('id')).toBe('wsRegister')
    })

    it('should provide clear signal button identification', () => {
      const signalButtons = wrapper.findAllComponents({ name: 'SignalButton' })
      const buttonIds = signalButtons.map(btn => btn.props('id'))
      
      expect(buttonIds).toContain('iws')
      expect(buttonIds).toContain('dws')
      expect(buttonIds).toContain('wyws')
      expect(buttonIds).toContain('wews')
    })
  })

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const renderSpy = vi.spyOn(wrapper.vm, '$forceUpdate')
      
      wrapper.setProps({ 
        visible: true,
        WS: 255,
        numberFormat: 'dec'
      })
      
      expect(renderSpy).not.toHaveBeenCalled()
    })

    it('should handle responsive changes efficiently', () => {
      expect(wrapper.vm.isMobile).toBe(false)
      
      window.innerWidth = 500
      const newWrapper = mount(WSRegisterSection, { props: defaultProps })
      expect(newWrapper.vm.isMobile).toBe(true)
      newWrapper.unmount()
    })
  })
})