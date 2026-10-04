import type { SwitchProps } from '@/Types/Components';

const SettingsSwitch = ({ label, checked, onChange }: SwitchProps) => {
  return (
    <label className="switch" onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
      <input type="checkbox" aria-label={label} checked={!!checked} onChange={(event) => onChange?.(event.target.checked)} />
      <span className="slider round" />
    </label>
  );
};

export default SettingsSwitch;
