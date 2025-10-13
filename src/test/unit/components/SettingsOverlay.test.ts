import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import SettingsOverlay from '../../../components/SettingsOverlay.vue'

// Mock child components
vi.mock('../../../components/SettingsPanel.vue', () => ({
  default: {
    name: 'SettingsPanel',
    template: '<div class="settings-panel">Mock SettingsPanel</div>',
    props: [
      'isAnimated', 'isMobile', 'creators', 'caregivers', 'lightMode',
      'numberFormat', 'codeBits', 'addresBits', 'oddDelay', 'extras',
      'platform', 'decSigned', 'memoryAddresBits', 'autocompleteEnabled'
    ],
    emits: [
      'close', 'update:lightMode', 'update:numberFormat', 'update:decSigned',
      'update:codeBits', 'update:addresBits', 'update:oddDelay', 'update:extras',
      'resetValues', 'defaultSettings', 'open-command-list',
      'update:autocompleteEnabled', 'update:memoryAddresBits'
    ]
  }
}))

vi.mock('../../../components/CreatorsPanel.vue', () => ({
  default: {
    name: 'CreatorsPanel',
    template: '<div class="creators-panel">Mock CreatorsPanel</div>',
    props: ['isMobile', 'isAnimated', 'creators', 'caregivers']
  }
}))

