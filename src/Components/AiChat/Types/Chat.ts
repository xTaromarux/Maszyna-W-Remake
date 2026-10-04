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

export interface ChatState {
  messages: ChatMessage[];
  text: string;
  apiKey: string;
  apiKeyDraft: string;
  apiKeyError: string;
  showApiKeyModal: boolean;
  showApiKeyValue: boolean;

  apiState: ApiState;
  currentAiMessageId: string | null;
  rateLimitMessage: string;
  generalError: string;
  showSuggestions: boolean;
  ready: boolean;
}

export type ChatStateUpdate = Partial<ChatState> | ((state: ChatState) => Partial<ChatState>);

export interface ChatRuntime {
  worker: Worker | null;
  animation: { messageId: string; timer: ReturnType<typeof setInterval> } | null;
  sessionId: string;
  requests: number[];
  healthController: AbortController | null;
  requestToken: number;
  alive: boolean;
}
