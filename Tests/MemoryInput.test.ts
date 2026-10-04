import assert from 'node:assert/strict';
import test from 'node:test';
import { getMemoryBounds, parseMemoryInput } from '../src/Components/MemoryContent/Helpers/MemoryValues';
import { toUnsigned } from '../src/Shared/Utils/Numbers';

test('memory input requires a complete decimal integer', () => {
  assert.equal(parseMemoryInput(' 42 '), 42);
  assert.equal(parseMemoryInput('-128'), -128);
  assert.equal(parseMemoryInput('+7'), 7);

  for (const raw of ['1e2', '1.9', '42abc', '0x10', '', '-', 'Infinity', '9007199254740993']) {
    assert.equal(parseMemoryInput(raw), null, raw);
  }
});

test('memory bounds and stored negative values follow the configured word width', () => {
  assert.deepEqual(getMemoryBounds(8, false), { min: 0, max: 255 });
  assert.deepEqual(getMemoryBounds(8, true), { min: -128, max: 127 });
  assert.deepEqual(getMemoryBounds(10, true), { min: -512, max: 511 });
  assert.equal(toUnsigned(parseMemoryInput('-1')!, 10), 1023);
  assert.deepEqual(getMemoryBounds(30, false), { min: 0, max: 1073741823 });
});
