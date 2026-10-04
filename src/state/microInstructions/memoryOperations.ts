import type { MicroOperation } from './types';

export const memoryOperations = {
  czyt: (machine) => {
    const address = machine.A & machine.addrMask();
    machine.S = machine.toWord(machine.mem[address] ?? 0);
  },

  pisz: (machine) => {
    const address = machine.A & machine.addrMask();
    machine.mem[address] = machine.toWord(machine.S);
  },
} satisfies Record<string, MicroOperation>;
