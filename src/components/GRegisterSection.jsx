'use client';

import SignalButton from './SignalButton';
import RegisterComponent from './RegisterComponent';
import useWindowWidth from '@/hooks/useWindowWidth';

export default function GRegisterSection({ visible, G, signals, numberFormat, onUpdateG, onUpdateNumberFormat, onClickItem }) {
  const isMobile = useWindowWidth() <= 768;
  if (!visible) return null;
  return <div id="gRegister">
    <SignalButton id="wyg" signal={signals.wyg} label="wyg" divClassNames={isMobile ? 'pathDownOnRight' : 'pathUpOnRight'} spanClassNames="lineRightOnBottom" onClick={() => onClickItem?.('wyg')} />
    <RegisterComponent label="G" model={G} onUpdateModel={onUpdateG} numberFormat={numberFormat} onUpdateNumberFormat={onUpdateNumberFormat} />
    <SignalButton id="start" signal={signals.start} label="start" divClassNames={isMobile ? 'pathUpOnLeft' : 'pathDownOnLeft'} spanClassNames="arrowLeftOnBottom" onClick={() => onClickItem?.('start')} />
  </div>;
}
