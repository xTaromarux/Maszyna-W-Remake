export enum ApiState {
  IDLE = 'idle',
  CHECKING = 'checking',
  WAKING = 'waking',
  ERROR = 'error',
}

export type Sender = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  sender: Sender;
  text: string;
  timestamp: number;
}

export interface StreamChunk {
  messageId: string;
  text?: string;
  chunk?: string;
  done?: boolean;
  error?: string;
  errorKey?: string;
  errorDetail?: string;
  cancelled?: boolean;
  streaming?: boolean;
}

export interface HealthResponse {
  upstream_ok?: boolean;
  status?: string;
  [key: string]: unknown;
}

export interface RateLimit {
  maxRequests: number;
  windowMs: number;
  message?: string;
}

export const STORAGE_VERSION = 1;
export const STORAGE_KEY = 'aiChat.messages';
export const STORAGE_VERSION_KEY = 'aiChat.version';
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
