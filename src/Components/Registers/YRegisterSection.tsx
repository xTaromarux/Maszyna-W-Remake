import type { YRegisterSectionProps } from '@/Types/Components';
import RegisterComponent from './RegisterComponent';
import SignalButton from '../SignalButton';

const YRegisterSection = ({ visible, Y, signals, numberFormat, onUpdateY, onUpdateNumberFormat, onClickItem }: YRegisterSectionProps) => {
  if (!visible) {
    return null;
  }

  return (
    <div id="yRegister">
      <SignalButton
        id="wyy"
        signal={signals.wyy}
        label="wyy"
        divClassNames="pathUpOnRight"
        spanClassNames="lineRightOnBottom"
        onClick={() => onClickItem?.('wyy')}
      />
      <RegisterComponent
        label="Y"
        model={Y}
        onUpdateModel={onUpdateY}
        numberFormat={numberFormat}
        onUpdateNumberFormat={onUpdateNumberFormat}
      />
      <SignalButton
        id="wey"
        signal={signals.wey}
        label="wey"
        divClassNames="pathDownOnLeft"
        spanClassNames="arrowLeftOnBottom"
        onClick={() => onClickItem?.('wey')}
      />
    </div>
  );
};

export default YRegisterSection;
