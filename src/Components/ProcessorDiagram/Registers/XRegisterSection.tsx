import type { XRegisterSectionProps } from '@/Components/ProcessorDiagram/Registers/Types';
import RegisterComponent from './RegisterComponent';
import SignalButton from '../Ui/SignalButton';

const XRegisterSection = ({ visible, X, signals, numberFormat, onUpdateX, onUpdateNumberFormat, onClickItem }: XRegisterSectionProps) => {
  if (!visible) {
    return null;
  }

  return (
    <div id="xRegister">
      <SignalButton
        id="wyx"
        signal={signals.wyx}
        label="wyx"
        divClassNames="pathUpOnRight"
        spanClassNames="lineRightOnBottom"
        onClick={() => onClickItem?.('wyx')}
      />
      <RegisterComponent
        label="X"
        model={X}
        onUpdateModel={onUpdateX}
        numberFormat={numberFormat}
        onUpdateNumberFormat={onUpdateNumberFormat}
      />
      <SignalButton
        id="wex"
        signal={signals.wex}
        label="wex"
        divClassNames="pathDownOnLeft"
        spanClassNames="arrowLeftOnBottom"
        onClick={() => onClickItem?.('wex')}
      />
    </div>
  );
};

export default XRegisterSection;
