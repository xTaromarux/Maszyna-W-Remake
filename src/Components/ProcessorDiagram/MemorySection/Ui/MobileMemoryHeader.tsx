import ListLinesIcon from '@/Shared/Ui/Icons/ListLinesIcon';
import { useI18n } from '@/I18n/Hooks/UseI18n';
import type { MobileMemoryHeaderProps } from '@/Components/ProcessorDiagram/MemorySection/Types';
import BusLabel from '../../Ui/BusLabel';
import SignalButton from '../../Ui/SignalButton';

const MobileMemoryHeader = ({
  signals,
  mobileView,
  busAValue,
  busSValue,
  showInvisibleRegisters = false,
  formatNumber,
  onOpen,
  onClickItem,
}: MobileMemoryHeaderProps) => {
  const { t } = useI18n();
  // BusLabel's mobileView flag hides the label, so the mobile header inverts it.
  const hideBusLabels = !mobileView;

  return (
    <div className="mobile-memory-header">
      <div className="memory-signal-in">
        <SignalButton
          id="wea"
          signal={signals.wea}
          label="wea"
          divClassNames="pathDownOnRight"
          spanClassNames="arrowRightOnBottom"
          onClick={() => onClickItem?.('wea')}
          style={{ gridArea: 'wea' }}
        />
      </div>
      <div className="busLabel busLabelUp">
        <BusLabel
          busName="A"
          busValue={busAValue}
          showInvisibleRegisters={showInvisibleRegisters}
          mobileView={hideBusLabels}
          formatNumber={formatNumber}
        />
      </div>
      <button type="button" onClick={onOpen} className="mobile-memory-button" style={{ gridArea: 'memory' }}>
        <ListLinesIcon />
        <span>{t('memory.sectionTitle')}</span>
      </button>
      <div className="memory-signals-in" style={{ gridArea: 'memory-signals-in' }}>
        <SignalButton
          id="czyt"
          signal={signals.czyt}
          label="czyt"
          spanClassNames="lineLeftOnBottom"
          onClick={() => onClickItem?.('czyt')}
        />
        <SignalButton
          id="pisz"
          signal={signals.pisz}
          label="pisz"
          spanClassNames="lineLeftOnBottom"
          onClick={() => onClickItem?.('pisz')}
        />
      </div>
      <div className="memory-signals-out" style={{ gridArea: 'memory-signals-out' }}>
        <SignalButton
          id="wes"
          signal={signals.wes}
          label="wes"
          divClassNames="pathUpOnRight"
          spanClassNames="arrowRightOnBottom"
          onClick={() => onClickItem?.('wes')}
          style={{ gridArea: 'wes' }}
        />
        <SignalButton
          id="wys"
          signal={signals.wys}
          label="wys"
          divClassNames="pathDownOnLeft"
          spanClassNames="lineLeftOnBottom"
          onClick={() => onClickItem?.('wys')}
          style={{ gridArea: 'wys' }}
        />
      </div>
      <div className="busLabel busLabelDown">
        <BusLabel
          busName="S"
          busValue={busSValue}
          showInvisibleRegisters={showInvisibleRegisters}
          mobileView={hideBusLabels}
          formatNumber={formatNumber}
        />
      </div>
    </div>
  );
};

export default MobileMemoryHeader;
