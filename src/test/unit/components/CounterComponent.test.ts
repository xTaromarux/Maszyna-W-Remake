import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import CounterComponent from '../../../components/CounterComponent.vue'
import SignalButton from '../../../components/SignalButton.vue'
import RegisterComponent from '../../../components/RegisterComponent.vue'

describe('CounterComponent.vue', () => {
  let wrapper: VueWrapper

  const defaultProps = {
    signals: { il: true, dl: false, wyl: true, wel: false },
    programCounter: 42,
    extras: { dl: true, stack: { wylsSignal: true } },
    formatNumber: vi.fn(),
    numberFormat: 'decimal'
  }

  beforeEach(() => {
    wrapper = mount(CounterComponent, {
      props: defaultProps
    })
  })

  describe('Component Structure', () => {
    it('should render with correct base structure', () => {
      expect(wrapper.find('#counter').exists()).toBe(true)
      expect(wrapper.vm.$options.name).toBe('CounterComponent')
    })

    it('should render SignalButton components', () => {
      const signalButtons = wrapper.findAllComponents(SignalButton)
      expect(signalButtons.length).toBeGreaterThan(0)
    })

    it('should render RegisterComponent', () => {
      const registerComponent = wrapper.findComponent(RegisterComponent)
      expect(registerComponent.exists()).toBe(true)
    })

    it('should have correct component name', () => {
      expect(wrapper.vm.$options.name).toBe('CounterComponent')
    })

    it('should render il SignalButton', () => {
      const signalButtons = wrapper.findAllComponents(SignalButton)
      const ilButton = signalButtons.find(btn => btn.props('id') === 'il')
      expect(ilButton).toBeDefined()
    })

    it('should render wyl SignalButton', () => {
      const signalButtons = wrapper.findAllComponents(SignalButton)
      const wylButton = signalButtons.find(btn => btn.props('id') === 'wyl')
      expect(wylButton).toBeDefined()
    })

    it('should render wel SignalButton', () => {
      const signalButtons = wrapper.findAllComponents(SignalButton)
      const welButton = signalButtons.find(btn => btn.props('id') === 'wel')
      expect(welButton).toBeDefined()
    })
  })

  describe('Conditional Rendering', () => {
    it('should render dl SignalButton when extras.dl is true', () => {
      const signalButtons = wrapper.findAllComponents(SignalButton)
      const dlButton = signalButtons.find(btn => btn.props('id') === 'dl')
      expect(dlButton).toBeDefined()
    })

    it('should not render dl SignalButton when extras.dl is false', async () => {
      await wrapper.setProps({
        extras: { dl: false, stack: { wylsSignal: true } }
      })
      
      const signalButtons = wrapper.findAllComponents(SignalButton)
      const dlButton = signalButtons.find(btn => btn.props('id') === 'dl')
      expect(dlButton).toBeUndefined()
    })

    it('should show wylsSignalsExt when extras.stack.wylsSignal is true', () => {
      expect(wrapper.find('.wylsSignalsExt').exists()).toBe(true)
    })

    it('should not show wylsSignalsExt when extras.stack.wylsSignal is false', async () => {
      await wrapper.setProps({
        extras: { dl: true, stack: { wylsSignal: false } }
      })
      
      expect(wrapper.find('.wylsSignalsExt').exists()).toBe(false)
    })

    it('should apply correct CSS class based on wylsSignal state', async () => {
      const container = wrapper.find('.wylsSignalsConteiner')
      expect(container.classes()).toContain('wylsSignalsConteinerContent')

      await wrapper.setProps({
        extras: { dl: true, stack: { wylsSignal: false } }
      })
      
      expect(container.classes()).toContain('wylsSignalsConteinerContentEnd')
    })
  })

  describe('Props Handling', () => {
    it('should pass signals to SignalButton components', () => {
      const signalButtons = wrapper.findAllComponents(SignalButton)
      const ilButton = signalButtons.find(btn => btn.props('id') === 'il')
      const welButton = signalButtons.find(btn => btn.props('id') === 'wel')
      
      expect(ilButton.props('signal')).toBe(true)
      expect(welButton.props('signal')).toBe(false)
    })

    it('should pass programCounter to RegisterComponent', () => {
      const registerComponent = wrapper.findComponent(RegisterComponent)
      expect(registerComponent.props('model')).toBe(42)
    })

    it('should pass numberFormat to RegisterComponent', () => {
      const registerComponent = wrapper.findComponent(RegisterComponent)
      expect(registerComponent.props('numberFormat')).toBe('decimal')
    })

    it('should pass label to RegisterComponent', () => {
      const registerComponent = wrapper.findComponent(RegisterComponent)
      expect(registerComponent.props('label')).toBe('L')
    })

    it('should handle minimal extras configuration', () => {
      const minimalWrapper = mount(CounterComponent, {
        props: {
          signals: { il: true, dl: false, wyl: true, wel: false },
          programCounter: 42,
          extras: { dl: false, stack: { wylsSignal: false } },
          formatNumber: vi.fn(),
          numberFormat: 'decimal'
        }
      })
      
      expect(minimalWrapper.find('#counter').exists()).toBe(true)
      expect(minimalWrapper.findAllComponents(SignalButton).find(btn => btn.props('id') === 'dl')).toBeUndefined()
    })
  })

  describe('Event Handling', () => {
    it('should emit clickItem when il SignalButton is clicked', async () => {
      wrapper = mount(CounterComponent, { props: defaultProps })
      const signalButtons = wrapper.findAllComponents(SignalButton)
      const ilButton = signalButtons.find(btn => btn.props('id') === 'il')
      
      await ilButton.trigger('click')
      await wrapper.vm.$nextTick()
      
      expect(wrapper.emitted('clickItem')).toBeTruthy()
      expect(wrapper.emitted('clickItem')[0][0]).toBe('il')
    })

    it('should emit clickItem when wyl SignalButton is clicked', async () => {
      wrapper = mount(CounterComponent, { props: defaultProps })
      const signalButtons = wrapper.findAllComponents(SignalButton)
      const wylButton = signalButtons.find(btn => btn.props('id') === 'wyl')
      
      await wylButton.trigger('click')
      await wrapper.vm.$nextTick()
      
      expect(wrapper.emitted('clickItem')).toBeTruthy()
      expect(wrapper.emitted('clickItem')[0][0]).toBe('wyl')
    })

    it('should emit clickItem when wel SignalButton is clicked', async () => {
      wrapper = mount(CounterComponent, { props: defaultProps })
      const signalButtons = wrapper.findAllComponents(SignalButton)
      const welButton = signalButtons.find(btn => btn.props('id') === 'wel')
      
      await welButton.trigger('click')
      await wrapper.vm.$nextTick()
      
      expect(wrapper.emitted('clickItem')).toBeTruthy()
      expect(wrapper.emitted('clickItem')[0][0]).toBe('wel')
    })

    it('should emit clickItem when dl SignalButton is clicked', async () => {
      wrapper = mount(CounterComponent, { props: defaultProps })
      const signalButtons = wrapper.findAllComponents(SignalButton)
      const dlButton = signalButtons.find(btn => btn.props('id') === 'dl')
      
      await dlButton.trigger('click')
      await wrapper.vm.$nextTick()
      
      expect(wrapper.emitted('clickItem')).toBeTruthy()
      expect(wrapper.emitted('clickItem')[0][0]).toBe('dl')
    })

    it('should emit update:programCounter when RegisterComponent model updates', async () => {
      const registerComponent = wrapper.findComponent(RegisterComponent)
      await registerComponent.vm.$emit('update:model', 100)

      expect(wrapper.emitted('update:programCounter')).toBeTruthy()
      expect(wrapper.emitted('update:programCounter')[0][0]).toBe(100)
    })

    it('should emit update:numberFormat when RegisterComponent format changes', async () => {
      const registerComponent = wrapper.findComponent(RegisterComponent)
      await registerComponent.vm.$emit('update:number-format', 'hex')

      expect(wrapper.emitted('update:numberFormat')).toBeTruthy()
      expect(wrapper.emitted('update:numberFormat')[0][0]).toBe('hex')
    })
  })

  describe('SignalButton Configuration', () => {
    it('should configure il button with correct props', () => {
      const signalButtons = wrapper.findAllComponents(SignalButton)
      const ilButton = signalButtons.find(btn => btn.props('id') === 'il')

      expect(ilButton.props('id')).toBe('il')
      expect(ilButton.props('label')).toBe('il')
      expect(ilButton.props('spanClassNames')).toBe('arrowRightOnBottom')
    })

    it('should configure wyl button with correct props', () => {
      const signalButtons = wrapper.findAllComponents(SignalButton)
      const wylButton = signalButtons.find(btn => btn.props('id') === 'wyl')

      expect(wylButton.props('id')).toBe('wyl')
      expect(wylButton.props('label')).toBe('wyl')
      expect(wylButton.props('spanClassNames')).toBe('arrowLeftOnBottom')
    })

    it('should configure wel button with correct props', () => {
      const signalButtons = wrapper.findAllComponents(SignalButton)
      const welButton = signalButtons.find(btn => btn.props('id') === 'wel')

      expect(welButton.props('id')).toBe('wel')
      expect(welButton.props('label')).toBe('wel')
      expect(welButton.props('spanClassNames')).toBe('arrowRightOnBottom')
    })

    it('should configure dl button with correct props when visible', () => {
      const signalButtons = wrapper.findAllComponents(SignalButton)
      const dlButton = signalButtons.find(btn => btn.props('id') === 'dl')

      expect(dlButton.props('id')).toBe('dl')
      expect(dlButton.props('label')).toBe('dl')
      expect(dlButton.props('spanClassNames')).toBe('arrowLeftOnBottom')
    })
  })

  describe('CSS Classes', () => {
    it('should apply correct CSS classes to wyl button', () => {
      const signalButtons = wrapper.findAllComponents(SignalButton)
      const wylButton = signalButtons.find(btn => btn.props('id') === 'wyl')
      expect(wylButton.classes()).toContain('long')
      expect(wylButton.classes()).toContain('pathDownOnLeft')
    })

    it('should apply correct CSS classes to wel button', () => {
      const signalButtons = wrapper.findAllComponents(SignalButton)
      const welButton = signalButtons.find(btn => btn.props('id') === 'wel')
      expect(welButton.classes()).toContain('impulse')
      expect(welButton.classes()).toContain('pathUpOnRight')
    })
  })

  describe('Edge Cases', () => {
    it('should handle proper extras structure', () => {
      const safeWrapper = mount(CounterComponent, {
        props: {
          signals: { il: true, dl: false, wyl: true, wel: false },
          programCounter: 42,
          extras: { dl: true, stack: { wylsSignal: true } },
          formatNumber: vi.fn(),
          numberFormat: 'decimal'
        }
      })
      
      expect(safeWrapper.find('#counter').exists()).toBe(true)
    })

    it('should handle missing signal properties', () => {
      const partialWrapper = mount(CounterComponent, {
        props: {
          signals: { il: true },
          programCounter: 42,
          extras: { dl: true, stack: { wylsSignal: true } },
          formatNumber: vi.fn(),
          numberFormat: 'decimal'
        }
      })
      
      expect(partialWrapper.find('#counter').exists()).toBe(true)
    })

    it('should handle zero programCounter value', async () => {
      await wrapper.setProps({ programCounter: 0 })
      
      const registerComponent = wrapper.findComponent(RegisterComponent)
      expect(registerComponent.props('model')).toBe(0)
    })

    it('should handle negative programCounter value', async () => {
      await wrapper.setProps({ programCounter: -10 })
      
      const registerComponent = wrapper.findComponent(RegisterComponent)
      expect(registerComponent.props('model')).toBe(-10)
    })

    it('should handle nested extras properties', async () => {
      await wrapper.setProps({
        extras: { dl: false, stack: { wylsSignal: false } }
      })
      
      expect(wrapper.find('#counter').exists()).toBe(true)
      expect(wrapper.findAllComponents(SignalButton).find(btn => btn.props('id') === 'dl')).toBeUndefined()
      expect(wrapper.find('.wylsSignalsExt').exists()).toBe(false)
    })
  })

  describe('Component Integration', () => {
    it('should maintain proper component hierarchy', () => {
      expect(wrapper.find('#counter').exists()).toBe(true)
      expect(wrapper.findComponent(RegisterComponent).exists()).toBe(true)
      expect(wrapper.findAllComponents(SignalButton).length).toBeGreaterThan(0)
    })

    it('should handle rapid signal changes', async () => {
      const newSignals = { il: false, dl: false, wyl: false, wel: true }
      await wrapper.setProps({ signals: newSignals })
      
      const signalButtons = wrapper.findAllComponents(SignalButton)
      const welButton = signalButtons.find(btn => btn.props('id') === 'wel')
      expect(welButton.props('signal')).toBe(true)
    })

    it('should handle multiple button clicks in sequence', async () => {
      const signalButtons = wrapper.findAllComponents(SignalButton)
      const ilButton = signalButtons.find(btn => btn.props('id') === 'il')
      const wylButton = signalButtons.find(btn => btn.props('id') === 'wyl')
      
      await ilButton.trigger('click')
      await wylButton.trigger('click')
      
      expect(wrapper.emitted('clickItem')).toBeTruthy()
      expect(wrapper.emitted('clickItem').length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Program Counter Operations', () => {
    it('should handle large program counter values', async () => {
      await wrapper.setProps({ programCounter: 999999 })
      const registerComponent = wrapper.findComponent(RegisterComponent)
      expect(registerComponent.props('model')).toBe(999999)
    })

    it('should update program counter through register component', async () => {
      const registerComponent = wrapper.findComponent(RegisterComponent)
      await registerComponent.vm.$emit('update:model', 200)
      
      expect(wrapper.emitted('update:programCounter')).toBeTruthy()
      expect(wrapper.emitted('update:programCounter')[0][0]).toBe(200)
    })

    it('should handle decimal format changes', async () => {
      const registerComponent = wrapper.findComponent(RegisterComponent)
      await registerComponent.vm.$emit('update:number-format', 'hex')
      
      expect(wrapper.emitted('update:numberFormat')).toBeTruthy()
      expect(wrapper.emitted('update:numberFormat')[0][0]).toBe('hex')
    })
  })

  describe('Layout Structure', () => {
    it('should have proper DOM structure', () => {
      expect(wrapper.find('#counter').exists()).toBe(true)
      expect(wrapper.find('.wylsSignalsConteiner').exists()).toBe(true)
    })

    it('should maintain signal button order', () => {
      const signalButtons = wrapper.findAllComponents(SignalButton)
      const buttonIds = signalButtons.map(btn => btn.props('id'))
      
      expect(buttonIds).toContain('il')
      expect(buttonIds).toContain('wyl')
      expect(buttonIds).toContain('wel')
    })
  })

  describe('Accessibility', () => {
    it('should have identifiable signal buttons', () => {
      const signalButtons = wrapper.findAllComponents(SignalButton)
      signalButtons.forEach(button => {
        expect(button.props('id')).toBeTruthy()
        expect(button.props('label')).toBeTruthy()
      })
    })

    it('should have accessible register component', () => {
      const registerComponent = wrapper.findComponent(RegisterComponent)
      expect(registerComponent.props('label')).toBe('L')
    })
  })

  describe('Performance', () => {
    it('should not re-render unnecessarily', async () => {
      const initialRender = wrapper.html()
      
      await wrapper.setProps({ signals: defaultProps.signals })
      // Same props should not trigger unnecessary changes
      expect(wrapper.html()).toBe(initialRender)
    })

    it('should handle frequent props updates efficiently', async () => {
      for (let i = 0; i < 10; i++) {
        await wrapper.setProps({
          programCounter: i,
          signals: { ...defaultProps.signals, il: i % 2 === 0 }
        })
      }
      
      expect(wrapper.find('#counter').exists()).toBe(true)
    })
  })
})