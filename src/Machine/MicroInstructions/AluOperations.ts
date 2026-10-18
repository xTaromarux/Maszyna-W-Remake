import { toSigned } from '@/Shared/Utils/Numbers';
import type { MicroOperation } from './Types';

/** ALU results keep the existing JAML/weak pipeline; shifts operate on the accumulator. */
export const aluOperations = {
  iak: (machine) => {
    machine.ACC = machine.toWord(machine.ACC + 1);
  },

  dak: (machine) => {
    machine.ACC = machine.toWord(machine.ACC - 1);
  },

  dod: (machine) => {
    machine.JAML = machine.toWord(machine.JAML + machine.ACC);
  },

  ode: (machine) => {
    machine.JAML = machine.toWord(machine.ACC - machine.JAML);
  },

  przep: (machine) => {
    machine.ACC = machine.toWord(machine.JAML);
  },

  mno: (machine) => {
    machine.JAML = machine.toWord(Math.imul(machine.ACC, machine.JAML));
  },

  dziel: (machine) => {
    const wordBits = machine.codeBits + machine.addresBits;
    const divisor = toSigned(machine.JAML, wordBits);
    const dividend = toSigned(machine.ACC, wordBits);
    machine.JAML = divisor === 0 ? 0 : machine.toWord(Math.trunc(dividend / divisor));
  },

  shr: (machine) => {
    const shiftCount = machine.toWord(machine.JAML);
    const wordBits = machine.codeBits + machine.addresBits;
    machine.ACC = shiftCount >= wordBits ? 0 : machine.toWord(machine.toWord(machine.ACC) >>> shiftCount);
  },

  shl: (machine) => {
    const shiftCount = machine.toWord(machine.JAML);
    const wordBits = machine.codeBits + machine.addresBits;
    machine.ACC = shiftCount >= wordBits ? 0 : machine.toWord(machine.ACC << shiftCount);
  },

  neg: (machine) => {
    machine.ACC = machine.toWord(-machine.ACC);
  },

  lub: (machine) => {
    machine.ACC = machine.toWord(machine.ACC | machine.JAML);
  },

  i: (machine) => {
    machine.ACC = machine.toWord(machine.ACC & machine.JAML);
  },
} satisfies Record<string, MicroOperation>;
