import type { ChatWorkerRequest, StartChatRequest, StreamChunk } from '../Types/WorkerProtocol';

import { requestChatWithRetry } from './ChatTransport';

declare const self: DedicatedWorkerGlobalScope;

const CHAT_REQUEST_TIMEOUT_MS = 120000;

interface RequestState {
  controller: AbortController;
  cancelled: boolean;
  timedOut: boolean;
}

const inFlight = new Map<string, RequestState>();

const publish = (messageId: string, payload: Omit<StreamChunk, 'messageId'>) => self.postMessage({ messageId, ...payload });

/** Runs one request and publishes only while it still owns its message ID. */
const handleStartMessage = async (request: StartChatRequest): Promise<void> => {
  const { messageId, query, history, apiKey } = request;

  if (typeof messageId !== 'string' || !messageId) {
    return;
  }

  if (typeof query !== 'string' || !Array.isArray(history)) {
    publish(messageId, { error: 'Invalid payload (query/history).', done: true });
    return;
  }

  if (typeof apiKey !== 'string' || !apiKey.trim()) {
    publish(messageId, { errorKey: 'aiChat.apiKey.missingError', done: true });
    return;
  }

  const previousRequest = inFlight.get(messageId);
  previousRequest?.controller.abort();

  const state: RequestState = {
    controller: new AbortController(),
    cancelled: false,
    timedOut: false,
  };

  inFlight.set(messageId, state);

  const publishCurrent = (payload: Omit<StreamChunk, 'messageId'>) => {
    if (inFlight.get(messageId) === state) {
      publish(messageId, payload);
    }
  };

  const timeout = setTimeout(() => {
    state.timedOut = true;
    state.controller.abort();
  }, CHAT_REQUEST_TIMEOUT_MS);

  try {
    const result = await requestChatWithRetry(request, state.controller.signal, (text) => {
      if (!state.controller.signal.aborted) {
        publishCurrent({ text, streaming: true });
      }
    });

    state.controller.signal.throwIfAborted();
    publishCurrent({ ...result, done: true });
  } catch (error) {
    if (state.cancelled) {
      publishCurrent({ cancelled: true, done: true });
      return;
    }

    let errorDetail = '';
    if (state.timedOut) {
      errorDetail = 'Request timed out';
    } else if (error instanceof Error) {
      errorDetail = error.message;
    }

    publishCurrent({ errorKey: 'aiChat.fetchFailed', errorDetail, done: true });
  } finally {
    clearTimeout(timeout);

    if (inFlight.get(messageId) === state) {
      inFlight.delete(messageId);
    }
  }
};

/** Receives start/cancel commands; transport and response parsing live in adjacent modules. */
self.addEventListener('message', (event: MessageEvent<ChatWorkerRequest>) => {
  const request = event.data;
  if (!request) {
    return;
  }

  if (request.type === 'cancel') {
    const state = inFlight.get(request.messageId);
    if (state) {
      state.cancelled = true;
      state.controller.abort();
    }
    return;
  }

  if (request.type === 'start') {
    void handleStartMessage(request);
  }
});
