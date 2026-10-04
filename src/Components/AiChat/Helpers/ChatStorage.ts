import { generateId } from '@/Shared/Utils/Identifiers';
import { clamp } from '@/Shared/Utils/Numbers';
import { getStorageItem, setStorageItem } from '@/Shared/Utils/Storage';
import type { ChatMessage } from '@/Types/Chat';
import {
  API_KEY_STORAGE_KEY,
  DEFAULT_PANEL_WIDTH,
  HISTORY_LIMIT,
  MAX_WIDTH,
  MIN_WIDTH,
  SESSION_KEY,
  STORAGE_KEY,
  STORAGE_VERSION,
  WIDTH_KEY,
} from '../ChatConfig';

const isStoredMessage = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object';

const extractMessageEntries = (history: unknown): unknown[] => {
  // Older versions stored the message array without a versioned wrapper.
  if (Array.isArray(history)) {
    return history;
  }

  if (history !== null && typeof history === 'object' && 'messages' in history) {
    return Array.isArray(history.messages) ? history.messages : [];
  }

  return [];
};

const normalizeMessage = (message: Record<string, unknown>, index: number): ChatMessage => {
  const storedTimestamp = message.timestamp;
  const hasValidTimestamp = typeof storedTimestamp === 'number' && Number.isFinite(storedTimestamp);

  return {
    id: typeof message.id === 'string' ? message.id : generateId(`legacy-${index}`),
    sender: message.sender === 'assistant' ? 'assistant' : 'user',
    text: typeof message.text === 'string' ? message.text : '',
    timestamp: hasValidTimestamp ? storedTimestamp : Date.now(),
  };
};

export const restoreMessages = (): ChatMessage[] => {
  try {
    const storedHistory = getStorageItem(STORAGE_KEY);
    if (!storedHistory) {
      return [];
    }

    const parsedHistory: unknown = JSON.parse(storedHistory);
    const entries = extractMessageEntries(parsedHistory);
    const recentMessages = entries.filter(isStoredMessage).slice(-HISTORY_LIMIT);

    return recentMessages.map(normalizeMessage);
  } catch {
    // Invalid history should not prevent the rest of the chat from restoring.
    return [];
  }
};

export const persistMessages = (messages: ChatMessage[]): void => {
  if (messages.length === 0) {
    setStorageItem(STORAGE_KEY, null);
    return;
  }

  const history = {
    version: STORAGE_VERSION,
    messages: messages.slice(-HISTORY_LIMIT),
  };
  setStorageItem(STORAGE_KEY, JSON.stringify(history));
};

export const restoreApiKey = (): string => {
  const storedKey = getStorageItem(API_KEY_STORAGE_KEY);
  return storedKey?.trim() ?? '';
};

export const persistApiKey = (key: string): void => {
  setStorageItem(API_KEY_STORAGE_KEY, key || null);
};

export const restorePanelWidth = (): number => {
  const storedWidth = getStorageItem(WIDTH_KEY);
  if (!storedWidth) {
    return DEFAULT_PANEL_WIDTH;
  }

  const width = Number(storedWidth);
  if (!Number.isFinite(width)) {
    return DEFAULT_PANEL_WIDTH;
  }

  return clamp(width, MIN_WIDTH, MAX_WIDTH);
};

export const persistPanelWidth = (width: number): void => {
  setStorageItem(WIDTH_KEY, String(width));
};

export const restoreSessionId = (): string => {
  const storedSessionId = getStorageItem(SESSION_KEY);
  const sessionId = storedSessionId || generateId('session');
  setStorageItem(SESSION_KEY, sessionId);
  return sessionId;
};
