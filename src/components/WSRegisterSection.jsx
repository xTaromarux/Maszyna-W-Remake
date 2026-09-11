'use client';

import SignalButton from './SignalButton';
import RegisterComponent from './RegisterComponent';
import BusLabel from './BusLabel';
import useWindowWidth from '@/hooks/useWindowWidth';

export default function WSRegisterSection({ visible, signals, WS, BusS, extras, formatNumber, numberFormat, onUpdateWS, onUpdateNumberFormat, onClickItem }) {
  const isMobile = useWindowWidth() <= 768;
  if (!visible) return null;
  return <div id="wsRegister">
    <SignalButton id="iws" signal={signals.iws} onClick={() => onClickItem?.('iws')} label="iws" spanClassNames="arrowRightOnBottom" />
    <RegisterComponent label="WS" model={WS} onUpdateModel={onUpdateWS} numberFormat={numberFormat} onUpdateNumberFormat={onUpdateNumberFormat} />
    <SignalButton id="dws" signal={signals.dws} onClick={() => onClickItem?.('dws')} label="dws" spanClassNames="arrowLeftOnBottom" />
    <SignalButton id="wyws" signal={signals.wyws} onClick={() => onClickItem?.('wyws')} label="wyws" className="long pathUpOnRight" spanClassNames="lineRightOnBottom" />
    <SignalButton id="wews" signal={signals.wews} onClick={() => onClickItem?.('wews')} label="wews" className="impulse pathDownOnLeft" spanClassNames="arrowLeftOnBottom" />
    {isMobile && <div id="busS"><BusLabel busName="S" busValue={BusS} showInvisibleRegisters={extras.showInvisibleRegisters} formatNumber={formatNumber} /></div>}
  </div>;
}
