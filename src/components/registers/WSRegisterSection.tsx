'use client';

import useWindowWidth from '@/hooks/useWindowWidth';
import type { WSRegisterSectionProps } from '@/types/components';
import BusLabel from '../BusLabel';
import RegisterComponent from './RegisterComponent';
import SignalButton from '../SignalButton';

export default function WSRegisterSection({
  visible,
  signals,
  WS,
  BusS = 0,
  extras,
  formatNumber,
  numberFormat,
  onUpdateWS,
  onUpdateNumberFormat,
  onClickItem,
}: WSRegisterSectionProps) {
  const isMobile = useWindowWidth() <= 768;
  if (!visible) return null;
  return (
    <div id="wsRegister">
      <SignalButton id="iws" signal={signals.iws} onClick={() => onClickItem?.('iws')} label="iws" spanClassNames="arrowRightOnBottom" />
      <RegisterComponent
        label="WS"
        model={WS}
        onUpdateModel={onUpdateWS}
        numberFormat={numberFormat}
        onUpdateNumberFormat={onUpdateNumberFormat}
      />
      <SignalButton id="dws" signal={signals.dws} onClick={() => onClickItem?.('dws')} label="dws" spanClassNames="arrowLeftOnBottom" />
      <SignalButton
        id="wyws"
        signal={signals.wyws}
        onClick={() => onClickItem?.('wyws')}
        label="wyws"
        className="long pathUpOnRight"
        spanClassNames="lineRightOnBottom"
      />
      <SignalButton
        id="wews"
        signal={signals.wews}
        onClick={() => onClickItem?.('wews')}
        label="wews"
        className="impulse pathDownOnLeft"
        spanClassNames="arrowLeftOnBottom"
      />
      {isMobile && (
        <div id="busS">
          <BusLabel busName="S" busValue={BusS} showInvisibleRegisters={extras.showInvisibleRegisters} formatNumber={formatNumber} />
        </div>
      )}
    </div>
  );
}
