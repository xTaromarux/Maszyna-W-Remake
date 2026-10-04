import { extractResponseText, parseResponseData, readResponseField, requireResponseText } from './ChatResponse';

const EVENT_SEPARATOR_PATTERN = /\r?\n\r?\n/;
const EVENT_LINE_PATTERN = /\r?\n/;

const extractEventData = (event: string): string =>
  event
    .split(EVENT_LINE_PATTERN)
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice(5).trimStart())
    .join('\n');

/** Decodes split UTF-8/SSE chunks and reports the accumulated reply after each data event. */
export const readEventStream = async (body: ReadableStream<Uint8Array>, onText: (text: string) => void): Promise<string> => {
  const reader = body.getReader();
  const decoder = new TextDecoder();

  let pendingEvents = '';
  let responseText = '';
  let streamFinished = false;

  const applyEvent = (event: string) => {
    const eventData = extractEventData(event);
    if (!eventData) {
      return;
    }

    if (eventData === '[DONE]') {
      streamFinished = true;
      return;
    }

    const data = parseResponseData(eventData, { delta: eventData });
    if (readResponseField(data, 'error')) {
      throw new Error('Stream failed');
    }

    const delta =
      readResponseField(data, 'choices', 0, 'delta', 'content') ?? readResponseField(data, 'delta') ?? readResponseField(data, 'chunk');

    if (typeof delta === 'string') {
      responseText += delta;
    } else {
      const replacement = extractResponseText(data);
      if (replacement) {
        responseText = replacement;
      }
    }

    onText(responseText);
  };

  try {
    while (!streamFinished) {
      const { value, done } = await reader.read();
      pendingEvents += decoder.decode(value, { stream: !done });

      let separator = EVENT_SEPARATOR_PATTERN.exec(pendingEvents);
      while (separator) {
        const event = pendingEvents.slice(0, separator.index);
        pendingEvents = pendingEvents.slice(separator.index + separator[0].length);
        applyEvent(event);

        if (streamFinished) {
          break;
        }
        separator = EVENT_SEPARATOR_PATTERN.exec(pendingEvents);
      }

      if (done) {
        if (!streamFinished && pendingEvents.trim()) {
          applyEvent(pendingEvents);
        }
        break;
      }
    }
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }

  return requireResponseText(responseText);
};
