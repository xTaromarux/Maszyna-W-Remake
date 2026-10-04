import type { TextContentProps } from '@/Types/Components';
import { Fragment } from 'react';
import CodeBlock from './CodeBlock';

const INLINE_CODE_PATTERN = /(`[^`\n]+`)/g;

const InlineMessage = ({ text }: TextContentProps) =>
  text.split(INLINE_CODE_PATTERN).map((part, index) =>
    // Text enclosed in backticks is inline code; slice(1, -1) removes the surrounding backticks.
    part.startsWith('`') && part.endsWith('`') ? (
      <code key={index} className="inline-code">
        {part.slice(1, -1)}
      </code>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    )
  );

const MessageContent = ({ text }: TextContentProps) => {
  const parts = [];
  const codeBlockPattern = /```([^\n`]*)?\r?\n([\s\S]*?)```/g;

  let offset = 0;

  for (const match of text.matchAll(codeBlockPattern)) {
    const blockStart = match.index;
    const language = (match[1] || '').trim();
    const code = match[2];

    if (blockStart > offset) {
      const precedingText = text.slice(offset, blockStart);
      parts.push(<InlineMessage key={`text-${offset}`} text={precedingText} />);
    }

    parts.push(<CodeBlock key={`code-${blockStart}`} language={language} code={code} />);
    offset = blockStart + match[0].length;
  }

  if (offset < text.length) {
    const remainingText = text.slice(offset);
    parts.push(<InlineMessage key={`text-${offset}`} text={remainingText} />);
  }

  return <div className="messageHtml">{parts}</div>;
};

export default MessageContent;
