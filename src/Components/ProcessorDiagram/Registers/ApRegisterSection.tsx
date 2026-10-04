import type { APRegisterSectionProps } from '@/Components/ProcessorDiagram/Registers/Types';
import RegisterComponent from './RegisterComponent';
import SignalButton from '../Ui/SignalButton';

const APRegisterSection = ({
  visible,
  AP,
  signals,
  numberFormat,
  onUpdateAP,
  onUpdateNumberFormat,
  onClickItem,
}: APRegisterSectionProps) => {
  if (!visible) {
    return null;
  }

  return (
    <div id="apRegister">
      <SignalButton
        id="wyap"
        signal={signals.wyap}
        label="wyap"
        divClassNames="pathDownOnRight"
        spanClassNames="lineRightOnBottom"
        onClick={() => onClickItem?.('wyap')}
      />
      <RegisterComponent
        label="AP"
        model={AP}
        onUpdateModel={onUpdateAP}
        numberFormat={numberFormat}
        onUpdateNumberFormat={onUpdateNumberFormat}
      />
    </div>
  );
};

export default APRegisterSection;
