import assert from 'node:assert/strict';
import test, { type TestContext } from 'node:test';
import { createMachineStore } from '../src/Machine/CreateMachineStore';
import { prepareProgramCompilation } from '../src/Components/AssemblyEditor/Compilation/PrepareProgramCompilation';

function fixture(context: TestContext, start = false) {
  const saved = new Map<string, string>();
  Object.assign(globalThis, {
    window: Object.assign(new EventTarget(), { innerWidth: 1440 }),
    document: {
      title: 'Maszyna W',
      documentElement: { lang: 'pl' },
      body: { classList: { toggle() {} } },
    },
    localStorage: {
      getItem: (key: string) => saved.get(key) ?? null,
      setItem: (key: string, value: string) => saved.set(key, value),
    },
  });
  const store = createMachineStore();
  context.after(() => store.dispose());
  if (start) store.start();
  return { store, machine: store.machine as any, saved };
}

const delay = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const loadProgram = (machine: any, source: string) => {
  const result = prepareProgramCompilation(source, {
    commandList: machine.commandList,
    codeBits: machine.codeBits,
    addresBits: machine.addresBits,
  });

  machine.applyInitMemory(result.memoryAssignments);
  machine.handleProgramSectionCompile(result.code);
};

test('multiplication preserves low bits of 30-bit words in both execution modes', (context) => {
  const { machine } = fixture(context);
  machine.codeBits = 16;
  machine.addresBits = 14;

  for (const fast of [false, true]) {
    machine.isFastRunning = fast;
    machine.ACC = 2 ** 29 + 1;
    machine.JAML = 2 ** 29 + 1;
    machine.mno();
    assert.equal(machine.JAML, 1);

    machine.ACC = 2 ** 30 - 1;
    machine.JAML = 2 ** 30 - 1;
    machine.mno();
    assert.equal(machine.JAML, 1);
  }
});

test('division uses the full signed word and retains the zero-divisor policy in both modes', (context) => {
  const { machine } = fixture(context);

  for (const fast of [false, true]) {
    machine.isFastRunning = fast;
    machine.ACC = 512;
    machine.JAML = 256;
    machine.dziel();
    assert.equal(machine.JAML, machine.toWord(-2));

    machine.JAML = 0;
    machine.dziel();
    assert.equal(machine.JAML, 0);
  }
});

test('QA07: division interprets both operands as U2 and truncates toward zero', (context) => {
  const { machine } = fixture(context);
  for (const [codeBits, addresBits] of [
    [1, 3],
    [6, 4],
    [16, 14],
  ]) {
    machine.codeBits = codeBits;
    machine.addresBits = addresBits;
    const minimum = -(2 ** (codeBits + addresBits - 1));
    for (const fast of [false, true]) {
      machine.isFastRunning = fast;
      for (const [dividend, divisor, quotient] of [
        [6, 2, 3],
        [-6, 2, -3],
        [6, -2, -3],
        [-6, -2, 3],
        [7, 2, 3],
        [-7, 2, -3],
        [7, -2, -3],
        [-7, -2, 3],
        [0, -2, 0],
        [-6, 0, 0],
        [minimum, 1, minimum],
        [minimum, -1, -minimum],
      ]) {
        machine.ACC = machine.toWord(dividend);
        machine.JAML = machine.toWord(divisor);
        machine.dziel();
        assert.equal(machine.JAML, machine.toWord(quotient), `${dividend} / ${divisor}`);
        assert.equal(machine.ACC, machine.toWord(dividend), 'division writes JAML until weak commits the result');
        machine.weak();
        assert.equal(machine.ACC, machine.toWord(quotient));
      }
    }
  }
});

test('QA07: DZI divides signed operands fetched from memory in both execution modes', (context) => {
  const { machine } = fixture(context);
  for (const fast of [false, true]) {
    machine.resetValues();
    loadProgram(machine, 'POB number\nDZI divisor\nSTP\nnumber: RST -6\ndivisor: RST 2');
    machine.isFastRunning = fast;
    let stepsLeft = 20;
    while (machine.codeCompiled && stepsLeft-- > 0) machine.executeLine();
    assert.equal(machine.codeCompiled, false, 'the program should terminate');
    assert.equal(machine.ACC, 1021, 'ten-bit U2 representation of -3');
    assert.equal(machine.mem[3], 1018, 'division must not modify the dividend in memory');
    assert.equal(machine.mem[4], 2, 'division must not modify the divisor in memory');
  }
});

test('logical shifts use the full count and clear words at or above their width', (context) => {
  const { machine } = fixture(context);

  for (const fast of [false, true]) {
    machine.isFastRunning = fast;
    machine.ACC = 512;
    machine.JAML = 8;
    machine.shr();
    assert.equal(machine.ACC, 2);

    machine.ACC = 1;
    machine.shl();
    assert.equal(machine.ACC, 256);

    for (const count of [10, 32, 1023]) {
      for (const signal of ['shr', 'shl']) {
        machine.ACC = 1023;
        machine.JAML = count;
        machine[signal]();
        assert.equal(machine.ACC, 0);
      }
    }
  }
});

test('nested subroutine calls track committed stack writes without modifying AP', (context) => {
  const { machine } = fixture(context);

  for (const fast of [false, true]) {
    machine.resetValues();
    loadProgram(machine, 'SDP outer\nSTP\nouter: SDP inner\nPWR\ninner: PWR');
    machine.AP = 9;
    machine.isFastRunning = fast;
    let maximumDepth = 0;
    let phasesRemaining = 100;

    while (machine.codeCompiled && phasesRemaining > 0) {
      machine.executeLine();
      maximumDepth = Math.max(maximumDepth, machine.stack.length);
      assert.equal(machine.AP, 9);
      phasesRemaining--;
    }

    assert.equal(machine.codeCompiled, false);
    assert.equal(maximumDepth, 2);
    assert.deepEqual([...machine.stack], []);
    assert.equal(machine.WS, 0);
    assert.equal(machine.mem[15], 1);
    assert.equal(machine.mem[14], 3);
    assert.equal(machine.programCounter, 2);
    assert.equal(
      machine.logs.some((log: any) => log.class === 'error' || log.class === 'warning'),
      false
    );
  }
});

