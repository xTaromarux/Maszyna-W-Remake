import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ProcessorDiagram from '../src/Components/ProcessorDiagram/ProcessorDiagram';
import RegisterComponent from '../src/Components/ProcessorDiagram/Registers/RegisterComponent';
import { parseRegisterInput } from '../src/Shared/Utils/RegisterInput';
import { createMachineStore } from '../src/Machine/CreateMachineStore';

test('the complete machine diagram renders on the server without browser globals', () => {
  assert.equal(typeof window, 'undefined');
  const { machine } = createMachineStore() as any;
  const extras = machine.getDefaultExtras();
  for (const key of Object.keys(extras)) {
    if (typeof extras[key] === 'boolean') extras[key] = true;
    else for (const field of Object.keys(extras[key])) extras[key][field] = true;
  }
  const markup = renderToStaticMarkup(
    createElement(ProcessorDiagram, {
      ...machine,
      extras,
      wordBits: machine.codeBits + machine.addresBits,
    })
  );
  for (const id of [
    'W',
    'counter',
    'memory',
    'accumulator',
    'jaml',
    'iRegister',
    'xRegister',
    'yRegister',
    'wsRegister',
    'rbRegister',
    'gRegister',
    'rzRegister',
    'rpRegister',
    'rmRegister',
    'apRegister',
  ]) {
    assert.ok(markup.includes(`id="${id}"`), `${id} should be available in the full diagram`);
  }
  assert.ok(markup.includes('class="format-button"'));
  assert.ok(markup.includes('aria-pressed="false"'));
});

test('register input parsing retains integer precision and rejects invalid digits', () => {
  assert.equal(parseRegisterInput('9007199254740993123456', 'dec'), 9007199254740993123456n);
  assert.equal(parseRegisterInput('-0xFF_FF', 'dec'), -65535n);
  assert.equal(parseRegisterInput('101010', 'bin'), 42n);
  assert.equal(parseRegisterInput('0b101010', 'hex'), 42n);
  assert.equal(parseRegisterInput('102', 'bin'), null);
  assert.equal(parseRegisterInput('xyz', 'hex'), null);
  assert.equal(parseRegisterInput('-', 'dec'), null);
});

test('signed register display uses the configured word width', () => {
  const markup = renderToStaticMarkup(createElement(RegisterComponent, { label: 'AK', model: 1023, signedDec: true, wordBits: 10 }));
  assert.ok(markup.includes('<span>-1</span>'));
  assert.ok(markup.includes('aria-label="Akumulator"'));
});
