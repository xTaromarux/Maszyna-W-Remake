'use client';

import { useI18n } from '@/I18n/Index';
import { ApiState } from '@/Types/Chat';
import type { AiChatProps } from '@/Types/Components';
import type { FormEvent, KeyboardEvent, MouseEvent } from 'react';
import AiChatTrashIcon from './Ui/AiChatTrashIcon';
import ApiKeyDialog from './Ui/ApiKeyDialog';
import ChatComposer from './Ui/ChatComposer';
import ChatConversation from './Ui/ChatConversation';
import ChatSuggestions from './Ui/ChatSuggestions';
import { useChatSession } from './Hooks/UseChatSession';
import { useChatPanel } from './Hooks/UseChatPanel';

const AiChat = ({ visible = false, title = '', placeholder = '', instruction = '', onClose }: AiChatProps) => {
  const { t } = useI18n();
  const session = useChatSession(visible);
  const {
    state,
    patch,
    hasApiKey,
    showApiKeyGate,
    inputDisabled,
    openApiKeyModal,
    closeApiKeyModal,
    saveApiKey,
    clearApiKey,
    cancelResponse,
    resetConversation,
    sendUserMessage,
  } = session;
  const panel = useChatPanel(visible, showApiKeyGate, state.messages);

  const closeOverlay = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose?.();
    }
  };

  const handleEscape = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Escape') {
      return;
    }

    event.stopPropagation();
    if (state.showApiKeyModal && hasApiKey) {
      closeApiKeyModal();
    } else {
      onClose?.();
    }
  };

  const dismissSuggestions = () => patch({ showSuggestions: false });

  const selectSuggestion = (text: string) => {
    patch({ text });
    if (!hasApiKey) {
      openApiKeyModal();
    } else {
      panel.focusPrimary();
    }
  };

  const saveKeyAndFocus = (event: FormEvent<HTMLFormElement>) => {
    saveApiKey(event);
    panel.focusPrimary();
  };

  if (!visible) {
    return null;
  }

  return (
    <div className="chatOverlay" onClick={closeOverlay}>
      <div
        ref={panel.dialog}
        tabIndex={-1}
        id="aiChat"
        className="chatPanel show"
        role="dialog"
        aria-modal="true"
        aria-label={title || t('aiChat.title')}
        style={{ width: panel.panelWidth }}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={handleEscape}
      >
        <div className="resizer" {...panel.resizeHandleProps} />
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
          <div id="conversation" ref={panel.conversation} inert={showApiKeyGate}>
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
              <ChatSuggestions onDismiss={dismissSuggestions} onSelect={selectSuggestion} />
            )}
            <ChatConversation state={state} cancelResponse={cancelResponse} />
          </div>
          <ChatComposer
            inert={showApiKeyGate}
            state={state}
            patch={patch}
            inputDisabled={inputDisabled}
            sendUserMessage={sendUserMessage}
            inputRef={panel.textInput}
            instruction={instruction}
            placeholder={placeholder}
          />
          {showApiKeyGate && (
            <ApiKeyDialog
              state={state}
              patch={patch}
              hasApiKey={hasApiKey}
              closeApiKeyModal={closeApiKeyModal}
              saveApiKey={saveKeyAndFocus}
              clearApiKey={clearApiKey}
              inputRef={panel.apiKeyInput}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AiChat;
