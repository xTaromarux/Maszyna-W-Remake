import type { ProcessorDiagramProps } from '@/Components/ProcessorDiagram/Types';
import RPRegisterSection from '../Registers/RpRegisterSection';
import RZRegisterSection from '../Registers/RzRegisterSection';
import SignalButton from './SignalButton';
import type { RegisterBindings } from '../Bindings/RegisterBindings';

type InterruptLayerProps = Pick<ProcessorDiagramProps, 'extras' | 'signals' | 'RZ' | 'RP' | 'onClickItem'> & {
  registers: Pick<RegisterBindings, 'RZ' | 'RP'>;
};

const InterruptLayer = ({ extras, signals, RZ, RP, onClickItem, registers }: InterruptLayerProps) => {
  const hasInterruptExtras = Object.values(extras.interrupts || {}).some(Boolean);
  if (!hasInterruptExtras) {
    return null;
  }

  return (
    <div className="layer">
      <RZRegisterSection visible={extras.interrupts?.rzRegister} RZ={RZ} {...registers.RZ} />
      <RPRegisterSection visible={extras.interrupts?.rpRegister} RP={RP} {...registers.RP} />
      <div className="additionalInterruptsSignalsConteiner">
        {extras.interrupts?.rintSignal && (
          <SignalButton
            id="rint"
            signal={signals.rint}
            label="rint"
            spanClassNames="arrowLeftOnBottom additionalInterruptsSignal"
            onClick={() => onClickItem?.('rint')}
          />
        )}
        {extras.interrupts?.eniSignal && (
          <SignalButton
            id="eni"
            signal={signals.eni}
            label="eni"
            spanClassNames="arrowLeftOnBottom additionalInterruptsSignal"
            onClick={() => onClickItem?.('eni')}
          />
        )}
      </div>
    </div>
  );
};

export default InterruptLayer;
