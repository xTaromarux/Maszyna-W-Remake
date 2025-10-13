<template>
  <div class="test-dashboard">
    <header class="dashboard-header">
      <div class="header-content">
        <h1 class="dashboard-title">
          <span class="icon">🧪</span>
          Maszyna W - Test Dashboard
        </h1>
        <div class="header-stats">
          <div class="stat-item success">
            <span class="stat-number">{{ totalPassed }}</span>
            <span class="stat-label">Passing</span>
          </div>
          <div class="stat-item error">
            <span class="stat-number">{{ totalFailed }}</span>
            <span class="stat-label">Failing</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ coveragePercentage }}%</span>
            <span class="stat-label">Coverage</span>
          </div>
        </div>
      </div>
    </header>

    <nav class="dashboard-nav">
      <div class="nav-buttons">
        <button 
          v-for="category in categories"
          :key="category.id"
          :class="['nav-button', { active: selectedCategory === category.id }]"
          @click="selectedCategory = category.id"
        >
          <span class="nav-icon">{{ category.icon }}</span>
          <span class="nav-label">{{ category.name }}</span>
          <span class="nav-badge" :class="category.status">{{ category.count }}</span>
        </button>
      </div>
      
      <div class="nav-controls">
        <div class="search-box">
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Search tests..."
            class="search-input"
          >
          <span class="search-icon">🔍</span>
        </div>
        
        <select v-model="filterStatus" class="filter-select">
          <option value="all">All Tests</option>
          <option value="passing">Passing Only</option>
          <option value="failing">Failing Only</option>
          <option value="slow">Slow Tests</option>
        </select>

        <button @click="runAllTests" class="run-button" :disabled="testsRunning">
          {{ testsRunning ? '⏳ Running...' : '▶️ Run All' }}
        </button>
      </div>
    </nav>

    <main class="dashboard-main">
      <div class="test-results">
        <div class="results-header">
          <h2>{{ currentCategoryName }} Results</h2>
          <div class="results-summary">
            {{ filteredTests.length }} tests found
            <span v-if="searchQuery"> matching "{{ searchQuery }}"</span>
          </div>
        </div>

        <div class="test-grid">
          <div 
            v-for="test in paginatedTests"
            :key="test.id"
            :class="['test-card', test.status]"
            @click="selectTest(test)"
          >
            <div class="test-card-header">
              <div class="test-status-icon">
                {{ test.status === 'passed' ? '✅' : test.status === 'failed' ? '❌' : '⏸️' }}
              </div>
              <div class="test-info">
                <h3 class="test-name">{{ test.name }}</h3>
                <p class="test-suite">{{ test.suite }}</p>
              </div>
              <div class="test-meta">
                <span class="test-duration">{{ formatDuration(test.duration) }}</span>
                <span v-if="test.coverage" class="test-coverage">{{ test.coverage }}%</span>
              </div>
            </div>
            
            <div v-if="test.status === 'failed'" class="test-error">
              <div class="error-message">{{ test.error?.message }}</div>
            </div>
            
            <div class="test-tags">
              <span 
                v-for="tag in test.tags" 
                :key="tag"
                class="test-tag"
                :class="tag.toLowerCase()"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="totalPages > 1" class="pagination">
          <button 
            @click="currentPage = Math.max(1, currentPage - 1)"
            :disabled="currentPage === 1"
            class="pagination-button"
          >
            ← Previous
          </button>
          
          <span class="pagination-info">
            Page {{ currentPage }} of {{ totalPages }}
          </span>
          
          <button 
            @click="currentPage = Math.min(totalPages, currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="pagination-button"
          >
            Next →
          </button>
        </div>
      </div>

      <aside class="test-details" v-if="selectedTest">
        <div class="details-header">
          <h3>Test Details</h3>
          <button @click="selectedTest = null" class="close-button">×</button>
        </div>
        
        <div class="details-content">
          <div class="detail-section">
            <h4>{{ selectedTest.name }}</h4>
            <p class="detail-suite">{{ selectedTest.suite }}</p>
            
            <div class="detail-stats">
              <div class="detail-stat">
                <span class="detail-label">Status:</span>
                <span :class="['detail-value', selectedTest.status]">
                  {{ selectedTest.status.toUpperCase() }}
                </span>
              </div>
              <div class="detail-stat">
                <span class="detail-label">Duration:</span>
                <span class="detail-value">{{ formatDuration(selectedTest.duration) }}</span>
              </div>
              <div v-if="selectedTest.coverage" class="detail-stat">
                <span class="detail-label">Coverage:</span>
                <span class="detail-value">{{ selectedTest.coverage }}%</span>
              </div>
            </div>
          </div>

          <div v-if="selectedTest.error" class="detail-section">
            <h4>Error Details</h4>
            <div class="error-details">
              <pre class="error-stack">{{ selectedTest.error.stack }}</pre>
            </div>
          </div>

          <div v-if="selectedTest.assertions" class="detail-section">
            <h4>Assertions ({{ selectedTest.assertions.length }})</h4>
            <div class="assertions-list">
              <div 
                v-for="assertion in selectedTest.assertions"
                :key="assertion.id"
                :class="['assertion-item', assertion.status]"
              >
                <span class="assertion-icon">
                  {{ assertion.status === 'passed' ? '✓' : '✗' }}
                </span>
                <span class="assertion-text">{{ assertion.description }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h4>Actions</h4>
            <div class="detail-actions">
              <button @click="runSingleTest(selectedTest)" class="action-button">
                🔄 Re-run Test
              </button>
              <button @click="debugTest(selectedTest)" class="action-button">
                🐛 Debug Test
              </button>
              <button @click="viewSource(selectedTest)" class="action-button">
                📝 View Source
              </button>
            </div>
          </div>
        </div>
      </aside>
    </main>

    <footer class="dashboard-footer">
      <div class="footer-content">
        <div class="footer-info">
          <span>Last run: {{ lastRunTime }}</span>
          <span>Total duration: {{ formatDuration(totalDuration) }}</span>
          <span>{{ filteredTests.length }}/{{ allTests.length }} tests displayed</span>
        </div>
        
        <div class="footer-actions">
          <button @click="exportResults" class="footer-button">
            📊 Export Results
          </button>
          <button @click="viewCoverage" class="footer-button">
            📈 Coverage Report
          </button>
          <button @click="openSettings" class="footer-button">
            ⚙️ Settings
          </button>
        </div>
      </div>
    </footer>

    <!-- Live Updates Badge -->
    <div v-if="liveUpdates" class="live-indicator">
      <span class="live-dot"></span>
      Live Updates
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface TestAssertion {
  id: string
  description: string
  status: 'passed' | 'failed'
}

interface TestError {
  message: string
  stack: string
  line?: number
  column?: number
}

interface Test {
  id: string
  name: string
  suite: string
  status: 'passed' | 'failed' | 'skipped' | 'running'
  duration: number
  coverage?: number
  error?: TestError
  tags: string[]
  assertions?: TestAssertion[]
  category: string
}

interface TestCategory {
  id: string
  name: string
  icon: string
  count: number
  status: 'success' | 'error' | 'warning'
}

// Reactive data
const selectedCategory = ref('all')
const searchQuery = ref('')
const filterStatus = ref('all')
const selectedTest = ref<Test | null>(null)
const testsRunning = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const liveUpdates = ref(true)
const lastRunTime = ref(new Date().toLocaleString())

// Mock test data - w rzeczywistości to byłby fetch z Vitest API
const allTests = ref<Test[]>([
  // WLAN Core Tests
  ...Array.from({ length: 22 }, (_, i) => ({
    id: `lexer-${i}`,
    name: `Lexer test ${i + 1}`,
    suite: 'WLAN Lexer',
    status: 'passed' as const,
    duration: Math.random() * 100 + 10,
    coverage: Math.floor(Math.random() * 20) + 80,
    tags: ['WLAN', 'Core', 'Lexer'],
    category: 'wlan-core',
    assertions: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, j) => ({
      id: `assertion-${i}-${j}`,
      description: `Should validate token ${j + 1}`,
      status: 'passed' as const
    }))
  })),
  
  ...Array.from({ length: 30 }, (_, i) => ({
    id: `parser-${i}`,
    name: `Parser test ${i + 1}`,
    suite: 'WLAN Parser', 
    status: 'passed' as const,
    duration: Math.random() * 150 + 20,
    coverage: Math.floor(Math.random() * 15) + 85,
    tags: ['WLAN', 'Core', 'Parser'],
    category: 'wlan-core'
  })),

  // Vue Component Tests
  ...Array.from({ length: 38 }, (_, i) => ({
    id: `program-editor-${i}`,
    name: `ProgramEditor test ${i + 1}`,
    suite: 'ProgramEditor.vue',
    status: 'passed' as const,
    duration: Math.random() * 200 + 50,
    coverage: Math.floor(Math.random() * 10) + 90,
    tags: ['Vue', 'Component', 'Editor'],
    category: 'vue-components'
  })),

  ...Array.from({ length: 56 }, (_, i) => ({
    id: `execution-controls-${i}`,
    name: `ExecutionControls test ${i + 1}`,
    suite: 'ExecutionControls.vue',
    status: 'passed' as const,
    duration: Math.random() * 100 + 30,
    coverage: Math.floor(Math.random() * 10) + 90,
    tags: ['Vue', 'Component', 'Controls'],
    category: 'vue-components'
  })),

  ...Array.from({ length: 43 }, (_, i) => ({
    id: `memory-section-${i}`,
    name: `MemorySection test ${i + 1}`,
    suite: 'MemorySection.vue',
    status: 'passed' as const,
    duration: Math.random() * 120 + 40,
    coverage: Math.floor(Math.random() * 10) + 90,
    tags: ['Vue', 'Component', 'Memory', 'Responsive'],
    category: 'vue-components'
  }))
])

