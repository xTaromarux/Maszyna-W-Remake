'use client';

import { useI18n } from '@/I18n/Hooks/UseI18n';
import { formatNumberInput } from '@/Shared/Utils/Numbers';
import { parseRegisterInput } from '@/Shared/Utils/RegisterInput';
import { useMachineServices } from '@/Machine/MachineContext';
import type { NumberFormat } from '@/Shared/Types/Numbers';
import type { ChangeEvent } from 'react';
import { useEffect, useState } from 'react';
import { normalizeRegisterValue } from '../Helpers/NormalizeRegisterValue';

const REGISTER_TYPES: Record<string, string> = {
  AK: 'ACC',
  L: 'programCounter',
  JAML: 'JAL',
};

interface RegisterValueOptions {
  model: number;
  label: string;
  numberFormat: NumberFormat;
  fullName: string;
  onUpdateModel?: (value: number) => void;
}

/** Synchronizes the input draft with its register and commits valid integers, wrapping values outside its range. */
export const useRegisterValue = ({ model, label, numberFormat, fullName, onUpdateModel }: RegisterValueOptions) => {
  const { t } = useI18n();
  const { showToast, getMaxValueForRegister } = useMachineServices();

  const [draft, setDraft] = useState(() => formatNumberInput(model, numberFormat));

  useEffect(() => {
    setDraft(formatNumberInput(model, numberFormat));
  }, [model, numberFormat]);

  const restoreDraft = () => setDraft(formatNumberInput(model, numberFormat));

  const commitValue = (value: number) => {
    setDraft(formatNumberInput(value, numberFormat));
    onUpdateModel?.(value);
  };

  const notifyModulo = (original: bigint, normalized: bigint, maximum: number) => {
    const message = t('common.validation.registerModulo', {
      value: String(original),
      max: maximum,
      name: fullName || label,
      result: Number(normalized),
    });

    showToast(message);
  };

  const updateValue = (event: ChangeEvent<HTMLInputElement>) => {
    const rawInput = event.target.value;
    const trimmedInput = rawInput.trim();

    // Empty input and a lone minus sign are unfinished edits, not register values.
    if (trimmedInput === '' || trimmedInput === '-') {
      setDraft(rawInput);
      return;
    }

    const parsedValue = parseRegisterInput(rawInput, numberFormat);
    if (parsedValue === null) {
      restoreDraft();
      return;
    }

    const registerType = REGISTER_TYPES[label] || label;
    const maximum = getMaxValueForRegister(registerType);
    const normalizedValue = normalizeRegisterValue(parsedValue, maximum);

    if (normalizedValue !== parsedValue) {
      notifyModulo(parsedValue, normalizedValue, maximum);
    }

    const value = Number(normalizedValue);
    if (!Number.isFinite(value)) {
      restoreDraft();
      return;
    }

    commitValue(value);
  };

  const finishEditing = () => {
    if (draft === '') {
      commitValue(0);
      return;
    }

    restoreDraft();
  };

  return { draft, updateValue, finishEditing };
};
