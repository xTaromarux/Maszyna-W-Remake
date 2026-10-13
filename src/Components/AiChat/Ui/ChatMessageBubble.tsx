import { useI18n } from '@/I18n/Hooks/UseI18n';
import type { ChatMessage } from '@/Components/AiChat/Types/Chat';
import type { ChatSession } from '../Hooks/UseChatSession';
import MessageContent from './MessageContent';

interface ChatMessageBubbleProps {
  message: ChatMessage;
  isTyping: boolean;
  cancelResponse: ChatSession['cancelResponse'];
}

/** Displays one message and a cancellable typing indicator for the active assistant reply. */
export const ChatMessageBubble = ({ message, isTyping, cancelResponse }: ChatMessageBubbleProps) => {
  const { t, locale } = useI18n();
  const isAssistant = message.sender === 'assistant';
  const isReplyInProgress = isAssistant && isTyping;
  const timestamp = new Date(message.timestamp).toLocaleTimeString(locale || undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  const renderMessageText = () => {
    if (isReplyInProgress && !message.text) {
      return (
        <span className="typing">
          <span />
          <span />
          <span />
        </span>
      );
    }

    if (isAssistant) {
      return <MessageContent text={message.text} />;
    }

    return message.text;
  };

  return (
    <div className={`messageBubble ${isAssistant ? 'messageAi' : 'messageUser'}`}>
      <div className="iconWrapper">{isAssistant ? 'AI' : ''}</div>
      <div className="messageContent">
        <div className="messageHeader">
          <span className="senderName">{t(isAssistant ? 'aiChat.senderAi' : 'aiChat.senderUser')}</span>
          <span className={`timestamp${isReplyInProgress ? ' timestampAssistant' : ''}`}>{timestamp}</span>
          {isReplyInProgress && (
            <button className="cancelBtn" type="button" onClick={cancelResponse} aria-label={t('aiChat.cancel')}>
              &times;
            </button>
          )}
        </div>
        <div className={`messageText${isAssistant ? ' messageTextAssistant' : ''}`}>{renderMessageText()}</div>
      </div>
    </div>
  );
};
