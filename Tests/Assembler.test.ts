import assert from 'node:assert/strict';
import test from 'node:test';
import { compileAsmToMicroProgram } from '../src/Wlan/AsmPipeline';
import { WlanError } from '../src/Wlan/Error';
import { commandList } from '../src/Utils/Data/Commands.js';
import type { RuntimeCommand } from '../src/Types/Registry';

const compile = (source: string, commands: RuntimeCommand[] = commandList) => compileAsmToMicroProgram(source, commands);
const assignments = (result: ReturnType<typeof compile>) => result.initAssignments.map(({ addr, val }) => ({ addr, val }));

test('DOD 0 retains the fetch, address and addition microcycles', () => {
  const result = compile('DOD 0');
  assert.deepEqual(result.initAssignments, []);
  assert.deepEqual(
    result.ir.instructions.map(({ name, address, operands }) => ({ name, address, value: operands[0].value })),
    [{ name: 'DOD', address: 0, value: 0 }]
  );
  assert.deepEqual(result.microProgram, [
    {
      pc: 0,
      asmLine: 'DOD 0',
      phases: [
        { czyt: true, wys: true, wei: true, il: true, srcLine: 0 },
        { wyad: true, wea: true, srcLine: 1 },
        { czyt: true, wys: true, weja: true, dod: true, weak: true, wyl: true, wea: true, srcLine: 2 },
      ],
      meta: { kind: 'NONE' },
    },
  ]);
  assert.equal(result.microAsmText, 'czyt wys wei il;\nwyad wea;\nczyt wys weja dod weak wyl wea;');
});

test('forward and backward labels retain instruction addresses and branch metadata', () => {
  const result = compile('entry: POB value\nSOZ done\nSOB entry\ndone: STP\nvalue: RST 3');
  assert.deepEqual(
    result.ir.labels.map(({ name, address }) => ({ name, address })),
    [
      { name: 'entry', address: 0 },
      { name: 'done', address: 3 },
      { name: 'value', address: 4 },
    ]
  );
  assert.deepEqual(
    result.microProgram.map(({ asmLine }) => asmLine),
    ['POB 4', 'SOZ 3', 'SOB 0', 'STP']
  );
  assert.deepEqual(result.microProgram[2].meta, { kind: 'JUMP', trueTarget: 0 });
  assert.equal(result.microProgram[1].meta?.kind, 'CJUMP');
  const conditional = result.microProgram[1].phases.find((phase) => phase.conditional === true);
  assert.ok(conditional?.conditional);
  assert.equal(conditional.flag, 'Z');
  assert.equal(conditional.truePhases[0].wyad, true);
  assert.equal(conditional.truePhases[0].wel, true);
  assert.equal(conditional.falsePhases[0].wyl, true);
  assert.match(result.microAsmText, /IF Z THEN @zero ELSE @notzero;/);
  assert.match(result.microAsmText, /stop;$/);
  assert.deepEqual(assignments(result), [{ addr: 4, val: 3 }]);
});

test('ORG, RST, RPA and DATA initialize reserved memory without creating executable instructions', () => {
  const result = compile('ORG 16\nconstant: RST -128\nspace: RPA\nDATA 0xff, 0b10, 0\nORG 0\nDOD constant\nSTP');
  assert.deepEqual(assignments(result), [
    { addr: 16, val: -128 },
    { addr: 17, val: 0 },
    { addr: 18, val: 255 },
    { addr: 19, val: 2 },
    { addr: 20, val: 0 },
  ]);
  assert.deepEqual(
    result.ir.instructions.map(({ address }) => address),
    [0, 1]
  );
  assert.deepEqual(
    result.microProgram.map(({ asmLine }) => asmLine),
    ['DOD 16', 'STP']
  );
  assert.deepEqual(
    result.ir.memoryDecls.map(({ name, size }) => ({ name, size })),
    [
      { name: 'RST', size: 1 },
      { name: 'RPA', size: 1 },
      { name: 'DATA', size: 3 },
    ]
  );
});

test('the assembler accepts its inclusive data and address boundaries', () => {
  const data = compile('DATA -128, 255');
  assert.deepEqual(assignments(data), [
    { addr: 0, val: -128 },
    { addr: 1, val: 255 },
  ]);
  const address = compile('ORG 65535\nDOD 65535');
  assert.equal(address.ir.instructions[0].address, 65535);
  assert.equal(address.ir.instructions[0].operands[0].value, 65535);
});

