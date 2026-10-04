'use client';

import type { ConsoleProps } from '@/Types/Components';
import { useConsoleScroll } from './Hooks/UseConsoleScroll';
import ConsoleEntry from './Ui/ConsoleEntry';
import ConsoleHeader from './Ui/ConsoleHeader';

const Console = ({ logs = [], onClose, onClear, className = '', ...rest }: ConsoleProps) => {
  const { contentRef, handleScroll, scrollToTop, scrollToBottom } = useConsoleScroll(logs);

  return (
    <div data-editor-console="" {...rest} id="console" className={`futuristic-console ${className}`}>
      <ConsoleHeader
        entryCount={logs.length}
        onClose={onClose}
        onClear={onClear}
        scrollToTop={scrollToTop}
        scrollToBottom={scrollToBottom}
      />
      <div data-editor-console="" className="console-content" ref={contentRef} onScroll={handleScroll}>
        {logs.map((log) => (
          <ConsoleEntry key={log.id} log={log} />
        ))}
      </div>
    </div>
  );
};

export default Console;
