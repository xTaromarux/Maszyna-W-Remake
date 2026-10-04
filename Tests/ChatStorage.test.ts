import assert from 'node:assert/strict';
import test from 'node:test';
import { restoreApiKey, restoreMessages, persistMessages, restorePanelWidth } from '../src/Components/AiChat/Helpers/ChatStorage';
import { API_KEY_STORAGE_KEY, STORAGE_KEY, WIDTH_KEY } from '../src/Components/AiChat/ChatConfig';

test('damaged history does not prevent API key and panel preferences from restoring', (context) => {
  const values = new Map([
    [STORAGE_KEY, '{broken'],
    [API_KEY_STORAGE_KEY, ' test-key '],
    [WIDTH_KEY, '5000'],
  ]);
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    },
  });
  context.after(() => {
    if (previous) Object.defineProperty(globalThis, 'localStorage', previous);
    else Reflect.deleteProperty(globalThis, 'localStorage');
  });
  assert.deepEqual(restoreMessages(), []);
  assert.equal(restoreApiKey(), 'test-key');
  assert.equal(restorePanelWidth(), 1000);
  values.set(STORAGE_KEY, JSON.stringify([null, { text: 'legacy' }, { id: 'a', sender: 'assistant', text: 'answer', timestamp: 12 }]));
  const messages = restoreMessages();
  assert.equal(messages.length, 2);
  assert.equal(messages[0].sender, 'user');
  assert.equal(messages[0].text, 'legacy');
  assert.equal(messages[1].timestamp, 12);
  persistMessages(messages);
  assert.deepEqual(restoreMessages(), messages);
  persistMessages([]);
  assert.equal(values.has(STORAGE_KEY), false);
});