test('data push metadata appears only after memory write and pop preserves memory contents', (context) => {
  const { machine } = fixture(context);

  for (const fast of [false, true]) {
    machine.resetValues();
    machine.isFastRunning = fast;
    machine.ACC = 7;

    for (const phase of ['dws', 'wyws wea wyak wes']) {
      machine.nextLine = new Set(phase.split(' '));
      machine.executeSignalsFromNextLine();
      assert.equal(machine.stack.length, 0);
    }

    machine.nextLine = new Set(['pisz', 'wyl', 'wea']);
    machine.executeSignalsFromNextLine();
    assert.deepEqual([...machine.stack], [{ type: 'Data', value: 7 }]);
    assert.equal(machine.mem[15], 7);

    // Pop uses the actual memory value, even if the metadata snapshot is stale.
    machine.mem[15] = 11;
    machine.nextLine = new Set(['wyws', 'wea', 'iws']);
    machine.executeSignalsFromNextLine();
    machine.nextLine = new Set(['czyt', 'wys', 'weja', 'przep', 'weak', 'wyl', 'wea']);
    machine.executeSignalsFromNextLine();

    assert.equal(machine.ACC, 11);
    assert.equal(machine.stack.length, 0);
    assert.equal(machine.WS, 0);
    assert.equal(machine.mem[15], 11);
  }
});

test('QA09: PZS and PWR preserve popped memory in both execution modes', (context) => {
  const { machine } = fixture(context);

  for (const [source, retainedValue] of [
    ['DNS\nPOB other\nPZS\nSTP\nother: RST 11', 7],
    ['SDP proc\nSTP\nproc: PWR', 1],
  ] as const) {
    for (const fast of [false, true]) {
      machine.resetValues();
      loadProgram(machine, source);
      machine.ACC = 7;
      machine.isFastRunning = fast;
      const expectedMemory = [...machine.mem];
      expectedMemory[15] = retainedValue;

      let stepsLeft = 30;
      while (machine.codeCompiled && stepsLeft-- > 0) machine.executeLine();

      assert.equal(machine.codeCompiled, false, 'the program should terminate');
      assert.equal(machine.ACC, 7);
      assert.equal(machine.WS, 0);
      assert.deepEqual([...machine.stack], []);
      assert.deepEqual([...machine.mem], expectedMemory, 'only the push should write to memory');
      const clearedMessage = machine.t('logs.memoryClearedFromStack', { idx: 15 });
      assert.equal(
        machine.logs.some((log: any) => log.message.startsWith(clearedMessage)),
        false
      );
    }
  }
});

test('QA16: werb reads the full data bus independently of AK in both execution modes', (context) => {
  const { machine } = fixture(context);

  for (const fast of [false, true]) {
    for (const value of [65, 0, 1023]) {
      machine.resetValues();
      machine.isFastRunning = fast;
      machine.ACC = 7;
      machine.BusS = value;
      machine.werb();

      assert.equal(machine.RB, value);
      assert.equal(machine.DEV_OUT, value);
      assert.equal(machine.ACC, 7);
      assert.equal(machine.BusS, value);
      assert.equal(machine.signals.busS, !fast);
    }
  }
});

test('QA16: WYP and WYP2 output the original accumulator value in both execution modes', (context) => {
  const { machine } = fixture(context);

  for (const fast of [false, true]) {
    for (const instruction of ['WYP', 'WYP2']) {
      machine.resetValues();
      loadProgram(machine, `${instruction} 0\nSTP`);
      machine.ACC = 65;
      machine.isFastRunning = fast;
      machine.executeLine();
      machine.executeLine();

      assert.equal(machine.ACC, instruction === 'WYP2' ? 0 : 65);
      assert.equal(machine.BusS, 65);
      assert.equal(machine.RB, 65);
      assert.equal(machine.DEV_OUT, 65);
    }
  }
});

test('device completion survives subsequent phases and signal clearing', (context) => {
  context.mock.timers.enable({ apis: ['setTimeout'] });
  const { machine } = fixture(context);
  machine.oddDelay = 10;
  machine.DEV_IN = 65;
  machine.start();
  assert.equal(machine.DEV_BUSY, true);
  const deviceTimer = machine.deviceOperationTimer;

  machine.nextLine = new Set(['iak']);
  machine.executeSignalsFromNextLine();
  assert.equal(machine.DEV_BUSY, true);
  assert.equal(machine.deviceOperationTimer, deviceTimer);
  machine.start();
  assert.equal(machine.deviceOperationTimer, deviceTimer);

  context.mock.timers.tick(20);
  assert.equal(machine.DEV_BUSY, false);
  assert.equal(machine.deviceOperationTimer, null);
  assert.equal(machine.DEV_READY, 0);
  assert.equal(machine.G, 0);

  machine.wyrb();
  assert.equal(machine.BusS, 65);
  assert.equal(machine.DEV_IN, 0);
  assert.equal(machine.DEV_READY, 1);
});

test('stop cancels device completion and fast device operations create no timers', (context) => {
  context.mock.timers.enable({ apis: ['setTimeout'] });
  const { machine } = fixture(context);
  machine.oddDelay = 10;
  machine.start();
  machine.stopRun();
  assert.equal(machine.DEV_BUSY, false);
  assert.equal(machine.deviceOperationTimer, null);
  machine.DEV_IN = 65;
  context.mock.timers.tick(100);
  assert.equal(machine.DEV_READY, 1, 'cancelled completion must not observe later input');

  machine.isFastRunning = true;
  machine.start();
  assert.equal(machine.DEV_BUSY, false);
  assert.equal(machine.DEV_READY, 0);
  assert.equal(machine.deviceOperationTimer, null);
  assert.equal(machine.activeTimeouts.length, 0);
});

