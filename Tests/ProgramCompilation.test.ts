import assert from 'node:assert/strict';
import test from 'node:test';
import { prepareProgramCompilation } from '../src/Components/AssemblyEditor/Compilation/PrepareProgramCompilation';
import { commandList } from '../src/Assembler/Data/Commands.js';
import { AssemblerError } from '../src/Assembler/Errors/AssemblerError';

const options = { commandList, codeBits: 4, addresBits: 4 };

test('compilation encodes aliases and accepts the last available memory address', () => {
  const result = prepareProgramCompilation('LOAD value\nSTP\nORG 15\nvalue: RST 7', options);
  const loadOpcode = commandList.findIndex((command) => command.name === 'POB');
  const stopOpcode = commandList.findIndex((command) => command.name === 'STP');

  assert.deepEqual(result.memoryAssignments, [
    { addr: 15, val: 7 },
    { addr: 0, val: loadOpcode * 16 + 15 },
    { addr: 1, val: stopOpcode * 16 },
  ]);
  assert.equal(result.code.program.length, 2);
});

test('compilation rejects instruction and data writes beyond configured memory', () => {
  for (const source of ['ORG 16\nSTP', 'ORG 16\nRST 1', 'ORG 16\nRPA', 'ORG 15\nDATA 1, 2']) {
    assert.throws(
      () => prepareProgramCompilation(source, options),
      (error: unknown) => {
        assert.ok(error instanceof AssemblerError);
        assert.equal(error.code, 'COMPILE_MEMORY_ADDRESS_RANGE');
        assert.equal(error.loc?.line, 2);
        return true;
      }
    );
  }
});

test('compilation rejects operands and opcodes wider than configured fields', () => {
  assert.throws(() => prepareProgramCompilation('DOD 16', options));
  assert.throws(() => prepareProgramCompilation('POB 0', { ...options, codeBits: 1 }));
});
