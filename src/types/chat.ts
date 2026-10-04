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

export interface ChatState {
  messages: ChatMessage[];
  text: string;
  apiKey: string;
  apiKeyDraft: string;
  apiKeyError: string;
  showApiKeyModal: boolean;
  showApiKeyValue: boolean;
  aiTyping: boolean;
  isCancelling: boolean;
  apiState: ApiState;
  currentAiMessageId: string | null;
  panelWidth: number;
  rateLimitMessage: string;
  generalError: string;
  showSuggestions: boolean;
  ready: boolean;
}
export type ChatStateUpdate = Partial<ChatState> | ((state: ChatState) => Partial<ChatState>);
export interface ChatRuntime {
  worker: Worker | null;
  timers: Map<string, ReturnType<typeof setInterval>>;
  sessionId: string;
  requests: number[];
  healthController: AbortController | null;
  requestToken: number;
  alive: boolean;
  resize: { move: (event: PointerEvent) => void; stop: () => void; previousCursor: string } | null;
}
