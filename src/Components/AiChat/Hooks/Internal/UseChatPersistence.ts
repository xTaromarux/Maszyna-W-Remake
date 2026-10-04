import { useEffect } from 'react';
import { SAVE_DEBOUNCE_MS } from '../../ChatConfig';
import { persistMessages, restoreApiKey, restoreMessages, restoreSessionId } from '../../Helpers/ChatStorage';
import type { ChatSessionStore } from './UseChatState';

/** Restores saved keys, history and session ID, and persists history changes and the final snapshot. */
export const useChatPersistence = ({ state, latest, runtime, patch }: ChatSessionStore) => {
  useEffect(() => {
    const apiKey = restoreApiKey();
    runtime.current.sessionId = restoreSessionId();
    patch({ ready: true, apiKey, apiKeyDraft: apiKey, messages: restoreMessages() });
    return () => {
      persistMessages(latest.current.messages);
    };
  }, [latest, runtime, patch]);
  useEffect(() => {
    if (!state.ready) {
      return;
    }
    const timer = setTimeout(() => persistMessages(state.messages), SAVE_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [state.messages, state.ready]);
};
