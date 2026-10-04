import { useI18n } from '@/I18n/Index';
import type { RefObject } from 'react';
import type { ChatSession } from '../Hooks/UseChatSession';
type Props = Pick<ChatSession, 'state' | 'patch' | 'hasApiKey' | 'closeApiKeyModal' | 'saveApiKey' | 'clearApiKey'> & {
  inputRef: RefObject<HTMLInputElement | null>;
};
export default function ApiKeyDialog({ state, patch, hasApiKey, closeApiKeyModal, saveApiKey, clearApiKey, inputRef }: Props) {
  const { t } = useI18n();
  return (
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
            ref={inputRef}
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
  );
}
