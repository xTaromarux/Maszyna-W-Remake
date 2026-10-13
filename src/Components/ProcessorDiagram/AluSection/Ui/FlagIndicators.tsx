import { useI18n } from '@/I18n/Hooks/UseI18n';
import { toUnsigned } from '@/Shared/Utils/Numbers';

type FlagIndicatorsProps = {
  accumulator: number;
  wordBits: number;
};

const FlagIndicators = ({ accumulator, wordBits }: FlagIndicatorsProps) => {
  const { t } = useI18n();
  const unsignedAccumulator = toUnsigned(accumulator, wordBits);
  const signBitValue = 2 ** (wordBits - 1);
  const isNegative = unsignedAccumulator >= signBitValue;
  const isZero = unsignedAccumulator === 0;

  return (
    <div id="flags">
      {t('calc.flags.label')}:{isNegative && <div title={t('calc.flags.negativeTitle')}>N</div>}
      {isZero && <div title={t('calc.flags.zeroTitle')}>Z</div>}
    </div>
  );
};

export default FlagIndicators;