test('pausing preserves stack preparation but replacing a program discards it', (context) => {
  const { machine } = fixture(context);
  machine.ACC = 7;
  machine.nextLine = new Set(['dws']);
  machine.executeSignalsFromNextLine();
  machine.nextLine = new Set(['wyws', 'wea', 'wyak', 'wes']);
  machine.executeSignalsFromNextLine();
  machine.stopRun();
  assert.deepEqual(machine._pendingStackWrite, { address: 15, type: 'Data' });

  machine.nextLine = new Set(['pisz']);
  machine.executeSignalsFromNextLine();
  assert.equal(machine.stack.length, 1);

  machine.nextLine = new Set(['iws']);
  machine.executeSignalsFromNextLine();
  assert.equal(machine._pendingStackRead, 15);

  machine.handleProgramSectionCompile('czyt wys weja weak');
  machine.executeLine();
  assert.equal(machine.mem[15], 7);
  assert.equal(machine.stack.length, 1);
  assert.equal(machine._pendingStackRead, null);

  machine.nextLine = new Set(['wyws', 'wea', 'wyak', 'wes']);
  machine.executeSignalsFromNextLine();
  assert.notEqual(machine._pendingStackWrite, null);
  machine.handleProgramSectionCompile('pisz');
  machine.executeLine();
  assert.equal(machine.stack.length, 1);
  assert.equal(machine._pendingStackWrite, null);
});

test('stack metadata follows the actual memory write when a phase also reads memory', (context) => {
  const { machine } = fixture(context);

  for (const fast of [false, true]) {
    machine.resetValues();
    machine.isFastRunning = fast;
    machine.ACC = 7;
    machine.nextLine = new Set(['dws']);
    machine.executeSignalsFromNextLine();
    machine.nextLine = new Set(['wyws', 'wea', 'wyak', 'wes']);
    machine.executeSignalsFromNextLine();

    machine.mem[15] = 11;
    machine.nextLine = new Set(['czyt', 'pisz']);
    machine.executeSignalsFromNextLine();

    assert.equal(machine.mem[15], 11);
    assert.deepEqual([...machine.stack], [{ type: 'Data', value: 11 }]);
  }
});

test('memory, bus, ALU and device phases produce the same state in both execution modes', (context) => {
  const { machine } = fixture(context);
  const snapshots: unknown[] = [];

  for (const fast of [false, true]) {
    machine.resetValues();
    machine.isFastRunning = fast;
    machine.ACC = 7;
    machine.mem[0] = 5;
    machine.DEV_IN = 65;
    machine.DEV_READY = 0;

    for (const phase of ['czyt wys weja dod weak', 'wyak wes pisz', 'wyrb weja przep weak', 'wyak wes', 'pisz']) {
      machine.nextLine = new Set(phase.split(' '));
      machine.executeSignalsFromNextLine();
    }

    snapshots.push({
      accumulator: machine.ACC,
      alu: machine.JAML,
      storage: machine.S,
      bus: machine.BusS,
      memory: [...machine.mem],
      input: machine.DEV_IN,
      ready: machine.DEV_READY,
      deviceRegister: machine.RB,
    });
  }

  assert.deepEqual(snapshots[0], snapshots[1]);
  assert.equal(machine.ACC, 65);
  assert.equal(machine.mem[0], 65);
});

test('assembler STOP terminates before following instructions in both modes', (context) => {
  const { machine } = fixture(context);

  for (const fast of [false, true]) {
    machine.resetValues();
    loadProgram(machine, 'STP\nDOD value\nvalue: RST 7');
    machine.isFastRunning = fast;
    machine.executeLine();
    assert.equal(machine.codeCompiled, false);
    assert.equal(machine.ACC, 0);
    assert.equal(machine.programCounter, 1);
  }
});

test('log IDs remain stable when repeated messages coalesce and distinct entries share a timestamp', (context) => {
  const { machine } = fixture(context);
  const initialLength = machine.logs.length;

  machine.addLog('Repeated log');
  const firstId = machine.logs.at(-1).id;
  machine.addLog('Repeated log');
  assert.equal(machine.logs.length, initialLength + 1);
  assert.equal(machine.logs.at(-1).id, firstId);

  machine.addLog('Different log');
  const secondId = machine.logs.at(-1).id;
  machine.logs.at(-1).timestamp = machine.logs.at(-2).timestamp;
  assert.notEqual(secondId, firstId);
  assert.equal(machine.logs.at(-2).id, firstId);
});

test('instruction register retains the opcode while wyad outputs only the address', (context) => {
  const { machine } = fixture(context);
  machine.codeBits = 4;
  machine.addresBits = 6;
  for (const fast of [false, true]) {
    machine.isFastRunning = fast;
    machine.BusS = 3 * 64 + 17;
    machine.wei();
    assert.equal(machine.I, 209);
    machine.wyad();
    assert.equal(machine.BusA, 17);
  }
  assert.equal(machine.getMaxValueForRegister('I'), 1023);
  assert.equal(machine.getMaxValueForRegister('S'), 1023);
  assert.equal(machine.getMaxValueForRegister('A'), 63);
});

