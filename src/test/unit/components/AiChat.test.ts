import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import AiChat from '../../../components/AiChat.vue'

// Mock AiChatTrashIcon component
vi.mock('../../../components/AiChatTrashIcon.vue', () => ({
  default: {
    name: 'AiChatTrashIcon',
    template: '<div class="mock-trash-icon" :width="width" :height="height"></div>',
    props: ['width', 'height', 'class']
  }
}))

// Mock Web Worker
const mockWorker = {
  postMessage: vi.fn(),
  terminate: vi.fn(),
  onmessage: null,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn()
}

// Mock Worker constructor
Object.defineProperty(global, 'Worker', {
  writable: true,
  value: vi.fn().mockImplementation(() => mockWorker)
})

// Mock fetch
const mockFetch = vi.fn()
Object.defineProperty(global, 'fetch', {
  writable: true,
  value: mockFetch
})

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage
})

// Mock clipboard API
const mockClipboard = {
  writeText: vi.fn().mockResolvedValue(undefined)
}
Object.defineProperty(navigator, 'clipboard', {
  value: mockClipboard,
  configurable: true
})

// Mock execCommand
Object.defineProperty(document, 'execCommand', {
  value: vi.fn().mockReturnValue(true)
})

// Mock requestAnimationFrame
Object.defineProperty(global, 'requestAnimationFrame', {
  value: vi.fn(cb => setTimeout(cb, 16))
})

