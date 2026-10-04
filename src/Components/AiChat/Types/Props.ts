import type { FormEventHandler, RefObject } from 'react';
import type { Action, Update } from '@/Shared/Types/Common';
import type { ChatMessage } from './Chat';

export interface TextContentProps {
  text: string;
}

export interface CodeBlockProps {
  code: string;
  language: string;
}

export interface AiChatProps {
  visible?: boolean;
  title?: string;
  placeholder?: string;
  instruction?: string;
  onClose?: Action;
}

export interface ChatComposerProps {
  text: string;
  errorMessage: string;
  inputDisabled: boolean;
  updateText: Update<string>;
  sendUserMessage: FormEventHandler<HTMLFormElement>;
  inputRef: RefObject<HTMLInputElement | null>;
  instruction: string;
  placeholder: string;
  inert: boolean;
}

export interface ApiKeyDialogProps {
  apiKeyDraft: string;
  apiKeyError: string;
  showApiKeyValue: boolean;
  hasApiKey: boolean;
  updateApiKeyDraft: Update<string>;
  toggleKeyVisibility: Action;
  closeApiKeyModal: Action;
  saveApiKey: FormEventHandler<HTMLFormElement>;
  clearApiKey: Action;
  inputRef: RefObject<HTMLInputElement | null>;
}

export interface ChatConversationProps {
  messages: ChatMessage[];
  currentAiMessageId: string | null;
  cancelResponse: Action;
}