// Computed properties
const categories = computed<TestCategory[]>(() => [
  {
    id: 'all',
    name: 'All Tests',
    icon: '🧪',
    count: allTests.value.length,
    status: totalFailed.value > 0 ? 'error' : 'success'
  },
  {
    id: 'wlan-core',
    name: 'WLAN Core',
    icon: '⚙️',
    count: allTests.value.filter(t => t.category === 'wlan-core').length,
    status: 'success'
  },
  {
    id: 'vue-components',
    name: 'Vue Components',
    icon: '🎨',
    count: allTests.value.filter(t => t.category === 'vue-components').length,
    status: 'success'
  },
  {
    id: 'integration',
    name: 'Integration',
    icon: '🔗',
    count: 0,
    status: 'warning'
  },
  {
    id: 'e2e',
    name: 'E2E Tests',
    icon: '🌐',
    count: 0,
    status: 'warning'
  }
])

const currentCategoryName = computed(() => {
  const category = categories.value.find(c => c.id === selectedCategory.value)
  return category?.name || 'All Tests'
})

const filteredTests = computed(() => {
  let tests = allTests.value

  // Filter by category
  if (selectedCategory.value !== 'all') {
    tests = tests.filter(test => test.category === selectedCategory.value)
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    tests = tests.filter(test => 
      test.name.toLowerCase().includes(query) ||
      test.suite.toLowerCase().includes(query) ||
      test.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }

  // Filter by status
  if (filterStatus.value !== 'all') {
    switch (filterStatus.value) {
      case 'passing':
        tests = tests.filter(test => test.status === 'passed')
        break
      case 'failing':
        tests = tests.filter(test => test.status === 'failed')
        break
      case 'slow':
        tests = tests.filter(test => test.duration > 100)
        break
    }
  }

  return tests
})

const totalPages = computed(() => Math.ceil(filteredTests.value.length / pageSize.value))

const paginatedTests = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredTests.value.slice(start, end)
})

