import type { BusLabelProps } from '@/Components/ProcessorDiagram/Types';
const BusLabel = ({ busName, busValue, showInvisibleRegisters = false, mobileView = false, formatNumber }: BusLabelProps) => {
  if (mobileView) {
    return null;
  }

  const busDescription = showInvisibleRegisters ? `${busName} : ${formatNumber(busValue)}` : null;

  return (
    <>
      {showInvisibleRegisters && <span style={{ marginRight: 5 }}>{busDescription}</span>}
      <span>{busName.toLowerCase()}</span>
    </>
  );
};

export default BusLabel;
