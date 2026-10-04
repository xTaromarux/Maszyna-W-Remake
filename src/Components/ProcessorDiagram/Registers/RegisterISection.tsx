import type { RegisterISectionProps } from '@/Components/ProcessorDiagram/Registers/Types';
import RegisterComponent from './RegisterComponent';
import SignalButton from '../Ui/SignalButton';

const RegisterISection = ({ I, signals, numberFormat, onUpdateI, onUpdateNumberFormat, onClickItem }: RegisterISectionProps) => {
  return (
    <div id="iRegister">
      <SignalButton
        id="wyad"
        signal={signals.wyad}
        label="wyad"
        divClassNames="long pathUpOnRight"
        spanClassNames="lineRightOnBottom"
        onClick={() => onClickItem?.('wyad')}
      />
      <RegisterComponent
        label="I"
        model={I}
        onUpdateModel={onUpdateI}
        numberFormat={numberFormat}
        onUpdateNumberFormat={onUpdateNumberFormat}
      />
      <div className="signals">
        <SignalButton
          id="wei"
          signal={signals.wei}
          label="wei"
          divClassNames="impulse pathUpOnLeft"
          spanClassNames="arrowLeftOnBottom"
          onClick={() => onClickItem?.('wei')}
        />
        <div className="stopConteiner">
          <SignalButton
            id="stop"
            signal={signals.stop}
            label="stop"
            spanClassNames="lineLeftOnBottom additionalInterruptsSignal"
            onClick={() => onClickItem?.('stop')}
          />
        </div>
      </div>
    </div>
  );
};

export default RegisterISection;