test('QA22: changing code and address widths truncates live registers and memory', (context) => {
  const { machine } = fixture(context, true);
  const words = ['ACC', 'I', 'S', 'X', 'Y', 'RB', 'G', 'JAML', 'BusS', 'DEV_IN', 'DEV_OUT'];
  const addresses = ['programCounter', 'A', 'AP', 'WS', 'BusA'];
  for (const field of words) machine[field] = 1023;
  for (const field of addresses) machine[field] = 15;
  machine.RZ = 15;
  machine.RM = 10;
  machine.RP = 8;
  machine.mem[8] = 1023;

  machine.codeBits = 3;
  for (const field of words) assert.equal(machine[field], 127, field);
  for (const field of addresses) assert.equal(machine[field], 15, field);
  assert.equal(machine.mem[8], 127);

  machine.addresBits = 2;
  for (const field of words) assert.equal(machine[field], 31, field);
  for (const field of addresses) assert.equal(machine[field], 3, field);
  assert.equal(machine.mem.length, 4);
  assert.ok(machine.mem.every((value: number) => value >= 0 && value <= 31));
  assert.equal(machine.RZ, 15);
  assert.equal(machine.RM, 10);
  assert.equal(machine.RP, 8);
});

test('QA22: width changes normalize state before starting the store', (context) => {
  const { machine } = fixture(context);
  machine.ACC = 1023;
  machine.programCounter = 15;
  machine.mem[0] = 1023;
  machine.codeBits = 3;
  assert.equal(machine.ACC, 127);
  assert.equal(machine.mem[0], 127);
  machine.addresBits = 2;
  assert.equal(machine.ACC, 31);
  assert.equal(machine.programCounter, 3);
  assert.equal(machine.mem.length, 4);
});

test('QA22: restored small widths and 30-bit boundaries retain valid machine values', (context) => {
  const { store, machine, saved } = fixture(context);
  saved.set('W', JSON.stringify({ codeBits: 1, addresBits: 2 }));
  machine.ACC = 1023;
  machine.RZ = 15;
  machine.RM = 10;
  machine.RP = 8;
  store.start();
  assert.deepEqual([...machine.mem], [1, 2, 4, 0]);
  assert.equal(machine.ACC, 7);
  assert.equal(machine.RZ, 15);
  assert.equal(machine.RM, 10);
  assert.equal(machine.RP, 8);

  machine.ACC = 7;
  machine.codeBits = 16;
  machine.addresBits = 14;
  assert.equal(machine.ACC, 7, 'increasing widths must preserve existing register values');
  machine.ACC = 2 ** 30 - 1;
  machine.BusS = 2 ** 30 - 1;
  machine.mem[8] = 2 ** 30 - 1;
  machine.programCounter = 2 ** 14 - 1;
  machine.codeBits = 15;
  assert.equal(machine.ACC, 2 ** 29 - 1);
  assert.equal(machine.BusS, 2 ** 29 - 1);
  assert.equal(machine.mem[8], 2 ** 29 - 1);
  machine.addresBits = 13;
  assert.equal(machine.ACC, 2 ** 28 - 1);
  assert.equal(machine.programCounter, 2 ** 13 - 1);
});

test('QA06: L wraps at the configured address width in both execution modes', (context) => {
  const { machine } = fixture(context);
  for (const bits of [1, 4, 6, 16]) {
    machine.addresBits = bits;
    const maximum = 2 ** bits - 1;
    for (const fast of [false, true]) {
      machine.isFastRunning = fast;
      machine.programCounter = maximum;
      machine.il();
      assert.equal(machine.programCounter, 0);
      machine.dl();
      assert.equal(machine.programCounter, maximum);
    }
  }
});

test('QA06: address transfers truncate wide values while preserving the data bus', (context) => {
  const { machine } = fixture(context);
  for (const bits of [1, 4, 6, 16]) {
    machine.addresBits = bits;
    const maximum = 2 ** bits - 1;
    for (const fast of [false, true]) {
      machine.isFastRunning = fast;
      for (const [value, expected] of [
        [machine.wordMask(), maximum],
        [2 ** bits + 1, 1],
      ]) {
        machine.BusA = value;
        machine.wel();
        assert.equal(machine.programCounter, expected);
        machine.programCounter = value;
        machine.wyl();
        assert.equal(machine.BusA, expected);
        machine.ACC = value;
        machine.nextLine = new Set(['wyak', 'sa', 'wel']);
        machine.executeSignalsFromNextLine();
        assert.equal(machine.BusS, value);
        assert.equal(machine.BusA, expected);
        assert.equal(machine.programCounter, expected);
      }
    }
  }
});

async function waitForStop(machine: any) {
  const deadline = Date.now() + 1500;
  while (machine.isRunning && Date.now() < deadline) await delay(5);
  assert.equal(machine.isRunning, false, 'execution should terminate');
}

test('manual signals preserve memory, bus and arithmetic execution order', (context) => {
  const { machine } = fixture(context);
  machine.ACC = 7;
  machine.mem[0] = 5;
  machine.nextLine = new Set(['czyt', 'wys', 'weja', 'dod', 'weak']);
  machine.executeLine();
  assert.equal(machine.S, 5);
  assert.equal(machine.BusS, 5);
  assert.equal(machine.JAML, 12);
  assert.equal(machine.ACC, 12);
  assert.equal(machine.nextLine.size, 0);
  assert.equal(machine.signals.weak, true);
});

test('plain microcode advances beyond its first phase and finishes in timed mode', async (context) => {
  const { machine } = fixture(context);
  machine.manualMode = false;
  machine.oddDelay = 1;
  machine.code = 'iak; iak; iak;';
  machine.compileCode();
  assert.equal(machine.ACC, 1);
  assert.equal(machine.activeLine, 1);
  machine.runCode();
  await waitForStop(machine);
  assert.equal(machine.ACC, 3);
  assert.equal(machine.codeCompiled, false);
});