test('data and address values outside assembler bounds report structured diagnostics', () => {
  for (const source of ['RST -129', 'RST 256', 'DATA 1, 256']) {
    assert.throws(
      () => compile(source),
      (error: unknown) => error instanceof WlanError && error.code === 'PARSE_DATA_RANGE'
    );
  }
  for (const source of ['ORG -1', 'ORG 65536', 'DOD -1', 'DOD 65536']) {
    assert.throws(
      () => compile(source),
      (error: unknown) => error instanceof WlanError && error.code === 'PARSE_ADDRESS_RANGE'
    );
  }
});

test('English aliases compile to the same canonical microprogram as Polish mnemonics', () => {
  const canonical = compile('DOD 0\nSTP');
  const english = compile('add 0\nhalt');
  assert.deepEqual(english.microProgram, canonical.microProgram);
  assert.equal(english.microAsmText, canonical.microAsmText);
});

test('custom commands and localized aliases use the supplied instruction catalog', () => {
  const custom: RuntimeCommand = { name: 'PODWOJ', mnemonics: { en: 'DOUBLE' }, args: 0, lines: 'wyak weja dod weak;' };
  const result = compile('double', [...commandList, custom]);
  assert.equal(result.microProgram[0].asmLine, 'PODWOJ');
  assert.deepEqual(result.microProgram[0].phases, [{ wyak: true, weja: true, dod: true, weak: true, srcLine: 0 }]);
  assert.equal(result.microAsmText, 'wyak weja dod weak;');
  assert.throws(
    () => compile('DOUBLE'),
    (error: unknown) => error instanceof WlanError && error.code === 'PARSE_UNKNOWN_MNEMONIC'
  );
});

test('reserved data directives keep their meaning when a catalog contains the same name', () => {
  const result = compile('RST 7', [...commandList, { name: 'RST', kind: 'exec', args: 0, lines: 'stop;' }]);
  assert.deepEqual(assignments(result), [{ addr: 0, val: 7 }]);
  assert.equal(result.microProgram.length, 0);
});

test('missing operands preserve diagnostic code, source coordinates and context', () => {
  assert.throws(
    () => compile('STP\nDOD'),
    (error: unknown) => {
      assert.ok(error instanceof WlanError);
      assert.equal(error.code, 'PARSE_BAD_ARITY');
      assert.deepEqual(error.loc, { line: 2, col: 1, length: 3 });
      assert.ok(error.hint);
      assert.match(error.message, /2 \| DOD/);
      assert.match(error.message, /\^~~/);
      return true;
    }
  );
});

test('invalid source rejects unknown tokens, unknown mnemonics and malformed operands', () => {
  const cases = [
    ['DOD $', 'LEX_UNKNOWN_CHAR'],
    ['NIEZNANY 1', 'PARSE_UNKNOWN_MNEMONIC'],
    ['DOD 0,', 'PARSE_TRAILING_COMMA'],
    ['DOD 1 2', 'PARSE_EXPECT_SEPARATOR'],
    ['DOD nowhere', 'SEM_UNDEFINED_SYMBOL'],
    ['same: STP\nsame: STP', 'SEM_DUPLICATE_SYMBOL'],
    ['SOB data\ndata: RST 0', 'GEN_SOB_BAD_ADDR'],
  ];
  for (const [source, code] of cases) {
    assert.throws(
      () => compile(source),
      (error: unknown) => error instanceof WlanError && error.code === code,
      source
    );
  }
});

test('CRLF, comments and Unicode labels preserve resolved instruction values', () => {
  const result = compile('; program\r\nDOD @ŻÓŁĆ // comment\r\nSTP\r\nżółć: RST 4');
  assert.equal(result.ir.instructions[0].operands[0].value, 2);
  assert.deepEqual(assignments(result), [{ addr: 2, val: 4 }]);
});

test('duplicate command definitions fail before assembling a program', () => {
  assert.throws(
    () => compile('STP', [...commandList, { ...commandList[0], name: 'stp' }]),
    (error: unknown) => error instanceof WlanError && error.code === 'REG_DUPLICATE'
  );
});
