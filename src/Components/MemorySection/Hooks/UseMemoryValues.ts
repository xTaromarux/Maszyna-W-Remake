import { useI18n } from '@/I18n/Index';
import { toSigned, toUnsigned } from '@/Shared/Utils/Numbers';
import { useMachineServices } from '@/State/MachineContext';
import type { MemoryContentProps } from '@/Types/Components';
import { getMemoryBounds, parseMemoryInput } from '../Helpers/MemoryValues';

type MemoryValuesOptions = Pick<MemoryContentProps, 'mem' | 'onUpdateMem'> & {
  wordBits: number;
  signedDec: boolean;
};

/** Displays signed or unsigned words and validates cell edits before updating memory. */
export const useMemoryValues = ({ mem, onUpdateMem, wordBits, signedDec }: MemoryValuesOptions) => {
  const { t } = useI18n();
  const { showToast } = useMachineServices();
  const { min, max } = getMemoryBounds(wordBits, signedDec);

  const displayValue = (value: number) => (signedDec ? toSigned(value, wordBits) : toUnsigned(value, wordBits));

  const updateMemoryValue = (raw: string, index: number): boolean => {
    const value = parseMemoryInput(raw);
    if (value === null) {
      return false;
    }

    if (value < min || value > max) {
      showToast(t('memory.outOfRange', { val: value, min, max, bits: wordBits }));
      return false;
    }

    const nextMemory = [...mem];
    nextMemory[index] = toUnsigned(value, wordBits);
    onUpdateMem?.(nextMemory);
    return true;
  };

  return { min, max, displayValue, updateMemoryValue };
};
