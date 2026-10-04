import { ApiState } from '@/types/chat';
import type { ChatMessage } from '@/types/chat';
import { generateId } from '@/shared/utils/identifiers';
import { HISTORY_LIMIT, RATE_LIMIT } from '../chatConfig';

export const isCheckingModel = (apiState: ApiState): boolean => [ApiState.CHECKING, ApiState.WAKING].includes(apiState);

export const createChatMessage = (sender: ChatMessage['sender'], text: string, timestamp = Date.now()): ChatMessage => ({
  id: generateId(sender),
  sender,
  text,
  timestamp,
});

/** The current query is sent separately; include only preceding, nonempty turns. */
export const buildRequestHistory = (messages: ChatMessage[]) =>
  messages
    .filter((message) => message.text.trim())
    .slice(-HISTORY_LIMIT)
    .map((message) => ({ role: message.sender, message: message.text }));

export const reserveRequestSlot = (timestamps: number[], now: number) => {
  const recentRequests = timestamps.filter((timestamp) => now - timestamp < RATE_LIMIT.windowMs);
  const allowed = recentRequests.length < RATE_LIMIT.maxRequests;
  if (allowed) {
    recentRequests.push(now);
  }
  return { allowed, timestamps: recentRequests };
};
