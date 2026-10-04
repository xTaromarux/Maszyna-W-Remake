import type { ChatSession } from '../Hooks/UseChatSession';
import { ChatMessageBubble } from './ChatMessageBubble';

const ChatConversation = ({ state, cancelResponse }: Pick<ChatSession, 'state' | 'cancelResponse'>) => (
  <div className="conversationBox" aria-live="polite" aria-relevant="additions text">
    {state.messages.map((message) => (
      <ChatMessageBubble
        key={message.id}
        message={message}
        isTyping={state.currentAiMessageId === message.id}
        cancelResponse={cancelResponse}
      />
    ))}
  </div>
);

export default ChatConversation;