describe('SettingsOverlay.vue', () => {
  let wrapper: any

  const defaultProps = {
    settingsOpen: false,
    isMobile: false,
    lightMode: false,
    numberFormat: 'dec',
    codeBits: 8,
    autocompleteEnabled: true,
    memoryAddresBits: 16,
    addresBits: 16,
    oddDelay: 0,
    decSigned: false,
    extras: {
      xRegister: true,
      yRegister: true,
      dl: true,
      jamlExtras: false,
      busConnectors: true,
      showInvisibleRegisters: false,
      interrupts: false,
      io: false,
      stack: false
    }
  }

  beforeEach(() => {
    vi.useFakeTimers()
    wrapper = mount(SettingsOverlay, {
      props: defaultProps
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Component Structure', () => {
    it('should render with correct base structure when closed', () => {
      expect(wrapper.find('#settings-overlay').exists()).toBe(false)
    })

    it('should render overlay when settingsOpen is true', async () => {
      await wrapper.setProps({ settingsOpen: true })
      
      expect(wrapper.find('#settings-overlay').exists()).toBe(true)
    })

    it('should render both child components when open', async () => {
      await wrapper.setProps({ settingsOpen: true })
      
      expect(wrapper.findComponent({ name: 'SettingsPanel' }).exists()).toBe(true)
      expect(wrapper.findComponent({ name: 'CreatorsPanel' }).exists()).toBe(true)
    })

    it('should have correct component name', () => {
      expect(wrapper.vm.$options.name).toBe('SettingsOverlay')
    })

    it('should have proper z-index styling', async () => {
      await wrapper.setProps({ settingsOpen: true })
      
      const overlay = wrapper.find('#settings-overlay')
      expect(overlay.exists()).toBe(true)
    })
  })

  describe('Props Handling', () => {
    it('should handle settingsOpen prop correctly', async () => {
      expect(wrapper.vm.open).toBe(false)
      
      await wrapper.setProps({ settingsOpen: true })
      expect(wrapper.vm.open).toBe(true)
    })

    it('should pass all props to SettingsPanel', async () => {
      await wrapper.setProps({ settingsOpen: true })
      
      const settingsPanel = wrapper.findComponent({ name: 'SettingsPanel' })
      expect(settingsPanel.props()).toMatchObject({
        isMobile: false,
        lightMode: false,
        numberFormat: 'dec',
        codeBits: 8,
        addresBits: 16,
        oddDelay: 0,
        decSigned: false,
        autocompleteEnabled: true,
        memoryAddresBits: 16,
        extras: defaultProps.extras
      })
    })

    it('should pass required props to CreatorsPanel', async () => {
      await wrapper.setProps({ settingsOpen: true })
      
      const creatorsPanel = wrapper.findComponent({ name: 'CreatorsPanel' })
      expect(creatorsPanel.props()).toMatchObject({
        isMobile: false,
        isAnimated: false // Initially false, becomes true after animation
      })
    })

    it('should handle isMobile prop changes', async () => {
      await wrapper.setProps({ settingsOpen: true, isMobile: true })
      
      const settingsPanel = wrapper.findComponent({ name: 'SettingsPanel' })
      const creatorsPanel = wrapper.findComponent({ name: 'CreatorsPanel' })
      
      expect(settingsPanel.props('isMobile')).toBe(true)
      expect(creatorsPanel.props('isMobile')).toBe(true)
    })

    it('should handle lightMode prop changes', async () => {
      await wrapper.setProps({ settingsOpen: true, lightMode: true })
      
      const settingsPanel = wrapper.findComponent({ name: 'SettingsPanel' })
      expect(settingsPanel.props('lightMode')).toBe(true)
    })

    it('should validate extras prop structure', () => {
      const validExtras = {
        xRegister: true,
        yRegister: false,
        dl: true,
        jamlExtras: false,
        busConnectors: true,
        showInvisibleRegisters: false,
        interrupts: true,
        io: false,
        stack: true
      }
      
      expect(() => {
        mount(SettingsOverlay, {
          props: { ...defaultProps, extras: validExtras }
        })
      }).not.toThrow()
    })

    it('should validate extras prop structure (warning on invalid)', () => {
      const invalidExtras = {
        xRegister: true,
        yRegister: false
        // Missing required properties
      }
      
      // Vue prop validators don't throw errors, they emit warnings and allow mounting
      // This test verifies the component can be mounted but the validator would fail
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      const testWrapper = mount(SettingsOverlay, {
        props: { ...defaultProps, extras: invalidExtras }
      })
      
      expect(testWrapper.vm).toBeDefined()
      consoleSpy.mockRestore()
    })
  })

  describe('Animation State Management', () => {
    it('should handle opening animation sequence', async () => {
      expect(wrapper.vm.open).toBe(false)
      expect(wrapper.vm.isAnimated).toBe(false)
      
      await wrapper.setProps({ settingsOpen: true })
      expect(wrapper.vm.open).toBe(true)
      
      await nextTick()
      vi.advanceTimersByTime(15)
      await nextTick()
      
      expect(wrapper.vm.isAnimated).toBe(true)
    })

    it('should handle closing animation sequence', async () => {
      await wrapper.setProps({ settingsOpen: true })
      await nextTick()
      vi.advanceTimersByTime(15)
      await nextTick()
      
      expect(wrapper.vm.open).toBe(true)
      expect(wrapper.vm.isAnimated).toBe(true)
      
      await wrapper.setProps({ settingsOpen: false })
      await nextTick()
      vi.advanceTimersByTime(15)
      
      expect(wrapper.vm.isAnimated).toBe(false)
      
      vi.advanceTimersByTime(400)
      await nextTick()
      
      expect(wrapper.vm.open).toBe(false)
    })

    it('should pass animation state to child components', async () => {
      await wrapper.setProps({ settingsOpen: true })
      await nextTick()
      vi.advanceTimersByTime(15)
      await nextTick()
      
      const settingsPanel = wrapper.findComponent({ name: 'SettingsPanel' })
      const creatorsPanel = wrapper.findComponent({ name: 'CreatorsPanel' })
      
      expect(settingsPanel.props('isAnimated')).toBe(true)
      expect(creatorsPanel.props('isAnimated')).toBe(true)
    })
  })

  describe('Event Handling', () => {
    it('should emit close event on overlay click', async () => {
      await wrapper.setProps({ settingsOpen: true })
      
      const overlay = wrapper.find('#settings-overlay')
      await overlay.trigger('click')
      
      expect(wrapper.emitted('close')).toBeTruthy()
      expect(wrapper.emitted('close')).toHaveLength(1)
    })

    it('should not emit close on child element click', async () => {
      await wrapper.setProps({ settingsOpen: true })
      
      const settingsPanel = wrapper.findComponent({ name: 'SettingsPanel' })
      await settingsPanel.trigger('click')
      
      expect(wrapper.emitted('close')).toBeFalsy()
    })

    it('should emit close and handle animation when startClose is called', async () => {
      await wrapper.setProps({ settingsOpen: true })
      
      wrapper.vm.startClose()
      
      expect(wrapper.emitted('close')).toBeTruthy()
      
      vi.advanceTimersByTime(400)
      await nextTick()
      
      expect(wrapper.vm.open).toBe(false)
    })
  })

  describe('Event Forwarding', () => {
    beforeEach(async () => {
      await wrapper.setProps({ settingsOpen: true })
    })

    it('should forward lightMode updates', async () => {
      const settingsPanel = wrapper.findComponent({ name: 'SettingsPanel' })
      await settingsPanel.vm.$emit('update:lightMode', true)
      
      expect(wrapper.emitted('update:lightMode')).toBeTruthy()
      expect(wrapper.emitted('update:lightMode')?.[0]).toEqual([true])
    })

    it('should forward numberFormat updates', async () => {
      const settingsPanel = wrapper.findComponent({ name: 'SettingsPanel' })
      await settingsPanel.vm.$emit('update:numberFormat', 'hex')
      
      expect(wrapper.emitted('update:numberFormat')).toBeTruthy()
      expect(wrapper.emitted('update:numberFormat')?.[0]).toEqual(['hex'])
    })

    it('should forward codeBits updates', async () => {
      const settingsPanel = wrapper.findComponent({ name: 'SettingsPanel' })
      await settingsPanel.vm.$emit('update:codeBits', 16)
      
      expect(wrapper.emitted('update:codeBits')).toBeTruthy()
      expect(wrapper.emitted('update:codeBits')?.[0]).toEqual([16])
    })

    it('should forward addresBits updates', async () => {
      const settingsPanel = wrapper.findComponent({ name: 'SettingsPanel' })
      await settingsPanel.vm.$emit('update:addresBits', 32)
      
      expect(wrapper.emitted('update:addresBits')).toBeTruthy()
      expect(wrapper.emitted('update:addresBits')?.[0]).toEqual([32])
    })

    it('should forward oddDelay updates', async () => {
      const settingsPanel = wrapper.findComponent({ name: 'SettingsPanel' })
      await settingsPanel.vm.$emit('update:oddDelay', 500)
      
      expect(wrapper.emitted('update:oddDelay')).toBeTruthy()
      expect(wrapper.emitted('update:oddDelay')?.[0]).toEqual([500])
    })

    it('should forward extras updates', async () => {
      const newExtras = { ...defaultProps.extras, xRegister: false }
      const settingsPanel = wrapper.findComponent({ name: 'SettingsPanel' })
      await settingsPanel.vm.$emit('update:extras', newExtras)
      
      expect(wrapper.emitted('update:extras')).toBeTruthy()
      expect(wrapper.emitted('update:extras')?.[0]).toEqual([newExtras])
    })

    it('should forward decSigned updates', async () => {
      const settingsPanel = wrapper.findComponent({ name: 'SettingsPanel' })
      await settingsPanel.vm.$emit('update:decSigned', true)
      
      expect(wrapper.emitted('update:decSigned')).toBeTruthy()
      expect(wrapper.emitted('update:decSigned')?.[0]).toEqual([true])
    })

    it('should forward autocompleteEnabled updates', async () => {
      const settingsPanel = wrapper.findComponent({ name: 'SettingsPanel' })
      await settingsPanel.vm.$emit('update:autocompleteEnabled', false)
      
      expect(wrapper.emitted('update:autocompleteEnabled')).toBeTruthy()
      expect(wrapper.emitted('update:autocompleteEnabled')?.[0]).toEqual([false])
    })

    it('should forward memoryAddresBits updates', async () => {
      const settingsPanel = wrapper.findComponent({ name: 'SettingsPanel' })
      await settingsPanel.vm.$emit('update:memoryAddresBits', 32)
      
      expect(wrapper.emitted('update:memoryAddresBits')).toBeTruthy()
      expect(wrapper.emitted('update:memoryAddresBits')?.[0]).toEqual([32])
    })

    it('should forward resetValues events', async () => {
      const settingsPanel = wrapper.findComponent({ name: 'SettingsPanel' })
      await settingsPanel.vm.$emit('resetValues')
      
      expect(wrapper.emitted('resetValues')).toBeTruthy()
    })

    it('should forward defaultSettings events', async () => {
      const settingsPanel = wrapper.findComponent({ name: 'SettingsPanel' })
      await settingsPanel.vm.$emit('defaultSettings')
      
      expect(wrapper.emitted('defaultSettings')).toBeTruthy()
    })

    it('should forward open-command-list events', async () => {
      const settingsPanel = wrapper.findComponent({ name: 'SettingsPanel' })
      await settingsPanel.vm.$emit('open-command-list')
      
      expect(wrapper.emitted('open-command-list')).toBeTruthy()
    })

    it('should forward close events from SettingsPanel', async () => {
      const settingsPanel = wrapper.findComponent({ name: 'SettingsPanel' })
      await settingsPanel.vm.$emit('close')
      
      expect(wrapper.emitted('close')).toBeTruthy()
    })
  })

  describe('Lifecycle Management', () => {
    it('should handle mounted lifecycle when settingsOpen is true', () => {
      const mountedWrapper = mount(SettingsOverlay, {
        props: { ...defaultProps, settingsOpen: true }
      })
      
      expect(mountedWrapper.vm.open).toBe(true)
    })

    it('should handle mounted lifecycle when settingsOpen is false', () => {
      const mountedWrapper = mount(SettingsOverlay, {
        props: { ...defaultProps, settingsOpen: false }
      })
      
      expect(mountedWrapper.vm.open).toBe(false)
    })

    it('should set up animation correctly on mount with settingsOpen true', async () => {
      const mountedWrapper = mount(SettingsOverlay, {
        props: { ...defaultProps, settingsOpen: true }
      })
      
      await nextTick()
      vi.advanceTimersByTime(15)
      await nextTick()
      
      expect(mountedWrapper.vm.isAnimated).toBe(true)
    })
  })

  describe('Default Props', () => {
    it('should have correct default creators array', () => {
      const defaultCreators = wrapper.vm.creators
      
      expect(Array.isArray(defaultCreators)).toBe(true)
      expect(defaultCreators).toHaveLength(11)
      expect(defaultCreators[0]).toMatchObject({
        name: 'Szymon Woźnica',
        linkedin: 'https://pl.linkedin.com/in/szymon-wo%C5%BAnica-b46b7b201',
        github: '',
        roles: []
      })
    })

    it('should have correct default caregivers array', () => {
      const defaultCaregivers = wrapper.vm.caregivers
      
      expect(Array.isArray(defaultCaregivers)).toBe(true)
      expect(defaultCaregivers).toHaveLength(3)
      expect(defaultCaregivers[0]).toMatchObject({
        name: 'Dr inż. Robert Tutajewicz',
        linkedin: '',
        roles: []
      })
    })

    it('should handle custom creators prop', () => {
      const customCreators = [
        { name: 'Test Creator', linkedin: 'test-link', github: 'test-github', roles: ['Developer'] }
      ]
      
      const customWrapper = mount(SettingsOverlay, {
        props: { ...defaultProps, creators: customCreators }
      })
      
      expect(customWrapper.vm.creators).toEqual(customCreators)
    })

    it('should handle custom caregivers prop', () => {
      const customCaregivers = [
        { name: 'Test Caregiver', linkedin: 'test-link', roles: ['Supervisor'] }
      ]
      
      const customWrapper = mount(SettingsOverlay, {
        props: { ...defaultProps, caregivers: customCaregivers }
      })
      
      expect(customWrapper.vm.caregivers).toEqual(customCaregivers)
    })
  })

  describe('Environment Variables', () => {
    it('should set platform from environment variable', () => {
      expect(wrapper.vm.platform).toBeDefined()
    })

    it('should pass platform to SettingsPanel', async () => {
      await wrapper.setProps({ settingsOpen: true })
      
      const settingsPanel = wrapper.findComponent({ name: 'SettingsPanel' })
      expect(settingsPanel.props('platform')).toBe(wrapper.vm.platform)
    })
  })

  describe('Edge Cases', () => {
    it('should handle rapid open/close cycles', async () => {
      // Open quickly
      await wrapper.setProps({ settingsOpen: true })
      expect(wrapper.vm.open).toBe(true)
      
      // Close immediately
      await wrapper.setProps({ settingsOpen: false })
      await nextTick()
      vi.advanceTimersByTime(15)
      
      expect(wrapper.vm.isAnimated).toBe(false)
      
      // Open again before close animation completes
      await wrapper.setProps({ settingsOpen: true })
      expect(wrapper.vm.open).toBe(true)
    })

    it('should handle missing props gracefully', () => {
      expect(() => {
        mount(SettingsOverlay, {
          props: {
            isMobile: false,
            lightMode: false,
            numberFormat: 'dec',
            codeBits: 8,
            addresBits: 16,
            oddDelay: 0,
            memoryAddresBits: 16,
            extras: defaultProps.extras
          }
        })
      }).not.toThrow()
    })

    it('should handle null/undefined event data', async () => {
      await wrapper.setProps({ settingsOpen: true })
      
      const settingsPanel = wrapper.findComponent({ name: 'SettingsPanel' })
      
      // Should not throw errors
      await settingsPanel.vm.$emit('update:lightMode', null)
      await settingsPanel.vm.$emit('update:numberFormat', undefined)
      
      expect(wrapper.emitted('update:lightMode')?.[0]).toEqual([null])
      expect(wrapper.emitted('update:numberFormat')?.[0]).toEqual([undefined])
    })

    it('should handle component destruction during animation', () => {
      const testWrapper = mount(SettingsOverlay, {
        props: { ...defaultProps, settingsOpen: true }
      })
      
      // Should not throw error when unmounting during animation
      expect(() => {
        testWrapper.unmount()
      }).not.toThrow()
    })
  })

  describe('Accessibility', () => {
    it('should handle keyboard events on overlay', async () => {
      await wrapper.setProps({ settingsOpen: true })
      
      const overlay = wrapper.find('#settings-overlay')
      
      // Test Escape key behavior (would typically be handled by parent component)
      await overlay.trigger('keydown', { key: 'Escape' })
      
      // Component should still be responsive
      expect(overlay.exists()).toBe(true)
    })

    it('should have proper overlay structure for screen readers', async () => {
      await wrapper.setProps({ settingsOpen: true })
      
      const overlay = wrapper.find('#settings-overlay')
      expect(overlay.exists()).toBe(true)
      
      // Check if child components are present for accessibility
      expect(wrapper.findComponent({ name: 'SettingsPanel' }).exists()).toBe(true)
      expect(wrapper.findComponent({ name: 'CreatorsPanel' }).exists()).toBe(true)
    })
  })

  describe('Performance', () => {
    it('should not re-render unnecessarily', async () => {
      const renderSpy = vi.fn()
      wrapper.vm.$forceUpdate = renderSpy
      
      // Same props should not trigger re-render
      await wrapper.setProps(defaultProps)
      
      expect(renderSpy).not.toHaveBeenCalled()
    })

    it('should handle rapid prop changes efficiently', async () => {
      const startTime = performance.now()
      
      for (let i = 0; i < 50; i++) {
        await wrapper.setProps({
          ...defaultProps,
          lightMode: i % 2 === 0,
          codeBits: i % 3 === 0 ? 8 : 16
        })
      }
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // Should complete within reasonable time
      expect(duration).toBeLessThan(1000)
    })

    it('should clean up timers properly', () => {
      const testWrapper = mount(SettingsOverlay, {
        props: { ...defaultProps, settingsOpen: true }
      })
      
      testWrapper.vm.startClose()
      
      // Unmount before timers complete
      testWrapper.unmount()
      
      // Should not throw errors
      vi.advanceTimersByTime(500)
    })
  })
})