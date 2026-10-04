import CommandListIcon from '@/Assets/Svg/CommandListIcon';
import RefreshIcon from '@/Assets/Svg/RefreshIcon';
import { useI18n } from '@/I18n/Index';
import type { SettingsPanelProps } from '@/Types/Components';
type SettingsActionsProps = Pick<SettingsPanelProps, 'onOpenLabDialog' | 'onResetValues' | 'onDefaultSettings' | 'onOpenCommandList'>;
const SettingsActions = (props: SettingsActionsProps) => {
  const { t } = useI18n();
  return (
    <div className="flexColumn">
      <div className="flexColumn button-column">
        {(
          [
            ['openLabDialog', 'labs.chooseButton', props.onOpenLabDialog, CommandListIcon],
            ['resetValues', 'settings.actions.resetRegisters', props.onResetValues, RefreshIcon],
            ['defaultSettings', 'settings.actions.defaultSettings', props.onDefaultSettings, RefreshIcon],
            ['openCommandList', 'settings.actions.commandList', props.onOpenCommandList, CommandListIcon],
          ] as const
        ).map(([id, label, handler, Icon]) => (
          <button key={id} id={id} className="SvgAndTextButton compact-button execution-btn execution-btn--step" onClick={handler}>
            <Icon />
            <span>{t(label)}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
export default SettingsActions;
