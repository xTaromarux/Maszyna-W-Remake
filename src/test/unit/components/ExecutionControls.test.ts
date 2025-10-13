import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ExecutionControls from '@/components/ExecutionControls.vue'

// Mock SVG icons
vi.mock('@/assets/svg/CompileIcon.vue', () => ({
  default: {
    name: 'CompileIcon',
    template: '<div class="mock-compile-icon"></div>'
  }
}))

vi.mock('@/assets/svg/EditIcon.vue', () => ({
  default: {
    name: 'EditIcon',
    template: '<div class="mock-edit-icon"></div>'
  }
}))

vi.mock('@/assets/svg/NextLineIcon.vue', () => ({
  default: {
    name: 'NextLineIcon',
    template: '<div class="mock-nextline-icon"></div>'
  }
}))

vi.mock('@/assets/svg/RunIcon.vue', () => ({
  default: {
    name: 'RunIcon',
    template: '<div class="mock-run-icon"></div>'
  }
}))

describe('ExecutionControls.vue', () => {
  const defaultProps = {
    manualMode: false,
    codeCompiled: false,
    code: 'czyt wei il',
    isRunning: false,
    isFastRunning: false,
    fastProgress: 0
  }

  let wrapper: any

  beforeEach(() => {
    wrapper = mount(ExecutionControls, {
      props: defaultProps
    })
  })

  describe('Component Structure', () => {
    it('should render main container', () => {
      expect(wrapper.find('.execution-controls').exists()).toBe(true)
    })

    it('should have correct component name', () => {
      expect(wrapper.vm.$options.name).toBe('ExecutionControls')
    })
  })

  describe('Compile Button', () => {
    it('should show compile button when code is not compiled', () => {
      expect(wrapper.find('.execution-btn--compile').exists()).toBe(true)
      expect(wrapper.find('.execution-btn--compile span').text()).toBe('Kompiluj')
    })

    it('should hide compile button when code is compiled', async () => {
      await wrapper.setProps({ codeCompiled: true })
      expect(wrapper.find('.execution-btn--compile').exists()).toBe(false)
    })

    it('should emit compile event when clicked', async () => {
      const compileBtn = wrapper.find('.execution-btn--compile')
      await compileBtn.trigger('click')
      
      expect(wrapper.emitted('compile')).toBeTruthy()
      expect(wrapper.emitted('compile')).toHaveLength(1)
    })

    it('should be disabled in manual mode', async () => {
      await wrapper.setProps({ manualMode: true })
      const compileBtn = wrapper.find('.execution-btn--compile')
      expect(compileBtn.attributes('disabled')).toBeDefined()
    })

    it('should be disabled when running', async () => {
      await wrapper.setProps({ isRunning: true })
      const compileBtn = wrapper.find('.execution-btn--compile')
      expect(compileBtn.attributes('disabled')).toBeDefined()
    })

    it('should be disabled when no code', async () => {
      await wrapper.setProps({ code: '' })
      const compileBtn = wrapper.find('.execution-btn--compile')
      expect(compileBtn.attributes('disabled')).toBeDefined()
    })

    it('should be disabled when code is only whitespace', async () => {
      await wrapper.setProps({ code: '   \n\t  ' })
      const compileBtn = wrapper.find('.execution-btn--compile')
      expect(compileBtn.attributes('disabled')).toBeDefined()
    })

    it('should have correct title attribute', () => {
      const compileBtn = wrapper.find('.execution-btn--compile')
      expect(compileBtn.attributes('title')).toBe('Skompiluj program')
    })
  })

  describe('Edit Button', () => {
    beforeEach(async () => {
      await wrapper.setProps({ codeCompiled: true })
    })

    it('should show edit button when code is compiled', () => {
      expect(wrapper.find('.execution-btn--edit').exists()).toBe(true)
      expect(wrapper.find('.execution-btn--edit span').text()).toBe('Edytuj')
    })

    it('should emit edit event when clicked', async () => {
      const editBtn = wrapper.find('.execution-btn--edit')
      await editBtn.trigger('click')
      
      expect(wrapper.emitted('edit')).toBeTruthy()
      expect(wrapper.emitted('edit')).toHaveLength(1)
    })

    it('should be disabled when running', async () => {
      await wrapper.setProps({ isRunning: true })
      const editBtn = wrapper.find('.execution-btn--edit')
      expect(editBtn.attributes('disabled')).toBeDefined()
    })

    it('should have correct title attribute', () => {
      const editBtn = wrapper.find('.execution-btn--edit')
      expect(editBtn.attributes('title')).toBe('Wróć do edycji')
    })
  })

  describe('Step Button', () => {
    it('should always be visible', () => {
      expect(wrapper.find('.execution-btn--step').exists()).toBe(true)
    })

    it('should emit step event when clicked', async () => {
      await wrapper.setProps({ codeCompiled: true })
      const stepBtn = wrapper.find('.execution-btn--step')
      await stepBtn.trigger('click')
      
      expect(wrapper.emitted('step')).toBeTruthy()
      expect(wrapper.emitted('step')).toHaveLength(1)
    })

    it('should be enabled in manual mode', async () => {
      await wrapper.setProps({ manualMode: true })
      const stepBtn = wrapper.find('.execution-btn--step')
      expect(stepBtn.attributes('disabled')).toBeUndefined()
    })

    it('should be disabled when running', async () => {
      await wrapper.setProps({ isRunning: true })
      const stepBtn = wrapper.find('.execution-btn--step')
      expect(stepBtn.attributes('disabled')).toBeDefined()
    })

    it('should be disabled in auto mode when not compiled', async () => {
      await wrapper.setProps({ manualMode: false, codeCompiled: false })
      const stepBtn = wrapper.find('.execution-btn--step')
      expect(stepBtn.attributes('disabled')).toBeDefined()
    })

    it('should show correct text in manual mode', async () => {
      await wrapper.setProps({ manualMode: true })
      const stepBtn = wrapper.find('.execution-btn--step span')
      expect(stepBtn.text()).toBe('Wykonaj takt')
    })

    it('should show correct text in auto mode', async () => {
      await wrapper.setProps({ manualMode: false })
      const stepBtn = wrapper.find('.execution-btn--step span')
      expect(stepBtn.text()).toBe('Następny takt')
    })

    it('should have correct title attribute', () => {
      const stepBtn = wrapper.find('.execution-btn--step')
      expect(stepBtn.attributes('title')).toBe('Krok wykonania')
    })
  })

  describe('Run Button', () => {
    beforeEach(async () => {
      await wrapper.setProps({ codeCompiled: true, manualMode: false })
    })

    it('should show run button when not running', () => {
      expect(wrapper.find('.execution-btn--run').exists()).toBe(true)
      const runBtns = wrapper.findAll('.execution-btn--run')
      const normalRunBtn = runBtns.find(btn => btn.text().includes('Uruchom') && !btn.text().includes('bez animacji'))
      expect(normalRunBtn?.text()).toContain('Uruchom')
    })

    it('should emit run event when clicked', async () => {
      const runBtns = wrapper.findAll('.execution-btn--run')
      const normalRunBtn = runBtns.find(btn => btn.text().includes('Uruchom') && !btn.text().includes('bez animacji'))
      await normalRunBtn?.trigger('click')
      
      expect(wrapper.emitted('run')).toBeTruthy()
      expect(wrapper.emitted('run')).toHaveLength(1)
    })

    it('should be disabled in manual mode', async () => {
      await wrapper.setProps({ manualMode: true })
      const runBtns = wrapper.findAll('.execution-btn--run')
      const normalRunBtn = runBtns.find(btn => btn.text().includes('Uruchom') && !btn.text().includes('bez animacji'))
      expect(normalRunBtn?.attributes('disabled')).toBeDefined()
    })

    it('should be disabled when not compiled', async () => {
      await wrapper.setProps({ codeCompiled: false })
      const runBtns = wrapper.findAll('.execution-btn--run')
      const normalRunBtn = runBtns.find(btn => btn.text().includes('Uruchom') && !btn.text().includes('bez animacji'))
      expect(normalRunBtn?.attributes('disabled')).toBeDefined()
    })
  })

  describe('Stop Button', () => {
    beforeEach(async () => {
      await wrapper.setProps({ codeCompiled: true, isRunning: true })
    })

    it('should show stop button when running', () => {
      const runBtns = wrapper.findAll('.execution-btn--run')
      const stopBtn = runBtns.find(btn => btn.text().includes('Stop'))
      expect(stopBtn?.exists()).toBe(true)
    })

    it('should emit stop event when clicked', async () => {
      const runBtns = wrapper.findAll('.execution-btn--run')
      const stopBtn = runBtns.find(btn => btn.text().includes('Stop'))
      await stopBtn?.trigger('click')
      
      expect(wrapper.emitted('stop')).toBeTruthy()
      expect(wrapper.emitted('stop')).toHaveLength(1)
    })

    it('should have correct title attribute', () => {
      const runBtns = wrapper.findAll('.execution-btn--run')
      const stopBtn = runBtns.find(btn => btn.text().includes('Stop'))
      expect(stopBtn?.attributes('title')).toBe('Zatrzymaj wykonywanie')
    })
  })

  describe('Run Fast Button', () => {
    beforeEach(async () => {
      await wrapper.setProps({ codeCompiled: true, manualMode: false, isRunning: false })
    })

    it('should show run fast button when not running', () => {
      const runBtns = wrapper.findAll('.execution-btn--run')
      const fastRunBtn = runBtns.find(btn => btn.text().includes('bez animacji'))
      expect(fastRunBtn?.exists()).toBe(true)
    })

    it('should emit run-fast event when clicked', async () => {
      const runBtns = wrapper.findAll('.execution-btn--run')
      const fastRunBtn = runBtns.find(btn => btn.text().includes('bez animacji'))
      await fastRunBtn?.trigger('click')
      
      expect(wrapper.emitted('run-fast')).toBeTruthy()
      expect(wrapper.emitted('run-fast')).toHaveLength(1)
    })

    it('should be disabled in manual mode', async () => {
      await wrapper.setProps({ manualMode: true })
      const runBtns = wrapper.findAll('.execution-btn--run')
      const fastRunBtn = runBtns.find(btn => btn.text().includes('bez animacji'))
      expect(fastRunBtn?.attributes('disabled')).toBeDefined()
    })

    it('should be disabled when not compiled', async () => {
      await wrapper.setProps({ codeCompiled: false })
      const runBtns = wrapper.findAll('.execution-btn--run')
      const fastRunBtn = runBtns.find(btn => btn.text().includes('bez animacji'))
      expect(fastRunBtn?.attributes('disabled')).toBeDefined()
    })

    it('should have correct title attribute', () => {
      const runBtns = wrapper.findAll('.execution-btn--run')
      const fastRunBtn = runBtns.find(btn => btn.text().includes('bez animacji'))
      expect(fastRunBtn?.attributes('title')).toBe('Uruchom całość (bez animacji)')
    })
  })

  describe('Fast Running State', () => {
    beforeEach(async () => {
      await wrapper.setProps({ 
        codeCompiled: true, 
        isRunning: true, 
        isFastRunning: true,
        fastProgress: 45
      })
    })

    it('should show progress when fast running', () => {
      const runBtns = wrapper.findAll('.execution-btn--run')
      const progressBtn = runBtns.find(btn => btn.text().includes('Pracuję'))
      expect(progressBtn?.exists()).toBe(true)
      expect(progressBtn?.text()).toContain('Pracuję… 45%')
    })

    it('should show spinner when fast running', () => {
      const spinner = wrapper.find('.spinner')
      expect(spinner.exists()).toBe(true)
      expect(spinner.attributes('aria-hidden')).toBe('true')
    })

    it('should emit stop event when progress button clicked', async () => {
      const runBtns = wrapper.findAll('.execution-btn--run')
      const progressBtn = runBtns.find(btn => btn.text().includes('Pracuję'))
      await progressBtn?.trigger('click')
      
      expect(wrapper.emitted('stop')).toBeTruthy()
      expect(wrapper.emitted('stop')).toHaveLength(1)
    })

    it('should update progress dynamically', async () => {
      await wrapper.setProps({ fastProgress: 75 })
      const runBtns = wrapper.findAll('.execution-btn--run')
      const progressBtn = runBtns.find(btn => btn.text().includes('Pracuję'))
      expect(progressBtn?.text()).toContain('Pracuję… 75%')
    })
  })

  describe('Button States Integration', () => {
    it('should handle transition from compile to edit', async () => {
      // Initial state - not compiled
      expect(wrapper.find('.execution-btn--compile').exists()).toBe(true)
      expect(wrapper.find('.execution-btn--edit').exists()).toBe(false)

      // After compilation
      await wrapper.setProps({ codeCompiled: true })
      expect(wrapper.find('.execution-btn--compile').exists()).toBe(false)
      expect(wrapper.find('.execution-btn--edit').exists()).toBe(true)
    })

    it('should handle transition from run to stop', async () => {
      await wrapper.setProps({ codeCompiled: true })
      
      // Initial state - not running
      const initialRunBtns = wrapper.findAll('.execution-btn--run')
      expect(initialRunBtns.some(btn => btn.text().includes('Uruchom'))).toBe(true)
      expect(initialRunBtns.some(btn => btn.text().includes('Stop'))).toBe(false)

      // After starting
      await wrapper.setProps({ isRunning: true })
      const runningBtns = wrapper.findAll('.execution-btn--run')
      expect(runningBtns.some(btn => btn.text().includes('Stop'))).toBe(true)
      expect(runningBtns.some(btn => btn.text().includes('Uruchom') && !btn.text().includes('bez animacji'))).toBe(false)
    })

    it('should properly disable buttons when running', async () => {
      await wrapper.setProps({ codeCompiled: true, isRunning: true })
      
      expect(wrapper.find('.execution-btn--edit').attributes('disabled')).toBeDefined()
      expect(wrapper.find('.execution-btn--step').attributes('disabled')).toBeDefined()
    })
  })

  describe('Manual Mode Behavior', () => {
    beforeEach(async () => {
      await wrapper.setProps({ manualMode: true })
    })

    it('should disable compile button in manual mode', () => {
      expect(wrapper.find('.execution-btn--compile').attributes('disabled')).toBeDefined()
    })

    it('should enable step button in manual mode', () => {
      expect(wrapper.find('.execution-btn--step').attributes('disabled')).toBeUndefined()
    })

    it('should disable run buttons in manual mode', async () => {
      await wrapper.setProps({ codeCompiled: true })
      const runBtns = wrapper.findAll('.execution-btn--run')
      runBtns.forEach(btn => {
        expect(btn.attributes('disabled')).toBeDefined()
      })
    })
  })

  describe('Props Validation', () => {
    it('should accept all required props', () => {
      const requiredProps = ['manualMode', 'codeCompiled', 'code', 'isRunning']
      const componentProps = Object.keys(wrapper.vm.$props)
      
      requiredProps.forEach(prop => {
        expect(componentProps).toContain(prop)
      })
    })

    it('should have correct default values for optional props', () => {
      expect(wrapper.vm.isFastRunning).toBe(false)
      expect(wrapper.vm.fastProgress).toBe(0)
    })

    it('should handle prop type validation', () => {
      const props = wrapper.vm.$options.props
      
      expect(props.manualMode.type).toBe(Boolean)
      expect(props.codeCompiled.type).toBe(Boolean)
      expect(props.code.type).toBe(String)
      expect(props.isRunning.type).toBe(Boolean)
      expect(props.isFastRunning.type).toBe(Boolean)
      expect(props.fastProgress.type).toBe(Number)
    })
  })

  describe('Events Emission', () => {
    it('should define all required events', () => {
      const expectedEvents = ['compile', 'edit', 'step', 'run', 'run-fast', 'stop']
      const emittedEvents = wrapper.vm.$options.emits
      
      expectedEvents.forEach(event => {
        expect(emittedEvents).toContain(event)
      })
    })

    it('should not emit events when buttons are disabled', async () => {
      await wrapper.setProps({ isRunning: true, codeCompiled: true })
      
      // Try to click disabled step button
      const stepBtn = wrapper.find('.execution-btn--step')
      await stepBtn.trigger('click')
      
      // Should not emit step event
      expect(wrapper.emitted('step')).toBeFalsy()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const buttons = wrapper.findAll('button')
      buttons.forEach(button => {
        expect(button.attributes('title')).toBeDefined()
      })
    })

    it('should have aria-hidden on spinner', async () => {
      await wrapper.setProps({ 
        isRunning: true, 
        isFastRunning: true, 
        codeCompiled: true 
      })
      
      const spinner = wrapper.find('.spinner')
      expect(spinner.attributes('aria-hidden')).toBe('true')
    })
  })

  describe('CSS Classes', () => {
    it('should apply correct CSS classes to buttons', () => {
      expect(wrapper.find('.execution-btn--compile').classes()).toContain('execution-btn')
      expect(wrapper.find('.execution-btn--step').classes()).toContain('execution-btn')
    })

    it('should apply specific modifier classes', () => {
      expect(wrapper.find('.execution-btn--compile').classes()).toContain('execution-btn--compile')
      expect(wrapper.find('.execution-btn--step').classes()).toContain('execution-btn--step')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty code string', async () => {
      await wrapper.setProps({ code: '' })
      expect(wrapper.find('.execution-btn--compile').attributes('disabled')).toBeDefined()
    })

    it('should handle null/undefined values gracefully', async () => {
      // Test with minimal props to ensure component doesn't crash
      expect(() => {
        mount(ExecutionControls, {
          props: {
            manualMode: false,
            codeCompiled: false,
            code: '',
            isRunning: false
          }
        })
      }).not.toThrow()
    })

    it('should handle extreme progress values', async () => {
      await wrapper.setProps({ 
        isRunning: true, 
        isFastRunning: true, 
        fastProgress: 100 
      })
      
      const runBtns = wrapper.findAll('.execution-btn--run')
      const progressBtn = runBtns.find(btn => btn.text().includes('Pracuję'))
      expect(progressBtn?.text()).toContain('100%')
    })
  })
})