import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import BusLabel from '@/components/BusLabel.vue'

describe('BusLabel.vue', () => {
  let wrapper
  const mockFormatNumber = vi.fn((value) => `formatted_${value}`)

  const defaultProps = {
    busName: 'TEST_BUS',
    busValue: 42,
    showInvisibleRegisters: false,
    mobileView: false,
    formatNumber: mockFormatNumber
  }

  beforeEach(() => {
    vi.clearAllMocks()
    wrapper = mount(BusLabel, {
      props: defaultProps
    })
  })

  describe('Component Structure', () => {
    it('should render with correct base structure', () => {
      expect(wrapper.exists()).toBe(true)
    })

    it('should have correct component name', () => {
      expect(wrapper.vm.$options.name).toBe('BusLabel')
    })

    it('should render spans conditionally', () => {
      // Default state: showInvisibleRegisters=false, mobileView=false
      const spans = wrapper.findAll('span')
      expect(spans.length).toBe(1) // Only the second span should render
      expect(spans[0].text()).toBe('test_bus') // busName.toLowerCase()
    })
  })

  describe('Conditional Rendering Logic', () => {
    it('should show detailed info when showInvisibleRegisters is true and mobileView is false', async () => {
      await wrapper.setProps({ showInvisibleRegisters: true, mobileView: false })
      
      const spans = wrapper.findAll('span')
      expect(spans.length).toBe(2)
      
      // First span: detailed info
      expect(spans[0].text()).toBe('TEST_BUS : formatted_42')
      expect(spans[0].attributes('style')).toContain('margin-right: 5px')
      
      // Second span: lowercase name
      expect(spans[1].text()).toBe('test_bus')
    })

    it('should not show detailed info when mobileView is true regardless of showInvisibleRegisters', async () => {
      await wrapper.setProps({ showInvisibleRegisters: true, mobileView: true })
      
      const spans = wrapper.findAll('span')
      expect(spans.length).toBe(0) // No spans should render when mobileView is true
    })

    it('should only show lowercase name when showInvisibleRegisters is false and mobileView is false', async () => {
      await wrapper.setProps({ showInvisibleRegisters: false, mobileView: false })
      
      const spans = wrapper.findAll('span')
      expect(spans.length).toBe(1)
      expect(spans[0].text()).toBe('test_bus')
    })

    it('should show nothing when mobileView is true', async () => {
      await wrapper.setProps({ mobileView: true })
      
      const spans = wrapper.findAll('span')
      expect(spans.length).toBe(0)
    })
  })

  describe('FormatNumber Function Integration', () => {
    it('should call formatNumber with correct value when showing detailed info', async () => {
      await wrapper.setProps({ showInvisibleRegisters: true, mobileView: false })
      
      expect(mockFormatNumber).toHaveBeenCalledWith(42)
      expect(wrapper.text()).toContain('formatted_42')
    })

    it('should not call formatNumber when not showing detailed info', async () => {
      mockFormatNumber.mockClear()
      await wrapper.setProps({ showInvisibleRegisters: false, mobileView: false })
      
      expect(mockFormatNumber).not.toHaveBeenCalled()
    })

    it('should update formatted value when busValue changes', async () => {
      await wrapper.setProps({ 
        showInvisibleRegisters: true, 
        mobileView: false,
        busValue: 123 
      })
      
      expect(mockFormatNumber).toHaveBeenCalledWith(123)
      expect(wrapper.text()).toContain('formatted_123')
    })
  })

  describe('Bus Name Handling', () => {
    it('should display busName in uppercase in detailed view', async () => {
      await wrapper.setProps({ 
        showInvisibleRegisters: true, 
        mobileView: false,
        busName: 'MyBus'
      })
      
      expect(wrapper.text()).toContain('MyBus : formatted_42')
    })

    it('should display busName in lowercase in simple view', async () => {
      await wrapper.setProps({ 
        showInvisibleRegisters: false, 
        mobileView: false,
        busName: 'MyBus'
      })
      
      expect(wrapper.text()).toBe('mybus')
    })

    it('should handle special characters in busName', async () => {
      await wrapper.setProps({ 
        busName: 'BUS_123-ABC',
        showInvisibleRegisters: false,
        mobileView: false
      })
      
      expect(wrapper.text()).toBe('bus_123-abc')
    })
  })

  describe('Props Handling', () => {
    it('should handle busValue prop correctly', async () => {
      const testValues = [0, 1, -1, 100, -100, 999999]
      
      for (const value of testValues) {
        await wrapper.setProps({ 
          busValue: value,
          showInvisibleRegisters: true,
          mobileView: false
        })
        expect(mockFormatNumber).toHaveBeenCalledWith(value)
      }
    })

    it('should handle boolean props correctly', async () => {
      await wrapper.setProps({ 
        showInvisibleRegisters: true,
        mobileView: false 
      })
      
      expect(wrapper.vm.showInvisibleRegisters).toBe(true)
      expect(wrapper.vm.mobileView).toBe(false)
    })

    it('should react to prop changes immediately', async () => {
      // Start with simple view
      expect(wrapper.findAll('span').length).toBe(1)
      
      // Switch to detailed view
      await wrapper.setProps({ showInvisibleRegisters: true })
      expect(wrapper.findAll('span').length).toBe(2)
      
      // Switch to mobile view (no spans)
      await wrapper.setProps({ mobileView: true })
      expect(wrapper.findAll('span').length).toBe(0)
      
      // Back to simple view
      await wrapper.setProps({ mobileView: false, showInvisibleRegisters: false })
      expect(wrapper.findAll('span').length).toBe(1)
    })
  })

  describe('Edge Cases', () => {
    it('should handle null/undefined busValue gracefully', async () => {
      await wrapper.setProps({ 
        showInvisibleRegisters: true,
        mobileView: false,
        busValue: null 
      })
      
      expect(mockFormatNumber).toHaveBeenCalledWith(null)
      expect(wrapper.text()).toContain('formatted_null')
    })

    it('should handle empty string busName', async () => {
      await wrapper.setProps({ 
        busName: '',
        showInvisibleRegisters: false,
        mobileView: false
      })
      
      expect(wrapper.text()).toBe('')
    })

    it('should handle decimal busValue', async () => {
      await wrapper.setProps({ 
        showInvisibleRegisters: true,
        mobileView: false,
        busValue: 3.14159 
      })
      
      expect(mockFormatNumber).toHaveBeenCalledWith(3.14159)
      expect(wrapper.text()).toContain('formatted_3.14159')
    })

    it('should handle very long busName', async () => {
      const longName = 'A'.repeat(100)
      await wrapper.setProps({ 
        busName: longName,
        showInvisibleRegisters: false,
        mobileView: false
      })
      
      expect(wrapper.text()).toBe(longName.toLowerCase())
    })
  })

  describe('Visibility Combinations', () => {
    it('should handle all possible prop combinations correctly', async () => {
      const testCases = [
        { showInvisibleRegisters: false, mobileView: false, expectedSpans: 1, expectedText: 'test_bus' },
        { showInvisibleRegisters: true, mobileView: false, expectedSpans: 2, expectedText: 'TEST_BUS : formatted_42test_bus' },
        { showInvisibleRegisters: false, mobileView: true, expectedSpans: 0, expectedText: '' },
        { showInvisibleRegisters: true, mobileView: true, expectedSpans: 0, expectedText: '' }
      ]
      
      for (const testCase of testCases) {
        await wrapper.setProps({ 
          showInvisibleRegisters: testCase.showInvisibleRegisters,
          mobileView: testCase.mobileView 
        })
        
        const spans = wrapper.findAll('span')
        expect(spans.length).toBe(testCase.expectedSpans)
        expect(wrapper.text()).toBe(testCase.expectedText)
      }
    })
  })

  describe('Performance', () => {
    it('should call formatNumber only when needed', async () => {
      mockFormatNumber.mockClear()
      
      // Should not call when not showing detailed info
      await wrapper.setProps({ 
        showInvisibleRegisters: false,
        mobileView: false,
        busValue: 999 
      })
      expect(mockFormatNumber).not.toHaveBeenCalled()
      
      // Should call when showing detailed info
      await wrapper.setProps({ showInvisibleRegisters: true })
      expect(mockFormatNumber).toHaveBeenCalledWith(999)
    })

    it('should handle rapid prop changes efficiently', async () => {
      const startTime = performance.now()
      
      for (let i = 0; i < 50; i++) {
        await wrapper.setProps({ showInvisibleRegisters: i % 2 === 0 })
      }
      
      const endTime = performance.now()
      expect(endTime - startTime).toBeLessThan(500)
    })
  })

  describe('Props Validation', () => {
    it('should have correct prop definitions', () => {
      const props = wrapper.vm.$options.props
      
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
      const wrapper2 = mount(BusLabel, {
        props: {
          busName: 'REQUIRED_BUS',
          busValue: 123,
          formatNumber: mockFormatNumber,
          showInvisibleRegisters: true,
          mobileView: false
        }
      })
      
      expect(wrapper2.exists()).toBe(true)
      expect(wrapper2.vm.busName).toBe('REQUIRED_BUS')
      expect(wrapper2.vm.busValue).toBe(123)
    })
  })

  describe('Text Content Analysis', () => {
    it('should format detailed text correctly', async () => {
      await wrapper.setProps({ 
        busName: 'DATA_BUS',
        busValue: 255,
        showInvisibleRegisters: true,
        mobileView: false
      })
      
      const spans = wrapper.findAll('span')
      expect(spans[0].text()).toBe('DATA_BUS : formatted_255')
      expect(spans[1].text()).toBe('data_bus')
    })

    it('should maintain text consistency across updates', async () => {
      await wrapper.setProps({ busName: 'ADDR' })
      
      // Simple view
      await wrapper.setProps({ showInvisibleRegisters: false, mobileView: false })
      expect(wrapper.text()).toBe('addr')
      
      // Detailed view
      await wrapper.setProps({ showInvisibleRegisters: true })
      expect(wrapper.text()).toBe('ADDR : formatted_42addr')
      
      // Back to simple
      await wrapper.setProps({ showInvisibleRegisters: false })
      expect(wrapper.text()).toBe('addr')
    })
  })

  describe('CSS Styling', () => {
    it('should apply correct inline styles to detailed span', async () => {
      await wrapper.setProps({ showInvisibleRegisters: true, mobileView: false })
      
      const detailedSpan = wrapper.findAll('span')[0]
      expect(detailedSpan.attributes('style')).toContain('margin-right: 5px')
    })

    it('should not apply styles to simple span', async () => {
      await wrapper.setProps({ showInvisibleRegisters: false, mobileView: false })
      
      const simpleSpan = wrapper.find('span')
      expect(simpleSpan.attributes('style')).toBeUndefined()
    })
  })
})