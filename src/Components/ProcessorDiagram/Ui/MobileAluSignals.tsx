import type { ProcessorDiagramProps } from '@/Types/Components';
import SignalButton from '../../SignalButton';

type MobileAluSignalsProps = Pick<ProcessorDiagramProps, 'signals' | 'onClickItem'>;

const MobileAluSignals = ({ signals, onClickItem }: MobileAluSignalsProps) => (
  <>
    <SignalButton
      id="weja"
      signal={signals.weja}
      label="weja"
      style={{ height: '91%', minHeight: 40 }}
      divClassNames="pathDownOnRight"
      spanClassNames="arrowRightOnBottom"
      onClick={() => onClickItem?.('weja')}
    />
    <SignalButton
      id="wyak"
      signal={signals.wyak}
      label="wyak"
      style={{ height: '91%', minHeight: 40 }}
      divClassNames="pathUpOnLeft"
      spanClassNames="arrowLeftOnBottom"
      onClick={() => onClickItem?.('wyak')}
    />
  </>
);

export default MobileAluSignals;
