import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import CalcSection from '../../../components/CalcSection.vue'

// Mock child components
vi.mock('../../../components/SignalButton.vue', () => ({
  default: {
    name: 'SignalButton',
    props: ['id', 'signal', 'label', 'spanClassNames', 'divClassNames'],
    emits: ['click'],
    template: '<button @click="$emit(\'click\')" :id="id">{{ label }}</button>'
  }
}))

vi.mock('../../../components/RegisterComponent.vue', () => ({
  default: {
    name: 'RegisterComponent',
    props: ['id', 'label', 'model', 'signedDec', 'wordBits', 'numberFormat', 'formatNumber', 'isEnableEditValue', 'showFormatSelector'],
    emits: ['update:model', 'update:number-format'],
    template: '<div :id="id" class="register-component">{{ label }}: {{ model }}</div>'
  }
}))

vi.mock('../../../components/WSRegisterSection.vue', () => ({
  default: {
    name: 'WSRegisterSection',
    props: ['WS', 'visible', 'signals', 'formatNumber', 'numberFormat', 'extras'],
    emits: ['update:number-format', 'update:programCounter', 'clickItem', 'update:WS'],
    template: '<div class="ws-register-section" v-if="visible">WS: {{ WS }}</div>'
  }
}))

describe('CalcSection.vue', () => {
  let wrapper: VueWrapper<any>
  let mockFormatNumber: any

  const defaultProps = {
    extras: {
      jamlExtras: true,
      stack: {
        wsRegister: true
      }
    },
    signals: {
      iak: false,
      dak: false,
      weak: false,
      przep: false,
      dod: false,
      ode: false,
      mno: false,
      dziel: false,
      shr: false,
      shl: false,
      neg: false,
      lub: false,
      i: false,
      weja: false,
      wyak: false
    },
    ACC: 42,
    JAML: 100,
    WS: 200,
    decSigned: false,
    wordBits: 12,
    accFormat: 'hex',
    numberFormat: 'hex',
    formatNumber: vi.fn((num, format) => `${num}_${format}`)
  }

  beforeEach(() => {
    mockFormatNumber = vi.fn((num, format) => `${num}_${format}`)
    
    // Mock window properties
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024
    })

    // Mock addEventListener and removeEventListener
    vi.spyOn(window, 'addEventListener')
    vi.spyOn(window, 'removeEventListener')
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.clearAllMocks()
  })

  describe('Component Structure', () => {
    it('should render main container with correct class', () => {
      wrapper = mount(CalcSection, {
        props: defaultProps
      })

      const container = wrapper.find('.calcConteiner')
      expect(container.exists()).toBe(true)
      expect(container.classes()).toContain('calcConteinerAdditionalSpace')
    })

    it('should render without additional space class when wsRegister is false', () => {
      wrapper = mount(CalcSection, {
        props: {
          ...defaultProps,
          extras: {
            ...defaultProps.extras,
            stack: { wsRegister: false }
          }
        }
      })

      const container = wrapper.find('.calcConteiner')
      expect(container.classes()).not.toContain('calcConteinerAdditionalSpace')
    })

    it('should have correct component name', () => {
      wrapper = mount(CalcSection, {
        props: defaultProps
      })
      expect(wrapper.vm.$options.name).toBe('CalcSection')
    })

    it('should render calc section with correct id', () => {
      wrapper = mount(CalcSection, {
        props: defaultProps
      })

      const calc = wrapper.find('#calc')
      expect(calc.exists()).toBe(true)
    })

    it('should render flags section when jamlExtras is enabled', () => {
      wrapper = mount(CalcSection, {
        props: defaultProps
      })

      const flags = wrapper.find('#flags')
      expect(flags.exists()).toBe(true)
      expect(flags.text()).toContain('FLAGI:')
    })

    it('should not render flags section when jamlExtras is disabled', () => {
      wrapper = mount(CalcSection, {
        props: {
          ...defaultProps,
          extras: { jamlExtras: false, stack: { wsRegister: true } }
        }
      })

      const flags = wrapper.find('#flags')
      expect(flags.exists()).toBe(false)
    })
  })

  describe('Props Handling', () => {
    it('should accept all required props', () => {
      wrapper = mount(CalcSection, {
        props: defaultProps
      })

      expect(wrapper.props('extras')).toEqual(defaultProps.extras)
      expect(wrapper.props('signals')).toEqual(defaultProps.signals)
      expect(wrapper.props('ACC')).toBe(42)
      expect(wrapper.props('JAML')).toBe(100)
      expect(wrapper.props('WS')).toBe(200)
    })

    it('should handle optional props with defaults', () => {
      wrapper = mount(CalcSection, {
        props: {
          ...defaultProps,
          decSigned: undefined,
          wordBits: undefined
        }
      })

      expect(wrapper.props('decSigned')).toBe(false)
      expect(wrapper.props('wordBits')).toBe(8) // Default from the second wordBits definition
    })

    it('should pass props to child components correctly', () => {
      wrapper = mount(CalcSection, {
        props: defaultProps
      })

      const accumulator = wrapper.findComponent({ name: 'RegisterComponent' })
      expect(accumulator.props('model')).toBe(42)
      expect(accumulator.props('label')).toBe('AK')
      expect(accumulator.props('numberFormat')).toBe('hex')
    })
  })

  describe('Register Components', () => {
    it('should render accumulator register component', () => {
      wrapper = mount(CalcSection, {
        props: defaultProps
      })

      const accumulator = wrapper.find('#accumulator')
      expect(accumulator.exists()).toBe(true)
      expect(accumulator.text()).toContain('AK: 42')
    })

    it('should render JAML register component', () => {
      wrapper = mount(CalcSection, {
        props: defaultProps
      })

      const jaml = wrapper.find('#jaml')
      expect(jaml.exists()).toBe(true)
      expect(jaml.text()).toContain('JAML: 100')
    })

    it('should render WS register section when not mobile', () => {
      wrapper = mount(CalcSection, {
        props: defaultProps
      })

      const wsSection = wrapper.findComponent({ name: 'WSRegisterSection' })
      expect(wsSection.exists()).toBe(true)
      expect(wsSection.props('WS')).toBe(200)
      expect(wsSection.props('visible')).toBe(true)
    })

    it('should not render WS register section on mobile', () => {
      Object.defineProperty(window, 'innerWidth', { value: 500 })
      
      wrapper = mount(CalcSection, {
        props: defaultProps
      })

      const wsSection = wrapper.findComponent({ name: 'WSRegisterSection' })
      expect(wsSection.exists()).toBe(false)
    })
  })

  describe('Signal Buttons', () => {
    it('should render basic signal buttons', () => {
      wrapper = mount(CalcSection, {
        props: defaultProps
      })

      const basicButtons = ['weak', 'przep', 'dod', 'ode']
      basicButtons.forEach(buttonId => {
        const button = wrapper.find(`#${buttonId}`)
        expect(button.exists()).toBe(true)
      })
    })

    it('should render JAML signal buttons when jamlExtras is enabled', () => {
      wrapper = mount(CalcSection, {
        props: defaultProps
      })

      const jamlButtons = ['iak', 'dak', 'mno', 'dziel', 'shr', 'shl', 'neg', 'lub', 'i']
      jamlButtons.forEach(buttonId => {
        const button = wrapper.find(`#${buttonId}`)
        expect(button.exists()).toBe(true)
      })
    })

    it('should not render JAML signal buttons when jamlExtras is disabled', () => {
      wrapper = mount(CalcSection, {
        props: {
          ...defaultProps,
          extras: { jamlExtras: false, stack: { wsRegister: true } }
        }
      })

      const jamlButtons = ['iak', 'dak', 'mno', 'dziel', 'shr', 'shl', 'neg', 'lub', 'i']
      jamlButtons.forEach(buttonId => {
        const button = wrapper.find(`#${buttonId}`)
        expect(button.exists()).toBe(false)
      })
    })

    it('should render weja and wyak buttons when not mobile', () => {
      wrapper = mount(CalcSection, {
        props: defaultProps
      })

      const weja = wrapper.find('#weja')
      const wyak = wrapper.find('#wyak')
      expect(weja.exists()).toBe(true)
      expect(wyak.exists()).toBe(true)
    })

    it('should not render weja and wyak buttons on mobile', () => {
      Object.defineProperty(window, 'innerWidth', { value: 500 })
      
      wrapper = mount(CalcSection, {
        props: defaultProps
      })

      const weja = wrapper.find('#weja')
      const wyak = wrapper.find('#wyak')
      expect(weja.exists()).toBe(false)
      expect(wyak.exists()).toBe(false)
    })
  })

  describe('Flag Calculations', () => {
    it('should calculate N flag correctly for positive numbers', () => {
      wrapper = mount(CalcSection, {
        props: {
          ...defaultProps,
          ACC: 42, // Positive number
          wordBits: 8
        }
      })

      expect(wrapper.vm.nFlag).toBe(false)
      const nFlag = wrapper.find('div[title="Negative number in Acc"]')
      expect(nFlag.exists()).toBe(false)
    })

    it('should calculate N flag correctly for negative numbers', () => {
      wrapper = mount(CalcSection, {
        props: {
          ...defaultProps,
          ACC: 0x80, // Negative in 8-bit
          wordBits: 8
        }
      })

      expect(wrapper.vm.nFlag).toBe(true)
      const nFlag = wrapper.find('div[title="Negative number in Acc"]')
      expect(nFlag.exists()).toBe(true)
      expect(nFlag.text()).toBe('N')
    })

    it('should calculate Z flag correctly for zero', () => {
      wrapper = mount(CalcSection, {
        props: {
          ...defaultProps,
          ACC: 0
        }
      })

      expect(wrapper.vm.zFlag).toBe(true)
      const zFlag = wrapper.find('div[title="Zero in Acc"]')
      expect(zFlag.exists()).toBe(true)
      expect(zFlag.text()).toBe('Z')
    })

    it('should calculate Z flag correctly for non-zero', () => {
      wrapper = mount(CalcSection, {
        props: {
          ...defaultProps,
          ACC: 42
        }
      })

      expect(wrapper.vm.zFlag).toBe(false)
      const zFlag = wrapper.find('div[title="Zero in Acc"]')
      expect(zFlag.exists()).toBe(false)
    })

    it('should handle word bit masking correctly', () => {
      wrapper = mount(CalcSection, {
        props: {
          ...defaultProps,
          ACC: 0x1FF, // 9 bits set
          wordBits: 8
        }
      })

      expect(wrapper.vm._accU).toBe(0xFF) // Masked to 8 bits
      expect(wrapper.vm._mask).toBe(0xFF)
      expect(wrapper.vm._signMask).toBe(0x80)
    })
  })

  describe('Event Handling', () => {
    it('should emit clickItem when signal buttons are clicked', async () => {
      wrapper = mount(CalcSection, {
        props: defaultProps
      })

      const weakButton = wrapper.findComponent({ name: 'SignalButton' })
      await weakButton.trigger('click')

      expect(wrapper.emitted('clickItem')).toBeTruthy()
    })

    it('should emit update:ACC when accumulator is updated', async () => {
      wrapper = mount(CalcSection, {
        props: defaultProps
      })

      const accumulator = wrapper.findComponent({ name: 'RegisterComponent' })
      await accumulator.vm.$emit('update:model', 123)

      expect(wrapper.emitted('update:ACC')).toBeTruthy()
      expect(wrapper.emitted('update:ACC')[0]).toEqual([123])
    })

    it('should emit update:accFormat when accumulator format is updated', async () => {
      wrapper = mount(CalcSection, {
        props: defaultProps
      })

      const accumulator = wrapper.findComponent({ name: 'RegisterComponent' })
      await accumulator.vm.$emit('update:number-format', 'dec')

      expect(wrapper.emitted('update:accFormat')).toBeTruthy()
      expect(wrapper.emitted('update:accFormat')[0]).toEqual(['dec'])
    })

    it('should emit WS-related events from WSRegisterSection', async () => {
      wrapper = mount(CalcSection, {
        props: defaultProps
      })

      const wsSection = wrapper.findComponent({ name: 'WSRegisterSection' })
      await wsSection.vm.$emit('update:WS', 300)
      await wsSection.vm.$emit('clickItem', 'test')
      await wsSection.vm.$emit('update:programCounter', 500)

      expect(wrapper.emitted('update:WS')).toBeTruthy()
      expect(wrapper.emitted('update:WS')[0]).toEqual([300])
      expect(wrapper.emitted('clickItem')).toBeTruthy()
      expect(wrapper.emitted('clickItem')[0]).toEqual(['test'])
      expect(wrapper.emitted('update:programCounter')).toBeTruthy()
      expect(wrapper.emitted('update:programCounter')[0]).toEqual([500])
    })

    it('should emit number format updates with correct field', async () => {
      wrapper = mount(CalcSection, {
        props: defaultProps
      })

      const wsSection = wrapper.findComponent({ name: 'WSRegisterSection' })
      await wsSection.vm.$emit('update:number-format', 'bin')

      expect(wrapper.emitted('update:number-format')).toBeTruthy()
      expect(wrapper.emitted('update:number-format')[0]).toEqual([{ field: 'WS', value: 'bin' }])
    })
  })

  describe('Mobile Responsiveness', () => {
    it('should detect mobile on mount', () => {
      Object.defineProperty(window, 'innerWidth', { value: 500 })
      
      wrapper = mount(CalcSection, {
        props: defaultProps
      })

      expect(wrapper.vm.isMobile).toBe(true)
    })

    it('should detect desktop on mount', () => {
      Object.defineProperty(window, 'innerWidth', { value: 1024 })
      
      wrapper = mount(CalcSection, {
        props: defaultProps
      })

      expect(wrapper.vm.isMobile).toBe(false)
    })

    it('should add resize event listener on mount', () => {
      wrapper = mount(CalcSection, {
        props: defaultProps
      })

      expect(window.addEventListener).toHaveBeenCalledWith('resize', wrapper.vm.checkMobile)
    })

    it('should remove resize event listener on unmount', () => {
      wrapper = mount(CalcSection, {
        props: defaultProps
      })

      const checkMobileMethod = wrapper.vm.checkMobile
      wrapper.unmount()

      expect(window.removeEventListener).toHaveBeenCalledWith('resize', checkMobileMethod)
    })

    it('should update isMobile when checkMobile is called', () => {
      wrapper = mount(CalcSection, {
        props: defaultProps
      })

      Object.defineProperty(window, 'innerWidth', { value: 500 })
      wrapper.vm.checkMobile()
      expect(wrapper.vm.isMobile).toBe(true)

      Object.defineProperty(window, 'innerWidth', { value: 1024 })
      wrapper.vm.checkMobile()
      expect(wrapper.vm.isMobile).toBe(false)
    })
  })

  describe('Component Integration', () => {
    it('should pass correct props to SignalButton components', () => {
      wrapper = mount(CalcSection, {
        props: {
          ...defaultProps,
          signals: { weak: true, przep: false }
        }
      })

      const signalButtons = wrapper.findAllComponents({ name: 'SignalButton' })
      const weakButton = signalButtons.find(btn => btn.props('id') === 'weak')
      const przepButton = signalButtons.find(btn => btn.props('id') === 'przep')

      expect(weakButton?.props('signal')).toBe(true)
      expect(przepButton?.props('signal')).toBe(false)
    })

    it('should pass correct styling classes to signal buttons', () => {
      wrapper = mount(CalcSection, {
        props: defaultProps
      })

      const wejaButton = wrapper.findAllComponents({ name: 'SignalButton' })
        .find(btn => btn.props('id') === 'weja')
      const wyakButton = wrapper.findAllComponents({ name: 'SignalButton' })
        .find(btn => btn.props('id') === 'wyak')

      expect(wejaButton?.props('divClassNames')).toBe('pathUpOnRight')
      expect(wejaButton?.props('spanClassNames')).toBe('arrowRightOnBottom')
      expect(wyakButton?.props('divClassNames')).toBe('pathDownOnRight')
      expect(wyakButton?.props('spanClassNames')).toBe('arrowLeftOnBottom')
    })

    it('should configure JAML register with correct settings', () => {
      wrapper = mount(CalcSection, {
        props: defaultProps
      })

      const jamlRegister = wrapper.findAllComponents({ name: 'RegisterComponent' })
        .find(comp => comp.props('id') === 'jaml')

      expect(jamlRegister?.props('isEnableEditValue')).toBe(false)
      expect(jamlRegister?.props('showFormatSelector')).toBe(false)
      expect(jamlRegister?.props('formatNumber')).toBe(defaultProps.formatNumber)
    })
  })

  describe('Computed Properties', () => {
    it('should calculate mask correctly for different word bits', () => {
      const testCases = [
        { wordBits: 8, expectedMask: 0xFF },
        { wordBits: 12, expectedMask: 0xFFF },
        { wordBits: 16, expectedMask: 0xFFFF }
      ]

      testCases.forEach(({ wordBits, expectedMask }) => {
        wrapper = mount(CalcSection, {
          props: { ...defaultProps, wordBits }
        })
        expect(wrapper.vm._mask).toBe(expectedMask)
        wrapper.unmount()
      })
    })

    it('should calculate sign mask correctly for different word bits', () => {
      const testCases = [
        { wordBits: 8, expectedSignMask: 0x80 },
        { wordBits: 12, expectedSignMask: 0x800 },
        { wordBits: 16, expectedSignMask: 0x8000 }
      ]

      testCases.forEach(({ wordBits, expectedSignMask }) => {
        wrapper = mount(CalcSection, {
          props: { ...defaultProps, wordBits }
        })
        expect(wrapper.vm._signMask).toBe(expectedSignMask)
        wrapper.unmount()
      })
    })

    it('should wrap ACC value to word bits correctly', () => {
      wrapper = mount(CalcSection, {
        props: {
          ...defaultProps,
          ACC: 0x1234,
          wordBits: 8
        }
      })

      expect(wrapper.vm._accU).toBe(0x34) // 0x1234 & 0xFF
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero ACC value correctly', () => {
      wrapper = mount(CalcSection, {
        props: {
          ...defaultProps,
          ACC: 0
        }
      })

      expect(wrapper.vm._accU).toBe(0)
      expect(wrapper.vm.zFlag).toBe(true)
      expect(wrapper.vm.nFlag).toBe(false)
    })

    it('should handle maximum ACC value correctly', () => {
      wrapper = mount(CalcSection, {
        props: {
          ...defaultProps,
          ACC: 0xFFFFFFFF,
          wordBits: 8
        }
      })

      expect(wrapper.vm._accU).toBe(0xFF)
      expect(wrapper.vm.nFlag).toBe(true) // Sign bit set
    })

    it('should handle missing signal properties gracefully', () => {
      wrapper = mount(CalcSection, {
        props: {
          ...defaultProps,
          signals: {} // Empty signals object
        }
      })

      const signalButtons = wrapper.findAllComponents({ name: 'SignalButton' })
      expect(signalButtons.length).toBeGreaterThan(0)
    })

    it('should handle undefined extras gracefully', () => {
      wrapper = mount(CalcSection, {
        props: {
          ...defaultProps,
          extras: { jamlExtras: false }
        }
      })

      expect(wrapper.find('.calcConteiner').classes()).not.toContain('calcConteinerAdditionalSpace')
    })
  })

  describe('Performance', () => {
    it('should handle rapid ACC updates efficiently', async () => {
      wrapper = mount(CalcSection, {
        props: defaultProps
      })

      const values = [0, 100, 200, 255, 128, 64]
      
      for (const value of values) {
        await wrapper.setProps({ ACC: value })
        expect(wrapper.vm._accU).toBe(value & wrapper.vm._mask)
      }
    })

    it('should handle rapid flag state changes', async () => {
      wrapper = mount(CalcSection, {
        props: {
          ...defaultProps,
          wordBits: 8
        }
      })

      const testValues = [0, 128, 255, 1, 127]
      
      for (const acc of testValues) {
        await wrapper.setProps({ ACC: acc })
        
        const expectedZ = (acc & 0xFF) === 0
        const expectedN = ((acc & 0xFF) & 0x80) !== 0
        
        expect(wrapper.vm.zFlag).toBe(expectedZ)
        expect(wrapper.vm.nFlag).toBe(expectedN)
      }
    })
  })

  describe('Accessibility', () => {
    it('should have proper flag titles for accessibility', () => {
      wrapper = mount(CalcSection, {
        props: {
          ...defaultProps,
          ACC: 0x80, // Set N flag
          wordBits: 8
        }
      })

      const nFlag = wrapper.find('div[title="Negative number in Acc"]')
      expect(nFlag.exists()).toBe(true)
      expect(nFlag.attributes('title')).toBe('Negative number in Acc')
    })

    it('should have proper zero flag title', () => {
      wrapper = mount(CalcSection, {
        props: {
          ...defaultProps,
          ACC: 0
        }
      })

      const zFlag = wrapper.find('div[title="Zero in Acc"]')
      expect(zFlag.exists()).toBe(true)
      expect(zFlag.attributes('title')).toBe('Zero in Acc')
    })

    it('should pass accessibility properties to child components', () => {
      wrapper = mount(CalcSection, {
        props: defaultProps
      })

      const accumulator = wrapper.findComponent({ name: 'RegisterComponent' })
      expect(accumulator.props('id')).toBe('accumulator')
      expect(accumulator.props('label')).toBe('AK')
    })
  })
})