export interface StartChatRequest {
  type: 'start';
  messageId: string;
  query: string;
  history: { role: 'user' | 'assistant'; message: string }[];
  apiKey: string;
  sessionId?: string;
  apiUrl?: string;
  healthUrl?: string;
}

export interface CancelChatRequest {
  type: 'cancel';
  messageId: string;
}

export type ChatWorkerRequest = StartChatRequest | CancelChatRequest;
