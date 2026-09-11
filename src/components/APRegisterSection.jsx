import SignalButton from './SignalButton';
import RegisterComponent from './RegisterComponent';

export default function APRegisterSection({ visible, AP, signals, numberFormat, onUpdateAP, onUpdateNumberFormat, onClickItem }) {
  if (!visible) return null;
  return <div id="apRegister">
    <SignalButton id="wyap" signal={signals.wyap} label="wyap" divClassNames="pathDownOnRight" spanClassNames="lineRightOnBottom" onClick={() => onClickItem?.('wyap')} />
    <RegisterComponent label="AP" model={AP} onUpdateModel={onUpdateAP} numberFormat={numberFormat} onUpdateNumberFormat={onUpdateNumberFormat} />
  </div>;
}