const totalPassed = computed(() => allTests.value.filter(t => t.status === 'passed').length)
const totalFailed = computed(() => allTests.value.filter(t => t.status === 'failed').length)
const totalDuration = computed(() => allTests.value.reduce((sum, test) => sum + test.duration, 0))

const coveragePercentage = computed(() => {
  const testsWithCoverage = allTests.value.filter(t => t.coverage)
  if (testsWithCoverage.length === 0) return 0
  const avgCoverage = testsWithCoverage.reduce((sum, test) => sum + (test.coverage || 0), 0) / testsWithCoverage.length
  return Math.round(avgCoverage)
})

// Methods
const formatDuration = (duration: number): string => {
  if (duration < 1000) return `${Math.round(duration)}ms`
  return `${(duration / 1000).toFixed(1)}s`
}

const selectTest = (test: Test) => {
  selectedTest.value = test
}

const runAllTests = async () => {
  testsRunning.value = true
  // Simulate test run
  await new Promise(resolve => setTimeout(resolve, 2000))
  testsRunning.value = false
  lastRunTime.value = new Date().toLocaleString()
}

const runSingleTest = async (test: Test) => {
  test.status = 'running'
  await new Promise(resolve => setTimeout(resolve, 1000))
  test.status = 'passed'
}

const debugTest = (test: Test) => {
  console.log('Debugging test:', test)
  // Open debug interface
}

