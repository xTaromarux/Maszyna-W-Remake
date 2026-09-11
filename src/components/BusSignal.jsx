import BusLabel from './BusLabel';

export default function BusSignal({ signalStatus, mobileView = false, busValue, showInvisibleRegisters = false, busName, formatNumber }) {
  return <div className={`bus signal${signalStatus ? ' active' : ''}`}>
    <div className="line" />
    <BusLabel {...{ busName, busValue, showInvisibleRegisters, mobileView, formatNumber }} />
  </div>;
}
