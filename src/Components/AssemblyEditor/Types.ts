import type { Action, Update } from '../../Shared/Types/Common';
import type { DivProps } from '../../Shared/Types/React';
import type { RuntimeCommand } from '../../Assembler/Types/Registry';
import type { CompiledPayload, LogEvent, MemoryAssignment } from '../../Machine/Types/Machine';

export interface AssemblyEditorProps extends DivProps {
  manualMode: boolean;
  commandList?: RuntimeCommand[];
  program?: string;
  autocompleteEnabled?: boolean;
  autoResetOnAsmCompile?: boolean;
  codeBits: number;
  addresBits: number;
  onUpdateCode?: Update<CompiledPayload>;
  onLog?: Update<LogEvent>;
  onInitMemory?: Update<MemoryAssignment[]>;
  onResetRegisters?: Action;
  className?: string;
}
