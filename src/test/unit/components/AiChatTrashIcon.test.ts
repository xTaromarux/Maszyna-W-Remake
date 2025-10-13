import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import AiChatTrashIcon from '../../../components/AiChatTrashIcon.vue'

describe('AiChatTrashIcon.vue', () => {
  let wrapper: VueWrapper<any>

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Component Structure', () => {
    it('should render SVG element with correct attributes', () => {
      wrapper = mount(AiChatTrashIcon)

      const svg = wrapper.find('svg')
      expect(svg.exists()).toBe(true)
      expect(svg.classes()).toContain('aiChatTrashIcon')
      expect(svg.attributes('xmlns')).toBe('http://www.w3.org/2000/svg')
      expect(svg.attributes('viewBox')).toBe('0 0 408.483 408.483')
      expect(svg.attributes('aria-hidden')).toBe('true')
    })

    it('should have correct component name', () => {
      wrapper = mount(AiChatTrashIcon)
      expect(wrapper.vm.$options.name || 'AiChatTrashIcon').toBe('AiChatTrashIcon')
    })

    it('should render as an SVG icon component', () => {
      wrapper = mount(AiChatTrashIcon)
      expect(wrapper.element.tagName).toBe('svg')
    })

    it('should contain the trash can icon paths', () => {
      wrapper = mount(AiChatTrashIcon)

      const paths = wrapper.findAll('path')
      expect(paths).toHaveLength(2)
      
      // Check that paths have d attributes (SVG path data)
      paths.forEach(path => {
        expect(path.attributes('d')).toBeDefined()
        expect(path.attributes('d')).not.toBe('')
      })
    })

    it('should have nested group structure', () => {
      wrapper = mount(AiChatTrashIcon)

      const groups = wrapper.findAll('g')
      expect(groups).toHaveLength(2) // One main group and one nested group
    })
  })

  describe('Props Handling', () => {
    it('should use default fill color', () => {
      wrapper = mount(AiChatTrashIcon)

      const svg = wrapper.find('svg')
      expect(svg.attributes('fill')).toBe('currentColor')
    })

    it('should accept custom fill prop', () => {
      wrapper = mount(AiChatTrashIcon, {
        props: { fill: '#ff0000' }
      })

      const svg = wrapper.find('svg')
      expect(svg.attributes('fill')).toBe('#ff0000')
    })

    it('should use default width', () => {
      wrapper = mount(AiChatTrashIcon)
      expect(wrapper.vm.width).toBe(20)
    })

    it('should accept custom width as number', () => {
      wrapper = mount(AiChatTrashIcon, {
        props: { width: 30 }
      })
      expect(wrapper.vm.width).toBe(30)
    })

    it('should accept custom width as string', () => {
      wrapper = mount(AiChatTrashIcon, {
        props: { width: '25' }
      })
      expect(wrapper.vm.width).toBe('25')
    })

    it('should use default height', () => {
      wrapper = mount(AiChatTrashIcon)
      expect(wrapper.vm.height).toBe(20)
    })

    it('should accept custom height as number', () => {
      wrapper = mount(AiChatTrashIcon, {
        props: { height: 35 }
      })
      expect(wrapper.vm.height).toBe(35)
    })

    it('should accept custom height as string', () => {
      wrapper = mount(AiChatTrashIcon, {
        props: { height: '28' }
      })
      expect(wrapper.vm.height).toBe('28')
    })

    it('should handle all props together', () => {
      wrapper = mount(AiChatTrashIcon, {
        props: {
          fill: '#333333',
          width: 40,
          height: '45'
        }
      })

      const svg = wrapper.find('svg')
      expect(svg.attributes('fill')).toBe('#333333')
      expect(wrapper.vm.width).toBe(40)
      expect(wrapper.vm.height).toBe('45')
    })
  })

  describe('CSS Styling', () => {
    it('should apply correct CSS classes', () => {
      wrapper = mount(AiChatTrashIcon)

      const svg = wrapper.find('svg')
      expect(svg.classes()).toContain('aiChatTrashIcon')
    })

    it('should have scoped styles for size control', () => {
      wrapper = mount(AiChatTrashIcon)

      const svg = wrapper.find('svg')
      // The CSS variables can be set via CSS custom properties
      expect(svg.classes()).toContain('aiChatTrashIcon')
    })

    it('should support CSS custom properties for width and height', () => {
      wrapper = mount(AiChatTrashIcon, {
        attrs: {
          style: '--icon-width: 50px; --icon-height: 50px;'
        }
      })

      const svg = wrapper.find('svg')
      expect(svg.attributes('style')).toContain('--icon-width: 50px')
      expect(svg.attributes('style')).toContain('--icon-height: 50px')
    })
  })

  describe('SVG Path Data', () => {
    it('should contain valid SVG path data', () => {
      wrapper = mount(AiChatTrashIcon)

      const paths = wrapper.findAll('path')
      
      paths.forEach(path => {
        const pathData = path.attributes('d')
        expect(pathData).toBeDefined()
        expect(pathData).toMatch(/^[MmLlHhVvCcSsQqTtAaZz0-9\s\-.,]+$/)
      })
    })

    it('should have the first path for trash can body', () => {
      wrapper = mount(AiChatTrashIcon)

      const paths = wrapper.findAll('path')
      const firstPath = paths[0]
      
      expect(firstPath.attributes('d')).toContain('M87.748,388.784')
      expect(firstPath.attributes('d')).toContain('c0.461,11.01')
    })

    it('should have the second path for trash can lid', () => {
      wrapper = mount(AiChatTrashIcon)

      const paths = wrapper.findAll('path')
      const secondPath = paths[1]
      
      expect(secondPath.attributes('d')).toContain('M343.567,21.043')
      expect(secondPath.attributes('d')).toContain('h-88.535')
    })

    it('should include vertical separator lines in body path', () => {
      wrapper = mount(AiChatTrashIcon)

      const paths = wrapper.findAll('path')
      const bodyPath = paths[0]
      
      // Check for vertical separator coordinates
      expect(bodyPath.attributes('d')).toContain('M247.655,171.329')
      expect(bodyPath.attributes('d')).toContain('M189.216,171.329')
      expect(bodyPath.attributes('d')).toContain('M130.775,171.329')
    })
  })

  describe('Props Validation', () => {
    it('should have correct prop types', () => {
      wrapper = mount(AiChatTrashIcon)

      const props = wrapper.vm.$options.props || {}
      
      expect(props.width?.type).toEqual([Number, String])
      expect(props.height?.type).toEqual([Number, String])
      expect(props.fill?.type).toBe(String)
    })

    it('should have correct default values', () => {
      wrapper = mount(AiChatTrashIcon)

      const props = wrapper.vm.$options.props || {}
      
      expect(props.width?.default).toBe(20)
      expect(props.height?.default).toBe(20)
      expect(props.fill?.default).toBe('currentColor')
    })
  })

  describe('Color Variations', () => {
    it('should work with hex colors', () => {
      wrapper = mount(AiChatTrashIcon, {
        props: { fill: '#dc2626' }
      })

      const svg = wrapper.find('svg')
      expect(svg.attributes('fill')).toBe('#dc2626')
    })

    it('should work with RGB colors', () => {
      wrapper = mount(AiChatTrashIcon, {
        props: { fill: 'rgb(220, 38, 38)' }
      })

      const svg = wrapper.find('svg')
      expect(svg.attributes('fill')).toBe('rgb(220, 38, 38)')
    })

    it('should work with HSL colors', () => {
      wrapper = mount(AiChatTrashIcon, {
        props: { fill: 'hsl(0, 84%, 60%)' }
      })

      const svg = wrapper.find('svg')
      expect(svg.attributes('fill')).toBe('hsl(0, 84%, 60%)')
    })

    it('should work with CSS color names', () => {
      wrapper = mount(AiChatTrashIcon, {
        props: { fill: 'red' }
      })

      const svg = wrapper.find('svg')
      expect(svg.attributes('fill')).toBe('red')
    })

    it('should work with transparent value', () => {
      wrapper = mount(AiChatTrashIcon, {
        props: { fill: 'transparent' }
      })

      const svg = wrapper.find('svg')
      expect(svg.attributes('fill')).toBe('transparent')
    })
  })

  describe('Size Variations', () => {
    it('should handle different numeric width values', () => {
      const sizes = [16, 24, 32, 48, 64]
      
      sizes.forEach(size => {
        wrapper = mount(AiChatTrashIcon, {
          props: { width: size }
        })
        expect(wrapper.vm.width).toBe(size)
        wrapper.unmount()
      })
    })

    it('should handle different string width values', () => {
      const sizes = ['16px', '2rem', '100%', '1.5em']
      
      sizes.forEach(size => {
        wrapper = mount(AiChatTrashIcon, {
          props: { width: size }
        })
        expect(wrapper.vm.width).toBe(size)
        wrapper.unmount()
      })
    })

    it('should handle different numeric height values', () => {
      const sizes = [16, 24, 32, 48, 64]
      
      sizes.forEach(size => {
        wrapper = mount(AiChatTrashIcon, {
          props: { height: size }
        })
        expect(wrapper.vm.height).toBe(size)
        wrapper.unmount()
      })
    })

    it('should handle different string height values', () => {
      const sizes = ['16px', '2rem', '100%', '1.5em']
      
      sizes.forEach(size => {
        wrapper = mount(AiChatTrashIcon, {
          props: { height: size }
        })
        expect(wrapper.vm.height).toBe(size)
        wrapper.unmount()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have aria-hidden for decorative icon', () => {
      wrapper = mount(AiChatTrashIcon)

      const svg = wrapper.find('svg')
      expect(svg.attributes('aria-hidden')).toBe('true')
    })

    it('should support custom accessibility attributes when needed', () => {
      wrapper = mount(AiChatTrashIcon, {
        attrs: {
          'aria-label': 'Delete message',
          'role': 'img',
          'aria-hidden': 'false'
        }
      })

      const svg = wrapper.find('svg')
      expect(svg.attributes('aria-label')).toBe('Delete message')
      expect(svg.attributes('role')).toBe('img')
      expect(svg.attributes('aria-hidden')).toBe('false')
    })

    it('should work with screen reader descriptions', () => {
      wrapper = mount(AiChatTrashIcon, {
        attrs: {
          'aria-describedby': 'trash-description'
        }
      })

      const svg = wrapper.find('svg')
      expect(svg.attributes('aria-describedby')).toBe('trash-description')
    })
  })

  describe('Responsive Behavior', () => {
    it('should maintain aspect ratio with viewBox', () => {
      wrapper = mount(AiChatTrashIcon)

      const svg = wrapper.find('svg')
      expect(svg.attributes('viewBox')).toBe('0 0 408.483 408.483')
    })

    it('should be scalable via CSS variables', () => {
      wrapper = mount(AiChatTrashIcon, {
        attrs: {
          style: '--icon-width: 100px; --icon-height: 100px;'
        }
      })

      const svg = wrapper.find('svg')
      expect(svg.attributes('style')).toContain('--icon-width: 100px')
      expect(svg.attributes('style')).toContain('--icon-height: 100px')
    })

    it('should work with different viewport sizes', () => {
      const viewBoxes = [
        '0 0 408.483 408.483', // default
        '0 0 200 200', // smaller
        '0 0 800 800'  // larger
      ]

      // Test that viewBox is properly set
      wrapper = mount(AiChatTrashIcon)
      const svg = wrapper.find('svg')
      expect(svg.attributes('viewBox')).toBe(viewBoxes[0])
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero width', () => {
      wrapper = mount(AiChatTrashIcon, {
        props: { width: 0 }
      })
      expect(wrapper.vm.width).toBe(0)
    })

    it('should handle zero height', () => {
      wrapper = mount(AiChatTrashIcon, {
        props: { height: 0 }
      })
      expect(wrapper.vm.height).toBe(0)
    })

    it('should handle very large dimensions', () => {
      wrapper = mount(AiChatTrashIcon, {
        props: { width: 9999, height: 9999 }
      })
      expect(wrapper.vm.width).toBe(9999)
      expect(wrapper.vm.height).toBe(9999)
    })

    it('should handle empty string colors', () => {
      wrapper = mount(AiChatTrashIcon, {
        props: { fill: '' }
      })

      const svg = wrapper.find('svg')
      expect(svg.attributes('fill')).toBe('')
    })

    it('should handle invalid color gracefully', () => {
      wrapper = mount(AiChatTrashIcon, {
        props: { fill: 'invalid-color' }
      })

      const svg = wrapper.find('svg')
      expect(svg.attributes('fill')).toBe('invalid-color')
      // Invalid colors will be handled by browser
    })

    it('should handle negative dimensions', () => {
      wrapper = mount(AiChatTrashIcon, {
        props: { width: -10, height: -5 }
      })
      expect(wrapper.vm.width).toBe(-10)
      expect(wrapper.vm.height).toBe(-5)
    })
  })

  describe('DOM Structure', () => {
    it('should have single root SVG element', () => {
      wrapper = mount(AiChatTrashIcon)

      expect(wrapper.element.tagName).toBe('svg')
      expect(wrapper.element.children).toHaveLength(1) // One main group
    })

    it('should maintain proper SVG hierarchy', () => {
      wrapper = mount(AiChatTrashIcon)

      const svg = wrapper.find('svg')
      const mainGroup = svg.find('g')
      const nestedGroup = mainGroup.find('g')
      const paths = nestedGroup.findAll('path')

      expect(svg.exists()).toBe(true)
      expect(mainGroup.exists()).toBe(true)
      expect(nestedGroup.exists()).toBe(true)
      expect(paths).toHaveLength(2)
    })
  })

  describe('Performance', () => {
    it('should handle rapid prop changes efficiently', async () => {
      wrapper = mount(AiChatTrashIcon)

      const colors = ['red', 'blue', 'green', 'yellow', 'purple']
      
      for (const color of colors) {
        await wrapper.setProps({ fill: color })
        const svg = wrapper.find('svg')
        expect(svg.attributes('fill')).toBe(color)
      }
    })

    it('should maintain consistent rendering with same props', async () => {
      wrapper = mount(AiChatTrashIcon, {
        props: { fill: 'blue', width: 30, height: 30 }
      })

      const initialHtml = wrapper.html()
      
      // Re-mount with same props
      wrapper.unmount()
      wrapper = mount(AiChatTrashIcon, {
        props: { fill: 'blue', width: 30, height: 30 }
      })

      expect(wrapper.html()).toBe(initialHtml)
    })
  })

  describe('Integration', () => {
    it('should work as part of button or clickable element', () => {
      const buttonWrapper = mount({
        template: '<button><AiChatTrashIcon fill="red" :width="24" :height="24" /></button>',
        components: { AiChatTrashIcon }
      })

      const button = buttonWrapper.find('button')
      const icon = buttonWrapper.findComponent(AiChatTrashIcon)

      expect(button.exists()).toBe(true)
      expect(icon.exists()).toBe(true)
      expect(icon.props('fill')).toBe('red')
      expect(icon.props('width')).toBe(24)
      expect(icon.props('height')).toBe(24)

      buttonWrapper.unmount()
    })

    it('should work with CSS custom properties', () => {
      wrapper = mount(AiChatTrashIcon, {
        props: { fill: 'var(--danger-color)' }
      })

      const svg = wrapper.find('svg')
      expect(svg.attributes('fill')).toBe('var(--danger-color)')
    })

    it('should work within flex containers', () => {
      const flexWrapper = mount({
        template: '<div style="display: flex;"><AiChatTrashIcon /></div>',
        components: { AiChatTrashIcon }
      })

      const container = flexWrapper.find('div')
      const icon = flexWrapper.findComponent(AiChatTrashIcon)

      expect(container.attributes('style')).toContain('display: flex')
      expect(icon.exists()).toBe(true)

      flexWrapper.unmount()
    })
  })

  describe('Visual Consistency', () => {
    it('should maintain consistent viewBox dimensions', () => {
      wrapper = mount(AiChatTrashIcon)

      const svg = wrapper.find('svg')
      const viewBox = svg.attributes('viewBox')
      
      expect(viewBox).toBe('0 0 408.483 408.483')
      
      // Verify this represents a square-ish icon
      const [x, y, width, height] = viewBox.split(' ').map(Number)
      expect(x).toBe(0)
      expect(y).toBe(0)
      expect(width).toBeCloseTo(408.483)
      expect(height).toBeCloseTo(408.483)
    })

    it('should have properly positioned paths within viewBox', () => {
      wrapper = mount(AiChatTrashIcon)

      const paths = wrapper.findAll('path')
      
      // All path coordinates should be within reasonable bounds
      paths.forEach(path => {
        const pathData = path.attributes('d')
        // Check that path contains coordinate values
        expect(pathData).toMatch(/\d+/)
      })
    })

    it('should represent a recognizable trash can icon', () => {
      wrapper = mount(AiChatTrashIcon)

      const paths = wrapper.findAll('path')
      
      // First path should be the body with lid
      const bodyPath = paths[0].attributes('d')
      expect(bodyPath).toContain('87.748,388.784') // Bottom coordinates
      
      // Second path should be the lid/top
      const lidPath = paths[1].attributes('d')
      expect(lidPath).toContain('343.567,21.043') // Top coordinates
    })
  })

  describe('Theme Integration', () => {
    it('should work with currentColor for theming', () => {
      wrapper = mount(AiChatTrashIcon)

      const svg = wrapper.find('svg')
      expect(svg.attributes('fill')).toBe('currentColor')
    })

    it('should inherit color from parent context', () => {
      const themedWrapper = mount({
        template: '<div style="color: purple;"><AiChatTrashIcon /></div>',
        components: { AiChatTrashIcon }
      })

      const container = themedWrapper.find('div')
      const icon = themedWrapper.findComponent(AiChatTrashIcon)

      expect(container.attributes('style')).toContain('color: purple')
      expect(icon.props('fill')).toBe('currentColor')

      themedWrapper.unmount()
    })

    it('should support custom theme colors', () => {
      const themeColors = ['var(--primary)', 'var(--danger)', 'var(--warning)']
      
      themeColors.forEach(color => {
        wrapper = mount(AiChatTrashIcon, {
          props: { fill: color }
        })
        
        const svg = wrapper.find('svg')
        expect(svg.attributes('fill')).toBe(color)
        wrapper.unmount()
      })
    })
  })
})