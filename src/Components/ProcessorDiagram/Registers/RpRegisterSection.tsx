import type { RPRegisterSectionProps } from '@/Components/ProcessorDiagram/Registers/Types';
import RegisterComponent from './RegisterComponent';

const RPRegisterSection = ({ visible, RP, numberFormat, onUpdateRP, onUpdateNumberFormat }: RPRegisterSectionProps) => {
  if (!visible) {
    return null;
  }

  return (
    <div id="rpRegister">
      <div style={{ height: 33 }} />
      <RegisterComponent
        label="RP"
        model={RP}
        onUpdateModel={onUpdateRP}
        numberFormat={numberFormat}
        onUpdateNumberFormat={onUpdateNumberFormat}
      />
    </div>
  );
};

export default RPRegisterSection;
