import type { BusSignalProps } from '@/Types/Components';
import BusLabel from './BusLabel';

const BusSignal = ({
  signalStatus,
  mobileView = false,
  busValue,
  showInvisibleRegisters = false,
  busName,
  formatNumber,
}: BusSignalProps) => {
  const className = `bus signal${signalStatus ? ' active' : ''}`;

  return (
    <div className={className}>
      <div className="line" />
      <BusLabel
        busName={busName}
        busValue={busValue}
        showInvisibleRegisters={showInvisibleRegisters}
        mobileView={mobileView}
        formatNumber={formatNumber}
      />
    </div>
  );
};

export default BusSignal;
