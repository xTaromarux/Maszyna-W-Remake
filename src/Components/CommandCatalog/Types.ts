import type { Action, Update } from '../../Shared/Types/Common';
import type { DivProps } from '../../Shared/Types/React';
import type { RuntimeCommand } from '../../Assembler/Types/Registry';

export interface ActionIconProps {
  name: 'trash' | 'confirm' | 'cancel' | 'edit' | 'add' | 'load' | 'download';
}

export interface CommandCatalogProps extends DivProps {
  visible?: boolean;
  commandList?: RuntimeCommand[];
  codeBits?: number;
  onUpdateCommandList?: Update<RuntimeCommand[]>;
  onClose?: Action;
  className?: string;
}
