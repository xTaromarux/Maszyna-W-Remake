<template>
  <div id="console" class="futuristic-console">
    <div class="console-header">
      <div class="header-left">
        <div class="status-indicator"></div>
        <span class="console-title">SYSTEM CONSOLE</span>
      </div>
      <div class="header-center">
        <button @click="scrollToTop" class="scroll-top-btn" title="Scroll to top">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 15l-6-6-6 6" />
          </svg>
        </button>
        <button @click="scrollToBottom" class="scroll-bottom-btn" title="Scroll to bottom">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        <button @click="clearConsole" class="clear-btn" title="Clear console">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          </svg>
        </button>
      </div>
      <div class="header-right">
        <span class="entry-count">{{ logs.length }} entries</span>
        <button @click="closeConsole" class="close-btn" title="Close console">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6l-12 12" />
            <path d="M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <div class="console-content" ref="consoleContentRef">
      <div v-for="(log, i) in logs" :key="i" :class="['console-entry', getLogLevelClass(log), { 'has-details': hasErrorDetails(log) }]">
        <div class="entry-header" @click="hasErrorDetails(log) ? toggleDetails(i) : null">
          <div class="entry-meta">
            <div class="severity-indicator" :style="{ backgroundColor: getLogColor(log) }"></div>
            <span class="timestamp">{{ fmt(log.timestamp) }}</span>
            <span class="level-badge" :style="{ color: getLogColor(log) }">
              {{ getDisplayLevel(log) }}
            </span>
          </div>

          <div class="entry-content">
            <div class="message-line">
              <span class="terminal-symbol">>_</span>
              <span class="message">{{ getMainMessage(log) }}</span>
            </div>

            <button
              v-if="hasErrorDetails(log)"
              class="details-toggle"
              :class="{ expanded: expandedEntries.has(i) }"
              @click.stop="toggleDetails(i)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
            </button>
          </div>
        </div>

        <div v-if="expandedEntries.has(i) && hasErrorDetails(log)" class="entry-details">
          <div class="details-content">
            <div v-if="getErrorCode(log)" class="detail-section">
              <span class="detail-label">Error Code:</span>
              <code class="detail-value">{{ getErrorCode(log) }}</code>
            </div>

            <div v-if="getErrorHint(log)" class="detail-section">
              <span class="detail-label">Hint:</span>
              <div class="detail-value hint-text">{{ getErrorHint(log) }}</div>
            </div>

            <div v-if="getErrorLocation(log)" class="detail-section">
              <span class="detail-label">Location:</span>
              <code class="detail-value">{{ getErrorLocation(log) }}</code>
            </div>

            <div v-if="getErrorFrame(log)" class="detail-section code-frame">
              <span class="detail-label">Context:</span>
              <pre class="detail-value code-block">{{ getErrorFrame(log) }}</pre>
            </div>

            <div v-if="getErrorTimestamp(log)" class="detail-section">
              <span class="detail-label">Occurred:</span>
              <span class="detail-value">{{ formatDetailedTimestamp(getErrorTimestamp(log)) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, toRefs, watch } from 'vue';
import { ErrorLevel, ErrorLevelColor } from '../errors';

const props = defineProps({
  logs: { type: Array, default: () => [] },
});

const emit = defineEmits(['close', 'clear']);
const expandedEntries = ref(new Set());
const consoleContentRef = ref(null);

const pad = (n) => String(n).padStart(2, '0');

const fmt = (ts) => {
  const d = new Date(ts);
  const today = new Date().toDateString() === d.toDateString();
  const YMD = [d.getFullYear(), pad(d.getMonth() + 1), pad(d.getDate())].join('-');
  const HMS = [pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds())].join(':');

  return today ? HMS : `${YMD} ${HMS}`;
};

const formatDetailedTimestamp = (timestamp) => {
  return new Date(timestamp).toLocaleString();
};

const getLogLevelClass = (log) => {
  // Map legacy class names and new error levels
  const level = getLogLevel(log);
  return `level-${level.toLowerCase()}`;
};

const getLogLevel = (log) => {
  // Check if it's a BaseAppError with level property
  if (log.error?.level) {
    return log.error.level;
  }

  // Check direct level property
  if (log.level) {
    return log.level;
  }

  // Map legacy class names
  const legacyClass = log.class?.toLowerCase();
  switch (legacyClass) {
    case 'error':
    case 'błąd':
    case 'błąd parsera kodu':
      return ErrorLevel.ERROR;
    case 'warning':
    case 'ostrzeżenie':
      return ErrorLevel.WARNING;
    case 'info':
    case 'system':
    case 'kompilator rozkazów':
      return ErrorLevel.INFO;
    default:
      return ErrorLevel.INFO;
  }
};

const getLogColor = (log) => {
  const level = getLogLevel(log);
  return ErrorLevelColor[level] || ErrorLevelColor[ErrorLevel.INFO];
};

const getDisplayLevel = (log) => {
  const level = getLogLevel(log);
  return level || log.class || 'INFO';
};

const getMainMessage = (log) => {
  return log.message || log.error?.message || 'Unknown message';
};

const hasErrorDetails = (log) => {
  return !!(log.error?.code || log.error?.hint || log.error?.loc || log.error?.frame || log.error?.timestamp);
};

const getErrorCode = (log) => {
  return log.error?.code;
};

const getErrorHint = (log) => {
  return log.error?.hint;
};

const getErrorLocation = (log) => {
  const loc = log.error?.loc;
  if (!loc) return null;
  return `Line ${loc.line}, Column ${loc.col}`;
};

const getErrorFrame = (log) => {
  return log.error?.frame;
};

const getErrorTimestamp = (log) => {
  return log.error?.timestamp;
};

const toggleDetails = (index) => {
  if (expandedEntries.value.has(index)) {
    expandedEntries.value.delete(index);
  } else {
    expandedEntries.value.add(index);
  }
};

const closeConsole = () => {
  emit('close');
};

const clearConsole = () => {
  emit('clear');
};

const scrollToTop = () => {
  if (consoleContentRef.value) {
    consoleContentRef.value.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }
};

const scrollToBottom = () => {
  if (consoleContentRef.value) {
    nextTick(() => {
      consoleContentRef.value.scrollTo({
        top: consoleContentRef.value.scrollHeight,
        behavior: 'smooth',
      });
    });
  }
};

// Auto-scroll to bottom when new logs are added (only if user is already at bottom)
const { logs } = toRefs(props);
watch(
  logs,
  (newLogs, oldLogs) => {
    if (newLogs.length > (oldLogs?.length || 0) && consoleContentRef.value) {
      const element = consoleContentRef.value;
      const isAtBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - 10;

      if (isAtBottom) {
        nextTick(() => {
          scrollToBottom();
        });
      }
    }
  },
  { deep: true }
);
</script>
