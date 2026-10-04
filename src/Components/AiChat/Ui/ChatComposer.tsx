import { useI18n } from '@/I18n/Hooks/UseI18n';
import type { ChatComposerProps } from '../Types/Props';

const ChatComposer = ({
  text,
  errorMessage,
  updateText,
  inputDisabled,
  sendUserMessage,
  inputRef,
  instruction,
  placeholder,
  inert,
}: ChatComposerProps) => {
  const { t } = useI18n();
  return (
    <div className="inputArea" inert={inert}>
      <p className="inputInstruction">{instruction || t('aiChat.instruction')}</p>
      {errorMessage && <p className="inputError">{errorMessage}</p>}
      <form onSubmit={sendUserMessage}>
        <input
          ref={inputRef}
          value={text}
          onChange={(event) => updateText(event.target.value)}
          placeholder={placeholder || t('aiChat.placeholder')}
          aria-label={placeholder || t('aiChat.placeholder')}
          type="text"
          disabled={inputDisabled}
          aria-disabled={inputDisabled}
        />
        <button className="execution-btn execution-btn--run" type="submit" disabled={inputDisabled || !text.trim()}>
          {t('aiChat.send')}
        </button>
      </form>
    </div>
  );
};

export default ChatComposer;
