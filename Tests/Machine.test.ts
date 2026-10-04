import assert from 'node:assert/strict';
import test, { type TestContext } from 'node:test';
import { createMachineStore } from '../src/State/CreateMachineStore';
import { prepareProgramCompilation } from '../src/Components/InstructionsEditor/Helpers/PrepareProgramCompilation';

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

test('division uses the full word and retains the zero-divisor policy in both modes', (context) => {
  const { machine } = fixture(context);

  for (const fast of [false, true]) {
    machine.isFastRunning = fast;
    machine.ACC = 512;
    machine.JAML = 256;
    machine.dziel();
    assert.equal(machine.JAML, 2);

    machine.JAML = 0;
    machine.dziel();
    assert.equal(machine.JAML, 0);
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
    assert.equal(machine.mem[15], 0);
    assert.equal(machine.mem[14], 0);
    assert.equal(machine.programCounter, 2);
    assert.equal(
      machine.logs.some((log: any) => log.class === 'error' || log.class === 'warning'),
      false
    );
  }
});

test('data push metadata appears only after memory write and pop restores memory contents', (context) => {
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
    assert.equal(machine.mem[15], 0);
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
  machine.RZInputs = [1, 1, 0, 0];
  machine.runCode();
  machine.resetValues();
  await delay(10);
  assert.equal(machine.ACC, 0);
  assert.equal(machine.isRunning, false);
  assert.deepEqual([...machine.RZInputs], [0, 0, 0, 0]);
});

test('IRQ operations use framework-independent translations and no timers in fast mode', (context) => {
  const { machine } = fixture(context);
  machine.BusS = 11;
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