test('fast execution pauses at a breakpoint and resumes the pending phase once', async (context) => {
  const { machine } = fixture(context);
  machine.handleProgramSectionCompile({
    text: 'iak;\niak;\niak;',
    program: [
      {
        phases: [
          { iak: true, srcLine: 0 },
          { iak: true, srcLine: 1 },
          { iak: true, srcLine: 2 },
        ],
      },
    ],
  });
  machine.breakpoints.add(1);
  await machine.runToEndFast();
  assert.equal(machine.ACC, 1);
  assert.equal(machine.codeCompiled, true);
  assert.equal(machine.activePhaseIndex, 1);
  assert.equal(machine.isRunning, false);
  assert.equal(document.title, 'Maszyna W');
  await machine.runToEndFast();
  assert.equal(machine.ACC, 3);
  assert.equal(machine.codeCompiled, false);
});

test('stopping an async fast chunk cannot cancel a newly started timed run', async (context) => {
  const { machine } = fixture(context);
  machine.oddDelay = 100;
  machine.handleProgramSectionCompile({ text: 'iak wel;', program: [{ phases: [{ iak: true, wel: true, srcLine: 0 }] }] });
  const fastRun = machine.runToEndFast();
  assert.equal(machine.isFastRunning, true);
  machine.stopRun();
  const stoppedValue = machine.ACC;
  machine.runCode();
  await fastRun;
  assert.equal(machine.isRunning, true);
  assert.equal(machine.isFastRunning, false);
  assert.equal(machine.ACC, stoppedValue);
  machine.stopRun();
});

test('STOP terminates plain fast microcode without executing following phases', async (context) => {
  const { machine } = fixture(context);
  machine.handleProgramSectionCompile('iak\nstop\niak');
  await machine.runToEndFast();
  assert.equal(machine.ACC, 1);
  assert.equal(machine.codeCompiled, false);
  assert.equal(machine.isRunning, false);
  assert.equal(machine.activeTimeouts.length, 0);
});

test('reset cancels an active runner and clears interrupt inputs', async (context) => {
  const { machine } = fixture(context);
  machine.oddDelay = 1;
  machine.handleProgramSectionCompile('iak\niak\niak');
  machine.RZ = 3;
  machine.runCode();
  machine.resetValues();
  await delay(10);
  assert.equal(machine.ACC, 0);
  assert.equal(machine.isRunning, false);
  assert.equal(machine.RZ, 0);
});

test('continuous eni accepts IRQs on later ticks in manual, plain and structured execution', (context) => {
  const { machine } = fixture(context);

  for (const fast of [false, true]) {
    for (const mode of ['manual', 'plain', 'structured']) {
      for (const enabled of [false, true]) {
        machine.resetValues();
        machine.uncompileCode();
        machine.manualMode = mode === 'manual';
        if (mode === 'plain') machine.handleProgramSectionCompile('iak\niak');
        if (mode === 'structured') {
          machine.handleProgramSectionCompile({ text: 'iak;\niak;', program: [{ phases: [{ iak: true }, { iak: true }] }] });
        }
        machine.extras.interrupts.eniAlwaysEnabled = enabled;
        machine.extras.interrupts.eniSignal = false;
        machine.isFastRunning = fast;

        for (let tick = 0; tick < 2; tick++) {
          if (tick === 1) machine.RZ = 1;
          if (mode === 'manual') machine.nextLine = new Set(['iak']);
          machine.executeLine();
        }

        assert.equal(machine.ACC, 2);
        assert.equal(machine.RP, enabled ? 1 : 0, `${mode}, enabled=${enabled}, fast=${fast}`);
        assert.equal(machine.AP, enabled ? 1 : 0);
        assert.equal(machine.RZ, 1);
      }
    }
  }
});

test('continuous eni respects masks, priorities, an accepted IRQ and disabling the option', (context) => {
  const { machine } = fixture(context);

  for (const fast of [false, true]) {
    machine.resetValues();
    machine.extras.interrupts.eniAlwaysEnabled = true;
    machine.isFastRunning = fast;
    machine.RZ = 15;
    machine.RM = 5;
    machine.executeLine();
    assert.equal(machine.RP, 2);
    assert.equal(machine.AP, 2);
    assert.equal(machine.RZ, 15);

    machine.RM = 0;
    machine.executeLine();
    assert.equal(machine.RP, 2, 'an accepted IRQ must remain selected until rint');

    machine.nextLine = new Set(['rint']);
    machine.executeLine();
    assert.equal(machine.RP, 0);
    assert.equal(machine.RZ, 13);

    machine.executeLine();
    assert.equal(machine.RP, 1);
    assert.equal(machine.RZ, 13);

    machine.extras.interrupts.eniAlwaysEnabled = false;
    machine.rint();
    machine.executeLine();
    assert.equal(machine.RP, 0);
    assert.equal(machine.AP, 0);
    assert.equal(machine.RZ, 12);
  }
});

test('continuous eni defaults off, persists and restores without enabling it for old preferences', (context) => {
  const { machine, saved } = fixture(context);
  assert.equal(machine.extras.interrupts.eniAlwaysEnabled, false);

  saved.set('W', JSON.stringify({ extras: { interrupts: { eniSignal: true } } }));
  machine.loadFromLS();
  assert.equal(machine.extras.interrupts.eniAlwaysEnabled, false);

  machine.extras.interrupts.eniAlwaysEnabled = true;
  machine.saveToLS();
  assert.equal(JSON.parse(saved.get('W')!).extras.interrupts.eniAlwaysEnabled, true);
  machine.extras = machine.getDefaultExtras();
  machine.loadFromLS();
  assert.equal(machine.extras.interrupts.eniAlwaysEnabled, true);

  machine.restoreDefaults();
  assert.equal(machine.extras.interrupts.eniAlwaysEnabled, false);
});

