import type { ColorUpdate } from '../../Machine/Types/EspColors';
import type { Action, Update } from '../../Shared/Types/Common';
import type { NumberFormat } from '../../Shared/Types/Numbers';
import type { Extras, ExtrasPatch } from '../../Machine/Types/Machine';
import type { Person } from './About/Types';
import type { ColorSelection } from '../../Shared/Types/Colors';

export interface SettingsPanelProps {
  isAnimated?: boolean;
  isMobile?: boolean;
  lightMode: boolean;
  language?: string;
  numberFormat: NumberFormat;
  decSigned?: boolean;
  codeBits: number;
  addresBits: number;
  oddDelay: number;
  stepDelay: number;
  extras: Extras;
  platform?: string;
  autocompleteEnabled?: boolean;
  autoResetOnAsmCompile?: boolean;
  creators?: Person[];
  caregivers?: Person[];
  onClose?: Action;
  onUpdateExtras?: Update<ExtrasPatch>;
  onColorChange?: Update<ColorUpdate>;
  onUpdateLightMode?: Update<boolean>;
  onUpdateLanguage?: Update<string>;
  onUpdateNumberFormat?: Update<NumberFormat>;
  onUpdateDecSigned?: Update<boolean>;
  onUpdateCodeBits?: Update<number>;
  onUpdateAddresBits?: Update<number>;
  onUpdateOddDelay?: Update<number>;
  onUpdateStepDelay?: Update<number>;
  onUpdateAutocompleteEnabled?: Update<boolean>;
  onUpdateAutoResetOnAsmCompile?: Update<boolean>;
  onResetValues?: Action;
  onDefaultSettings?: Action;
  onOpenCommandList?: Action;
  onOpenLabDialog?: Action;
}

export interface SettingsOverlayProps extends SettingsPanelProps {
  settingsOpen?: boolean;
}

export interface SwitchProps {
  label: string;
  checked?: boolean;
  onChange?: Update<boolean>;
}

export type PendingColor = ColorSelection & Pick<ColorUpdate, 'type'>;

export type SavedColor = Pick<ColorSelection, 'color' | 'brightness'> & Partial<Pick<ColorSelection, 'colorData'>>;
