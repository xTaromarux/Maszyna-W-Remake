export default function BusLabel({ busName, busValue, showInvisibleRegisters = false, mobileView = false, formatNumber }) {
  if (mobileView) return null;
  return <>
    {showInvisibleRegisters && <span style={{ marginRight: 5 }}>{busName} : {formatNumber(busValue)}</span>}
    <span>{busName.toLowerCase()}</span>
  </>;
}