test('QA15: showing eni does not accept interrupts in a program without that signal', (context) => {
  const { machine } = fixture(context);

  for (const fast of [false, true]) {
    for (const visible of [false, true]) {
      machine.resetValues();
      loadProgram(machine, 'DOD value\nSTP\nvalue: RST 1');
      machine.extras.interrupts.eniSignal = visible;
      machine.RZ = 1;
      machine.isFastRunning = fast;
      const memory = [...machine.mem];

      machine.executeLine();
      assert.equal(machine.I, 18);
      assert.equal(machine.programCounter, 1);
      assert.equal(machine.RP, 0);
      assert.equal(machine.AP, 0);
      assert.equal(machine.RZ, 1);
      assert.equal(machine.WS, 0);
      assert.deepEqual([...machine.stack], []);
      assert.deepEqual([...machine.mem], memory);

      let stepsLeft = 20;
      while (machine.codeCompiled && stepsLeft-- > 0) machine.executeLine();
      assert.equal(machine.codeCompiled, false);
      assert.equal(machine.ACC, 1);
      assert.equal(machine.RP, 0);
      assert.equal(machine.RZ, 1);
    }
  }
});

test('QA15: a program accepts and resets IRQs only in phases containing eni and rint', (context) => {
  const { machine } = fixture(context);

  for (const fast of [false, true]) {
    machine.resetValues();
    machine.handleProgramSectionCompile({
      text: 'iak;\neni;\nrint;',
      program: [{ phases: [{ iak: true }, { eni: true }, { rint: true }] }],
    });
    machine.extras.interrupts.eniSignal = true;
    machine.RZ = 1;
    machine.isFastRunning = fast;

    machine.executeLine();
    assert.equal(machine.ACC, 1);
    assert.equal(machine.RP, 0);
    assert.equal(machine.RZ, 1);

    machine.executeLine();
    assert.equal(machine.RP, 1);
    assert.equal(machine.AP, 1);
    assert.equal(machine.RZ, 1);

    machine.executeLine();
    assert.equal(machine.RP, 0);
    assert.equal(machine.AP, 0);
    assert.equal(machine.RZ, 0);
  }
});

test('QA14: eni uses the configured handler address for each IRQ, including address zero', (context) => {
  const { machine } = fixture(context);
  machine.interruptVectors = [0, 15, 12, 0];

  for (const fast of [false, true]) {
    for (const [index, address] of machine.interruptVectors.entries()) {
      machine.resetValues();
      machine.isFastRunning = fast;
      machine.RZ = 1 << index;
      machine.eni();
      assert.equal(machine.AP, address);
      assert.equal(machine.RP, 1 << index);
      assert.equal(machine.RZ, 1 << index);
    }
  }
});

test('QA14: program phases accept IRQ3 and jump only when microcode transfers AP', (context) => {
  const { machine } = fixture(context);
  machine.interruptVectors = [1, 2, 12, 4];

  for (const fast of [false, true]) {
    machine.resetValues();
    machine.isFastRunning = fast;
    const program = Array.from({ length: 16 }, () => ({ phases: [{ stop: true }] }));
    machine.handleProgramSectionCompile({
      text: 'eni;\nwyap wel wea rint;',
      program: [{ phases: [{ eni: true }, { wyap: true, wel: true, wea: true, rint: true }] }, ...program.slice(1)],
    });
    machine.programCounter = 7;
    machine.A = 6;
    machine.WS = 9;
    machine.RZ = 12;
    const memory = [...machine.mem];

    machine.executeLine();
    assert.equal(machine.RP, 4);
    assert.equal(machine.AP, 12);
    assert.equal(machine.RZ, 12);
    assert.equal(machine.programCounter, 7);
    assert.equal(machine.A, 6);
    assert.equal(machine.WS, 9);
    assert.deepEqual([...machine.stack], []);
    assert.deepEqual([...machine.mem], memory);

    machine.executeLine();
    assert.equal(machine.programCounter, 12);
    assert.equal(machine.A, 12);
    assert.equal(machine.RP, 0);
    assert.equal(machine.AP, 0);
    assert.equal(machine.RZ, 8, 'rint clears IRQ3 while preserving IRQ4');
    assert.equal(machine.WS, 9);
    assert.deepEqual([...machine.stack], []);
    assert.deepEqual([...machine.mem], memory);

    machine.executeLine();
    assert.equal(machine.codeCompiled, false);
  }
});

test('QA14: handler addresses persist, survive register resets and restore defaults for legacy preferences', (context) => {
  const { machine, saved } = fixture(context);
  assert.deepEqual([...machine.interruptVectors], [1, 2, 3, 4]);
  saved.set('W', JSON.stringify({ extras: { interrupts: { eniSignal: true } } }));
  machine.loadFromLS();
  assert.deepEqual([...machine.interruptVectors], [1, 2, 3, 4]);

  machine.interruptVectors = [0, 15, 12, 7];
  machine.resetValues();
  assert.deepEqual([...machine.interruptVectors], [0, 15, 12, 7]);
  machine.saveToLS();
  assert.deepEqual(JSON.parse(saved.get('W')!).interruptVectors, [0, 15, 12, 7]);
  machine.interruptVectors = [1, 2, 3, 4];
  machine.loadFromLS();
  assert.deepEqual([...machine.interruptVectors], [0, 15, 12, 7]);
  machine.restoreDefaults();
  assert.deepEqual([...machine.interruptVectors], [1, 2, 3, 4]);
});

test('QA14: malformed saved handler addresses cannot replace valid defaults', (context) => {
  const { machine, saved } = fixture(context);
  for (const invalid of [null, '12', {}, [1, 2, 3], [1, 2, 3, 4, 5], [-1, 2.5, '12', 65536]]) {
    saved.set('W', JSON.stringify({ interruptVectors: invalid }));
    machine.loadFromLS();
    assert.deepEqual([...machine.interruptVectors], [1, 2, 3, 4]);
  }
  saved.set('W', JSON.stringify({ interruptVectors: [0, null, 12, {}] }));
  machine.loadFromLS();
  assert.deepEqual([...machine.interruptVectors], [0, 2, 12, 4]);
});

