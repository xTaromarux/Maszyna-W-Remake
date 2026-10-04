import { useI18n } from '@/I18n/Hooks/UseI18n';
import { getErrorMessage } from '@/Shared/Utils/Errors';
import type { AssemblyEditorProps } from '@/Components/AssemblyEditor/Types';
import type { RuntimeCommand } from '@/Assembler/Types/Registry';
import { AssemblerError } from '@/Assembler/Errors/AssemblerError';
import { useEffect, useState } from 'react';
import { prepareProgramCompilation } from '../Compilation/PrepareProgramCompilation';

type Options = Pick<
  AssemblyEditorProps,
  | 'program'
  | 'commandList'
  | 'autoResetOnAsmCompile'
  | 'codeBits'
  | 'addresBits'
  | 'onUpdateCode'
  | 'onLog'
  | 'onInitMemory'
  | 'onResetRegisters'
>;

const EMPTY_COMMANDS: RuntimeCommand[] = [];

/**
 * Owns the editable source and compilation lock, and reports compilation diagnostics.
 * Validates the whole result before resetting registers or applying memory and microcode.
 * Replaces the draft and unlocks editing when an external program is loaded.
 */
export const useProgramCompilation = ({
  program = '',
  commandList = EMPTY_COMMANDS,
  autoResetOnAsmCompile = false,
  codeBits,
  addresBits,
  onUpdateCode,
  onLog,
  onInitMemory,
  onResetRegisters,
}: Options) => {
  const { t } = useI18n();
  const [source, setSource] = useState(program);
  const [isCompiled, setIsCompiled] = useState(false);

  useEffect(() => {
    setSource(typeof program === 'string' ? program : '');
    setIsCompiled(false);
  }, [program]);

  const compileProgram = () => {
    try {
      const result = prepareProgramCompilation(source, { commandList, codeBits, addresBits });

      if (autoResetOnAsmCompile) {
        onResetRegisters?.();
      }

      if (result.memoryAssignments.length > 0) {
        onInitMemory?.(result.memoryAssignments);
      }

      onUpdateCode?.(result.code);
      setIsCompiled(true);

      onLog?.({
        message: t('logs.programCompiledWlan'),
        class: 'compiler',
      });
    } catch (error) {
      const message = t('logs.compileError', { message: getErrorMessage(error, String(error)) });

      onLog?.({
        message,
        class: 'Error',
        error: error instanceof AssemblerError ? error : undefined,
      });
    }
  };

  const enableProgramEditing = () => {
    setIsCompiled(false);

    onLog?.({
      message: t('logs.programUnlocked'),
      class: 'system',
    });
  };

  return {
    source,
    setSource,
    isCompiled,
    compileProgram,
    enableProgramEditing,
  };
};
