import type { MicroOperation } from './types';

const INTERRUPT_MASK = 0x0f;
const INTERRUPT_INDEX_MASK = 0x03;

export const interruptOperations = {
  werm: (machine) => {
    machine.RM = machine.BusS & INTERRUPT_MASK;
    machine.addLog(machine.t('logs.rmSet', { rm: machine.RM, busS: machine.BusS }), 'system');
  },

  wyrm: (machine) => {
    machine.BusS = machine.RM & INTERRUPT_MASK;
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
