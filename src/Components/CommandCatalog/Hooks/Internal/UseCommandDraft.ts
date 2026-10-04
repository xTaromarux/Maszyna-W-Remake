import { useState } from 'react';

/** Owns name and microcode drafts without coupling their independent editing modes to catalog publication. */
export const useCommandDraft = () => {
  const [editCommandEnabled, setEditCommandEnabled] = useState(false);
  const [editCommandField, setEditCommandField] = useState('');
  const [commandInputValue, setCommandInputValue] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingCommandOriginalName, setEditingCommandOriginalName] = useState('');
  const [newCommandLines, setNewCommandLines] = useState('');

  const stopCodeEdit = () => setEditCommandEnabled(false);

  const resetExistingEdits = () => {
    setEditCommandEnabled(false);
    setIsEditingName(false);
  };

  const selectExistingDraft = (name: string) => {
    setCommandInputValue(name);
    setIsCreatingNew(false);
    resetExistingEdits();
  };

  const updateCommandInput = (value: string) => setCommandInputValue(value);

  const resolveInputMatch = (value: string, matchesExisting: boolean) => {
    if (matchesExisting) {
      setIsCreatingNew(false);
      return;
    }

    setIsCreatingNew(Boolean(value.trim()));
    if (!isCreatingNew) {
      setNewCommandLines('');
    }
  };

  const startCodeEdit = (lines: string) => {
    setEditCommandField(lines);
    setEditCommandEnabled(true);
  };

  const startNameEdit = (name: string) => {
    setIsEditingName(true);
    setEditingCommandOriginalName(name);
  };

  const restoreNameDraft = () => setCommandInputValue(editingCommandOriginalName);

  const finishNameEdit = () => {
    setIsEditingName(false);
    setEditingCommandOriginalName('');
  };

  const cancelNameEdit = () => {
    restoreNameDraft();
    finishNameEdit();
  };

  const finishNewCommand = (name: string) => {
    setCommandInputValue(name);
    setIsCreatingNew(false);
    setNewCommandLines('');
  };

  const resetImportedDraft = (name: string) => {
    setCommandInputValue(name);
    resetExistingEdits();
    setIsCreatingNew(false);
  };

  return {
    editCommandEnabled,
    editCommandField,
    commandInputValue,
    isCreatingNew,
    isEditingName,
    editingCommandOriginalName,
    newCommandLines,
    setEditCommandField,
    setNewCommandLines,
    stopCodeEdit,
    resetExistingEdits,
    selectExistingDraft,
    updateCommandInput,
    resolveInputMatch,
    startCodeEdit,
    startNameEdit,
    restoreNameDraft,
    finishNameEdit,
    cancelNameEdit,
    finishNewCommand,
    resetImportedDraft,
  };
};
