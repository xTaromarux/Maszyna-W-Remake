'use client';

import CompileIcon from '@/assets/svg/CompileIcon';
import EditIcon from '@/assets/svg/EditIcon';
import CodeMirrorEditor from '@/components/CodeMirrorEditor';
import { useI18n } from '@/i18n';
import { getErrorMessage } from '@/shared/utils/errors';
import type { ProgramSectionProps } from '@/types/components';
import { compileAsmToMicroProgram } from '@/WLAN/asmPipeline';
import { WlanError } from '@/WLAN/error';
import { useEffect, useState } from 'react';

export default function ProgramSection({
  manualMode,
  commandList = [],
  program = '',
  autocompleteEnabled = true,
  autoResetOnAsmCompile = false,
  codeBits,
  addresBits,
  onUpdateCode,
  onLog,
  onInitMemory,
  onResetRegisters,
  className = '',
  ...rest
}: ProgramSectionProps) {
  const { t } = useI18n();
  const [programLocal, setProgramLocal] = useState(program);
  const [programCompiled, setProgramCompiled] = useState(false);
  useEffect(() => {
    setProgramLocal(typeof program === 'string' ? program : '');
    setProgramCompiled(false);
  }, [program]);

  const compileProgram = () => {
    try {
      if (autoResetOnAsmCompile) onResetRegisters?.();
      const { ir, initAssignments: dataAssignments, microProgram, microAsmText } = compileAsmToMicroProgram(programLocal, commandList);
      const opcodeLookup = new Map();
      commandList.forEach((command, index) => {
        if (!command || command.name == null) return;
        const key = String(command.name).toUpperCase();
        if (!opcodeLookup.has(key)) opcodeLookup.set(key, index);
      });
      const addressSpace = 2 ** addresBits;
      const addressMask = addressSpace - 1;
      const maxOpcode = 2 ** codeBits - 1;
      const initAssignments = dataAssignments.map((entry) => ({ addr: entry.addr, val: entry.val }));
      for (const node of ir.instructions) {
        const opcode = opcodeLookup.get(String(node.name || '').toUpperCase());
        if (opcode == null) throw new Error(t('logs.compileMissingOpcode', { name: node.name }));
        if (opcode > maxOpcode) throw new Error(t('logs.compileOpcodeTooLarge', { name: node.name, opcode, maxOpcode, codeBits }));
        const argument = node.operands?.[0]?.value ?? 0;
        if (argument < 0 || argument > addressMask)
          throw new Error(t('logs.compileArgOutOfRange', { arg: argument, name: node.name, max: addressMask, addrBits: addresBits }));
        initAssignments.push({ addr: node.address, val: opcode * addressSpace + argument });
      }
      if (initAssignments.length) onInitMemory?.(initAssignments);
      onUpdateCode?.({ text: microAsmText, program: microProgram });
      setProgramCompiled(true);
      onLog?.({ message: t('logs.programCompiledWlan'), class: 'compiler' });
    } catch (error) {
      if (error instanceof WlanError) {
        onLog?.({ message: t('logs.compileError', { message: error.message || String(error) }), class: 'Error', error });
      } else {
        onLog?.({ message: t('logs.compileError', { message: getErrorMessage(error, String(error)) }), class: 'Error' });
      }
    }
  };
  const enableProgramEditing = () => {
    setProgramCompiled(false);
    onLog?.({ message: t('logs.programUnlocked'), class: 'system' });
  };

  if (manualMode) return null;
  return (
    <div data-editor-macro-program-section="" {...rest} id="program" className={className}>
      <CodeMirrorEditor
        disable={programCompiled}
        modelValue={programLocal}
        onUpdateModelValue={setProgramLocal}
        language="macroW"
        theme="macroTheme"
        maxHeight="35.6rem"
        commandList={commandList}
        autocompleteEnabled={autocompleteEnabled}
        programCompiled={programCompiled}
        onCompile={compileProgram}
        onEdit={enableProgramEditing}
      />
      <div data-editor-macro-program-section="" className="flexRow">
        {!programCompiled ? (
          <button
            data-editor-macro-program-section=""
            onClick={compileProgram}
            disabled={manualMode || !programLocal.trim()}
            className="execution-btn execution-btn--compile"
          >
            <CompileIcon />
            <span data-editor-macro-program-section="">{t('execution.compile')}</span>
          </button>
        ) : (
          <button
            data-editor-macro-program-section=""
            onClick={enableProgramEditing}
            disabled={manualMode}
            className="execution-btn execution-btn--edit"
          >
            <EditIcon />
            <span data-editor-macro-program-section="">{t('execution.edit')}</span>
          </button>
        )}
      </div>
    </div>
  );
}
