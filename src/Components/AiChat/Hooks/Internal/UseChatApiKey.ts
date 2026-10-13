import { useI18n } from '@/I18n/Hooks/UseI18n';
import type { FormEvent } from 'react';
import { useEffect } from 'react';
import { persistApiKey } from '../../Storage/ChatStorage';
import type { ChatSessionStore } from './UseChatState';

/** Manages API-key editing, validation, storage, and the key dialog's visibility. */
export const useChatApiKey = (visible: boolean, { state, latest, patch }: ChatSessionStore) => {
  const { t } = useI18n();

  const hasApiKey = Boolean(state.apiKey.trim());
  const showApiKeyGate = !hasApiKey || state.showApiKeyModal;

  useEffect(() => {
    if (!visible) {
      patch({
        showApiKeyModal: false,
        showApiKeyValue: false,
        apiKeyError: '',
        apiKeyDraft: latest.current.apiKey,
      });
    }
  }, [visible, latest, patch]);

  const openApiKeyModal = () => {
    patch({
      showApiKeyModal: true,
      apiKeyDraft: latest.current.apiKey,
      apiKeyError: '',
      showApiKeyValue: false,
    });
  };

  const closeApiKeyModal = () => {
    if (!latest.current.apiKey.trim()) {
      return;
    }

    patch({
      showApiKeyModal: false,
      apiKeyDraft: latest.current.apiKey,
      apiKeyError: '',
      showApiKeyValue: false,
    });
  };

  const saveApiKey = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const key = latest.current.apiKeyDraft.trim();
    if (!key) {
      patch({ apiKeyError: t('aiChat.apiKey.missingError') });
      return;
    }

    patch({
      apiKey: key,
      apiKeyDraft: key,
      apiKeyError: '',
      generalError: '',
      showApiKeyModal: false,
      showApiKeyValue: false,
    });

    persistApiKey(key);
  };

  const clearApiKey = () => {
    patch({
      apiKey: '',
      apiKeyDraft: '',
      apiKeyError: '',
      generalError: '',
      showApiKeyModal: false,
      showApiKeyValue: false,
    });

    persistApiKey('');
  };

  return {
    hasApiKey,
    showApiKeyGate,
    openApiKeyModal,
    closeApiKeyModal,
    saveApiKey,
    clearApiKey,
  };
};
