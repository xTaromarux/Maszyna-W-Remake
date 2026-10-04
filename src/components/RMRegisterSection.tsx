import type { RMRegisterSectionProps } from '@/types/components';
import RegisterComponent from './RegisterComponent';
import SignalButton from './SignalButton';

export default function RMRegisterSection({
  visible,
  RM,
  signals,
  numberFormat,
  onUpdateRM,
  onUpdateNumberFormat,
  onClickItem,
}: RMRegisterSectionProps) {
  if (!visible) return null;
  return (
    <div id="rmRegister">
      <SignalButton
        id="wyrm"
        signal={signals.wyrm}
        label="wyrm"
        divClassNames="pathDownOnRight"
        spanClassNames="lineRightOnBottom"
        onClick={() => onClickItem?.('wyrm')}
      />
      <RegisterComponent
        label="RM"
        model={RM}
        onUpdateModel={onUpdateRM}
        numberFormat={numberFormat}
        onUpdateNumberFormat={onUpdateNumberFormat}
      />
      <SignalButton
        id="werm"
        signal={signals.werm}
        label="werm"
        divClassNames="pathUpOnLeft"
        spanClassNames="arrowLeftOnBottom"
        onClick={() => onClickItem?.('werm')}
      />
    </div>
  );
}