test('QA14: address-width changes and preference restoration keep handlers within memory', (context) => {
  const { machine, saved } = fixture(context);
  machine.interruptVectors = [0, 5, 12, 15];
  machine.addresBits = 2;
  assert.deepEqual([...machine.interruptVectors], [0, 1, 0, 3]);
  machine.RZ = 8;
  machine.eni();
  assert.equal(machine.AP, 3);

  saved.set('W', JSON.stringify({ addresBits: 3, interruptVectors: [0, 9, 12, 15] }));
  machine.loadFromLS();
  assert.deepEqual([...machine.interruptVectors], [0, 1, 4, 7]);
});

test('QA13: IRQ1 has the highest priority and masked requests are skipped', (context) => {
  const { machine } = fixture(context);

  for (const [requests, mask, expected] of [
    [15, 0, 1],
    [15, 1, 2],
    [15, 3, 3],
    [15, 7, 4],
    [15, 15, null],
    [0, 0, null],
    [15, 5, 2],
    [12, 0, 3],
    [10, 0, 2],
    [9, 0, 1],
    [8, 0, 4],
  ] as const) {
    machine.RZ = requests;
    machine.RM = mask;
    assert.equal(machine.highestPriorityIRQ, expected, `RZ=${requests}, RM=${mask}`);
  }
});

test('QA13: eni and rint process pending IRQs in priority order in both modes', (context) => {
  const { machine } = fixture(context);

  for (const fast of [false, true]) {
    for (const [mask, accepted] of [
      [
        0,
        [
          [1, 1],
          [2, 2],
          [3, 4],
          [4, 8],
        ],
      ],
      [
        5,
        [
          [2, 2],
          [4, 8],
        ],
      ],
    ] as const) {
      machine.resetValues();
      machine.isFastRunning = fast;
      machine.RZ = 15;
      machine.RM = mask;

      for (const [irq, bit] of accepted) {
        const pending = machine.RZ;
        machine.nextLine = new Set(['eni']);
        machine.executeLine();
        assert.equal(machine.RP, bit);
        assert.equal(machine.AP, irq);
        assert.equal(machine.RZ, pending);
        assert.equal(machine.RM, mask);

        machine.nextLine = new Set(['rint']);
        machine.executeLine();
        assert.equal(machine.RP, 0);
        assert.equal(machine.RZ, pending - bit);
      }

      assert.equal(machine.RZ, mask, 'masked requests remain pending');
      assert.equal(machine.highestPriorityIRQ, null);
    }
  }
});

test('QA12: manual eni accepts each unmasked IRQ without jumping or writing to the stack', (context) => {
  const { machine } = fixture(context);

  for (const fast of [false, true]) {
    for (const [irq, bit] of [
      [1, 1],
      [2, 2],
      [3, 4],
      [4, 8],
    ]) {
      machine.resetValues();
      machine.isFastRunning = fast;
      machine.RZ = bit;
      machine.programCounter = 11;
      machine.A = 6;
      machine.WS = 9;
      const memory = [...machine.mem];

      machine.handleSignalToggle('eni');
      assert.equal(machine.RP, 0, 'selecting eni must not accept an interrupt before the tick');
      machine.executeLine();

      assert.equal(machine.RP, bit);
      assert.equal(machine.AP, irq);
      assert.equal(machine.RZ, bit, 'the accepted request remains pending until rint');
      assert.equal(machine.RM, 0);
      assert.equal(machine.programCounter, 11);
      assert.equal(machine.A, 6);
      assert.equal(machine.WS, 9);
      assert.deepEqual([...machine.stack], []);
      assert.deepEqual([...machine.mem], memory);
    }
  }
});

test('QA12: eni leaves absent, masked and already accepted interrupts untouched', (context) => {
  const { machine } = fixture(context);

  for (const fast of [false, true]) {
    for (const [requests, mask, accepted, address] of [
      [0, 0, 0, 0],
      [5, 5, 0, 0],
      [4, 0, 2, 9],
    ]) {
      machine.resetValues();
      machine.isFastRunning = fast;
      machine.RZ = requests;
      machine.RM = mask;
      machine.RP = accepted;
      machine.AP = address;
      machine.nextLine = new Set(['eni']);
      machine.executeLine();

      assert.equal(machine.RZ, requests);
      assert.equal(machine.RM, mask);
      assert.equal(machine.RP, accepted);
      assert.equal(machine.AP, address);
    }
  }
});

test('QA12: manual rint clears only the accepted request and preserves masks in both modes', (context) => {
  const { machine } = fixture(context);

  for (const fast of [false, true]) {
    for (const [bit, remaining] of [
      [1, 14],
      [2, 13],
      [4, 11],
      [8, 7],
    ]) {
      machine.resetValues();
      machine.isFastRunning = fast;
      machine.RZ = 15;
      machine.RM = 15;
      machine.RP = bit;
      machine.AP = 10;
      machine.programCounter = 11;
      machine.WS = 9;
      const memory = [...machine.mem];

      machine.handleSignalToggle('rint');
      machine.executeLine();

      assert.equal(machine.RP, 0);
      assert.equal(machine.AP, 0);
      assert.equal(machine.RZ, remaining);
      assert.equal(machine.RM, 15);
      assert.equal(machine.programCounter, 11);
      assert.equal(machine.WS, 9);
      assert.deepEqual([...machine.stack], []);
      assert.deepEqual([...machine.mem], memory);

      machine.rint();
      assert.equal(machine.RZ, remaining, 'resetting again must preserve all remaining requests');
    }
  }
});

