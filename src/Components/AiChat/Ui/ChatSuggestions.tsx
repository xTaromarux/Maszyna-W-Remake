import { useI18n } from '@/I18n/Hooks/UseI18n';
interface Props {
  onDismiss: () => void;
  onSelect: (text: string) => void;
}
const ChatSuggestions = ({ onDismiss, onSelect }: Props) => {
  const { t } = useI18n();
  return (
    <div className="suggestionPanel">
      <div className="suggestionHeader">
        <span className="suggestionTitle">{t('aiChat.suggestions.title')}</span>
        <button className="suggestionClose" type="button" onClick={onDismiss} aria-label={t('aiChat.suggestions.closeAria')}>
          &times;
        </button>
      </div>
      <div className="suggestionGrid">
        {['whatIsW', 'addTwoNumbers', 'firstProgram'].map((key) => (
          <button key={key} className="suggestionTile" type="button" onClick={() => onSelect(t(`aiChat.suggestions.items.${key}`))}>
            <span className="suggestionText">{t(`aiChat.suggestions.items.${key}`)}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChatSuggestions;
