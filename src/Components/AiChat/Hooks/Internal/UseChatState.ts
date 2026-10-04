import type { ChatRuntime, ChatState, ChatStateUpdate } from '@/Types/Chat';
import { ApiState } from '@/Types/Chat';
import { useCallback, useEffect, useRef, useState } from 'react';

/** Owns session state, its synchronous snapshot, and the lifetime of worker, requests and animation. */
export const useChatState = () => {
  const [state, setState] = useState<ChatState>({
    messages: [],
    text: '',
    apiKey: '',
    apiKeyDraft: '',
    apiKeyError: '',
    showApiKeyModal: false,
    showApiKeyValue: false,

    apiState: ApiState.IDLE,
    currentAiMessageId: null,
    rateLimitMessage: '',
    generalError: '',
    showSuggestions: true,
    ready: false,
  });
  const latest = useRef(state);
  const runtime = useRef<ChatRuntime>({
    worker: null,
    animation: null,
    sessionId: '',
    requests: [],
    healthController: null,
    requestToken: 0,
    alive: false,
  });
  const patch = useCallback((update: ChatStateUpdate) => {
    const values = typeof update === 'function' ? update(latest.current) : update;
    latest.current = { ...latest.current, ...values };
    if (runtime.current.alive) {
      setState(latest.current);
    }
  }, []);

  const stopAnimation = useCallback((messageId?: string) => {
    const animation = runtime.current.animation;
    if (!animation || (messageId !== undefined && animation.messageId !== messageId)) {
      return;
    }

    clearInterval(animation.timer);
    runtime.current.animation = null;
  }, []);

  useEffect(() => {
    runtime.current.alive = true;

    return () => {
      runtime.current.alive = false;
      runtime.current.requestToken += 1;
      runtime.current.healthController?.abort();
      runtime.current.healthController = null;
      stopAnimation();
      runtime.current.worker?.terminate();
      runtime.current.worker = null;
    };
  }, [stopAnimation]);

  return { state, latest, runtime, patch, stopAnimation };
};
export type ChatSessionStore = ReturnType<typeof useChatState>;
