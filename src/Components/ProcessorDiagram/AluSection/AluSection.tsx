'use client';

import useWindowWidth from '@/Shared/Hooks/UseWindowWidth';
import type { AluSectionProps } from '@/Components/ProcessorDiagram/Types';
import RegisterComponent from '../Registers/RegisterComponent';
import AluBlock from './Ui/AluBlock';
import SignalButton from '../Ui/SignalButton';
import WSRegisterSection from '../Registers/WsRegisterSection';
import FlagIndicators from './Ui/FlagIndicators';

const BASE_OPERATIONS = ['weak', 'przep', 'dod', 'ode'];
const EXTRA_OPERATIONS = ['mno', 'dziel', 'shr', 'shl', 'neg', 'lub', 'i'];
const ACCUMULATOR_OPERATIONS = ['iak', 'dak'];

const AluSection = ({
  extras,
  signals,
  ACC,
  WS,
  decSigned = false,
  wordBits = 8,
  accFormat,
  numberFormat,
  formatNumber,
  onClickItem,
  onUpdateACC,
  onUpdateWS,
  onUpdateAccFormat,
  onUpdateNumberFormat,
}: AluSectionProps) => {
  const isMobile = useWindowWidth() <= 768;
  const operations = extras.jamlExtras ? [...BASE_OPERATIONS, ...EXTRA_OPERATIONS] : BASE_OPERATIONS;

  return (
    <div className={`calcConteiner${extras.stack?.wsRegister ? ' calcConteinerAdditionalSpace' : ''}`}>
      {!isMobile && (
        <WSRegisterSection
          WS={WS}
          visible={extras.stack?.wsRegister}
          signals={signals}
          formatNumber={formatNumber}
          numberFormat={numberFormat}
          onUpdateNumberFormat={onUpdateNumberFormat}
          extras={extras}
          onClickItem={onClickItem}
          onUpdateWS={onUpdateWS}
        />
      )}
      <div id="calc">
        {extras.jamlExtras && <FlagIndicators accumulator={ACC} wordBits={wordBits} />}
        <div className="accSignals">
          {extras.jamlExtras &&
            ACCUMULATOR_OPERATIONS.map((signal) => (
              <SignalButton
                key={signal}
                id={signal}
                signal={signals[signal]}
                label={signal}
                spanClassNames="arrowRightOnBottom"
                onClick={() => onClickItem?.(signal)}
              />
            ))}
        </div>
        <RegisterComponent
          id="accumulator"
          label="AK"
          signedDec={decSigned}
          wordBits={wordBits}
          model={ACC}
          onUpdateModel={onUpdateACC}
          numberFormat={accFormat}
          onUpdateNumberFormat={onUpdateAccFormat}
        />
        <div className="jamlSignals">
          {operations.map((signal) => (
            <SignalButton
              key={signal}
              id={signal}
              signal={signals[signal]}
              label={signal}
              spanClassNames={signal === 'weak' ? 'arrowRightOnBottom' : 'lineRightOnBottom'}
              onClick={() => onClickItem?.(signal)}
            />
          ))}
        </div>
        <AluBlock />
        {!isMobile && (
          <>
            <SignalButton
              id="weja"
              signal={signals.weja}
              label="weja"
              divClassNames="pathUpOnRight"
              spanClassNames="lineRightOnBottom"
              onClick={() => onClickItem?.('weja')}
            />
            <SignalButton
              id="wyak"
              signal={signals.wyak}
              label="wyak"
              divClassNames="pathDownOnRight"
              spanClassNames="lineRightOnBottom"
              onClick={() => onClickItem?.('wyak')}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default AluSection;
