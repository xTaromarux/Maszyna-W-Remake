import type { MicroOperation } from './Types';

const INTERRUPT_MASK = 0x0f;
const INTERRUPT_INDEX_MASK = 0x03;

export const interruptOperations = {
  eni: (machine) => {
    if (machine.RP !== 0) return;
    const irq = machine.highestPriorityIRQ;
    if (irq === null) return;

    machine.RP = 1 << (irq - 1);
    machine.AP = machine.interruptVectors[irq - 1] & machine.addrMask();
  },

  rint: (machine) => {
    machine.RZ &= ~machine.RP;
    machine.RP = 0;
    machine.AP = 0;
  },

  werm: (machine) => {
    machine.RM = machine.BusA & INTERRUPT_MASK;
    machine.addLog(machine.t('logs.rmSet', { rm: machine.RM, busA: machine.BusA }), 'system');
  },

  wyrm: (machine) => {
    machine.BusA = machine.RM & INTERRUPT_MASK;
  },

  wyap: (machine) => {
    machine.BusA = machine.AP & machine.addrMask();
  },

  weap: (machine) => {
    machine.AP = machine.BusA & machine.addrMask();
  },

  wyrz: (machine) => {
    machine.BusS = machine.RZ & INTERRUPT_MASK;
  },

  werz: (machine) => {
    machine.RZ = machine.BusS & INTERRUPT_MASK;
    machine.addLog(machine.t('logs.rzSet', { rz: machine.RZ }), 'system');
  },

  wyrp: (machine) => {
    machine.BusS = machine.RP & INTERRUPT_MASK;
  },

  werp: (machine) => {
    machine.RP = machine.BusS & INTERRUPT_MASK;
    machine.addLog(machine.t('logs.rpSet', { rp: machine.RP }), 'system');
  },

  ustrm: (machine) => {
    const interruptIndex = machine.BusA & INTERRUPT_INDEX_MASK;
    machine.RM = (machine.RM | (1 << interruptIndex)) & INTERRUPT_MASK;
    machine.addLog(machine.t('logs.rmBitSet', { bit: interruptIndex, rm: machine.RM, irq: interruptIndex + 1 }), 'interrupt');
  },

  czrm: (machine) => {
    const interruptIndex = machine.BusA & INTERRUPT_INDEX_MASK;
    machine.RM = machine.RM & ~(1 << interruptIndex) & INTERRUPT_MASK;
    machine.addLog(machine.t('logs.rmBitCleared', { bit: interruptIndex, rm: machine.RM, irq: interruptIndex + 1 }), 'interrupt');
  },
} satisfies Record<string, MicroOperation>;
