import SignalButton from './SignalButton';
import RegisterComponent from './RegisterComponent';

export default function XRegisterSection({ visible, X, signals, numberFormat, onUpdateX, onUpdateNumberFormat, onClickItem }) {
  if (!visible) return null;
  return <div id="xRegister">
    <SignalButton id="wyx" signal={signals.wyx} label="wyx" divClassNames="pathUpOnRight" spanClassNames="lineRightOnBottom" onClick={() => onClickItem?.('wyx')} />
    <RegisterComponent label="X" model={X} onUpdateModel={onUpdateX} numberFormat={numberFormat} onUpdateNumberFormat={onUpdateNumberFormat} />
    <SignalButton id="wex" signal={signals.wex} label="wex" divClassNames="pathDownOnLeft" spanClassNames="arrowLeftOnBottom" onClick={() => onClickItem?.('wex')} />
  </div>;
}
