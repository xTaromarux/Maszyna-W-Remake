import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import BusSignal from '@/components/BusSignal.vue'
import BusLabel from '@/components/BusLabel.vue'

describe('BusSignal.vue', () => {
  let wrapper
  const mockFormatNumber = vi.fn((value) => `formatted_${value}`)

  const defaultProps = {
    signalStatus: false,
    busName: 'TEST_BUS',
    busValue: 42,
    showInvisibleRegisters: false,
    mobileView: false,
    formatNumber: mockFormatNumber
  }

  beforeEach(() => {
    vi.clearAllMocks()
    wrapper = mount(BusSignal, {
      props: defaultProps
    })
  })

  describe('Component Structure', () => {
    it('should render with correct base structure', () => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.element.tagName).toBe('DIV')
      expect(wrapper.classes()).toContain('bus')
      expect(wrapper.classes()).toContain('signal')
    })

    it('should have correct component name', () => {
      expect(wrapper.vm.$options.name).toBe('BusSignal')
    })

    it('should contain line div and BusLabel component', () => {
      expect(wrapper.find('.line').exists()).toBe(true)
      expect(wrapper.findComponent(BusLabel).exists()).toBe(true)
    })

    it('should have proper DOM hierarchy', () => {
      const mainDiv = wrapper.find('.bus.signal')
      const lineDiv = wrapper.find('.line')
      const busLabel = wrapper.findComponent(BusLabel)
      
      expect(mainDiv.exists()).toBe(true)
      expect(lineDiv.exists()).toBe(true)
      expect(busLabel.exists()).toBe(true)
      
      // Verify line div is child of main div
      expect(lineDiv.element.parentElement).toBe(mainDiv.element)
      
      // Verify BusLabel component exists within the main div structure
      expect(wrapper.findComponent(BusLabel).exists()).toBe(true)
      const busLabelElement = wrapper.find('.bus.signal span')
      expect(busLabelElement.exists()).toBe(true)
    })
  })

  describe('Signal Status Handling', () => {
    it('should not have active class when signalStatus is false', () => {
      expect(wrapper.classes()).not.toContain('active')
    })

    it('should have active class when signalStatus is true', async () => {
      await wrapper.setProps({ signalStatus: true })
      expect(wrapper.classes()).toContain('active')
    })

    it('should toggle active class when signalStatus changes', async () => {
      // Initially false
      expect(wrapper.classes()).not.toContain('active')
      
      // Set to true
      await wrapper.setProps({ signalStatus: true })
      expect(wrapper.classes()).toContain('active')
      
      // Set back to false
      await wrapper.setProps({ signalStatus: false })
      expect(wrapper.classes()).not.toContain('active')
    })

    it('should handle rapid signal status changes', async () => {
      const states = [true, false, true, false, true]
      
      for (const state of states) {
        await wrapper.setProps({ signalStatus: state })
        expect(wrapper.classes().includes('active')).toBe(state)
      }
    })
  })

  describe('BusLabel Integration', () => {
    it('should pass correct props to BusLabel', () => {
      const busLabel = wrapper.findComponent(BusLabel)
      
      expect(busLabel.props()).toEqual({
        busName: 'TEST_BUS',
        busValue: 42,
        showInvisibleRegisters: false,
        mobileView: false,
        formatNumber: mockFormatNumber
      })
    })

    it('should update BusLabel props when own props change', async () => {
      await wrapper.setProps({
        busName: 'NEW_BUS',
        busValue: 123,
        showInvisibleRegisters: true,
        mobileView: true
      })
      
      const busLabel = wrapper.findComponent(BusLabel)
      expect(busLabel.props()).toEqual({
        busName: 'NEW_BUS',
        busValue: 123,
        showInvisibleRegisters: true,
        mobileView: true,
        formatNumber: mockFormatNumber
      })
    })

    it('should maintain BusLabel component across signalStatus changes', async () => {
      const initialBusLabel = wrapper.findComponent(BusLabel)
      expect(initialBusLabel.exists()).toBe(true)
      
      await wrapper.setProps({ signalStatus: true })
      const busLabelAfterChange = wrapper.findComponent(BusLabel)
      expect(busLabelAfterChange.exists()).toBe(true)
    })
  })

  describe('Props Handling', () => {
    it('should handle signalStatus prop correctly', async () => {
      expect(wrapper.vm.signalStatus).toBe(false)
      
      await wrapper.setProps({ signalStatus: true })
      expect(wrapper.vm.signalStatus).toBe(true)
    })

    it('should handle busName prop correctly', async () => {
      expect(wrapper.vm.busName).toBe('TEST_BUS')
      
      await wrapper.setProps({ busName: 'ADDRESS_BUS' })
      expect(wrapper.vm.busName).toBe('ADDRESS_BUS')
    })

    it('should handle busValue prop correctly', async () => {
      expect(wrapper.vm.busValue).toBe(42)
      
      await wrapper.setProps({ busValue: 255 })
      expect(wrapper.vm.busValue).toBe(255)
    })

    it('should handle boolean props correctly', async () => {
      await wrapper.setProps({
        showInvisibleRegisters: true,
        mobileView: true
      })
      
      expect(wrapper.vm.showInvisibleRegisters).toBe(true)
      expect(wrapper.vm.mobileView).toBe(true)
    })

    it('should handle function prop correctly', () => {
      expect(wrapper.vm.formatNumber).toBe(mockFormatNumber)
    })
  })

  describe('CSS Classes', () => {
    it('should always have base CSS classes', () => {
      expect(wrapper.classes()).toContain('bus')
      expect(wrapper.classes()).toContain('signal')
    })

    it('should maintain base classes when active', async () => {
      await wrapper.setProps({ signalStatus: true })
      
      expect(wrapper.classes()).toContain('bus')
      expect(wrapper.classes()).toContain('signal')
      expect(wrapper.classes()).toContain('active')
    })

    it('should have correct class combination when active', async () => {
      await wrapper.setProps({ signalStatus: true })
      
      const expectedClasses = ['bus', 'signal', 'active']
      expectedClasses.forEach(className => {
        expect(wrapper.classes()).toContain(className)
      })
    })

    it('should have correct class combination when inactive', () => {
      const expectedClasses = ['bus', 'signal']
      const notExpectedClasses = ['active']
      
      expectedClasses.forEach(className => {
        expect(wrapper.classes()).toContain(className)
      })
      
      notExpectedClasses.forEach(className => {
        expect(wrapper.classes()).not.toContain(className)
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle null/undefined busValue gracefully', async () => {
      await wrapper.setProps({ busValue: null })
      
      const busLabel = wrapper.findComponent(BusLabel)
      expect(busLabel.props('busValue')).toBe(null)
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle empty string busName', async () => {
      await wrapper.setProps({ busName: '' })
      
      const busLabel = wrapper.findComponent(BusLabel)
      expect(busLabel.props('busName')).toBe('')
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle very long busName', async () => {
      const longName = 'A'.repeat(100)
      await wrapper.setProps({ busName: longName })
      
      const busLabel = wrapper.findComponent(BusLabel)
      expect(busLabel.props('busName')).toBe(longName)
    })

    it('should handle negative busValue', async () => {
      await wrapper.setProps({ busValue: -42 })
      
      const busLabel = wrapper.findComponent(BusLabel)
      expect(busLabel.props('busValue')).toBe(-42)
    })

    it('should handle decimal busValue', async () => {
      await wrapper.setProps({ busValue: 3.14159 })
      
      const busLabel = wrapper.findComponent(BusLabel)
      expect(busLabel.props('busValue')).toBe(3.14159)
    })
  })

  describe('Component Integration', () => {
    it('should properly integrate all props and child components', async () => {
      await wrapper.setProps({
        signalStatus: true,
        busName: 'DATA',
        busValue: 255,
        showInvisibleRegisters: true,
        mobileView: false
      })
      
      // Check main component classes
      expect(wrapper.classes()).toContain('bus')
      expect(wrapper.classes()).toContain('signal')
      expect(wrapper.classes()).toContain('active')
      
      // Check line element
      expect(wrapper.find('.line').exists()).toBe(true)
      
      // Check BusLabel props
      const busLabel = wrapper.findComponent(BusLabel)
      expect(busLabel.props()).toEqual({
        busName: 'DATA',
        busValue: 255,
        showInvisibleRegisters: true,
        mobileView: false,
        formatNumber: mockFormatNumber
      })
    })

    it('should maintain component structure across prop changes', async () => {
      const initialStructure = {
        mainDiv: wrapper.find('.bus.signal').exists(),
        lineDiv: wrapper.find('.line').exists(),
        busLabel: wrapper.findComponent(BusLabel).exists()
      }
      
      // Change multiple props
      await wrapper.setProps({
        signalStatus: true,
        busName: 'CHANGED',
        busValue: 999,
        showInvisibleRegisters: true,
        mobileView: true
      })
      
      const finalStructure = {
        mainDiv: wrapper.find('.bus.signal').exists(),
        lineDiv: wrapper.find('.line').exists(),
        busLabel: wrapper.findComponent(BusLabel).exists()
      }
      
      expect(finalStructure).toEqual(initialStructure)
    })
  })

  describe('Performance', () => {
    it('should not re-render unnecessarily', async () => {
      const initialHtml = wrapper.html()
      
      // Set same props
      await wrapper.setProps({
        signalStatus: false,
        busName: 'TEST_BUS',
        busValue: 42,
        showInvisibleRegisters: false,
        mobileView: false
      })
      
      expect(wrapper.html()).toBe(initialHtml)
    })

    it('should handle frequent signalStatus updates efficiently', async () => {
      const startTime = performance.now()
      
      for (let i = 0; i < 100; i++) {
        await wrapper.setProps({ signalStatus: i % 2 === 0 })
      }
      
      const endTime = performance.now()
      expect(endTime - startTime).toBeLessThan(1000)
    })

    it('should handle mixed prop updates efficiently', async () => {
      const startTime = performance.now()
      
      for (let i = 0; i < 50; i++) {
        await wrapper.setProps({
          signalStatus: i % 2 === 0,
          busValue: i,
          showInvisibleRegisters: i % 3 === 0
        })
      }
      
      const endTime = performance.now()
      expect(endTime - startTime).toBeLessThan(1000)
    })
  })

  describe('Props Validation', () => {
    it('should have correct prop definitions', () => {
      const props = wrapper.vm.$options.props
      
      expect(props.signalStatus.type).toBe(Boolean)
      expect(props.signalStatus.required).toBe(true)
      
      expect(props.busName.type).toBe(String)
      expect(props.busName.required).toBe(true)
      
      expect(props.busValue.type).toBe(Number)
      expect(props.busValue.required).toBe(true)
      
      expect(props.showInvisibleRegisters.type).toBe(Boolean)
      expect(props.showInvisibleRegisters.default).toBe(false)
      
      expect(props.mobileView.type).toBe(Boolean)
      expect(props.mobileView.required).toBe(false)
      
      expect(props.formatNumber.type).toBe(Function)
      expect(props.formatNumber.required).toBe(true)
    })

    it('should handle all required props', () => {
      const wrapper2 = mount(BusSignal, {
        props: {
          signalStatus: true,
          busName: 'REQUIRED_BUS',
          busValue: 123,
          formatNumber: mockFormatNumber
        }
      })
      
      expect(wrapper2.exists()).toBe(true)
      expect(wrapper2.vm.signalStatus).toBe(true)
      expect(wrapper2.vm.busName).toBe('REQUIRED_BUS')
      expect(wrapper2.vm.busValue).toBe(123)
    })
  })

  describe('Accessibility', () => {
    it('should provide semantic structure', () => {
      expect(wrapper.element.tagName).toBe('DIV')
      expect(wrapper.find('.line').element.tagName).toBe('DIV')
      expect(wrapper.findComponent(BusLabel).exists()).toBe(true)
    })

    it('should maintain accessible content through child components', () => {
      const busLabel = wrapper.findComponent(BusLabel)
      expect(busLabel.exists()).toBe(true)
      expect(busLabel.props('busName')).toBeTruthy()
    })

    it('should provide visual feedback through CSS classes', async () => {
      // Inactive state
      expect(wrapper.classes()).not.toContain('active')
      
      // Active state
      await wrapper.setProps({ signalStatus: true })
      expect(wrapper.classes()).toContain('active')
    })
  })

  describe('State Combinations', () => {
    it('should handle all possible boolean state combinations', async () => {
      const testCases = [
        { signalStatus: false, showInvisibleRegisters: false, mobileView: false },
        { signalStatus: true, showInvisibleRegisters: false, mobileView: false },
        { signalStatus: false, showInvisibleRegisters: true, mobileView: false },
        { signalStatus: true, showInvisibleRegisters: true, mobileView: false },
        { signalStatus: false, showInvisibleRegisters: false, mobileView: true },
        { signalStatus: true, showInvisibleRegisters: false, mobileView: true },
        { signalStatus: false, showInvisibleRegisters: true, mobileView: true },
        { signalStatus: true, showInvisibleRegisters: true, mobileView: true }
      ]
      
      for (const testCase of testCases) {
        await wrapper.setProps(testCase)
        
        // Check signal status reflected in CSS
        expect(wrapper.classes().includes('active')).toBe(testCase.signalStatus)
        
        // Check BusLabel receives correct props
        const busLabel = wrapper.findComponent(BusLabel)
        expect(busLabel.props('showInvisibleRegisters')).toBe(testCase.showInvisibleRegisters)
        expect(busLabel.props('mobileView')).toBe(testCase.mobileView)
      }
    })
  })

  describe('Reactive Behavior', () => {
    it('should react immediately to prop changes', async () => {
      // Test signalStatus
      expect(wrapper.classes()).not.toContain('active')
      await wrapper.setProps({ signalStatus: true })
      expect(wrapper.classes()).toContain('active')
      
      // Test busName
      expect(wrapper.findComponent(BusLabel).props('busName')).toBe('TEST_BUS')
      await wrapper.setProps({ busName: 'NEW_BUS' })
      expect(wrapper.findComponent(BusLabel).props('busName')).toBe('NEW_BUS')
      
      // Test busValue
      expect(wrapper.findComponent(BusLabel).props('busValue')).toBe(42)
      await wrapper.setProps({ busValue: 999 })
      expect(wrapper.findComponent(BusLabel).props('busValue')).toBe(999)
    })

    it('should maintain reactivity across multiple updates', async () => {
      const updates = [
        { signalStatus: true, busValue: 1, busName: 'BUS1' },
        { signalStatus: false, busValue: 2, busName: 'BUS2' },
        { signalStatus: true, busValue: 3, busName: 'BUS3' }
      ]
      
      for (const update of updates) {
        await wrapper.setProps(update)
        
        expect(wrapper.classes().includes('active')).toBe(update.signalStatus)
        
        const busLabel = wrapper.findComponent(BusLabel)
        expect(busLabel.props('busValue')).toBe(update.busValue)
        expect(busLabel.props('busName')).toBe(update.busName)
      }
    })
  })
})