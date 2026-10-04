import CommandListIcon from '@/Shared/Ui/Icons/CommandListIcon';
import RefreshIcon from '@/Shared/Ui/Icons/RefreshIcon';
import { useI18n } from '@/I18n/Hooks/UseI18n';
import type { SettingsPanelProps } from '@/Components/Settings/Types';
type SettingsActionsProps = Pick<SettingsPanelProps, 'onOpenLabDialog' | 'onResetValues' | 'onDefaultSettings' | 'onOpenCommandList'>;

const SettingsActions = (props: SettingsActionsProps) => {
  const { t } = useI18n();
  const actions = [
    {
      id: 'openLabDialog',
      labelKey: 'labs.chooseButton',
      onClick: props.onOpenLabDialog,
      Icon: CommandListIcon,
    },
    {
      id: 'resetValues',
      labelKey: 'settings.actions.resetRegisters',
      onClick: props.onResetValues,
      Icon: RefreshIcon,
    },
    {
      id: 'defaultSettings',
      labelKey: 'settings.actions.defaultSettings',
      onClick: props.onDefaultSettings,
      Icon: RefreshIcon,
    },
    {
      id: 'openCommandList',
      labelKey: 'settings.actions.commandList',
      onClick: props.onOpenCommandList,
      Icon: CommandListIcon,
    },
  ];

  return (
    <div className="flexColumn">
      <div className="flexColumn button-column">
        {actions.map(({ id, labelKey, onClick, Icon }) => (
          <button key={id} id={id} className="SvgAndTextButton compact-button execution-btn execution-btn--step" onClick={onClick}>
            <Icon />
            <span>{t(labelKey)}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
export default SettingsActions;
