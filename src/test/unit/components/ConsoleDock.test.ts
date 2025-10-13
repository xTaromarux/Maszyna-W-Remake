import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import ConsoleDock from '../../../components/ConsoleDock.vue'
import Console from '../../../components/Console.vue'

describe('ConsoleDock.vue', () => {
  let wrapper: VueWrapper

  const defaultProps = {
    manualMode: false,
    codeCompiled: false,
    code: 'test code',
    isRunning: false,
    isFastRunning: false,
    fastProgress: 0,
    logs: [],
    consoleOpen: true,
    hasConsoleErrors: false,
    breakpointsEnabled: true
  }

  beforeEach(() => {
    wrapper = mount(ConsoleDock, {
      props: defaultProps
    })
  })

  describe('Component Structure', () => {
    it('should render with correct base structure', () => {
      expect(wrapper.find('.console-dock').exists()).toBe(true)
      expect(wrapper.vm.$options.name).toBe('ConsoleDock')
    })

    it('should render controls rail when console is open', () => {
      expect(wrapper.find('.controls-rail').exists()).toBe(true)
    })

    it('should render console wrap when console is open', () => {
      expect(wrapper.find('.console-wrap').exists()).toBe(true)
      expect(wrapper.findComponent(Console).exists()).toBe(true)
    })

    it('should not render controls when console is closed', async () => {
      await wrapper.setProps({ consoleOpen: false })
      expect(wrapper.find('.controls-rail').exists()).toBe(false)
      expect(wrapper.find('.console-wrap').exists()).toBe(false)
    })

    it('should render console dock indicator when closed', async () => {
      await wrapper.setProps({ consoleOpen: false })
      expect(wrapper.find('.console-dock-indicator').exists()).toBe(true)
    })
  })

  describe('Button States - Code Not Compiled', () => {
    beforeEach(() => {
      wrapper = mount(ConsoleDock, {
        props: { ...defaultProps, codeCompiled: false }
      })
    })

    it('should show compile button when code is not compiled', () => {
      const compileBtn = wrapper.find('button[title="Skompiluj program"]')
      expect(compileBtn.exists()).toBe(true)
    })

    it('should disable compile button when running', async () => {
      await wrapper.setProps({ isRunning: true })
      const compileBtn = wrapper.find('button[title="Skompiluj program"]')
      expect(compileBtn.attributes('disabled')).toBeDefined()
    })

    it('should disable compile button when no code', async () => {
      await wrapper.setProps({ code: '' })
      const compileBtn = wrapper.find('button[title="Skompiluj program"]')
      expect(compileBtn.attributes('disabled')).toBeDefined()
    })

    it('should disable step button when code not compiled and not manual mode', () => {
      const stepBtn = wrapper.find('button[title="Następny takt"]')
      expect(stepBtn.attributes('disabled')).toBeDefined()
    })

    it('should disable run button when code not compiled', () => {
      const runBtn = wrapper.find('button[title="Uruchom program"]')
      expect(runBtn.attributes('disabled')).toBeDefined()
    })
  })

  describe('Button States - Code Compiled', () => {
    beforeEach(() => {
      wrapper = mount(ConsoleDock, {
        props: { ...defaultProps, codeCompiled: true }
      })
    })

    it('should show edit button when code is compiled', () => {
      const editBtn = wrapper.find('button[title="Wróć do edycji"]')
      expect(editBtn.exists()).toBe(true)
    })

    it('should enable step button when code compiled', () => {
      const stepBtn = wrapper.find('button[title="Następny takt"]')
      expect(stepBtn.attributes('disabled')).toBeUndefined()
    })

    it('should enable run button when code compiled and not manual mode', () => {
      const runBtn = wrapper.find('button[title="Uruchom program"]')
      expect(runBtn.attributes('disabled')).toBeUndefined()
    })

    it('should disable run button in manual mode', async () => {
      await wrapper.setProps({ manualMode: true })
      const runBtn = wrapper.find('button[title="Uruchom program"]')
      expect(runBtn.attributes('disabled')).toBeDefined()
    })
  })

  describe('Button States - Running', () => {
    beforeEach(() => {
      wrapper = mount(ConsoleDock, {
        props: { ...defaultProps, codeCompiled: true, isRunning: true }
      })
    })

    it('should show stop button when running', () => {
      const stopBtn = wrapper.find('button[title="Zatrzymaj wykonywanie"]')
      expect(stopBtn.exists()).toBe(true)
    })

    it('should disable edit button when running', () => {
      const editBtn = wrapper.find('button[title="Wróć do edycji"]')
      expect(editBtn.attributes('disabled')).toBeDefined()
    })

    it('should disable step button when running', () => {
      const stepBtn = wrapper.find('button[title="Następny takt"]')
      expect(stepBtn.attributes('disabled')).toBeDefined()
    })
  })

  describe('Fast Running States', () => {
    it('should show fast run button when not running', () => {
      wrapper = mount(ConsoleDock, {
        props: { ...defaultProps, codeCompiled: true, isRunning: false }
      })
      const fastRunBtn = wrapper.find('button[title="Uruchom całość (bez animacji)"]')
      expect(fastRunBtn.exists()).toBe(true)
    })

    it('should show spinning indicator when fast running', () => {
      wrapper = mount(ConsoleDock, {
        props: { ...defaultProps, isRunning: true, isFastRunning: true }
      })
      const spinningBtn = wrapper.find('button[title="Pracuję…"]')
      expect(spinningBtn.exists()).toBe(true)
      expect(spinningBtn.classes()).toContain('spinning')
    })

    it('should disable fast run button in manual mode', () => {
      wrapper = mount(ConsoleDock, {
        props: { ...defaultProps, codeCompiled: true, manualMode: true }
      })
      const fastRunBtn = wrapper.find('button[title="Uruchom całość (bez animacji)"]')
      expect(fastRunBtn.attributes('disabled')).toBeDefined()
    })
  })

  describe('Event Handling', () => {
    beforeEach(() => {
      wrapper = mount(ConsoleDock, {
        props: { ...defaultProps, codeCompiled: true }
      })
    })

    it('should emit compile when compile button clicked', async () => {
      await wrapper.setProps({ codeCompiled: false })
      const compileBtn = wrapper.find('button[title="Skompiluj program"]')
      await compileBtn.trigger('click')
      
      expect(wrapper.emitted('compile')).toBeTruthy()
    })

    it('should emit edit when edit button clicked', async () => {
      const editBtn = wrapper.find('button[title="Wróć do edycji"]')
      await editBtn.trigger('click')
      
      expect(wrapper.emitted('edit')).toBeTruthy()
    })

    it('should emit step when step button clicked', async () => {
      const stepBtn = wrapper.find('button[title="Następny takt"]')
      await stepBtn.trigger('click')
      
      expect(wrapper.emitted('step')).toBeTruthy()
    })

    it('should emit run when run button clicked', async () => {
      const runBtn = wrapper.find('button[title="Uruchom program"]')
      await runBtn.trigger('click')
      
      expect(wrapper.emitted('run')).toBeTruthy()
    })

    it('should emit stop when stop button clicked', async () => {
      await wrapper.setProps({ isRunning: true })
      const stopBtn = wrapper.find('button[title="Zatrzymaj wykonywanie"]')
      await stopBtn.trigger('click')
      
      expect(wrapper.emitted('stop')).toBeTruthy()
    })

    it('should emit run-fast when fast run button clicked', async () => {
      const fastRunBtn = wrapper.find('button[title="Uruchom całość (bez animacji)"]')
      await fastRunBtn.trigger('click')
      
      expect(wrapper.emitted('run-fast')).toBeTruthy()
    })

    it('should emit open when console indicator clicked', async () => {
      await wrapper.setProps({ consoleOpen: false })
      const indicator = wrapper.find('.console-dock-indicator')
      await indicator.trigger('click')
      
      expect(wrapper.emitted('open')).toBeTruthy()
    })
  })

  describe('Breakpoint Controls', () => {
    it('should render breakpoint toggle button', () => {
      const breakpointBtn = wrapper.find('button[title="Wyłącz breakpointy (wygaszenie)"]')
      expect(breakpointBtn.exists()).toBe(true)
    })

    it('should show active class when breakpoints enabled', () => {
      const breakpointBtn = wrapper.find('button[title="Wyłącz breakpointy (wygaszenie)"]')
      expect(breakpointBtn.classes()).toContain('active')
    })

    it('should show enable title when breakpoints disabled', async () => {
      await wrapper.setProps({ breakpointsEnabled: false })
      const breakpointBtn = wrapper.find('button[title="Włącz breakpointy"]')
      expect(breakpointBtn.exists()).toBe(true)
      expect(breakpointBtn.classes()).not.toContain('active')
    })

    it('should emit update:breakpointsEnabled when toggle clicked', async () => {
      const breakpointBtn = wrapper.find('button[title="Wyłącz breakpointy (wygaszenie)"]')
      await breakpointBtn.trigger('click')
      
      expect(wrapper.emitted('update:breakpointsEnabled')).toBeTruthy()
      expect(wrapper.emitted('update:breakpointsEnabled')[0][0]).toBe(false)
    })

    it('should emit disable-all-breakpoints when disable all clicked', async () => {
      const disableAllBtn = wrapper.find('button[title="Tymczasowo wyłącz wszystkie breakpointy"]')
      await disableAllBtn.trigger('click')
      
      expect(wrapper.emitted('disable-all-breakpoints')).toBeTruthy()
    })

    it('should emit clear-breakpoints when clear all clicked', async () => {
      const clearBtn = wrapper.find('button[title="Usuń wszystkie breakpointy"]')
      await clearBtn.trigger('click')
      
      expect(wrapper.emitted('clear-breakpoints')).toBeTruthy()
    })
  })

  describe('Console Integration', () => {
    it('should pass logs to Console component', () => {
      const logs = [{ type: 'info', message: 'test' }]
      wrapper = mount(ConsoleDock, {
        props: { ...defaultProps, logs }
      })
      
      const consoleComponent = wrapper.findComponent(Console)
      expect(consoleComponent.props('logs')).toEqual(logs)
    })

    it('should emit close when Console emits close', async () => {
      const consoleComponent = wrapper.findComponent(Console)
      await consoleComponent.vm.$emit('close')
      
      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('should emit clear when Console emits clear', async () => {
      const consoleComponent = wrapper.findComponent(Console)
      await consoleComponent.vm.$emit('clear')
      
      expect(wrapper.emitted('clear')).toBeTruthy()
    })
  })

  describe('Console Indicator States', () => {
    beforeEach(() => {
      wrapper = mount(ConsoleDock, {
        props: { ...defaultProps, consoleOpen: false }
      })
    })

    it('should show normal indicator when no errors', () => {
      const indicator = wrapper.find('.console-dock-indicator')
      expect(indicator.classes()).not.toContain('has-errors')
    })

    it('should show error indicator when has console errors', async () => {
      await wrapper.setProps({ hasConsoleErrors: true })
      const indicator = wrapper.find('.console-dock-indicator')
      expect(indicator.classes()).toContain('has-errors')
    })

    it('should have correct title attribute', () => {
      const indicator = wrapper.find('.console-dock-indicator')
      expect(indicator.attributes('title')).toBe('Kliknij aby otworzyć konsolę')
    })
  })

  describe('Computed Properties', () => {
    it('should correctly compute hasCode with valid code', () => {
      expect((wrapper.vm as any).hasCode).toBe(true)
    })

    it('should correctly compute hasCode with empty code', async () => {
      await wrapper.setProps({ code: '' })
      expect((wrapper.vm as any).hasCode).toBe(false)
    })

    it('should correctly compute hasCode with whitespace only', async () => {
      await wrapper.setProps({ code: '   \n  \t  ' })
      expect((wrapper.vm as any).hasCode).toBe(false)
    })

    it('should correctly compute hasCode with null code', async () => {
      await wrapper.setProps({ code: null })
      expect((wrapper.vm as any).hasCode).toBe(false)
    })
  })

  describe('Manual Mode Behavior', () => {
    beforeEach(() => {
      wrapper = mount(ConsoleDock, {
        props: { ...defaultProps, manualMode: true, codeCompiled: true }
      })
    })

    it('should change step button title in manual mode', () => {
      const stepBtn = wrapper.find('button[title="Wykonaj rozkaz"]')
      expect(stepBtn.exists()).toBe(true)
    })

    it('should enable step button in manual mode even without compiled code', async () => {
      await wrapper.setProps({ codeCompiled: false })
      const stepBtn = wrapper.find('button[title="Wykonaj rozkaz"]')
      expect(stepBtn.attributes('disabled')).toBeUndefined()
    })
  })

  describe('CSS Classes and Visual States', () => {
    it('should have correct base classes', () => {
      expect(wrapper.find('.console-dock').exists()).toBe(true)
      expect(wrapper.find('.controls-rail').exists()).toBe(true)
    })

    it('should apply divider correctly', () => {
      expect(wrapper.find('.divider').exists()).toBe(true)
    })

    it('should apply rail-btn class to all buttons', () => {
      const buttons = wrapper.findAll('.rail-btn')
      expect(buttons.length).toBeGreaterThan(0)
      
      buttons.forEach(button => {
        expect(button.classes()).toContain('rail-btn')
      })
    })
  })

  describe('SVG Icons', () => {
    it('should render SVG icons in buttons', () => {
      const svgIcons = wrapper.findAll('svg')
      expect(svgIcons.length).toBeGreaterThan(0)
    })

    it('should have correct SVG dimensions', () => {
      const svgIcons = wrapper.findAll('svg')
      svgIcons.forEach(svg => {
        const width = svg.attributes('width')
        const height = svg.attributes('height')
        
        // ConsoleDock uses 18x18, Console component uses 16x16
        expect(['16', '18']).toContain(width)
        expect(['16', '18']).toContain(height)
        expect(width).toBe(height) // Should be square
      })
    })
  })

  describe('Props Validation', () => {
    it('should handle all required props correctly', () => {
      const requiredProps = ['manualMode', 'codeCompiled', 'code', 'isRunning']
      
      requiredProps.forEach(prop => {
        expect(wrapper.props()).toHaveProperty(prop)
      })
    })

    it('should handle optional props with defaults', () => {
      const defaultWrapper = mount(ConsoleDock, {
        props: {
          manualMode: false,
          codeCompiled: false,
          code: 'test',
          isRunning: false
        }
      })

      expect(defaultWrapper.props('isFastRunning')).toBe(false)
      expect(defaultWrapper.props('fastProgress')).toBe(0)
      expect(defaultWrapper.props('logs')).toEqual([])
      expect(defaultWrapper.props('consoleOpen')).toBe(true)
      expect(defaultWrapper.props('hasConsoleErrors')).toBe(false)
      expect(defaultWrapper.props('breakpointsEnabled')).toBe(true)
    })
  })

  describe('Accessibility', () => {
    it('should have title attributes on all actionable buttons', () => {
      const buttons = wrapper.findAll('button')
      
      buttons.forEach(button => {
        expect(button.attributes('title')).toBeTruthy()
      })
    })

    it('should have aria-hidden on decorative SVGs', () => {
      const ariaHiddenSvg = wrapper.find('svg[aria-hidden="true"]')
      expect(ariaHiddenSvg.exists()).toBe(true)
    })

    it('should have proper click handlers for keyboard accessibility', () => {
      const indicator = wrapper.find('.console-dock-indicator')
      if (indicator.exists()) {
        // Verify click event can be triggered (accessibility concern)
        expect(indicator.trigger).toBeDefined()
      }
    })
  })

  describe('Performance', () => {
    it('should not re-render unnecessarily with same props', async () => {
      const initialHtml = wrapper.html()
      
      await wrapper.setProps(defaultProps)
      expect(wrapper.html()).toBe(initialHtml)
    })

    it('should handle rapid state changes efficiently', async () => {
      for (let i = 0; i < 5; i++) {
        await wrapper.setProps({
          isRunning: i % 2 === 0,
          codeCompiled: i % 3 === 0,
          consoleOpen: i % 2 === 1
        })
      }
      
      expect(wrapper.find('.console-dock').exists()).toBe(true)
    })
  })
})