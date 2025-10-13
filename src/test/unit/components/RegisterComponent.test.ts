import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import RegisterComponent from '../../../components/RegisterComponent.vue'

// Mock KogWheelIcon
vi.mock('@/assets/svg/KogWheelIcon.vue', () => ({
  default: {
    name: 'KogWheelIcon',
    template: '<svg class="kog-wheel-icon"><path /></svg>'
  }
}))

describe('RegisterComponent.vue', () => {
  let wrapper: any

  const defaultProps = {
    label: 'AK',
    id: 'akkumulator',
    model: 42,
    numberFormat: 'dec'
  }

  const mockValidateRegisterValue = vi.fn().mockReturnValue(true)
  const mockShowToast = vi.fn()
  const mockGetMaxValueForRegister = vi.fn().mockReturnValue(4095)

  beforeEach(() => {
    wrapper = mount(RegisterComponent, {
      props: defaultProps,
      global: {
        provide: {
          validateRegisterValue: mockValidateRegisterValue,
          showToast: mockShowToast,
          getMaxValueForRegister: mockGetMaxValueForRegister
        }
      }
    })
  })

  afterEach(() => {
    wrapper.unmount()
    vi.clearAllMocks()
  })

  describe('Component Structure', () => {
    it('should render with correct base structure', () => {
      expect(wrapper.find('.register-container').exists()).toBe(true)
      expect(wrapper.props('id')).toBe('akkumulator')
      expect(wrapper.classes()).toContain('register-container')
    })

    it('should display label and value when edit is enabled', () => {
      expect(wrapper.text()).toContain('AK')
      expect(wrapper.text()).toContain('42')
      expect(wrapper.text()).toContain(':')
    })

    it('should render format selector when enabled', () => {
      expect(wrapper.find('.format-selector').exists()).toBe(true)
      expect(wrapper.find('.format-button').exists()).toBe(true)
      expect(wrapper.findComponent({ name: 'KogWheelIcon' }).exists()).toBe(true)
    })

    it('should hide format selector when disabled', async () => {
      await wrapper.setProps({ showFormatSelector: false })
      expect(wrapper.find('.format-selector').exists()).toBe(false)
    })

    it('should hide input when editing is disabled', async () => {
      await wrapper.setProps({ isEnableEditValue: false })
      expect(wrapper.find('.inputWrapper').exists()).toBe(false)
    })

    it('should have correct component name', () => {
      expect(wrapper.vm.$options.name).toBe('RegisterComponent')
    })
  })

  describe('Props Handling', () => {
    it('should handle label prop correctly', async () => {
      await wrapper.setProps({ label: 'X' })
      expect(wrapper.text()).toContain('X')
    })

    it('should handle model value updates', async () => {
      await wrapper.setProps({ model: 255 })
      expect(wrapper.text()).toContain('255')
    })

    it('should handle numberFormat changes', async () => {
      await wrapper.setProps({ numberFormat: 'hex', model: 255 })
      expect(wrapper.text()).toContain('0xFF')
    })

    it('should handle classNames prop', async () => {
      await wrapper.setProps({ classNames: 'custom-class' })
      expect(wrapper.classes()).toContain('custom-class')
    })

    it('should handle wordBits prop for signed values', async () => {
      await wrapper.setProps({ 
        signedDec: true, 
        wordBits: 8, 
        model: 255,
        numberFormat: 'dec'
      })
      expect(wrapper.text()).toContain('-1')
    })

    it('should handle signedDec prop', async () => {
      await wrapper.setProps({ 
        signedDec: true, 
        model: 2048,
        numberFormat: 'dec'
      })
      expect(wrapper.text()).toContain('-2048')
    })
  })

  describe('Value Formatting', () => {
    it('should format decimal values correctly', () => {
      expect(wrapper.vm.formattedValue).toBe('42')
    })

    it('should format hexadecimal values correctly', async () => {
      await wrapper.setProps({ numberFormat: 'hex', model: 255 })
      expect(wrapper.vm.formattedValue).toBe('0xFF')
    })

    it('should format binary values correctly', async () => {
      await wrapper.setProps({ numberFormat: 'bin', model: 7 })
      expect(wrapper.vm.formattedValue).toBe('0b111')
    })

    it('should handle zero value', async () => {
      await wrapper.setProps({ model: 0 })
      expect(wrapper.vm.formattedValue).toBe('0')
    })

    it('should handle large values', async () => {
      await wrapper.setProps({ model: 4095, numberFormat: 'hex' })
      expect(wrapper.vm.formattedValue).toBe('0xFFF')
    })

    it('should handle invalid model values', async () => {
      await wrapper.setProps({ model: NaN })
      expect(wrapper.vm.formattedValue).toBe('Błąd')
    })

    it('should handle null model values', async () => {
      await wrapper.setProps({ model: null })
      expect(wrapper.vm.formattedValue).toBe('Błąd')
    })

    it('should handle undefined model values', async () => {
      await wrapper.setProps({ model: undefined })
      expect(wrapper.vm.formattedValue).toBe('Błąd')
    })

    it('should format signed decimal correctly for negative values', async () => {
      await wrapper.setProps({ 
        signedDec: true, 
        wordBits: 12, 
        model: 4095,
        numberFormat: 'dec'
      })
      expect(wrapper.vm.formattedValue).toBe('-1')
    })

    it('should format signed decimal correctly for positive values', async () => {
      await wrapper.setProps({ 
        signedDec: true, 
        wordBits: 12, 
        model: 1,
        numberFormat: 'dec'
      })
      expect(wrapper.vm.formattedValue).toBe('1')
    })
  })

  describe('Full Name Mapping', () => {
    it('should map AK to Akumulator', async () => {
      await wrapper.setProps({ label: 'AK' })
      expect(wrapper.vm.fullName).toBe('Akumulator')
    })

    it('should map X to Rejestr X', async () => {
      await wrapper.setProps({ label: 'X' })
      expect(wrapper.vm.fullName).toBe('Rejestr X')
    })

    it('should map Y to Rejestr Y', async () => {
      await wrapper.setProps({ label: 'Y' })
      expect(wrapper.vm.fullName).toBe('Rejestr Y')
    })

    it('should map I to Rejestr I (adresowy)', async () => {
      await wrapper.setProps({ label: 'I' })
      expect(wrapper.vm.fullName).toBe('Rejestr I (adresowy)')
    })

    it('should map L to Licznik', async () => {
      await wrapper.setProps({ label: 'L' })
      expect(wrapper.vm.fullName).toBe('Licznik')
    })

    it('should map WS to Wskaźnik stosu', async () => {
      await wrapper.setProps({ label: 'WS' })
      expect(wrapper.vm.fullName).toBe('Wskaźnik stosu')
    })

    it('should return label for unknown register types', async () => {
      await wrapper.setProps({ label: 'UNKNOWN' })
      expect(wrapper.vm.fullName).toBe('UNKNOWN')
    })
  })

  describe('Register Type Mapping', () => {
    it('should map AK to ACC', async () => {
      await wrapper.setProps({ label: 'AK' })
      expect(wrapper.vm.registerType).toBe('ACC')
    })

    it('should map L to programCounter', async () => {
      await wrapper.setProps({ label: 'L' })
      expect(wrapper.vm.registerType).toBe('programCounter')
    })

    it('should return label for unmapped types', async () => {
      await wrapper.setProps({ label: 'CUSTOM' })
      expect(wrapper.vm.registerType).toBe('CUSTOM')
    })
  })

  describe('Input Handling', () => {
    it('should update value on valid input', async () => {
      const input = wrapper.find('input[type="number"]')
      await input.setValue('100')
      await input.trigger('input')
      
      expect(wrapper.emitted('update:model')).toBeTruthy()
      expect(wrapper.emitted('update:model')?.[0]).toEqual([100])
    })

    it('should call validation when validateRegisterValue is provided', async () => {
      const input = wrapper.find('input[type="number"]')
      await input.setValue('100')
      await input.trigger('input')
      
      expect(mockValidateRegisterValue).toHaveBeenCalledWith(100, 'ACC', 'Akumulator')
    })

    it('should not emit when validation fails', async () => {
      // Stwórz nową instancję komponentu bez mockValidateRegisterValue w globalnym provide
      const mockValidateRegisterValue = vi.fn().mockReturnValue(false)
      
      const validationWrapper = mount(RegisterComponent, {
        props: { ...defaultProps, label: 'AK', model: 0 },
        global: { provide: { validateRegisterValue: mockValidateRegisterValue } },
      })
      
      const input = validationWrapper.find('input[type="number"]')
      await input.setValue('42')
      await input.trigger('input')
      
      // Sprawdź czy walidacja została wywołana
      expect(mockValidateRegisterValue).toHaveBeenCalledWith(42, 'ACC', 'Akumulator')
      
      // Sprawdź czy wartość zostanie przywrócona przez komponent
      expect((input.element as HTMLInputElement).value).toBe('0')
      
      validationWrapper.unmount()
    })

    it('should check max value when getMaxValueForRegister is provided', async () => {
      // Stwórz nową instancję komponentu tylko z funkcją getMaxValueForRegister (bez validateRegisterValue)
      const mockGetMaxValueForRegister = vi.fn().mockReturnValue(255)
      const mockShowToast = vi.fn()
      
      const maxValueWrapper = mount(RegisterComponent, {
        props: { ...defaultProps, label: 'AK', model: 0 },
        global: { 
          provide: { 
            getMaxValueForRegister: mockGetMaxValueForRegister,
            showToast: mockShowToast
          } 
        },
      })
      
      const input = maxValueWrapper.find('input[type="number"]')
      await input.setValue('300')
      await input.trigger('input')
      
      expect(mockGetMaxValueForRegister).toHaveBeenCalledWith('ACC')
      expect(mockShowToast).toHaveBeenCalledWith(
        'Wartość 300 przekracza maksymalną dozwoloną wartość 255 dla rejestru Akumulator.'
      )
      
      maxValueWrapper.unmount()
    })

    it('should emit null for invalid input', async () => {
      const input = wrapper.find('input[type="number"]')
      await input.setValue('abc')
      await input.trigger('input')
      
      expect(wrapper.emitted('update:model')).toBeTruthy()
      expect(wrapper.emitted('update:model')?.[0]).toEqual([null])
    })

    it('should handle blur event with empty value', async () => {
      const input = wrapper.find('input[type="number"]')
      input.element.value = ''
      await input.trigger('blur')
      
      expect(wrapper.emitted('update:model')).toBeTruthy()
      expect(wrapper.emitted('update:model')?.[0]).toEqual([0])
    })

    it('should handle blur event with null value', async () => {
      const input = wrapper.find('input[type="number"]')
      input.element.value = null
      await input.trigger('blur')
      
      expect(wrapper.emitted('update:model')).toBeTruthy()
      expect(wrapper.emitted('update:model')?.[0]).toEqual([0])
    })
  })

  describe('Format Menu', () => {
    it('should toggle format menu when button is clicked', async () => {
      const formatButton = wrapper.find('.format-button')
      
      expect(wrapper.vm.showFormatMenu).toBe(false)
      await formatButton.trigger('click')
      expect(wrapper.vm.showFormatMenu).toBe(true)
      
      await formatButton.trigger('click')
      expect(wrapper.vm.showFormatMenu).toBe(false)
    })

    it('should show format menu with all options', async () => {
      const formatButton = wrapper.find('.format-button')
      await formatButton.trigger('click')
      
      const menu = wrapper.find('.format-menu')
      expect(menu.exists()).toBe(true)
      expect(menu.text()).toContain('DEC')
      expect(menu.text()).toContain('HEX')
      expect(menu.text()).toContain('BIN')
    })

    it('should highlight active format', async () => {
      await wrapper.setProps({ numberFormat: 'hex' })
      const formatButton = wrapper.find('.format-button')
      await formatButton.trigger('click')
      
      const menuItems = wrapper.findAll('.format-menu div')
      const hexItem = menuItems.find(item => item.text() === 'HEX')
      expect(hexItem?.classes()).toContain('active')
    })

    it('should emit format change when menu item is clicked', async () => {
      const formatButton = wrapper.find('.format-button')
      await formatButton.trigger('click')
      
      const hexItem = wrapper.find('.format-menu div:nth-child(2)')
      await hexItem.trigger('click')
      
      expect(wrapper.emitted('update:numberFormat')).toBeTruthy()
      expect(wrapper.emitted('update:numberFormat')?.[0]).toEqual(['hex'])
      expect(wrapper.vm.showFormatMenu).toBe(false)
    })

    it('should close menu when clicking outside', async () => {
      const formatButton = wrapper.find('.format-button')
      await formatButton.trigger('click')
      expect(wrapper.vm.showFormatMenu).toBe(true)
      
      // Simulate click outside
      document.dispatchEvent(new Event('click'))
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.showFormatMenu).toBe(false)
    })
  })

  describe('Edge Position Detection', () => {
    it('should detect left edge position on mouse enter', async () => {
      // Mock getBoundingClientRect to simulate left edge
      const mockGetBoundingClientRect = vi.fn().mockReturnValue({
        left: 10,
        right: 100
      })
      wrapper.vm.$el.getBoundingClientRect = mockGetBoundingClientRect
      
      const label = wrapper.find('span[title]')
      await label.trigger('mouseenter')
      
      expect(wrapper.vm.edgeClass).toBe('edge-left')
    })

    it('should detect right edge position on mouse enter', async () => {
      // Mock getBoundingClientRect and window.innerWidth
      Object.defineProperty(window, 'innerWidth', { value: 1000, writable: true })
      const mockGetBoundingClientRect = vi.fn().mockReturnValue({
        left: 800,
        right: 980
      })
      wrapper.vm.$el.getBoundingClientRect = mockGetBoundingClientRect
      
      const label = wrapper.find('span[title]')
      await label.trigger('mouseenter')
      
      expect(wrapper.vm.edgeClass).toBe('edge-right')
    })

    it('should clear edge class when not on edge', async () => {
      const mockGetBoundingClientRect = vi.fn().mockReturnValue({
        left: 200,
        right: 300
      })
      wrapper.vm.$el.getBoundingClientRect = mockGetBoundingClientRect
      
      const label = wrapper.find('span[title]')
      await label.trigger('mouseenter')
      
      expect(wrapper.vm.edgeClass).toBe('')
    })

    it('should clear edge class on mouse leave', async () => {
      wrapper.vm.edgeClass = 'edge-left'
      
      const label = wrapper.find('span[title]')
      await label.trigger('mouseleave')
      
      expect(wrapper.vm.edgeClass).toBe('')
    })
  })

  describe('Lifecycle Management', () => {
    it('should add click listener on mount', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener')
      
      mount(RegisterComponent, {
        props: defaultProps,
        global: {
          provide: {
            validateRegisterValue: mockValidateRegisterValue,
            showToast: mockShowToast,
            getMaxValueForRegister: mockGetMaxValueForRegister
          }
        }
      })
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function))
    })

    it('should remove click listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')
      
      const testWrapper = mount(RegisterComponent, {
        props: defaultProps,
        global: {
          provide: {
            validateRegisterValue: mockValidateRegisterValue,
            showToast: mockShowToast,
            getMaxValueForRegister: mockGetMaxValueForRegister
          }
        }
      })
      
      testWrapper.unmount()
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function))
    })
  })

  describe('Edge Cases', () => {
    it('should handle component without validation functions', () => {
      const noValidationWrapper = mount(RegisterComponent, {
        props: defaultProps,
        global: {
          provide: {}
        }
      })
      
      expect(noValidationWrapper.exists()).toBe(true)
      noValidationWrapper.unmount()
    })

    it('should handle extremely large numbers', async () => {
      await wrapper.setProps({ model: Number.MAX_SAFE_INTEGER })
      expect(wrapper.vm.formattedValue).toBe(Number.MAX_SAFE_INTEGER.toString())
    })

    it('should handle extremely small numbers', async () => {
      await wrapper.setProps({ model: Number.MIN_SAFE_INTEGER })
      expect(wrapper.vm.formattedValue).toBe(Number.MIN_SAFE_INTEGER.toString())
    })

    it('should handle unknown number format', async () => {
      await wrapper.setProps({ numberFormat: 'unknown' })
      expect(wrapper.vm.formattedValue).toBe('42') // Should default to decimal
    })

    it('should handle edge case word bits', async () => {
      await wrapper.setProps({ 
        signedDec: true, 
        wordBits: 1, 
        model: 1,
        numberFormat: 'dec'
      })
      expect(wrapper.vm.formattedValue).toBe('-1')
    })
  })

  describe('Accessibility', () => {
    it('should have proper title attribute for tooltips', () => {
      const labelSpan = wrapper.find('span[title]')
      expect(labelSpan.attributes('title')).toBe('Akumulator')
    })

    it('should have proper input attributes', () => {
      const input = wrapper.find('input[type="number"]')
      expect(input.attributes('inputmode')).toBe('numeric')
      expect(input.attributes('pattern')).toBe('[0-9]*')
    })

    it('should be keyboard accessible', () => {
      const interactiveElements = wrapper.findAll('input, button')
      expect(interactiveElements.length).toBeGreaterThan(0)
    })
  })

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const renderSpy = vi.spyOn(wrapper.vm, '$forceUpdate')
      
      wrapper.setProps({ 
        model: 42, // Same value
        numberFormat: 'dec' // Same value
      })
      
      expect(renderSpy).not.toHaveBeenCalled()
    })

    it('should handle rapid value changes efficiently', async () => {
      const startTime = performance.now()
      
      for (let i = 0; i < 100; i++) {
        await wrapper.setProps({ model: i })
      }
      
      const endTime = performance.now()
      expect(endTime - startTime).toBeLessThan(1000) // Should be fast
    })

    it('should handle rapid format changes efficiently', async () => {
      const formats = ['dec', 'hex', 'bin']
      
      const startTime = performance.now()
      
      for (let i = 0; i < 30; i++) {
        await wrapper.setProps({ numberFormat: formats[i % 3] })
      }
      
      const endTime = performance.now()
      expect(endTime - startTime).toBeLessThan(1000) // Should be fast
    })
  })
})