import { useI18n } from '@/i18n';
import type { RefObject } from 'react';
import type { ChatSession } from '../hooks/useChatSession';
type Props = Pick<ChatSession, 'state' | 'patch' | 'inputDisabled' | 'sendUserMessage'> & {
  inputRef: RefObject<HTMLInputElement | null>;
  instruction: string;
  placeholder: string;
  inert: boolean;
};
export default function ChatComposer({ state, patch, inputDisabled, sendUserMessage, inputRef, instruction, placeholder, inert }: Props) {
  const { t } = useI18n();
  return (
    <div className="inputArea" inert={inert}>
      <p className="inputInstruction">{instruction || t('aiChat.instruction')}</p>
      {(state.rateLimitMessage || state.generalError) && <p className="inputError">{state.rateLimitMessage || state.generalError}</p>}
      <form onSubmit={sendUserMessage}>
        <input
          ref={inputRef}
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
  );
}
