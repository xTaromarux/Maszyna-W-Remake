import assert from 'node:assert/strict';
import { test } from 'node:test';
import { findDuplicateNames, parseCommandCatalog } from '../src/Components/CommandCatalog/Helpers/CommandCatalog';

test('catalog import keeps executable metadata and normalizes legacy entries', () => {
  const commands = parseCommandCatalog(
    JSON.stringify([
      { name: 'LOAD', lines: 'czyt wys wea;', args: 1, mnemonics: { pl: 'LAD' } },
      { name: 'RST', kind: 'memory', args: 1 },
    ])
  );
  assert.equal(commands[0].kind, 'exec');
  assert.equal(commands[0].lines, 'czyt wys wea;');
  assert.deepEqual(commands[0].mnemonics, { pl: 'LAD' });
  assert.equal(commands[1].kind, 'memory');
  assert.equal(commands[1].lines, '');
});

test('catalog import rejects malformed fields before updating editor state', () => {
  for (const entry of [
    { name: ' ' },
    { name: 'LOAD', lines: 12 },
    { name: 'LOAD', args: -1 },
    { name: 'LOAD', kind: 'unknown' },
    { name: 'LOAD', mnemonics: { pl: [1] } },
  ]) {
    assert.throws(() => parseCommandCatalog(JSON.stringify([entry])), /Invalid command list/);
  }
  assert.throws(() => parseCommandCatalog('{}'), /Invalid command list/);
});

test('duplicate detection includes commands outside the visible opcode range', () => {
  const commands = [{ name: 'LOAD' }, { name: 'DOD' }, { name: ' load ' }];
  assert.deepEqual([...findDuplicateNames(commands)], ['load']);
});
