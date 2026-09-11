import SignalButton from './SignalButton';
import RegisterComponent from './RegisterComponent';

export default function RMRegisterSection({ visible, RM, signals, numberFormat, onUpdateRM, onUpdateNumberFormat, onClickItem }) {
  if (!visible) return null;
  return <div id="rmRegister">
    <SignalButton id="wyrm" signal={signals.wyrm} label="wyrm" divClassNames="pathDownOnRight" spanClassNames="lineRightOnBottom" onClick={() => onClickItem?.('wyrm')} />
    <RegisterComponent label="RM" model={RM} onUpdateModel={onUpdateRM} numberFormat={numberFormat} onUpdateNumberFormat={onUpdateNumberFormat} />
    <SignalButton id="werm" signal={signals.werm} label="werm" divClassNames="pathUpOnLeft" spanClassNames="arrowLeftOnBottom" onClick={() => onClickItem?.('werm')} />
  </div>;
}