const viewSource = (test: Test) => {
  console.log('View source for:', test)
  // Open source code
}

const exportResults = () => {
  const data = {
    summary: {
      total: allTests.value.length,
      passed: totalPassed.value,
      failed: totalFailed.value,
      coverage: coveragePercentage.value
    },
    tests: allTests.value,
    timestamp: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `test-results-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const viewCoverage = () => {
  // Open coverage report
  window.open('/coverage/index.html', '_blank')
}

const openSettings = () => {
  // Open settings modal
  console.log('Open test settings')
}

// Auto-refresh every 30 seconds when live updates enabled
let refreshInterval: number | null = null

onMounted(() => {
  if (liveUpdates.value) {
    refreshInterval = window.setInterval(() => {
      // Refresh test data
      lastRunTime.value = new Date().toLocaleString()
    }, 30000)
  }
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<style scoped>
.test-dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #333;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.dashboard-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1.5rem 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  color: #2d3748;
}

.icon {
  font-size: 2rem;
}

.header-stats {
  display: flex;
  gap: 2rem;
}

.stat-item {
  text-align: center;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.stat-item.success {
  border-color: #10b981;
  background: linear-gradient(135deg, #ecfdf5, #d1fae5);
}

.stat-item.error {
  border-color: #ef4444;
  background: linear-gradient(135deg, #fef2f2, #fecaca);
}

.stat-number {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
}

.stat-label {
  display: block;
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.dashboard-nav {
  background: rgba(255, 255, 255, 0.9);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  max-width: 1400px;
  margin: 0 auto;
}

.nav-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.nav-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.nav-button:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.nav-button.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.nav-badge {
  background: #e5e7eb;
  color: #374151;
  padding: 0.125rem 0.375rem;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 600;
  min-width: 1.25rem;
  text-align: center;
}

.nav-button.active .nav-badge {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.nav-badge.success {
  background: #10b981;
  color: white;
}

.nav-badge.error {
  background: #ef4444;
  color: white;
}

.nav-badge.warning {
  background: #f59e0b;
  color: white;
}

.nav-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
}

.search-input {
  padding: 0.5rem 2.5rem 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  width: 200px;
}

.search-icon {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.filter-select {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
}

.run-button {
  padding: 0.5rem 1rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.run-button:hover:not(:disabled) {
  background: #059669;
}

.run-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.dashboard-main {
  display: flex;
  max-width: 1400px;
  margin: 0 auto;
  gap: 2rem;
  padding: 2rem;
  min-height: calc(100vh - 300px);
}

.test-results {
  flex: 1;
}

.results-header {
  margin-bottom: 1.5rem;
}

.results-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: white;
}

.results-summary {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.875rem;
}

.test-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
}

.test-card {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  border-left: 4px solid #e5e7eb;
}

.test-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.test-card.passed {
  border-left-color: #10b981;
}

.test-card.failed {
  border-left-color: #ef4444;
}

.test-card.running {
  border-left-color: #f59e0b;
  animation: pulse 2s infinite;
}

.test-card-header {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.test-status-icon {
  font-size: 1.25rem;
  margin-top: 0.125rem;
}

.test-info {
  flex: 1;
  min-width: 0;
}

.test-name {
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.test-suite {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
}

.test-meta {
  text-align: right;
  font-size: 0.75rem;
  color: #9ca3af;
}

.test-duration {
  display: block;
}

.test-coverage {
  display: block;
  margin-top: 0.125rem;
}

.test-error {
  margin-top: 0.75rem;
  padding: 0.5rem;
  background: #fef2f2;
  border-radius: 4px;
  border: 1px solid #fecaca;
}

.error-message {
  font-size: 0.75rem;
  color: #dc2626;
  font-family: 'Monaco', 'Menlo', monospace;
}

.test-tags {
  display: flex;
  gap: 0.25rem;
  margin-top: 0.75rem;
  flex-wrap: wrap;
}

.test-tag {
  background: #f3f4f6;
  color: #374151;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-size: 0.625rem;
  font-weight: 500;
}

.test-tag.wlan {
  background: #dbeafe;
  color: #1e40af;
}

.test-tag.vue {
  background: #dcfce7;
  color: #166534;
}

.test-tag.component {
  background: #fef3c7;
  color: #92400e;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.pagination-button {
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-button:hover:not(:disabled) {
  background: #f9fafb;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  color: white;
  font-size: 0.875rem;
}

.test-details {
  width: 400px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  height: fit-content;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.details-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.details-content {
  padding: 1rem;
}

.detail-section {
  margin-bottom: 1.5rem;
}

.detail-section h4 {
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
}

.detail-suite {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0 0 1rem 0;
}

.detail-stats {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.detail-value {
  font-size: 0.875rem;
  font-weight: 500;
}

.detail-value.passed {
  color: #10b981;
}

.detail-value.failed {
  color: #ef4444;
}

.error-details {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 4px;
  padding: 0.75rem;
}

.error-stack {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.75rem;
  color: #dc2626;
  margin: 0;
  white-space: pre-wrap;
}

.assertions-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.assertion-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
}

.assertion-item.passed {
  background: #ecfdf5;
  color: #065f46;
}

.assertion-item.failed {
  background: #fef2f2;
  color: #991b1b;
}

.assertion-icon {
  font-weight: bold;
}

.detail-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.action-button {
  padding: 0.5rem;
  background: #f9fafb;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
  text-align: left;
}

.action-button:hover {
  background: #f3f4f6;
}

.dashboard-footer {
  background: rgba(255, 255, 255, 0.9);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1rem 2rem;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
  flex-wrap: wrap;
  gap: 1rem;
}

.footer-info {
  display: flex;
  gap: 2rem;
  font-size: 0.875rem;
  color: #6b7280;
  flex-wrap: wrap;
}

.footer-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.footer-button {
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.footer-button:hover {
  background: #f9fafb;
}

.live-indicator {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #10b981;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 1000;
}

.live-dot {
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@media (max-width: 768px) {
  .dashboard-main {
    flex-direction: column;
    padding: 1rem;
  }
  
  .test-details {
    width: 100%;
  }
  
  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .dashboard-nav {
    flex-direction: column;
    align-items: stretch;
  }
  
  .nav-controls {
    justify-content: center;
  }
  
  .footer-content {
    flex-direction: column;
    text-align: center;
  }
  
  .test-grid {
    grid-template-columns: 1fr;
  }
}
</style>