'use client';

import { useI18n } from '@/i18n';
import {
  API_KEY_STORAGE_KEY,
  API_URL,
  HEALTH_URL,
  HISTORY_LIMIT,
  RATE_LIMIT,
  SAVE_DEBOUNCE_MS,
  SESSION_KEY,
  STORAGE_KEY,
  STORAGE_VERSION,
  STORAGE_VERSION_KEY,
  WIDTH_KEY,
} from '@/models/AiChat';
import { sleep } from '@/shared/utils/async';
import { getErrorMessage } from '@/shared/utils/errors';
import { generateId } from '@/shared/utils/identifiers';
import { clamp } from '@/shared/utils/numbers';
import { getStorageItem, setStorageItem } from '@/shared/utils/storage';
import type { ChatMessage, ChatRuntime, ChatState, ChatStateUpdate, StreamChunk } from '@/types/chat';
import { ApiState } from '@/types/chat';
import type { AiChatProps, CodeBlockProps, TextContentProps } from '@/types/components';
import type { FormEvent, PointerEvent as ReactPointerEvent } from 'react';
import { Fragment, useEffect, useRef, useState } from 'react';
import AiChatTrashIcon from './AiChatTrashIcon';

const MIN_WIDTH = 480;
const MAX_WIDTH = 1000;

function persistMessages(messages: ChatMessage[]) {
  setStorageItem(STORAGE_VERSION_KEY, String(STORAGE_VERSION));
  setStorageItem(
    STORAGE_KEY,
    messages.length ? JSON.stringify({ version: STORAGE_VERSION, messages: messages.slice(-HISTORY_LIMIT) }) : null
  );
}

