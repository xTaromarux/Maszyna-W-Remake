import { useI18n } from '@/I18n/Index';
import { collectCommandAliases } from '@/Shared/Utils/CommandMnemonics';
import type { MemoryContentProps } from '@/Types/Components';
import { Fragment } from 'react';
import MemoryInput from './MemoryInput';

type MemoryTableProps = Pick<MemoryContentProps, 'A' | 'mem' | 'formatNumber' | 'decToCommand' | 'decToArgument'> & {
  width: number;
  min: number;
  max: number;
  displayValue: (value: number) => number;
  updateMemoryValue: (raw: string, index: number) => boolean;
};

const MemoryTable = ({
  A,
  mem,
  formatNumber,
  decToCommand,
  decToArgument,
  width,
  min,
  max,
  displayValue,
  updateMemoryValue,
}: MemoryTableProps) => {
  const { t, locale } = useI18n();
  const addressLabel = t(width < 1400 ? 'memory.labelShort' : 'memory.labelFull');

  return (
    <div id="memoryTable">
      <div className="scrollWrapper">
        <div className="memoryContainer">
          <span className="label">{addressLabel}</span>
          <span className="label">{t('memory.value')}</span>
          <span className="label">{t('memory.code')}</span>
          <span className="label">{t('memory.address')}</span>
          {mem.map((value, index) => {
            const isSelected = A === index;
            const selectedClass = isSelected ? 'selected' : '';
            const command = decToCommand(value);
            const commandLabel = command ? collectCommandAliases(command, { locale }).preferred[0] : t('memory.empty');

            // Fragments keep each cell directly in the four-column CSS grid.
            return (
              <Fragment key={index}>
                <span className={selectedClass}>{formatNumber(index)}</span>
                <div className={`inputWrapper${isSelected ? ' selected' : ''}`}>
                  <span>{formatNumber(value)}</span>
                  <MemoryInput
                    value={displayValue(value)}
                    min={min}
                    max={max}
                    label={t('memory.cellLabel', { index })}
                    onChange={(raw) => updateMemoryValue(raw, index)}
                  />
                </div>
                <span className={selectedClass}>{commandLabel}</span>
                <span className={selectedClass}>{formatNumber(decToArgument(value))}</span>
              </Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MemoryTable;