test('QA12: a jump consumes AP before rint resets it in the same phase', (context) => {
  const { machine } = fixture(context);

  for (const fast of [false, true]) {
    machine.resetValues();
    machine.isFastRunning = fast;
    machine.RZ = 5;
    machine.RP = 4;
    machine.AP = 12;
    machine.nextLine = new Set(['rint', 'wea', 'wel', 'wyap']);
    machine.executeLine();

    assert.equal(machine.programCounter, 12);
    assert.equal(machine.A, 12);
    assert.equal(machine.AP, 0);
    assert.equal(machine.RP, 0);
    assert.equal(machine.RZ, 1);

    machine.nextLine = new Set(['eni']);
    machine.executeLine();
    assert.equal(machine.RP, 1);
    assert.equal(machine.AP, 1);
    assert.equal(machine.RZ, 1);
  }
});

test('QA11: RM transfers use the address bus and retain four-bit masks in both modes', (context) => {
  const { machine } = fixture(context);

  for (const fast of [false, true]) {
    for (const value of [5, 0, 15, 0x1b]) {
      machine.resetValues();
      machine.isFastRunning = fast;
      machine.BusA = value;
      machine.BusS = 10;
      machine.werm();
      assert.equal(machine.RM, value & 0x0f);
      assert.equal(machine.BusA, value);
      assert.equal(machine.BusS, 10);
      assert.ok(machine.logs.at(-1).message.endsWith(`[BusA=${value}]`));

      machine.BusA = 0;
      machine.RM = value;
      machine.wyrm();
      assert.equal(machine.BusA, value & 0x0f);
      assert.equal(machine.BusS, 10);
      assert.equal(machine.RM, value);
      assert.equal(machine.signals.busA, !fast);
      assert.equal(machine.signals.busS, false);
    }
  }
});

test('QA11: a phase transfers I to RM and RM to A independently of the data bus', (context) => {
  const { machine } = fixture(context);

  for (const fast of [false, true]) {
    machine.resetValues();
    machine.isFastRunning = fast;
    machine.I = 5;
    machine.ACC = 10;
    machine.nextLine = new Set(['wyad', 'wyak', 'werm']);
    machine.executeSignalsFromNextLine();
    assert.equal(machine.RM, 5);
    assert.equal(machine.BusA, 5);
    assert.equal(machine.BusS, 10);

    machine.BusA = 0;
    machine.nextLine = new Set(['wyrm', 'wea']);
    machine.executeSignalsFromNextLine();
    assert.equal(machine.A, 5);
    assert.equal(machine.BusA, 5);
    assert.equal(machine.BusS, 10);
  }
});

test('IRQ operations use framework-independent translations and no timers in fast mode', (context) => {
  const { machine } = fixture(context);
  machine.BusA = 11;
  machine.werm();
  assert.equal(machine.RM, 11);
  assert.ok(machine.logs.length > 0);
  machine.clearActiveTimeouts();
  machine.isFastRunning = true;
  machine.BusS = 7;
  machine.werz();
  machine.werp();
  machine.BusA = 2;
  machine.ustrm();
  assert.equal(machine.RZ, 7);
  assert.equal(machine.RP, 7);
  assert.equal(machine.RM, 15);
  assert.equal(machine.activeTimeouts.length, 0);
});

test('React store batches nested arrays and sets while persisting settings only', async (context) => {
  const { store, machine, saved } = fixture(context, true);
  await Promise.resolve();
  let revisions = 0;
  const unsubscribe = store.subscribe(() => revisions++);
  machine.mem[0] = 17;
  machine.breakpoints.add(4);
  machine.extras.io.rbRegister = true;
  machine.numberFormat = 'hex';
  await Promise.resolve();
  unsubscribe();
  assert.equal(revisions, 1);
  assert.equal(machine.mem[0], 17);
  assert.equal(machine.breakpoints.has(4), true);
  assert.ok(Object.values(machine.registerFormats).every((format) => format === 'hex'));
  const persisted = JSON.parse(saved.get('W')!);
  assert.equal(persisted.extras.io.rbRegister, true);
  assert.equal(persisted.numberFormat, 'hex');
  assert.equal(Object.hasOwn(persisted, 'mem'), false);
  assert.equal(Object.hasOwn(persisted, 'logs'), false);
});

test('conditional branch identity survives observable store updates', async (context) => {
  const { machine } = fixture(context, true);
  machine.handleProgramSectionCompile({
    text: 'IF Z\niak\niak',
    program: [
      {
        phases: [
          {
            conditional: true,
            flag: 'Z',
            srcLine: 0,
            truePhases: [
              { iak: true, srcLine: 1 },
              { iak: true, srcLine: 2 },
            ],
            falsePhases: [{ dak: true, srcLine: 3 }],
          },
        ],
      },
    ],
  });
  machine.executeLine();
  assert.equal(machine.ACC, 1);
  await Promise.resolve();
  machine.executeLine();
  assert.equal(machine.ACC, 2, 'the second true phase must run even after Z becomes false');
  assert.equal(machine.codeCompiled, false);
});

test('stale WebSocket events do not overwrite the replacement connection', (context) => {
  class Socket extends EventTarget {
    static OPEN = 1;
    readyState = 0;
    binaryType = '';
    sent: string[] = [];
    constructor(public url: string) {
      super();
    }
    send(value: string) {
      this.sent.push(value);
    }
    close() {
      this.readyState = 3;
    }
  }
  const previousSocket = globalThis.WebSocket;
  (globalThis as any).WebSocket = Socket;
  context.after(() => {
    globalThis.WebSocket = previousSocket;
  });
  const { machine } = fixture(context);
  machine.initWebsocket();
  const oldSocket = machine.ws as Socket;
  oldSocket.readyState = Socket.OPEN;
  oldSocket.dispatchEvent(new Event('open'));
  machine.initWebsocket();
  const newSocket = machine.ws as Socket;
  newSocket.readyState = Socket.OPEN;
  newSocket.dispatchEvent(new Event('open'));
  oldSocket.dispatchEvent(new Event('close'));
  assert.equal(machine.wsStatus, 'connected');
  assert.equal(machine.ws, newSocket);
  assert.notEqual(machine.wsPingTimer, null);
});
