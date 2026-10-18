'use client';

import CodeMirrorEditor from '@/Editor/CodeMirrorEditor/CodeMirrorEditor';
import type { AssemblyEditorProps } from '@/Components/AssemblyEditor/Types';
import { useProgramCompilation } from './Hooks/UseProgramCompilation';
import ProgramActions from './Ui/ProgramActions';

const AssemblyEditor = ({
  manualMode,
  commandList,
  program = '',
  autocompleteEnabled = true,
  autoResetOnAsmCompile = false,
  codeBits,
  addresBits,
  onUpdateCode,
  onLog,
  onInitMemory,
  onResetRegisters,
  executionControls,
  className = '',
  ...rest
}: AssemblyEditorProps) => {
  const { source, setSource, isCompiled, compileProgram, enableProgramEditing } = useProgramCompilation({
    program,
    commandList,
    autoResetOnAsmCompile,
    codeBits,
    addresBits,
    onUpdateCode,
    onLog,
    onInitMemory,
    onResetRegisters,
  });

  return (
    <div data-editor-macro-program-section="" {...rest} id="program" className={className} hidden={manualMode}>
      <CodeMirrorEditor
        modelValue={source}
        onUpdateModelValue={setSource}
        language="macroW"
        theme="macroTheme"
        maxHeight="none"
        expandable={false}
        commandList={commandList}
        autocompleteEnabled={autocompleteEnabled}
        programCompiled={isCompiled}
        onCompile={compileProgram}
        onEdit={enableProgramEditing}
      />

      <div className="program-actions">
        <ProgramActions
          isCompiled={isCompiled}
          canCompile={Boolean(source.trim())}
          onCompile={compileProgram}
          onEdit={enableProgramEditing}
        />
        {isCompiled && executionControls}
      </div>
    </div>
  );
};

export default AssemblyEditor;
