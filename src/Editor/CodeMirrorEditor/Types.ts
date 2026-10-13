import type { CSSProperties } from 'react';
import type { Action, Update } from '../../Shared/Types/Common';
import type { DivProps } from '../../Shared/Types/React';
import type { RuntimeCommand } from '../../Assembler/Types/Registry';

export interface CodeMirrorEditorProps extends DivProps {
  modelValue?: string;
  onUpdateModelValue?: Update<string>;
  onChange?: Update<string>;
  language?: 'macroW' | 'maszynaW' | 'javascript';
  theme?: 'macroTheme' | 'mwTheme';
  readOnly?: boolean;
  programCompiled?: boolean;
  disable?: boolean;
  onCompile?: Action;
  onEdit?: Action;
  autocompleteEnabled?: boolean;
  commandList?: RuntimeCommand[];
  maxHeight?: string;
  className?: string;
  style?: CSSProperties;
}
