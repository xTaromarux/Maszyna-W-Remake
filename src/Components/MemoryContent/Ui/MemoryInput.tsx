import type { MemoryInputProps } from '@/Types/Components';
import type { ChangeEvent } from 'react';
import { useEffect, useState } from 'react';

const isIncompleteInput = (value: string) => value.trim() === '' || value.trim() === '-';

const MemoryInput = ({ value, min, max, label, onChange }: MemoryInputProps) => {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => setDraft(String(value)), [value]);

  const changeDraft = (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    setDraft(raw);

    if (isIncompleteInput(raw)) {
      return;
    }

    if (!onChange(raw)) {
      setDraft(String(value));
    }
  };

  const finishEditing = () => {
    if (isIncompleteInput(draft)) {
      onChange('0');
      setDraft('0');
      return;
    }

    setDraft(String(value));
  };

  return (
    <input
      inputMode="numeric"
      type="number"
      className="hoverInput"
      aria-label={label}
      value={draft}
      min={min}
      max={max}
      onChange={changeDraft}
      onBlur={finishEditing}
    />
  );
};

export default MemoryInput;
