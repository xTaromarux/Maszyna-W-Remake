import RegisterComponent from './RegisterComponent';

export default function RPRegisterSection({ visible, RP, numberFormat, onUpdateRP, onUpdateNumberFormat }) {
  if (!visible) return null;
  return <div id="rpRegister">
    <div style={{ height: 33 }} />
    <RegisterComponent label="RP" model={RP} onUpdateModel={onUpdateRP} numberFormat={numberFormat} onUpdateNumberFormat={onUpdateNumberFormat} />
  </div>;
}