function InlineMessage({ text }: TextContentProps) {
  return text.split(/(`[^`\n]+`)/g).map((part, index) =>
    part.startsWith('`') && part.endsWith('`') ? (
      <code key={index} className="inline-code">
        {part.slice(1, -1)}
      </code>
    ) : (
      <Fragment key={index}>
        {part.split(/\r?\n/).map((line, lineIndex) => (
          <Fragment key={lineIndex}>
            {lineIndex > 0 && <br />}
            {line}
          </Fragment>
        ))}
      </Fragment>
    )
  );
}

function CodeBlock({ code, language }: CodeBlockProps) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1200);
    return () => clearTimeout(timer);
  }, [copied]);
  const copy = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      const input = document.createElement('textarea');
      input.value = code;
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.appendChild(input);
      input.select();
      try {
        if (document.execCommand('copy')) setCopied(true);
      } finally {
        input.remove();
      }
    }
  };
  return (
    <div className="code-group">
      <div className="code-toolbar-outside">
        <span className={`code-lang${language ? '' : ' no-lang'}`}>{language || t('aiChat.codeLabel')}</span>
        <button
          type="button"
          className={`copy-btn${copied ? ' copied' : ''}`}
          disabled={copied}
          aria-label={t('aiChat.copyCodeAria')}
          onClick={copy}
        >
          {t(copied ? 'aiChat.copyCodeDone' : 'aiChat.copyCode')}
        </button>
      </div>
      <pre className="code-block">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function MessageContent({ text }: TextContentProps) {
  const parts = [];
  const pattern = /```([^\n`]*)?\r?\n([\s\S]*?)```/g;
  let match,
    offset = 0;
  while ((match = pattern.exec(text))) {
    if (match.index > offset) parts.push(<InlineMessage key={`text-${offset}`} text={text.slice(offset, match.index)} />);
    parts.push(<CodeBlock key={`code-${match.index}`} language={(match[1] || '').trim()} code={match[2]} />);
    offset = pattern.lastIndex;
  }
  if (offset < text.length) parts.push(<InlineMessage key={`text-${offset}`} text={text.slice(offset)} />);
  return <div className="messageHtml">{parts}</div>;
}

export default function AiChat({ visible = false, title = '', placeholder = '', instruction = '', onClose }: AiChatProps) {
  const { t, locale } = useI18n();
  const [state, setState] = useState<ChatState>({
    messages: [],
    text: '',
    apiKey: '',
    apiKeyDraft: '',
    apiKeyError: '',
    showApiKeyModal: false,
    showApiKeyValue: false,
    aiTyping: false,
    isCancelling: false,
    apiState: ApiState.IDLE,
    currentAiMessageId: null,
    panelWidth: 650,
    rateLimitMessage: '',
    generalError: '',
    showSuggestions: true,
    ready: false,
  });
  const latest = useRef(state);
  const callbacks = useRef({ t, onClose });
  callbacks.current = { t, onClose };
  const runtime = useRef<ChatRuntime>({
    worker: null,
    timers: new Map(),
    sessionId: '',
    requests: [],
    healthController: null,
    requestToken: 0,
    resize: null,
    alive: false,
  });
  const conversation = useRef<HTMLDivElement | null>(null),
    textInput = useRef<HTMLInputElement | null>(null),
    apiKeyInput = useRef<HTMLInputElement | null>(null);
  const patch = (update: ChatStateUpdate) => {
    const values = typeof update === 'function' ? update(latest.current) : update;
    latest.current = { ...latest.current, ...values };
    if (runtime.current.alive) setState(latest.current);
  };
  const hasApiKey = !!state.apiKey.trim();
  const showApiKeyGate = !hasApiKey || state.showApiKeyModal;
  const isBusy = state.aiTyping || state.isCancelling || state.apiState === ApiState.CHECKING || state.apiState === ApiState.WAKING;
  const inputDisabled = isBusy || showApiKeyGate;
  const focusPrimary = () =>
    requestAnimationFrame(() => {
      if (!runtime.current.alive) return;
      const locked = !latest.current.apiKey.trim() || latest.current.showApiKeyModal;
      (locked ? apiKeyInput : textInput).current?.focus();
    });
  const updateMessage = (id: string, text: string) =>
    patch((previous) => ({ messages: previous.messages.map((message) => (message.id === id ? { ...message, text } : message)) }));
  const clearAnimation = (id: string) => {
    clearInterval(runtime.current.timers.get(id));
    runtime.current.timers.delete(id);
  };
  const finalizeMessage = (id: string, cancelled = false) => {
    clearAnimation(id);
    patch((previous) => ({
      ...(previous.currentAiMessageId === id ? { aiTyping: false, isCancelling: false, currentAiMessageId: null } : {}),
      ...(cancelled ? { messages: previous.messages.filter((message) => message.id !== id) } : {}),
    }));
  };
  const receiveWorkerMessage = (event: MessageEvent<StreamChunk>) => {
    if (!runtime.current.alive) return;
    const { messageId, text, done, error, errorKey, errorDetail, cancelled, streaming } = event.data || {};
    if (!messageId || !latest.current.messages.some((message) => message.id === messageId)) return;
    if (error || errorKey) {
      clearAnimation(messageId);
      updateMessage(messageId, errorKey ? callbacks.current.t(errorKey, { message: errorDetail || '' }).trim() : error || '');
      if (done) finalizeMessage(messageId);
      return;
    }
    if (cancelled) {
      finalizeMessage(messageId, true);
      return;
    }
    if (typeof text === 'string') {
      clearAnimation(messageId);
      if (streaming || !done || text.length <= 50) {
        updateMessage(messageId, text);
        if (done) finalizeMessage(messageId);
      } else {
        let position = 50;
        updateMessage(messageId, text.slice(0, position));
        const timer = setInterval(() => {
          position += 50;
          updateMessage(messageId, text.slice(0, position));
          if (position >= text.length) finalizeMessage(messageId);
        }, 30);
        runtime.current.timers.set(messageId, timer);
      }
    } else if (done) finalizeMessage(messageId);
  };
  const ensureWorker = () => {
    if (!runtime.current.worker) {
      const worker = new Worker(new URL('../workers/chat.worker.js', import.meta.url), { type: 'module' });
      worker.addEventListener('message', receiveWorkerMessage);
      worker.addEventListener('error', (event) => {
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

  useEffect(() => {
    runtime.current.alive = true;
    const restored: Partial<ChatState> = { ready: true };
    try {
      restored.apiKey = (getStorageItem(API_KEY_STORAGE_KEY) || '').trim();
      restored.apiKeyDraft = restored.apiKey;
      const width = getStorageItem(WIDTH_KEY);
      if (width && Number.isFinite(Number(width))) restored.panelWidth = clamp(Number(width), MIN_WIDTH, MAX_WIDTH);
      const raw = getStorageItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const messages = Array.isArray(parsed) ? parsed : parsed?.messages;
        if (Array.isArray(messages))
          restored.messages = messages
            .filter((message) => message && typeof message === 'object')
            .slice(-HISTORY_LIMIT)
            .map((message, index) => ({
              id: typeof message.id === 'string' ? message.id : generateId(`legacy-${index}`),
              sender: message.sender === 'assistant' ? 'assistant' : 'user',
              text: typeof message.text === 'string' ? message.text : '',
              timestamp: typeof message.timestamp === 'number' ? message.timestamp : Date.now(),
            }));
      }
    } catch {}
    runtime.current.sessionId = getStorageItem(SESSION_KEY) || generateId('session');
    setStorageItem(SESSION_KEY, runtime.current.sessionId);
    patch(restored);
    return () => {
      runtime.current.alive = false;
      runtime.current.requestToken += 1;
      runtime.current.healthController?.abort();
      runtime.current.timers.forEach(clearInterval);
      runtime.current.timers.clear();
      runtime.current.worker?.terminate();
      runtime.current.worker = null;
      if (runtime.current.resize) {
        window.removeEventListener('pointermove', runtime.current.resize.move);
        window.removeEventListener('pointerup', runtime.current.resize.stop);
        window.removeEventListener('pointercancel', runtime.current.resize.stop);
        document.body.style.cursor = runtime.current.resize.previousCursor;
        runtime.current.resize = null;
      }
      persistMessages(latest.current.messages);
    };
  }, []);
  useEffect(() => {
    if (!state.ready) return;
    const timer = setTimeout(() => persistMessages(state.messages), SAVE_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [state.messages, state.ready]);
  useEffect(() => {
    if (!state.ready) return;
    const timer = setTimeout(() => setStorageItem(WIDTH_KEY, String(state.panelWidth)), 120);
    return () => clearTimeout(timer);
  }, [state.panelWidth, state.ready]);
  useEffect(() => {
    if (!state.rateLimitMessage) return;
    const timer = setTimeout(() => patch({ rateLimitMessage: '' }), 4000);
    return () => clearTimeout(timer);
  }, [state.rateLimitMessage]);
  useEffect(() => {
    if (visible) focusPrimary();
    else
      patch({ isCancelling: false, showApiKeyModal: false, showApiKeyValue: false, apiKeyError: '', apiKeyDraft: latest.current.apiKey });
  }, [visible, showApiKeyGate]);
  useEffect(() => {
    if (!visible) return;
    const frame = requestAnimationFrame(() => {
      const element = conversation.current;
      if (element) element.scrollTop = element.scrollHeight;
    });
    return () => cancelAnimationFrame(frame);
  }, [state.messages, visible]);
  useEffect(() => {
    if (state.apiState !== ApiState.ERROR) return;
    const timer = setTimeout(() => patch({ apiState: ApiState.IDLE }), 1500);
    return () => clearTimeout(timer);
  }, [state.apiState]);

  const openApiKeyModal = () => {
    patch({ showApiKeyModal: true, apiKeyDraft: latest.current.apiKey, apiKeyError: '', showApiKeyValue: false });
    focusPrimary();
  };
  const closeApiKeyModal = () => {
    if (!latest.current.apiKey.trim()) return;
    patch({ showApiKeyModal: false, apiKeyDraft: latest.current.apiKey, apiKeyError: '', showApiKeyValue: false });
    focusPrimary();
  };
  const saveApiKey = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const key = latest.current.apiKeyDraft.trim();
    if (!key) {
      patch({ apiKeyError: t('aiChat.apiKey.missingError') });
      focusPrimary();
      return;
    }
    patch({ apiKey: key, apiKeyDraft: key, apiKeyError: '', generalError: '', showApiKeyModal: false, showApiKeyValue: false });
    setStorageItem(API_KEY_STORAGE_KEY, key);
    focusPrimary();
  };
  const clearApiKey = () => {
    patch({ apiKey: '', apiKeyDraft: '', apiKeyError: '', generalError: '', showApiKeyModal: false, showApiKeyValue: false });
    setStorageItem(API_KEY_STORAGE_KEY, null);
    focusPrimary();
  };
  const cancelResponse = () => {
    const id = latest.current.currentAiMessageId;
    if (!id) return;
    runtime.current.worker?.postMessage({ type: 'cancel', messageId: id });
    finalizeMessage(id, true);
  };
  const resetConversation = () => {
    runtime.current.requestToken += 1;
    runtime.current.healthController?.abort();
    if (latest.current.currentAiMessageId)
      runtime.current.worker?.postMessage({ type: 'cancel', messageId: latest.current.currentAiMessageId });
    runtime.current.timers.forEach(clearInterval);
    runtime.current.timers.clear();
    patch({
      messages: [],
      currentAiMessageId: null,
      aiTyping: false,
      isCancelling: false,
      generalError: '',
      rateLimitMessage: '',
      showSuggestions: true,
      apiState: ApiState.IDLE,
    });
    persistMessages([]);
  };
  const ensureModelAwake = async (token: number) => {
    if (!HEALTH_URL) return;
    const controller = new AbortController();
    runtime.current.healthController = controller;
    const timeout = setTimeout(() => controller.abort(), 35000);
    patch({ apiState: ApiState.CHECKING });
    try {
      const response = await fetch(`${HEALTH_URL}${HEALTH_URL.includes('?') ? '&' : '?'}check=1`, { signal: controller.signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const body = await response.json().catch(() => ({}));
      if (runtime.current.requestToken !== token) return;
      if (body.upstream_ok === false) {
        patch({ apiState: ApiState.WAKING });
        await fetch(`${HEALTH_URL}${HEALTH_URL.includes('?') ? '&' : '?'}wake=1`, { signal: controller.signal });
        await sleep(1200);
      }
      if (runtime.current.requestToken === token) patch({ apiState: ApiState.IDLE });
    } finally {
      clearTimeout(timeout);
      if (runtime.current.healthController === controller) runtime.current.healthController = null;
    }
  };
  const sendUserMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const current = latest.current;
    const query = current.text.trim();
    if (!query || current.aiTyping || current.isCancelling || [ApiState.CHECKING, ApiState.WAKING].includes(current.apiState)) return;
    if (!current.apiKey.trim()) {
      openApiKeyModal();
      patch({ apiKeyError: t('aiChat.apiKey.missingError') });
      return;
    }
    const now = Date.now();
    runtime.current.requests = runtime.current.requests.filter((timestamp) => now - timestamp < RATE_LIMIT.windowMs);
    if (runtime.current.requests.length >= RATE_LIMIT.maxRequests) {
      patch({ rateLimitMessage: t('aiChat.rateLimitExceeded') });
      return;
    }
    runtime.current.requests.push(now);
    const requestToken = ++runtime.current.requestToken;
    // The query is sent separately; history contains the preceding turns once each.
    const history = current.messages
      .filter((message) => message.text.trim())
      .slice(-HISTORY_LIMIT)
      .map((message) => ({ role: message.sender, message: message.text }));
    patch({
      generalError: '',
      messages: [...current.messages, { id: generateId('user'), sender: 'user', text: query, timestamp: now }],
      text: '',
      apiState: ApiState.CHECKING,
    });
    try {
      await ensureModelAwake(requestToken);
      if (runtime.current.requestToken !== requestToken || !runtime.current.alive) return;
      const id = generateId('assistant');
      patch((previous) => ({
        apiState: ApiState.IDLE,
        aiTyping: true,
        isCancelling: false,
        currentAiMessageId: id,
        messages: [...previous.messages, { id, sender: 'assistant', text: '', timestamp: Date.now() }],
      }));
      ensureWorker().postMessage({
        type: 'start',
        messageId: id,
        query,
        apiKey: current.apiKey.trim(),
        history,
        sessionId: runtime.current.sessionId,
        apiUrl: API_URL,
        healthUrl: HEALTH_URL,
      });
    } catch (error) {
      if (runtime.current.requestToken !== requestToken || !runtime.current.alive) return;
      patch({
        apiState: ApiState.ERROR,
        generalError: t('aiChat.connectFailed', { message: getErrorMessage(error) }).trim(),
        aiTyping: false,
        isCancelling: false,
        currentAiMessageId: null,
      });
    }
  };
  const startResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (runtime.current.resize) return;
    event.preventDefault();
    const startX = event.clientX,
      startWidth = latest.current.panelWidth;
    const previousCursor = document.body.style.cursor;
    const move = (event: PointerEvent) => patch({ panelWidth: clamp(startWidth + startX - event.clientX, MIN_WIDTH, MAX_WIDTH) });
    const stop = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
      document.body.style.cursor = previousCursor;
      runtime.current.resize = null;
      setStorageItem(WIDTH_KEY, String(latest.current.panelWidth));
    };
    runtime.current.resize = { move, stop, previousCursor };
    document.body.style.cursor = 'ew-resize';
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
  };
  if (!visible) return null;
  return (
    <div
      className="chatOverlay"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div
        id="aiChat"
        className="chatPanel show"
        role="dialog"
        aria-modal="true"
        aria-label={title || t('aiChat.title')}
        style={{ width: state.panelWidth }}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.stopPropagation();
            if (state.showApiKeyModal && hasApiKey) closeApiKeyModal();
            else onClose?.();
          }
        }}
      >
        <div className="resizer" onPointerDown={startResize} />
        <header className="chatHeader">
          <div className="chatHeaderTitle">
            <h1>{title || t('aiChat.title')}</h1>
            <span className={`apiKeyChip${hasApiKey ? ' apiKeyChipReady' : ''}`}>
              {t(hasApiKey ? 'aiChat.apiKey.savedBadge' : 'aiChat.apiKey.requiredBadge')}
            </span>
          </div>
          <div className="headerBtns">
            <button className="apiKeyBtn" type="button" onClick={openApiKeyModal} aria-label={t('aiChat.apiKey.buttonAria')}>
              {t(hasApiKey ? 'aiChat.apiKey.changeShort' : 'aiChat.apiKey.addShort')}
            </button>
            <button className="resetBtn" onClick={resetConversation} aria-label={t('aiChat.resetAria')}>
              <AiChatTrashIcon width="22" height="22" className="trashIcon" />
            </button>
            <button className="closeBtn" onClick={onClose} aria-label={t('aiChat.closeAria')}>
              &times;
            </button>
          </div>
        </header>
        <div className={`chatBody${showApiKeyGate ? ' chatBodyLocked' : ''}`}>
          <div id="conversation" ref={conversation}>
            {[ApiState.CHECKING, ApiState.WAKING].includes(state.apiState) && (
              <div className="healthBanner">
                <span>{t(state.apiState === ApiState.CHECKING ? 'aiChat.checking' : 'aiChat.waking')}</span>
                <span className="dots">
                  <span />
                  <span />
                  <span />
                </span>
              </div>
            )}
            {state.showSuggestions && !state.messages.length && (
              <div className="suggestionPanel">
                <div className="suggestionHeader">
                  <span className="suggestionTitle">{t('aiChat.suggestions.title')}</span>
                  <button
                    className="suggestionClose"
                    type="button"
                    onClick={() => patch({ showSuggestions: false })}
                    aria-label={t('aiChat.suggestions.closeAria')}
                  >
                    &times;
                  </button>
                </div>
                <div className="suggestionGrid">
                  {['whatIsW', 'addTwoNumbers', 'firstProgram'].map((key) => (
                    <button
                      key={key}
                      className="suggestionTile"
                      type="button"
                      onClick={() => {
                        patch({ text: t(`aiChat.suggestions.items.${key}`) });
                        if (!hasApiKey) openApiKeyModal();
                        else focusPrimary();
                      }}
                    >
                      <span className="suggestionText">{t(`aiChat.suggestions.items.${key}`)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="conversationBox" aria-live="polite" aria-relevant="additions text">
              {state.messages.map((message) => {
                const assistant = message.sender === 'assistant',
                  typing = assistant && state.aiTyping && state.currentAiMessageId === message.id;
                return (
                  <div key={message.id} className={`messageBubble ${assistant ? 'messageAi' : 'messageUser'}`}>
                    <div className="iconWrapper">{assistant ? 'AI' : ''}</div>
                    <div className="messageContent">
                      <div className="messageHeader">
                        <span className="senderName">{t(assistant ? 'aiChat.senderAi' : 'aiChat.senderUser')}</span>
                        <span className={`timestamp${typing ? ' timestampAssistant' : ''}`}>
                          {new Date(message.timestamp).toLocaleTimeString(locale || undefined, { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {typing && (
                          <button
                            className="cancelBtn"
                            type="button"
                            onClick={cancelResponse}
                            disabled={state.isCancelling}
                            aria-label={t('aiChat.cancel')}
                          >
                            &times;
                          </button>
                        )}
                      </div>
                      <div className={`messageText${assistant ? ' messageTextAssistant' : ''}`}>
                        {typing && !message.text ? (
                          <span className="typing">
                            <span />
                            <span />
                            <span />
                          </span>
                        ) : assistant ? (
                          <MessageContent text={message.text} />
                        ) : (
                          message.text
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="inputArea">
            <p className="inputInstruction">{instruction || t('aiChat.instruction')}</p>
            {(state.rateLimitMessage || state.generalError) && <p className="inputError">{state.rateLimitMessage || state.generalError}</p>}
            <form onSubmit={sendUserMessage}>
              <input
                ref={textInput}
                value={state.text}
                onChange={(event) => patch({ text: event.target.value })}
                placeholder={placeholder || t('aiChat.placeholder')}
                aria-label={placeholder || t('aiChat.placeholder')}
                type="text"
                disabled={inputDisabled}
                aria-disabled={inputDisabled}
              />
              <button className="execution-btn execution-btn--run" type="submit" disabled={inputDisabled || !state.text.trim()}>
                {t('aiChat.send')}
              </button>
            </form>
          </div>
          {showApiKeyGate && (
            <div
              className="apiKeyGate"
              onClick={(event) => {
                if (event.target === event.currentTarget) closeApiKeyModal();
              }}
            >
              <form className="apiKeyCard" onSubmit={saveApiKey}>
                <p className="apiKeyEyebrow">{t('aiChat.apiKey.eyebrow')}</p>
                <h2>{t(hasApiKey ? 'aiChat.apiKey.editTitle' : 'aiChat.apiKey.title')}</h2>
                <p className="apiKeyDescription">{t(hasApiKey ? 'aiChat.apiKey.editDescription' : 'aiChat.apiKey.description')}</p>
                <label className="apiKeyLabel" htmlFor="ai-chat-api-key">
                  {t('aiChat.apiKey.label')}
                </label>
                <div className="apiKeyField">
                  <input
                    id="ai-chat-api-key"
                    ref={apiKeyInput}
                    value={state.apiKeyDraft}
                    onChange={(event) => patch({ apiKeyDraft: event.target.value })}
                    type={state.showApiKeyValue ? 'text' : 'password'}
                    placeholder={t('aiChat.apiKey.placeholder')}
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <button className="apiKeyToggle" type="button" onClick={() => patch({ showApiKeyValue: !state.showApiKeyValue })}>
                    {t(state.showApiKeyValue ? 'aiChat.apiKey.hide' : 'aiChat.apiKey.show')}
                  </button>
                </div>
                <p className="apiKeyHint">{t('aiChat.apiKey.hint')}</p>
                <div className="apiKeyNotice">
                  <p className="apiKeyNoticeTitle">{t('aiChat.apiKey.noticeTitle')}</p>
                  <ul className="apiKeyNoticeList">
                    {['noticeRateLimits', 'noticeStorage', 'noticeShare'].map((key) => (
                      <li key={key}>{t(`aiChat.apiKey.${key}`)}</li>
                    ))}
                  </ul>
                </div>
                {state.apiKeyError && <p className="apiKeyError">{state.apiKeyError}</p>}
                <div className="apiKeyActions">
                  <button className="execution-btn execution-btn--run apiKeyPrimary" type="submit">
                    {t('aiChat.apiKey.save')}
                  </button>
                  {hasApiKey && (
                    <>
                      <button className="apiKeySecondary" type="button" onClick={closeApiKeyModal}>
                        {t('actions.cancel')}
                      </button>
                      <button className="apiKeySecondary apiKeyDanger" type="button" onClick={clearApiKey}>
                        {t('aiChat.apiKey.clear')}
                      </button>
                    </>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
