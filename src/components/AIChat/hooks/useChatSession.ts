import { isCheckingModel } from '../helpers/chatRequests';
import { useChatApiKey } from './internal/useChatApiKey';
import { useChatPersistence } from './internal/useChatPersistence';
import { useChatReplies } from './internal/useChatReplies';
import { useChatRequests } from './internal/useChatRequests';
import { useChatState } from './internal/useChatState';

/**
 * Composes session state, saved history, API-key settings, worker replies and request actions.
 * Exposes a single interface to the chat UI and disables input while busy or awaiting an API key.
 */
export const useChatSession = (visible: boolean) => {
  const store = useChatState();
  useChatPersistence(store);
  const apiKey = useChatApiKey(visible, store);
  const replies = useChatReplies(store);
  const requests = useChatRequests(store, replies, apiKey.openApiKeyModal);

  const { state, patch } = store;
  const isBusy = state.currentAiMessageId !== null || isCheckingModel(state.apiState);
  const inputDisabled = isBusy || apiKey.showApiKeyGate;

  return { state, patch, ...apiKey, ...requests, inputDisabled };
};
export type ChatSession = ReturnType<typeof useChatSession>;
