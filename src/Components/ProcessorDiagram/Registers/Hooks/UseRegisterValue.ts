'use client';

import { useI18n } from '@/I18n/Hooks/UseI18n';
import { formatNumberInput, toSigned } from '@/Shared/Utils/Numbers';
import { parseRegisterInput } from '@/Shared/Utils/RegisterInput';
import { useMachineServices } from '@/Machine/MachineContext';
import type { NumberFormat } from '@/Shared/Types/Numbers';
import type { ChangeEvent, FocusEvent, KeyboardEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
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
  signedDec: boolean;
  wordBits: number;
  onUpdateModel?: (value: number) => void;
}

/** Keeps edits local until Enter/blur; Escape restores the current register value. */
export const useRegisterValue = ({ model, label, numberFormat, fullName, signedDec, wordBits, onUpdateModel }: RegisterValueOptions) => {
  const { t } = useI18n();
  const { showToast, getMaxValueForRegister } = useMachineServices();

  const formatDraft = (value: number) =>
    formatNumberInput(numberFormat === 'dec' && signedDec ? toSigned(value, wordBits) : value, numberFormat);
  const formattedModel = formatDraft(model);
  const [draft, setDraft] = useState(formattedModel);
  const dirty = useRef(false);

  useEffect(() => {
    if (!dirty.current) setDraft(formattedModel);
  }, [formattedModel]);

  const restoreDraft = () => {
    dirty.current = false;
    setDraft(formattedModel);
  };

  const commitValue = (value: number) => {
    dirty.current = false;
    setDraft(formatDraft(value));
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
    dirty.current = true;
    setDraft(event.target.value);
  };

  const finishEditing = (event: FocusEvent<HTMLInputElement> | KeyboardEvent<HTMLInputElement>) => {
    if (!dirty.current) return;
    // Number inputs expose a lone minus as an empty value with badInput set.
    if (event.currentTarget.validity.badInput) {
      restoreDraft();
      return;
    }

    const parsedValue = draft.trim() === '' ? 0n : parseRegisterInput(draft, numberFormat);
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

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' && event.key !== 'Escape') return;
    event.preventDefault();
    event.stopPropagation();
    if (event.key === 'Enter') finishEditing(event);
    else restoreDraft();
  };

  return { draft, updateValue, finishEditing, handleKeyDown };
};
