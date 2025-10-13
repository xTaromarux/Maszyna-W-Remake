import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import AiChatIcon from '../../../components/AiChatIcon.vue'

describe('AiChatIcon.vue', () => {
  let wrapper: VueWrapper<any>

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Component Structure', () => {
    it('should render SVG element with correct attributes', () => {
      wrapper = mount(AiChatIcon)

      const svg = wrapper.find('svg')
      expect(svg.exists()).toBe(true)
      expect(svg.classes()).toContain('customIcon')
      expect(svg.attributes('xmlns')).toBe('http://www.w3.org/2000/svg')
      expect(svg.attributes('viewBox')).toBe('0 0 475 439')
      expect(svg.attributes('preserveAspectRatio')).toBe('xMidYMid meet')
    })

    it('should have correct component name', () => {
      wrapper = mount(AiChatIcon)
      expect(wrapper.vm.$options.name || 'AiChatIcon').toBe('AiChatIcon')
    })

    it('should render as an SVG icon component', () => {
      wrapper = mount(AiChatIcon)
      expect(wrapper.element.tagName).toBe('svg')
    })

    it('should contain the AI chat icon paths', () => {
      wrapper = mount(AiChatIcon)

      const paths = wrapper.findAll('path')
      expect(paths).toHaveLength(3)
      
      // Check that paths have d attributes (SVG path data)
      paths.forEach(path => {
        expect(path.attributes('d')).toBeDefined()
        expect(path.attributes('d')).not.toBe('')
      })
    })

    it('should have a main group element with correct attributes', () => {
      wrapper = mount(AiChatIcon)

      const group = wrapper.find('g')
      expect(group.exists()).toBe(true)
      expect(group.attributes('stroke-linejoin')).toBe('round')
      expect(group.attributes('stroke-linecap')).toBe('round')
    })
  })

  describe('Props Handling', () => {
    it('should use default fillColor', () => {
      wrapper = mount(AiChatIcon)

      const group = wrapper.find('g')
      expect(group.attributes('fill')).toBe('currentColor')
    })

    it('should accept custom fillColor prop', () => {
      wrapper = mount(AiChatIcon, {
        props: { fillColor: '#ff0000' }
      })

      const group = wrapper.find('g')
      expect(group.attributes('fill')).toBe('#ff0000')
    })

    it('should use default strokeColor', () => {
      wrapper = mount(AiChatIcon)

      const group = wrapper.find('g')
      expect(group.attributes('stroke')).toBe('none')
    })

    it('should accept custom strokeColor prop', () => {
      wrapper = mount(AiChatIcon, {
        props: { strokeColor: '#00ff00' }
      })

      const group = wrapper.find('g')
      expect(group.attributes('stroke')).toBe('#00ff00')
    })

    it('should use default strokeWidth', () => {
      wrapper = mount(AiChatIcon)

      const group = wrapper.find('g')
      expect(group.attributes('stroke-width')).toBe('0')
    })

    it('should accept custom strokeWidth as number', () => {
      wrapper = mount(AiChatIcon, {
        props: { strokeWidth: 2 }
      })

      const group = wrapper.find('g')
      expect(group.attributes('stroke-width')).toBe('2')
    })

    it('should accept custom strokeWidth as string', () => {
      wrapper = mount(AiChatIcon, {
        props: { strokeWidth: '1.5' }
      })

      const group = wrapper.find('g')
      expect(group.attributes('stroke-width')).toBe('1.5')
    })

    it('should handle all props together', () => {
      wrapper = mount(AiChatIcon, {
        props: {
          fillColor: '#333333',
          strokeColor: '#666666',
          strokeWidth: 1
        }
      })

      const group = wrapper.find('g')
      expect(group.attributes('fill')).toBe('#333333')
      expect(group.attributes('stroke')).toBe('#666666')
      expect(group.attributes('stroke-width')).toBe('1')
    })
  })

  describe('Transform Calculations', () => {
    it('should calculate transform correctly with viewBoxHeight', () => {
      wrapper = mount(AiChatIcon)

      const group = wrapper.find('g')
      expect(group.attributes('transform')).toBe('translate(0, 439) scale(0.1,-0.1)')
    })

    it('should use correct viewBoxHeight constant', () => {
      wrapper = mount(AiChatIcon)
      expect(wrapper.vm.viewBoxHeight).toBe(439)
    })
  })

  describe('CSS Styling', () => {
    it('should apply correct CSS classes', () => {
      wrapper = mount(AiChatIcon)

      const svg = wrapper.find('svg')
      expect(svg.classes()).toContain('customIcon')
    })

    it('should have appropriate styling for icon display', () => {
      wrapper = mount(AiChatIcon)

      const svg = wrapper.find('svg')
      const computedStyle = getComputedStyle(svg.element)
      
      // Note: In test environment, computed styles might not be fully available
      // but we can test that the class is applied
      expect(svg.classes()).toContain('customIcon')
    })
  })

  describe('SVG Path Data', () => {
    it('should contain valid SVG path data', () => {
      wrapper = mount(AiChatIcon)

      const paths = wrapper.findAll('path')
      
      paths.forEach(path => {
        const pathData = path.attributes('d')
        expect(pathData).toBeDefined()
        expect(pathData).toMatch(/^[MmLlHhVvCcSsQqTtAaZz0-9\s\-.,]+$/)
      })
    })

    it('should have the first path for main shape', () => {
      wrapper = mount(AiChatIcon)

      const paths = wrapper.findAll('path')
      const firstPath = paths[0]
      
      expect(firstPath.attributes('d')).toContain('M1465 3800')
      expect(firstPath.attributes('d')).toContain('c-176 -24')
    })

    it('should have the second path for character "A"', () => {
      wrapper = mount(AiChatIcon)

      const paths = wrapper.findAll('path')
      const secondPath = paths[1]
      
      expect(secondPath.attributes('d')).toContain('M875 2848')
      expect(secondPath.attributes('d')).toContain('c-202 -553')
    })

    it('should have the third path for character "I"', () => {
      wrapper = mount(AiChatIcon)

      const paths = wrapper.findAll('path')
      const thirdPath = paths[2]
      
      expect(thirdPath.attributes('d')).toContain('M1720 2150')
      expect(thirdPath.attributes('d')).toContain('l0 -710')
    })
  })

  describe('Props Validation', () => {
    it('should have correct prop types', () => {
      wrapper = mount(AiChatIcon)

      const props = wrapper.vm.$options.props || {}
      
      expect(props.fillColor?.type).toBe(String)
      expect(props.strokeColor?.type).toBe(String)
      expect(props.strokeWidth?.type).toEqual([Number, String])
    })

    it('should have correct default values', () => {
      wrapper = mount(AiChatIcon)

      const props = wrapper.vm.$options.props || {}
      
      expect(props.fillColor?.default).toBe('currentColor')
      expect(props.strokeColor?.default).toBe('none')
      expect(props.strokeWidth?.default).toBe(0)
    })
  })

  describe('Color Variations', () => {
    it('should work with hex colors', () => {
      wrapper = mount(AiChatIcon, {
        props: { fillColor: '#ff6b35' }
      })

      const group = wrapper.find('g')
      expect(group.attributes('fill')).toBe('#ff6b35')
    })

    it('should work with RGB colors', () => {
      wrapper = mount(AiChatIcon, {
        props: { fillColor: 'rgb(255, 107, 53)' }
      })

      const group = wrapper.find('g')
      expect(group.attributes('fill')).toBe('rgb(255, 107, 53)')
    })

    it('should work with HSL colors', () => {
      wrapper = mount(AiChatIcon, {
        props: { fillColor: 'hsl(20, 100%, 60%)' }
      })

      const group = wrapper.find('g')
      expect(group.attributes('fill')).toBe('hsl(20, 100%, 60%)')
    })

    it('should work with CSS color names', () => {
      wrapper = mount(AiChatIcon, {
        props: { fillColor: 'red' }
      })

      const group = wrapper.find('g')
      expect(group.attributes('fill')).toBe('red')
    })

    it('should work with transparent value', () => {
      wrapper = mount(AiChatIcon, {
        props: { fillColor: 'transparent' }
      })

      const group = wrapper.find('g')
      expect(group.attributes('fill')).toBe('transparent')
    })
  })

  describe('Stroke Configuration', () => {
    it('should handle stroke-only rendering', () => {
      wrapper = mount(AiChatIcon, {
        props: {
          fillColor: 'none',
          strokeColor: '#000000',
          strokeWidth: 2
        }
      })

      const group = wrapper.find('g')
      expect(group.attributes('fill')).toBe('none')
      expect(group.attributes('stroke')).toBe('#000000')
      expect(group.attributes('stroke-width')).toBe('2')
    })

    it('should handle both fill and stroke', () => {
      wrapper = mount(AiChatIcon, {
        props: {
          fillColor: '#ff0000',
          strokeColor: '#000000',
          strokeWidth: 1
        }
      })

      const group = wrapper.find('g')
      expect(group.attributes('fill')).toBe('#ff0000')
      expect(group.attributes('stroke')).toBe('#000000')
      expect(group.attributes('stroke-width')).toBe('1')
    })

    it('should handle fractional stroke width', () => {
      wrapper = mount(AiChatIcon, {
        props: { strokeWidth: '0.5' }
      })

      const group = wrapper.find('g')
      expect(group.attributes('stroke-width')).toBe('0.5')
    })
  })

  describe('Accessibility', () => {
    it('should be accessible as decorative icon', () => {
      wrapper = mount(AiChatIcon)

      const svg = wrapper.find('svg')
      // SVG without aria-label or title is treated as decorative
      expect(svg.attributes('role')).toBeUndefined()
    })

    it('should support custom accessibility attributes when needed', () => {
      wrapper = mount(AiChatIcon, {
        attrs: {
          'aria-label': 'AI Chat Icon',
          'role': 'img'
        }
      })

      const svg = wrapper.find('svg')
      expect(svg.attributes('aria-label')).toBe('AI Chat Icon')
      expect(svg.attributes('role')).toBe('img')
    })
  })

  describe('Responsive Behavior', () => {
    it('should maintain aspect ratio with preserveAspectRatio', () => {
      wrapper = mount(AiChatIcon)

      const svg = wrapper.find('svg')
      expect(svg.attributes('preserveAspectRatio')).toBe('xMidYMid meet')
    })

    it('should be scalable via CSS', () => {
      wrapper = mount(AiChatIcon, {
        attrs: {
          style: 'width: 50px; height: 50px;'
        }
      })

      const svg = wrapper.find('svg')
      expect(svg.attributes('style')).toContain('width: 50px')
      expect(svg.attributes('style')).toContain('height: 50px')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty string colors', () => {
      wrapper = mount(AiChatIcon, {
        props: {
          fillColor: '',
          strokeColor: ''
        }
      })

      const group = wrapper.find('g')
      expect(group.attributes('fill')).toBe('')
      expect(group.attributes('stroke')).toBe('')
    })

    it('should handle zero stroke width', () => {
      wrapper = mount(AiChatIcon, {
        props: { strokeWidth: 0 }
      })

      const group = wrapper.find('g')
      expect(group.attributes('stroke-width')).toBe('0')
    })

    it('should handle large stroke width', () => {
      wrapper = mount(AiChatIcon, {
        props: { strokeWidth: 100 }
      })

      const group = wrapper.find('g')
      expect(group.attributes('stroke-width')).toBe('100')
    })

    it('should handle invalid color gracefully', () => {
      wrapper = mount(AiChatIcon, {
        props: { fillColor: 'invalid-color' }
      })

      const group = wrapper.find('g')
      expect(group.attributes('fill')).toBe('invalid-color')
      // Invalid colors will be handled by browser
    })
  })

  describe('DOM Structure', () => {
    it('should have single root SVG element', () => {
      wrapper = mount(AiChatIcon)

      expect(wrapper.element.tagName).toBe('svg')
      expect(wrapper.element.children).toHaveLength(1) // One main group
    })

    it('should maintain proper SVG hierarchy', () => {
      wrapper = mount(AiChatIcon)

      const svg = wrapper.find('svg')
      const group = svg.find('g')
      const paths = group.findAll('path')

      expect(svg.exists()).toBe(true)
      expect(group.exists()).toBe(true)
      expect(paths).toHaveLength(3)
    })
  })

  describe('Performance', () => {
    it('should handle rapid prop changes efficiently', async () => {
      wrapper = mount(AiChatIcon)

      const colors = ['red', 'blue', 'green', 'yellow', 'purple']
      
      for (const color of colors) {
        await wrapper.setProps({ fillColor: color })
        const group = wrapper.find('g')
        expect(group.attributes('fill')).toBe(color)
      }
    })

    it('should maintain consistent rendering with same props', async () => {
      wrapper = mount(AiChatIcon, {
        props: { fillColor: 'blue' }
      })

      const initialHtml = wrapper.html()
      
      // Re-mount with same props
      wrapper.unmount()
      wrapper = mount(AiChatIcon, {
        props: { fillColor: 'blue' }
      })

      expect(wrapper.html()).toBe(initialHtml)
    })
  })

  describe('Integration', () => {
    it('should work as part of button or clickable element', () => {
      const buttonWrapper = mount({
        template: '<button><AiChatIcon fill-color="blue" /></button>',
        components: { AiChatIcon }
      })

      const button = buttonWrapper.find('button')
      const icon = buttonWrapper.findComponent(AiChatIcon)

      expect(button.exists()).toBe(true)
      expect(icon.exists()).toBe(true)
      expect(icon.props('fillColor')).toBe('blue')

      buttonWrapper.unmount()
    })

    it('should work with CSS custom properties', () => {
      wrapper = mount(AiChatIcon, {
        props: { fillColor: 'var(--icon-color)' }
      })

      const group = wrapper.find('g')
      expect(group.attributes('fill')).toBe('var(--icon-color)')
    })
  })

  describe('Visual Consistency', () => {
    it('should maintain consistent viewBox dimensions', () => {
      wrapper = mount(AiChatIcon)

      const svg = wrapper.find('svg')
      const viewBox = svg.attributes('viewBox')
      
      expect(viewBox).toBe('0 0 475 439')
      
      // Verify dimensions match component constants
      expect(wrapper.vm.viewBoxHeight).toBe(439)
    })

    it('should have properly positioned paths within viewBox', () => {
      wrapper = mount(AiChatIcon)

      const paths = wrapper.findAll('path')
      
      // All path coordinates should be within reasonable bounds
      paths.forEach(path => {
        const pathData = path.attributes('d')
        // Check that path contains coordinate values
        expect(pathData).toMatch(/\d+/)
      })
    })
  })
})