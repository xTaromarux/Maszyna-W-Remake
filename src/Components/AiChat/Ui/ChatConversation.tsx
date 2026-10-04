import { useI18n } from '@/I18n/Index';
import type { ChatSession } from '../Hooks/UseChatSession';
import MessageContent from './MessageContent';
export default function ChatConversation({ state, cancelResponse }: Pick<ChatSession, 'state' | 'cancelResponse'>) {
  const { t, locale } = useI18n();
  return (
    <div className="conversationBox" aria-live="polite" aria-relevant="additions text">
      {state.messages.map((message) => {
        const assistant = message.sender === 'assistant',
          typing = assistant && state.currentAiMessageId === message.id;
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
                  <button className="cancelBtn" type="button" onClick={cancelResponse} aria-label={t('aiChat.cancel')}>
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
  );
}
