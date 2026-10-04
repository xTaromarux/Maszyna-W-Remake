import type { BusSignalProps } from '@/Types/Components';
import BusLabel from './BusLabel';

export default function BusSignal({
  signalStatus,
  mobileView = false,
  busValue,
  showInvisibleRegisters = false,
  busName,
  formatNumber,
}: BusSignalProps) {
  return (
    <div className={`bus signal${signalStatus ? ' active' : ''}`}>
      <div className="line" />
      <BusLabel {...{ busName, busValue, showInvisibleRegisters, mobileView, formatNumber }} />
    </div>
  );
}
