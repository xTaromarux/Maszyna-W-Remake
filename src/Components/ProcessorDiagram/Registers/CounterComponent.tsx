import type { CounterComponentProps } from '@/Components/ProcessorDiagram/Registers/Types';
import RegisterComponent from './RegisterComponent';
import SignalButton from '../Ui/SignalButton';

const CounterComponent = ({
  signals,
  programCounter,
  extras,
  numberFormat,
  onClickItem,
  onUpdateProgramCounter,
  onUpdateNumberFormat,
}: CounterComponentProps) => {
  return (
    <div id="counter">
      <SignalButton id="il" signal={signals.il} onClick={() => onClickItem?.('il')} label="il" spanClassNames="arrowRightOnBottom" />
      <RegisterComponent
        label="L"
        model={programCounter}
        onUpdateModel={onUpdateProgramCounter}
        numberFormat={numberFormat}
        onUpdateNumberFormat={onUpdateNumberFormat}
      />
      {extras.dl && (
        <SignalButton id="dl" signal={signals.dl} onClick={() => onClickItem?.('dl')} label="dl" spanClassNames="arrowLeftOnBottom" />
      )}
      <SignalButton
        id="wyl"
        signal={signals.wyl}
        onClick={() => onClickItem?.('wyl')}
        label="wyl"
        className="long pathDownOnLeft"
        spanClassNames="lineLeftOnBottom"
      />
      <div
        className={`wylsSignalsConteiner ${extras.stack?.wylsSignal ? 'wylsSignalsConteinerContent' : 'wylsSignalsConteinerContentEnd'}`}
      >
        {extras.stack?.wylsSignal && <div className="wylsSignalsExt" />}
        <SignalButton
          id="wel"
          signal={signals.wel}
          onClick={() => onClickItem?.('wel')}
          label="wel"
          className="impulse pathUpOnRight"
          spanClassNames="arrowRightOnBottom"
        />
      </div>
    </div>
  );
};

export default CounterComponent;
