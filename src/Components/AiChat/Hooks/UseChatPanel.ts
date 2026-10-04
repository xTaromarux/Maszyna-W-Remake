import type { ChatMessage } from '@/Types/Chat';
import { useEffect, useRef } from 'react';
import { useDialogFocus } from './Internal/UseDialogFocus';
import { usePanelResize } from './Internal/UsePanelResize';

/** Combines dialog focus and saved panel resizing, and scrolls new messages into view. */
export const useChatPanel = (visible: boolean, locked: boolean, messages: ChatMessage[]) => {
  const focus = useDialogFocus(visible, locked);
  const resize = usePanelResize(visible);
  const conversation = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      const conversationElement = conversation.current;
      if (conversationElement) {
        conversationElement.scrollTop = conversationElement.scrollHeight;
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [messages, visible]);

  return { ...focus, ...resize, conversation };
};
