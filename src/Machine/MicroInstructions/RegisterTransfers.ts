import type { MicroOperation } from './Types';

export const registerTransfers = {
  il: (machine) => {
    machine.programCounter = (machine.programCounter + 1) & machine.addrMask();
  },

  dl: (machine) => {
    machine.programCounter = (machine.programCounter - 1) & machine.addrMask();
  },

  wyl: (machine) => {
    machine.BusA = machine.programCounter & machine.addrMask();
  },

  wel: (machine) => {
    machine.programCounter = machine.BusA & machine.addrMask();
  },

  wyad: (machine) => {
    machine.BusA = machine.I & machine.addrMask();
  },

  wei: (machine) => {
    machine.I = machine.toWord(machine.BusS);
  },

  weak: (machine) => {
    machine.ACC = machine.toWord(machine.JAML);
  },

  weja: (machine) => {
    machine.JAML = machine.toWord(machine.BusS);
  },

  wyak: (machine) => {
    machine.BusS = machine.toWord(machine.ACC);
  },

  wyx: (machine) => {
    machine.BusS = machine.toWord(machine.X);
  },

  wex: (machine) => {
    machine.X = machine.toWord(machine.BusS);
  },

  wyy: (machine) => {
    machine.BusS = machine.toWord(machine.Y);
  },

  wey: (machine) => {
    machine.Y = machine.toWord(machine.BusS);
  },

  wea: (machine) => {
    machine.A = machine.BusA & machine.addrMask();
  },

  wes: (machine) => {
    machine.S = machine.toWord(machine.BusS);
  },

  wys: (machine) => {
    machine.BusS = machine.toWord(machine.S);
  },

  as: (machine) => {
    machine.BusS = machine.BusA;
  },

  sa: (machine) => {
    machine.BusA = machine.BusS & machine.addrMask();
  },
} satisfies Record<string, MicroOperation>;
