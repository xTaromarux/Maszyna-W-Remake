'use client';

import useWindowWidth from '@/Shared/Hooks/UseWindowWidth';
import { toUnsigned } from '@/Shared/Utils/Numbers';
import type { CalcSectionProps } from '@/Types/Components';
import RegisterComponent from './Registers/RegisterComponent';
import AluBlock from './Registers/Ui/AluBlock';
import SignalButton from './SignalButton';
import WSRegisterSection from './Registers/WsRegisterSection';

export default function CalcSection({
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
}: CalcSectionProps) {
  const isMobile = useWindowWidth() <= 768;
  const modulo = 2 ** wordBits;
  const accumulator = toUnsigned(ACC, wordBits);
  const nFlag = accumulator >= modulo / 2;
  const zFlag = accumulator === 0;
  const operations = ['weak', 'przep', 'dod', 'ode', ...(extras.jamlExtras ? ['mno', 'dziel', 'shr', 'shl', 'neg', 'lub', 'i'] : [])];
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
        {extras.jamlExtras && (
          <div id="flags">
            FLAGI:{nFlag && <div title="Negative number in Acc">N</div>}
            {zFlag && <div title="Zero in Acc">Z</div>}
          </div>
        )}
        <div className="accSignals">
          {extras.jamlExtras &&
            ['iak', 'dak'].map((signal) => (
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
}