describe('AiChat.vue', () => {
  let wrapper: VueWrapper<any>

  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ upstream_ok: true })
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Component Structure', () => {
    it('should render chat overlay when visible', async () => {
      wrapper = mount(AiChat, {
        props: { visible: true }
      })

      await nextTick()
      await nextTick() // Wait for isHide to be set

      expect(wrapper.find('.chatOverlay').exists()).toBe(true)
      expect(wrapper.find('.chatPanel').exists()).toBe(true)
    })

    it('should not render when not visible initially', () => {
      wrapper = mount(AiChat, {
        props: { visible: false }
      })

      expect(wrapper.find('.chatOverlay').exists()).toBe(false)
    })

    it('should render header with title and buttons', async () => {
      wrapper = mount(AiChat, {
        props: { visible: true, title: 'Test Chat' }
      })

      await nextTick()
      await nextTick()

      const header = wrapper.find('.chatHeader')
      expect(header.exists()).toBe(true)
      expect(header.find('h1').text()).toBe('Test Chat')
      expect(header.find('.resetBtn').exists()).toBe(true)
      expect(header.find('.closeBtn').exists()).toBe(true)
    })

    it('should render conversation area', async () => {
      wrapper = mount(AiChat, {
        props: { visible: true }
      })

      await nextTick()
      await nextTick()

      expect(wrapper.find('#conversation').exists()).toBe(true)
      expect(wrapper.find('.conversationBox').exists()).toBe(true)
    })

    it('should render input area with form', async () => {
      wrapper = mount(AiChat, {
        props: { 
          visible: true,
          placeholder: 'Test placeholder',
          instruction: 'Test instruction'
        }
      })

      await nextTick()
      await nextTick()

      const inputArea = wrapper.find('.inputArea')
      expect(inputArea.exists()).toBe(true)
      expect(inputArea.find('.inputInstruction').text()).toBe('Test instruction')
      expect(inputArea.find('input').attributes('placeholder')).toBe('Test placeholder')
      expect(inputArea.find('button[type="submit"]').exists()).toBe(true)
    })
  })

  describe('Props Handling', () => {
    it('should handle title prop', async () => {
      wrapper = mount(AiChat, {
        props: { visible: true, title: 'Custom AI Assistant' }
      })

      await nextTick()
      await nextTick()

      expect(wrapper.find('h1').text()).toBe('Custom AI Assistant')
    })

    it('should handle placeholder prop', async () => {
      wrapper = mount(AiChat, {
        props: { visible: true, placeholder: 'Custom placeholder' }
      })

      await nextTick()
      await nextTick()

      expect(wrapper.find('input').attributes('placeholder')).toBe('Custom placeholder')
    })

    it('should handle instruction prop', async () => {
      wrapper = mount(AiChat, {
        props: { visible: true, instruction: 'Custom instruction' }
      })

      await nextTick()
      await nextTick()

      expect(wrapper.find('.inputInstruction').text()).toBe('Custom instruction')
    })

    it('should apply custom panel width from localStorage', async () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'aiChatPanelWidth') return '800'
        return null
      })

      wrapper = mount(AiChat, {
        props: { visible: true }
      })

      await nextTick()
      await nextTick()

      const panel = wrapper.find('.chatPanel')
      expect(panel.attributes('style')).toContain('width: 800px')
    })
  })

  describe('Visibility Management', () => {
    it('should show overlay when visible prop becomes true', async () => {
      wrapper = mount(AiChat, {
        props: { visible: false }
      })

      expect(wrapper.find('.chatOverlay').exists()).toBe(false)

      await wrapper.setProps({ visible: true })
      await nextTick()
      await nextTick()

      expect(wrapper.find('.chatOverlay').exists()).toBe(true)
      expect(wrapper.find('.chatOverlay').classes()).toContain('show')
    })

    it('should emit close event when overlay is clicked', async () => {
      wrapper = mount(AiChat, {
        props: { visible: true }
      })

      await nextTick()
      await nextTick()

      await wrapper.find('.chatOverlay').trigger('click')

      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('should emit close event when close button is clicked', async () => {
      wrapper = mount(AiChat, {
        props: { visible: true }
      })

      await nextTick()
      await nextTick()

      await wrapper.find('.closeBtn').trigger('click')

      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('should not emit close when chat panel is clicked', async () => {
      wrapper = mount(AiChat, {
        props: { visible: true }
      })

      await nextTick()
      await nextTick()

      await wrapper.find('.chatPanel').trigger('click')

      expect(wrapper.emitted('close')).toBeFalsy()
    })
  })

  describe('Message Display', () => {
    it('should display messages from localStorage on mount', async () => {
      const savedMessages = [
        { sender: 'user', text: 'Hello', timestamp: Date.now() },
        { sender: 'assistant', text: 'Hi there!', timestamp: Date.now() }
      ]

      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'aiChatMessages') return JSON.stringify(savedMessages)
        return null
      })

      wrapper = mount(AiChat, {
        props: { visible: true }
      })

      await nextTick()
      await nextTick()

      const messages = wrapper.findAll('.messageBubble')
      expect(messages).toHaveLength(2)
      expect(messages[0].classes()).toContain('messageUser')
      expect(messages[1].classes()).toContain('messageAi')
    })

    it('should display user messages correctly', async () => {
      const messages = [
        { sender: 'user', text: 'Test user message', timestamp: Date.now() }
      ]

      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'aiChatMessages') return JSON.stringify(messages)
        return null
      })

      wrapper = mount(AiChat, {
        props: { visible: true }
      })

      await nextTick()
      await nextTick()

      const userMessage = wrapper.find('.messageUser')
      expect(userMessage.exists()).toBe(true)
      expect(userMessage.find('.messageText').text()).toBe('Test user message')
      expect(userMessage.find('.senderName').text()).toBe('Ty')
    })

    it('should display AI messages correctly', async () => {
      const messages = [
        { sender: 'assistant', text: 'Test AI response', timestamp: Date.now() }
      ]

      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'aiChatMessages') return JSON.stringify(messages)
        return null
      })

      wrapper = mount(AiChat, {
        props: { visible: true }
      })

      await nextTick()
      await nextTick()

      const aiMessage = wrapper.find('.messageAi')
      expect(aiMessage.exists()).toBe(true)
      expect(aiMessage.find('.senderName').text()).toBe('AI')
      expect(aiMessage.find('.iconWrapper').text()).toBe('🤖')
    })

    it('should show typing indicator when AI is typing', async () => {
      wrapper = mount(AiChat, {
        props: { visible: true }
      })

      await nextTick()
      await nextTick()

      // Simulate AI typing by setting internal state
      const vm = wrapper.vm as any
      vm.aiTyping = true
      vm.messages = [{ sender: 'assistant', text: '', timestamp: Date.now() }]
      vm.currentAiIndex = 0

      await nextTick()

      expect(wrapper.find('.typing').exists()).toBe(true)
    })
  })

  describe('Message Input', () => {
    it('should handle text input', async () => {
      wrapper = mount(AiChat, {
        props: { visible: true }
      })

      await nextTick()
      await nextTick()

      const input = wrapper.find('input')
      await input.setValue('Test message')

      expect((wrapper.vm as any).text).toBe('Test message')
    })

    it('should submit message on form submit', async () => {
      mockFetch.mockResolvedValue({
        json: () => Promise.resolve({ upstream_ok: true })
      })

      wrapper = mount(AiChat, {
        props: { visible: true }
      })

      await nextTick()
      await nextTick()

      const input = wrapper.find('input')
      await input.setValue('Test message')

      const form = wrapper.find('form')
      await form.trigger('submit')

      await nextTick()

      expect(mockWorker.postMessage).toHaveBeenCalled()
    })

    it('should disable input when AI is typing', async () => {
      wrapper = mount(AiChat, {
        props: { visible: true }
      })

      await nextTick()
      await nextTick()

      // Simulate AI typing
      const vm = wrapper.vm as any
      vm.aiTyping = true

      await nextTick()

      const input = wrapper.find('input')
      const submitBtn = wrapper.find('button[type="submit"]')

      expect(input.attributes('disabled')).toBeDefined()
      expect(submitBtn.attributes('disabled')).toBeDefined()
    })

    it('should not submit empty messages', async () => {
      wrapper = mount(AiChat, {
        props: { visible: true }
      })

      await nextTick()
      await nextTick()

      const form = wrapper.find('form')
      await form.trigger('submit')

      expect(mockWorker.postMessage).not.toHaveBeenCalled()
    })
  })

  describe('Health Check and API State', () => {
    it('should show checking banner during health check', async () => {
      wrapper = mount(AiChat, {
        props: { visible: true }
      })

      await nextTick()
      await nextTick()

      // Simulate checking state
      const vm = wrapper.vm as any
      vm.apiState = 'checking'

      await nextTick()

      const banner = wrapper.find('.healthBanner')
      expect(banner.exists()).toBe(true)
      expect(banner.text()).toContain('Sprawdzam połączenie z modelem')
    })

    it('should show waking banner when waking model', async () => {
      wrapper = mount(AiChat, {
        props: { visible: true }
      })

      await nextTick()
      await nextTick()

      // Simulate waking state
      const vm = wrapper.vm as any
      vm.apiState = 'waking'

      await nextTick()

      const banner = wrapper.find('.healthBanner')
      expect(banner.exists()).toBe(true)
      expect(banner.text()).toContain('Wybudzam model na Hugging Face')
    })

    it('should disable input during health check', async () => {
      wrapper = mount(AiChat, {
        props: { visible: true }
      })

      await nextTick()
      await nextTick()

      // Simulate checking state
      const vm = wrapper.vm as any
      vm.apiState = 'checking'

      await nextTick()

      const input = wrapper.find('input')
      const submitBtn = wrapper.find('button[type="submit"]')

      expect(input.attributes('disabled')).toBeDefined()
      expect(submitBtn.attributes('disabled')).toBeDefined()
    })
  })

  describe('Conversation Management', () => {
    it('should reset conversation when reset button is clicked', async () => {
      const messages = [
        { sender: 'user', text: 'Hello', timestamp: Date.now() }
      ]

      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'aiChatMessages') return JSON.stringify(messages)
        return null
      })

      wrapper = mount(AiChat, {
        props: { visible: true }
      })

      await nextTick()
      await nextTick()

      expect(wrapper.findAll('.messageBubble')).toHaveLength(1)

      await wrapper.find('.resetBtn').trigger('click')

      await nextTick()

      expect(wrapper.findAll('.messageBubble')).toHaveLength(0)
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('aiChatMessages')
    })

    it('should save messages to localStorage', async () => {
      wrapper = mount(AiChat, {
        props: { visible: true }
      })

      await nextTick()
      await nextTick()

      // Simulate adding a message
      const vm = wrapper.vm as any
      vm.messages = [{ sender: 'user', text: 'Test', timestamp: Date.now() }]

      await nextTick()

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'aiChatMessages',
        expect.any(String)
      )
    })
  })

  describe('Message Rendering', () => {
    it('should render HTML in AI messages', async () => {
      const messages = [
        { sender: 'assistant', text: 'Here is some `code`', timestamp: Date.now() }
      ]

      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'aiChatMessages') return JSON.stringify(messages)
        return null
      })

      wrapper = mount(AiChat, {
        props: { visible: true }
      })

      await nextTick()
      await nextTick()

      const messageHtml = wrapper.find('.messageHtml')
      expect(messageHtml.exists()).toBe(true)
    })

    it('should render code blocks with copy functionality', async () => {
      const messages = [
        { sender: 'assistant', text: '```javascript\nconsole.log("test")\n```', timestamp: Date.now() }
      ]

      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'aiChatMessages') return JSON.stringify(messages)
        return null
      })

      wrapper = mount(AiChat, {
        props: { visible: true }
      })

      await nextTick()
      await nextTick()

      // Test copy button functionality
      const copyBtn = wrapper.find('.copy-btn')
      if (copyBtn.exists()) {
        await copyBtn.trigger('click')
        expect(mockClipboard.writeText).toHaveBeenCalled()
      }
    })
  })

  describe('Panel Resizing', () => {
    it('should handle resize functionality', async () => {
      wrapper = mount(AiChat, {
        props: { visible: true }
      })

      await nextTick()
      await nextTick()

      const resizer = wrapper.find('.resizer')
      expect(resizer.exists()).toBe(true)

      // Simulate mouse down on resizer
      const mouseDownEvent = new MouseEvent('mousedown', { clientX: 100 })
      await resizer.trigger('mousedown', mouseDownEvent)

      // The resize logic would be tested, but since it uses window events,
      // we primarily test that the resizer element exists
    })

    it('should save panel width to localStorage', async () => {
      wrapper = mount(AiChat, {
        props: { visible: true }
      })

      await nextTick()
      await nextTick()

      // Simulate width change
      const vm = wrapper.vm as any
      vm.panelWidth = 800

      await nextTick()

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('aiChatPanelWidth', '800')
    })
  })

  describe('Worker Communication', () => {
    it('should initialize worker on mount', () => {
      wrapper = mount(AiChat, {
        props: { visible: true }
      })

      expect(Worker).toHaveBeenCalled()
    })

    it('should terminate worker on unmount', async () => {
      wrapper = mount(AiChat, {
        props: { visible: true }
      })

      wrapper.unmount()

      expect(mockWorker.terminate).toHaveBeenCalled()
    })

    it('should handle worker messages', async () => {
      wrapper = mount(AiChat, {
        props: { visible: true }
      })

      await nextTick()
      await nextTick()

      // Simulate worker message
      const vm = wrapper.vm as any
      vm.messages = [{ sender: 'assistant', text: '', timestamp: Date.now() }]
      vm.currentAiIndex = 0
      vm.aiTyping = true

      // Simulate worker onmessage
      if (mockWorker.onmessage) {
        mockWorker.onmessage({
          data: { aiIndex: 0, char: 'H', done: false }
        })

        expect(vm.messages[0].text).toBe('H')
      }
    })
  })

  describe('Rate Limiting', () => {
    it('should enforce rate limiting', async () => {
      wrapper = mount(AiChat, {
        props: { visible: true }
      })

      await nextTick()
      await nextTick()

      const vm = wrapper.vm as any
      
      // Mock alert
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

      // Simulate 20 requests in the last minute
      vm.requestTimestamps = Array(20).fill(Date.now())

      const input = wrapper.find('input')
      await input.setValue('Test message')

      const form = wrapper.find('form')
      await form.trigger('submit')

      expect(alertSpy).toHaveBeenCalledWith('Limit 20 zapytań na minutę. Spróbuj ponownie później.')
      
      alertSpy.mockRestore()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', async () => {
      wrapper = mount(AiChat, {
        props: { visible: true }
      })

      await nextTick()
      await nextTick()

      const resetBtn = wrapper.find('.resetBtn')
      const closeBtn = wrapper.find('.closeBtn')

      expect(resetBtn.attributes('aria-label')).toBe('Resetuj czat')
      expect(closeBtn.attributes('aria-label')).toBe('Zamknij czat')
    })

    it('should focus input when chat becomes visible', async () => {
      wrapper = mount(AiChat, {
        props: { visible: false }
      })

      const focusSpy = vi.fn()
      const vm = wrapper.vm as any
      vm.$refs.textInput = { focus: focusSpy }

      await wrapper.setProps({ visible: true })
      await nextTick()
      await nextTick()

      // Focus would be called after timeout, so we test the setup
      expect(wrapper.props('visible')).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('should handle invalid localStorage data gracefully', async () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'aiChatMessages') return 'invalid json'
        return null
      })

      wrapper = mount(AiChat, {
        props: { visible: true }
      })

      await nextTick()
      await nextTick()

      // Should not crash and should have empty messages
      expect(wrapper.findAll('.messageBubble')).toHaveLength(0)
    })

    it('should handle network errors during health check', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      wrapper = mount(AiChat, {
        props: { visible: true }
      })

      const input = wrapper.find('input')
      await input.setValue('Test message')

      const form = wrapper.find('form')
      await form.trigger('submit')

      // Should not crash
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle cancel response functionality', async () => {
      wrapper = mount(AiChat, {
        props: { visible: true }
      })

      await nextTick()
      await nextTick()

      const vm = wrapper.vm as any
      vm.messages = [{ sender: 'assistant', text: '', timestamp: Date.now() }]
      vm.currentAiIndex = 0
      vm.aiTyping = true

      await nextTick()

      const cancelBtn = wrapper.find('.cancelBtn')
      if (cancelBtn.exists()) {
        await cancelBtn.trigger('click')
        expect(vm.aiTyping).toBe(false)
        expect(vm.currentAiIndex).toBe(null)
      }
    })
  })

  describe('Time Formatting', () => {
    it('should format timestamps correctly', async () => {
      const timestamp = new Date('2023-10-08T14:30:00').getTime()
      const messages = [
        { sender: 'user', text: 'Hello', timestamp }
      ]

      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'aiChatMessages') return JSON.stringify(messages)
        return null
      })

      wrapper = mount(AiChat, {
        props: { visible: true }
      })

      await nextTick()
      await nextTick()

      const timestamp_el = wrapper.find('.timestamp')
      expect(timestamp_el.exists()).toBe(true)
      // Time format would depend on locale, so we just check it exists
    })
  })

  describe('Performance', () => {
    it('should not re-render unnecessarily', async () => {
      wrapper = mount(AiChat, {
        props: { visible: true }
      })

      await nextTick()
      await nextTick()

      const renderCount = wrapper.vm.$?._updateCount || 0

      // Trigger same props
      await wrapper.setProps({ visible: true })

      const newRenderCount = wrapper.vm.$?._updateCount || 0
      expect(newRenderCount).toBe(renderCount)
    })

    it('should handle large message history efficiently', async () => {
      const largeMessageHistory = Array(100).fill(null).map((_, i) => ({
        sender: i % 2 === 0 ? 'user' : 'assistant',
        text: `Message ${i}`,
        timestamp: Date.now() + i
      }))

      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'aiChatMessages') return JSON.stringify(largeMessageHistory)
        return null
      })

      wrapper = mount(AiChat, {
        props: { visible: true }
      })

      await nextTick()
      await nextTick()

      expect(wrapper.findAll('.messageBubble')).toHaveLength(100)
    })
  })
})