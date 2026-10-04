import type { RateLimit } from '@/Components/AiChat/Types/Chat';

export const STORAGE_VERSION = 1;
export const STORAGE_KEY = 'aiChat.messages';
export const API_KEY_STORAGE_KEY = 'aiChat.apiKey';
export const WIDTH_KEY = 'aiChat.panelWidth';
export const SESSION_KEY = 'aiChat.sessionId';

export const HISTORY_LIMIT = 40;
export const SAVE_DEBOUNCE_MS = 350;

export const RATE_LIMIT: RateLimit = {
  maxRequests: 20,
  windowMs: 60_000,
};

// Endpoint configuration is passed explicitly to the browser worker.
export const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api/chat';
export const HEALTH_URL = process.env.NEXT_PUBLIC_HEALTH_URL || API_URL.replace(/\/(?:api\/)?chat\/?$/, '/health');

export const MIN_WIDTH = 480;
export const DEFAULT_PANEL_WIDTH = 650;
export const MAX_WIDTH = 1000;
