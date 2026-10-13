import type { RZRegisterSectionProps } from '@/Components/ProcessorDiagram/Registers/Types';
import RegisterComponent from './RegisterComponent';

const INTERRUPT_COUNT = 4;

/** The number field and interrupt buttons both read and update the same RZ value. */
const RZRegisterSection = ({ visible = true, RZ = 0, numberFormat, onUpdateRZ, onUpdateNumberFormat }: RZRegisterSectionProps) => {
  if (!visible) {
    return null;
  }

  const interruptBits = Array.from({ length: INTERRUPT_COUNT }, (_, index) => (RZ >> index) & 1);
  const toggleInterruptInput = (index: number) => onUpdateRZ?.(RZ ^ (1 << index));

  return (
    <div id="rzRegister" className="rz-register">
      <div className="rz-inputs">
        {interruptBits.map((value, index) => (
          <button
            key={index}
            className={`rz-input${value ? ' active' : ''}`}
            aria-pressed={Boolean(value)}
            onClick={() => toggleInterruptInput(index)}
            type="button"
          >
            {index + 1}
          </button>
        ))}
      </div>
      <RegisterComponent
        label="RZ"
        model={RZ}
        onUpdateModel={onUpdateRZ}
        numberFormat={numberFormat}
        onUpdateNumberFormat={onUpdateNumberFormat}
      />
    </div>
  );
};

export default RZRegisterSection;
