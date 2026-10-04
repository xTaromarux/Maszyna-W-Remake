import { translate as t } from '@/i18n';
import type { ProgramSectionProps } from '@/types/components';
import type { MemoryAssignment } from '@/types/simulator';
import { compileAsmToMicroProgram } from '@/WLAN/asmPipeline';
import { WlanError } from '@/WLAN/error';

type Options = Required<Pick<ProgramSectionProps, 'commandList' | 'codeBits' | 'addresBits'>>;

const buildOpcodeLookup = (commands: Options['commandList']): Map<string, number> => {
  const opcodes = new Map<string, number>();

  commands.forEach((command, index) => {
    if (!command || command.name == null) {
      return;
    }

    const name = String(command.name).toUpperCase();
    if (!opcodes.has(name)) {
      opcodes.set(name, index);
    }
  });

  return opcodes;
};

/** Prepares the complete program and validates every memory write before the simulator is modified. */
export const prepareProgramCompilation = (source: string, { commandList, codeBits, addresBits }: Options) => {
  const { ir, initAssignments, microProgram, microAsmText } = compileAsmToMicroProgram(source, commandList);
  const opcodes = buildOpcodeLookup(commandList);

  const addressSpace = 2 ** addresBits;
  const maxAddress = addressSpace - 1;
  const maxOpcode = 2 ** codeBits - 1;
  const memoryAssignments: MemoryAssignment[] = [];

  const validateMemoryAddress = (address: number, line: number) => {
    if (address < 0 || address > maxAddress) {
      throw new WlanError(t('logs.memoryInitOutOfRange', { addr: address }), {
        code: 'COMPILE_MEMORY_ADDRESS_RANGE',
        loc: { line, col: 1 },
      });
    }
  };

  for (const assignment of initAssignments) {
    validateMemoryAddress(assignment.addr, assignment.line);
    memoryAssignments.push({ addr: assignment.addr, val: assignment.val });
  }

  for (const instruction of ir.instructions) {
    const opcode = opcodes.get(instruction.name.toUpperCase());
    if (opcode === undefined) {
      throw new Error(t('logs.compileMissingOpcode', { name: instruction.name }));
    }

    if (opcode > maxOpcode) {
      throw new Error(t('logs.compileOpcodeTooLarge', { name: instruction.name, opcode, maxOpcode, codeBits }));
    }

    const argument = instruction.operands[0]?.value ?? 0;
    if (argument < 0 || argument > maxAddress) {
      throw new Error(t('logs.compileArgOutOfRange', { arg: argument, name: instruction.name, max: maxAddress, addrBits: addresBits }));
    }

    validateMemoryAddress(instruction.address, instruction.line);
    const instructionWord = opcode * addressSpace + argument;
    memoryAssignments.push({ addr: instruction.address, val: instructionWord });
  }

  return {
    memoryAssignments,
    code: {
      text: microAsmText,
      program: microProgram,
    },
  };
};
