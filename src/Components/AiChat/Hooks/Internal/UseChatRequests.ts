import { useI18n } from '@/I18n/Index';
import { getErrorMessage } from '@/Shared/Utils/Errors';
import { ApiState } from '@/Types/Chat';
import type { ChatWorkerRequest } from '@/Types/ChatWorker';
import type { FormEvent } from 'react';
import { useEffect } from 'react';
import { API_URL, HEALTH_URL } from '../../ChatConfig';
import { checkChatHealth } from '../../Helpers/ChatHealth';
import { persistMessages } from '../../Helpers/ChatStorage';
import { buildRequestHistory, createChatMessage, isCheckingModel, reserveRequestSlot } from '../../Helpers/ChatRequests';
import type { ChatSessionStore } from './UseChatState';
import type { ChatReplies } from './UseChatReplies';

const HEALTH_TIMEOUT_MS = 35000;
const RATE_LIMIT_NOTICE_DURATION_MS = 4000;
const API_ERROR_DURATION_MS = 1500;

/** Validates and sends requests, checks model readiness, and handles cancellation and reset. */
export const useChatRequests = (
  { state, latest, runtime, patch, stopAnimation }: ChatSessionStore,
  { ensureWorker, finalizeMessage }: ChatReplies,
  openApiKeyModal: () => void
) => {
  const { t } = useI18n();

  useEffect(() => {
    if (!state.rateLimitMessage) {
      return;
    }

    const timer = setTimeout(() => patch({ rateLimitMessage: '' }), RATE_LIMIT_NOTICE_DURATION_MS);

    return () => clearTimeout(timer);
  }, [state.rateLimitMessage, patch]);

  useEffect(() => {
    if (state.apiState !== ApiState.ERROR) {
      return;
    }

    const timer = setTimeout(() => patch({ apiState: ApiState.IDLE }), API_ERROR_DURATION_MS);

    return () => clearTimeout(timer);
  }, [state.apiState, patch]);

  const cancelResponse = () => {
    const id = latest.current.currentAiMessageId;

    if (!id) {
      return;
    }

    runtime.current.worker?.postMessage({ type: 'cancel', messageId: id } satisfies ChatWorkerRequest);
    finalizeMessage(id, true);
  };

  const resetConversation = () => {
    runtime.current.requestToken += 1;
    runtime.current.healthController?.abort();

    const pendingMessageId = latest.current.currentAiMessageId;

    if (pendingMessageId) {
      runtime.current.worker?.postMessage({ type: 'cancel', messageId: pendingMessageId } satisfies ChatWorkerRequest);
    }

    stopAnimation();

    patch({
      messages: [],
      currentAiMessageId: null,

      generalError: '',
      rateLimitMessage: '',
      showSuggestions: true,
      apiState: ApiState.IDLE,
    });

    persistMessages([]);
  };

  const isActiveRequest = (token: number): boolean => runtime.current.alive && runtime.current.requestToken === token;

  const ensureModelAwake = async (token: number) => {
    if (!HEALTH_URL) {
      return;
    }

    const controller = new AbortController();
    runtime.current.healthController = controller;

    const timeout = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);

    patch({ apiState: ApiState.CHECKING });

    try {
      await checkChatHealth(HEALTH_URL, controller.signal, () => {
        if (isActiveRequest(token)) {
          patch({ apiState: ApiState.WAKING });
        }
      });

      if (isActiveRequest(token)) {
        patch({ apiState: ApiState.IDLE });
      }
    } finally {
      clearTimeout(timeout);

      if (runtime.current.healthController === controller) {
        runtime.current.healthController = null;
      }
    }
  };

  const handleRequestFailure = (error: unknown) => {
    const pendingMessageId = latest.current.currentAiMessageId;

    if (pendingMessageId) {
      finalizeMessage(pendingMessageId, true);
    }

    runtime.current.worker?.terminate();
    runtime.current.worker = null;

    patch({
      apiState: ApiState.ERROR,
      generalError: t('aiChat.connectFailed', { message: getErrorMessage(error) }).trim(),

      currentAiMessageId: null,
    });
  };

  const sendUserMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const current = latest.current;
    const query = current.text.trim();
    const cannotSend = !query || current.currentAiMessageId !== null || isCheckingModel(current.apiState);

    if (cannotSend) {
      return;
    }

    if (!current.apiKey.trim()) {
      openApiKeyModal();
      patch({ apiKeyError: t('aiChat.apiKey.missingError') });
      return;
    }

    const now = Date.now();
    const requestSlot = reserveRequestSlot(runtime.current.requests, now);
    runtime.current.requests = requestSlot.timestamps;

    if (!requestSlot.allowed) {
      patch({ rateLimitMessage: t('aiChat.rateLimitExceeded') });
      return;
    }

    const requestToken = ++runtime.current.requestToken;
    const history = buildRequestHistory(current.messages);
    const userMessage = createChatMessage('user', query, now);

    patch({
      generalError: '',
      messages: [...current.messages, userMessage],
      text: '',
      apiState: ApiState.CHECKING,
    });

    try {
      await ensureModelAwake(requestToken);

      if (!isActiveRequest(requestToken)) {
        return;
      }

      // Create the worker before inserting a pending reply, so construction failure leaves no empty bubble.
      const worker = ensureWorker();
      const assistantMessage = createChatMessage('assistant', '');

      patch((previous) => ({
        apiState: ApiState.IDLE,

        currentAiMessageId: assistantMessage.id,
        messages: [...previous.messages, assistantMessage],
      }));

      worker.postMessage({
        type: 'start',
        messageId: assistantMessage.id,
        query,
        apiKey: current.apiKey.trim(),
        history,
        sessionId: runtime.current.sessionId,
        apiUrl: API_URL,
        healthUrl: HEALTH_URL,
      } satisfies ChatWorkerRequest);
    } catch (error) {
      if (!isActiveRequest(requestToken)) {
        return;
      }

      handleRequestFailure(error);
    }
  };

  return {
    cancelResponse,
    resetConversation,
    sendUserMessage,
  };
};
