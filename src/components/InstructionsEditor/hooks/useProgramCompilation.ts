import { useI18n } from '@/i18n';
import { getErrorMessage } from '@/shared/utils/errors';
import type { ProgramSectionProps } from '@/types/components';
import type { RuntimeCommand } from '@/types/registry';
import { WlanError } from '@/WLAN/error';
import { useEffect, useState } from 'react';
import { prepareProgramCompilation } from '../helpers/prepareProgramCompilation';

type Options = Pick<
  ProgramSectionProps,
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
        error: error instanceof WlanError ? error : undefined,
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
