import { useI18n } from '@/I18n/Index';
import type { ChatState, StreamChunk } from '@/Types/Chat';
import { useRef } from 'react';
import type { ChatSessionStore } from './UseChatState';

const ANIMATION_CHUNK_SIZE = 50;
const ANIMATION_INTERVAL_MS = 30;

/** Creates the worker and handles reply text, animations, completion, and worker failures. */
export const useChatReplies = ({ latest, runtime, patch, stopAnimation }: ChatSessionStore) => {
  const { t } = useI18n();

  const callbacks = useRef({ t });
  callbacks.current = { t };

  const updateMessage = (id: string, text: string) =>
    patch((previous) => ({
      messages: previous.messages.map((message) => (message.id === id ? { ...message, text } : message)),
    }));

  const finalizeMessage = (id: string, cancelled = false) => {
    stopAnimation(id);

    const update: Partial<ChatState> = {};

    if (latest.current.currentAiMessageId === id) {
      update.currentAiMessageId = null;
    }

    if (cancelled) {
      update.messages = latest.current.messages.filter((message) => message.id !== id);
    }

    patch(update);
  };

  // Completed, long replies are revealed in chunks; streaming replies render immediately.
  const animateReply = (messageId: string, text: string) => {
    stopAnimation();
    let visibleCharacters = ANIMATION_CHUNK_SIZE;
    updateMessage(messageId, text.slice(0, visibleCharacters));

    const revealNextChunk = () => {
      visibleCharacters += ANIMATION_CHUNK_SIZE;
      updateMessage(messageId, text.slice(0, visibleCharacters));

      if (visibleCharacters >= text.length) {
        finalizeMessage(messageId);
      }
    };

    const timer = setInterval(revealNextChunk, ANIMATION_INTERVAL_MS);
    runtime.current.animation = { messageId, timer };
  };

  const receiveWorkerMessage = (event: MessageEvent<StreamChunk>) => {
    if (!runtime.current.alive) {
      return;
    }

    const { messageId, text, done, error, errorKey, errorDetail, cancelled, streaming } = event.data || {};
    const belongsToConversation = latest.current.messages.some((message) => message.id === messageId);

    if (!messageId || !belongsToConversation) {
      return;
    }

    if (error || errorKey) {
      stopAnimation(messageId);

      const errorText = errorKey ? callbacks.current.t(errorKey, { message: errorDetail || '' }).trim() : error || '';
      updateMessage(messageId, errorText);

      if (done) {
        finalizeMessage(messageId);
      }

      return;
    }

    if (cancelled) {
      finalizeMessage(messageId, true);
      return;
    }

    if (typeof text === 'string') {
      stopAnimation(messageId);

      const shouldRenderImmediately = streaming || !done || text.length <= ANIMATION_CHUNK_SIZE;

      if (shouldRenderImmediately) {
        updateMessage(messageId, text);

        if (done) {
          finalizeMessage(messageId);
        }
      } else {
        animateReply(messageId, text);
      }
    } else if (done) {
      finalizeMessage(messageId);
    }
  };

  const ensureWorker = () => {
    if (!runtime.current.worker) {
      const worker = new Worker(new URL('../../../../Workers/Chat/ChatWorker.ts', import.meta.url), { type: 'module' });

      worker.addEventListener('message', receiveWorkerMessage);
      worker.addEventListener('error', (event) => {
        worker.terminate();

        if (runtime.current.worker === worker) {
          runtime.current.worker = null;
        }

        const id = latest.current.currentAiMessageId;

        if (id) {
          updateMessage(id, callbacks.current.t('aiChat.fetchFailed', { message: event.message || '' }));
          finalizeMessage(id);
        }
      });

      runtime.current.worker = worker;
    }

    return runtime.current.worker;
  };

  return {
    ensureWorker,
    finalizeMessage,
  };
};

export type ChatReplies = ReturnType<typeof useChatReplies>;
