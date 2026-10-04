import type { Action, Update } from '../../Shared/Types/Common';
import type { LocalizedLab } from '../../Machine/Types/Labs';

export interface LabCatalogDialogProps {
  visible?: boolean;
  labs?: LocalizedLab[];
  selectedLabId?: string;
  onClose?: Action;
  onSelectLab?: Update<string>;
  onLoadLab?: Action;
}
