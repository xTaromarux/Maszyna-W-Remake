import type { LogEntry } from '@/Types/Simulator';
import type { UIEvent } from 'react';
import { useEffect, useRef } from 'react';

const TOP_THRESHOLD_PX = 10;

/**
 * Follows new logs at the top of the newest-first list, unless the user is reading older entries.
 * Exposes separate smooth navigation actions for the header's top and bottom buttons.
 */
export const useConsoleScroll = (logs: LogEntry[]) => {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const followsLatest = useRef(true);
  const newestLog = logs[0];

  useEffect(() => {
    if (followsLatest.current) {
      contentRef.current?.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [newestLog?.id, newestLog?.message, newestLog?.timestamp]);

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    followsLatest.current = event.currentTarget.scrollTop <= TOP_THRESHOLD_PX;
  };

  const scrollToTop = () => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    const content = contentRef.current;
    if (content) {
      content.scrollTo({ top: content.scrollHeight, behavior: 'smooth' });
    }
  };

  return {
    contentRef,
    handleScroll,
    scrollToTop,
    scrollToBottom,
  };
};
