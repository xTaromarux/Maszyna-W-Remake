import type { ChatConversationProps } from '../Types/Props';
import { ChatMessageBubble } from './ChatMessageBubble';

const ChatConversation = ({ messages, currentAiMessageId, cancelResponse }: ChatConversationProps) => (
  <div className="conversationBox" aria-live="polite" aria-relevant="additions text">
    {messages.map((message) => (
      <ChatMessageBubble key={message.id} message={message} isTyping={currentAiMessageId === message.id} cancelResponse={cancelResponse} />
    ))}
  </div>
);

export default ChatConversation;
