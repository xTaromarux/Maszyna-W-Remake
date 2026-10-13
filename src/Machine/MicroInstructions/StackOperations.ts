import type { Machine, StackKind } from '@/Machine/Types/Machine';
import type { MicroOperation } from './Types';

export const stackOperations = {
  wyws: (machine) => {
    machine.BusA = machine.WS & machine.addrMask();
  },

  iws: (machine) => {
    machine.WS = (machine.WS + 1) & machine.addrMask();
  },

  dws: (machine) => {
    machine.WS = (machine.WS - 1) & machine.addrMask();
  },

  wyls: (machine) => {
    machine.BusS = machine.toWord(machine.programCounter);
  },
} satisfies Record<string, MicroOperation>;

/** Memory is the source of stack values. Metadata follows completed writes and reads across phases. */
export const captureStackPhase = (machine: Machine) => {
  const signals = machine.nextLine;
  const memoryAddress = machine.A & machine.addrMask();
  const stackAddress = machine.WS & machine.addrMask();
  const pendingWrite = machine._pendingStackWrite;

  const writesStack = signals.has('pisz') && pendingWrite?.address === memoryAddress;
  const readsStack =
    signals.has('czyt') && (machine._pendingStackRead === memoryAddress || (signals.has('iws') && memoryAddress === stackAddress));

  let poppedType: StackKind | null = null;
  if (readsStack && signals.has('sa') && signals.has('wel')) {
    poppedType = 'Address';
  } else if (readsStack && signals.has('weja') && signals.has('weak')) {
    poppedType = 'Data';
  }

  return {
    memoryAddress,
    stackAddress,
    writtenType: writesStack ? pendingWrite.type : null,
    poppedType,
    preparesWrite: signals.has('wyws') && signals.has('wea') && signals.has('wes'),
    writesAddress: signals.has('wyls'),
    writesData: signals.has('wyak'),
    incrementsStack: signals.has('iws'),
    readsMemory: signals.has('czyt'),
    writesMemory: signals.has('pisz'),
  };
};

export const completeStackPhase = (machine: Machine, phase: ReturnType<typeof captureStackPhase>) => {
  if (phase.writesMemory) {
    machine._pendingStackWrite = null;

    if (phase.writtenType) {
      const writtenValue = machine.toWord(machine.mem[phase.memoryAddress] ?? 0);
      machine.stackPush(phase.writtenType, writtenValue);
    }
  }

  if (phase.incrementsStack) {
    machine._pendingStackRead = phase.stackAddress;
  }

  if (phase.readsMemory) {
    machine._pendingStackRead = null;
  }

  if (phase.poppedType) {
    machine.stackPop(phase.poppedType);
    machine.mem[phase.memoryAddress] = 0;
    machine.addLog(machine.t('logs.memoryClearedFromStack', { idx: phase.memoryAddress }), 'stack');
  }

  if (phase.preparesWrite && (phase.writesAddress || phase.writesData)) {
    machine._pendingStackWrite = {
      address: machine.A & machine.addrMask(),
      type: phase.writesAddress ? 'Address' : 'Data',
    };
  }
};
