import { useI18n } from '@/I18n/Hooks/UseI18n';
import { normalizeMnemonicToken } from '@/Assembler/CommandMnemonics';
import { cloneJson } from '@/Shared/Utils/Json';
import type { CommandCatalogProps } from '@/Components/CommandCatalog/Types';
import type { RuntimeCommand } from '@/Assembler/Types/Registry';
import { useEffect, useRef, useState } from 'react';
import { findDuplicateNames } from '../Helpers/CommandCatalog';
import { useCommandDraft } from './Internal/UseCommandDraft';

/** Keeps catalog edits and selection in sync, retaining commands hidden by a smaller opcode width. */
export const useCommandCatalog = ({ commandList = [], codeBits = 6, onUpdateCommandList }: CommandCatalogProps) => {
  const { t, locale } = useI18n();
  const [localList, setLocalList] = useState(() => cloneJson(commandList));
  const fullListRef = useRef(cloneJson(commandList));
  const [selectedCommand, setSelectedCommand] = useState(commandList.length ? 0 : null);
  const draft = useCommandDraft();
  const {
    editCommandEnabled,
    editCommandField,
    commandInputValue,
    isCreatingNew,
    isEditingName,
    editingCommandOriginalName,
    newCommandLines,
    cancelNameEdit,
    setEditCommandField,
    setNewCommandLines,
  } = draft;
  const listRef = useRef<HTMLDivElement | null>(null);
  const previousBits = useRef(codeBits);
  const lastEmitted = useRef<string | null>(null);
  const incomingJson = JSON.stringify(commandList);
  const maxCommands = 2 ** codeBits;
  const matchingCommand = commandInputValue.trim()
    ? localList.find((command) => normalizeMnemonicToken(command.name, 'lower') === normalizeMnemonicToken(commandInputValue, 'lower'))
    : null;
  const selected = selectedCommand == null ? null : localList[selectedCommand];

  const emitUpdate = (next: RuntimeCommand[]) => {
    const duplicates = findDuplicateNames(next);
    if (duplicates.size) {
      alert(t('commandList.errors.duplicatesFound', { names: [...duplicates].join(', ') }));
      return false;
    }
    const copy = cloneJson(next);
    lastEmitted.current = JSON.stringify(copy);
    onUpdateCommandList?.(copy);
    return true;
  };

  useEffect(() => {
    if (incomingJson === lastEmitted.current) {
      return;
    }
    const next = JSON.parse(incomingJson);
    fullListRef.current = cloneJson(next);
    setLocalList(next);
    setSelectedCommand((current) => (next.length ? Math.min(current ?? 0, next.length - 1) : null));
    draft.resetExistingEdits();
  }, [incomingJson]);

  useEffect(() => {
    if (codeBits === previousBits.current) {
      return;
    }
    previousBits.current = codeBits;
    const next = cloneJson(fullListRef.current.slice(0, maxCommands));
    setLocalList(next);
    setSelectedCommand((current) => (next.length ? Math.min(current ?? 0, next.length - 1) : null));
    draft.stopCodeEdit();
    emitUpdate(next);
  }, [codeBits]);

  const selectCommand = (index: number) => {
    setSelectedCommand(index);
    draft.selectExistingDraft(localList[index]?.name || '');
  };

  const changeInput = (value: string) => {
    draft.updateCommandInput(value);
    if (isEditingName) {
      return;
    }
    const index = localList.findIndex(
      (command) => normalizeMnemonicToken(command.name, 'lower') === normalizeMnemonicToken(value, 'lower')
    );
    draft.stopCodeEdit();
    if (value.trim() && index >= 0) {
      setSelectedCommand(index);
      draft.resolveInputMatch(value, true);
    } else {
      setSelectedCommand(null);
      draft.resolveInputMatch(value, false);
    }
  };

  const saveCommand = () => {
    if (!selected) {
      return;
    }
    const next = localList.map((command, index) => (index === selectedCommand ? { ...command, lines: editCommandField } : command));
    fullListRef.current = fullListRef.current.map((command) =>
      command.name === selected.name ? { ...command, lines: editCommandField } : command
    );
    setLocalList(next);
    draft.stopCodeEdit();
    emitUpdate(next);
  };

  const deleteCommand = () => {
    if (!selected) {
      return;
    }
    const next = localList.filter((_, index) => index !== selectedCommand);
    fullListRef.current = fullListRef.current.filter((command) => command.name !== selected.name);
    const nextIndex = next.length ? Math.min(selectedCommand ?? 0, next.length - 1) : null;
    setLocalList(next);
    setSelectedCommand(nextIndex);
    draft.selectExistingDraft(nextIndex == null ? '' : next[nextIndex].name);
    emitUpdate(next);
  };

  const confirmNameEdit = () => {
    const nextName = commandInputValue.trim();
    if (!nextName) {
      alert(t('commandList.errors.emptyName'));
      draft.restoreNameDraft();
      return;
    }
    const originalKey = normalizeMnemonicToken(editingCommandOriginalName, 'lower');
    const index = localList.findIndex((command) => normalizeMnemonicToken(command.name, 'lower') === originalKey);
    if (index < 0) {
      alert(t('commandList.errors.notFound'));
      cancelNameEdit();
      return;
    }
    if (
      fullListRef.current.some(
        (command) =>
          normalizeMnemonicToken(command.name, 'lower') !== originalKey &&
          normalizeMnemonicToken(command.name, 'lower') === normalizeMnemonicToken(nextName, 'lower')
      )
    ) {
      alert(t('commandList.errors.duplicate', { name: nextName }));
      draft.restoreNameDraft();
      return;
    }
    const rename = (command: RuntimeCommand) =>
      normalizeMnemonicToken(command.name, 'lower') === originalKey ? { ...command, name: nextName } : command;
    const next = localList.map(rename);
    fullListRef.current = fullListRef.current.map(rename);
    setLocalList(next);
    draft.updateCommandInput(nextName);
    setSelectedCommand(index);
    draft.finishNameEdit();
    emitUpdate(next);
  };

  const addCommand = () => {
    if (localList.length >= maxCommands) {
      alert(t('commandList.errors.limitReached'));
      return;
    }
    const name = commandInputValue.trim();
    if (!name) {
      alert(t('commandList.errors.emptyName'));
      return;
    }
    if (fullListRef.current.some((command) => normalizeMnemonicToken(command.name, 'lower') === normalizeMnemonicToken(name, 'lower'))) {
      alert(t('commandList.errors.duplicate', { name }));
      return;
    }
    const command: RuntimeCommand = {
      name,
      args: 0,
      kind: 'exec',
      description: { [locale || 'pl']: t('commandList.commandDescription', { name }) },
      lines: newCommandLines || '',
    };
    const next = [...localList, command];
    fullListRef.current = [...fullListRef.current, cloneJson(command)];
    setLocalList(next);
    setSelectedCommand(next.length - 1);
    draft.finishNewCommand(name);
    emitUpdate(next);
    requestAnimationFrame(() =>
      listRef.current?.querySelectorAll('button')[next.length - 1]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    );
  };

  const importCommands = (normalized: RuntimeCommand[]) => {
    const next = normalized.slice(0, maxCommands);
    const duplicates = findDuplicateNames(normalized);
    if (duplicates.size) {
      alert(t('commandList.errors.duplicatesFound', { names: [...duplicates].join(', ') }));
      return;
    }
    if (!emitUpdate(next)) {
      return;
    }
    fullListRef.current = normalized;
    setLocalList(next);
    setSelectedCommand(next.length ? 0 : null);
    draft.resetImportedDraft(next[0]?.name || '');
  };

  const startCodeEdit = () => {
    if (!selected) {
      return;
    }
    draft.startCodeEdit(selected.lines || '');
  };

  const startNameEdit = () => {
    if (!matchingCommand) {
      return;
    }
    draft.startNameEdit(matchingCommand.name);
  };

  const placeholder = isEditingName
    ? t('commandList.placeholder.editName', { name: editingCommandOriginalName })
    : matchingCommand
      ? t('commandList.placeholder.editCommand', { name: matchingCommand.name })
      : t('commandList.placeholder.newName');

  return {
    localList,
    fullListRef,
    selectedCommand,
    editCommandEnabled,
    editCommandField,
    commandInputValue,
    isCreatingNew,
    isEditingName,
    newCommandLines,
    listRef,
    maxCommands,
    selected,
    matchingCommand,
    selectCommand,
    changeInput,
    saveCommand,
    deleteCommand,
    cancelNameEdit,
    confirmNameEdit,
    addCommand,
    importCommands,
    startCodeEdit,
    startNameEdit,
    setEditCommandField,
    setNewCommandLines,
    placeholder,
  };
};

export type CommandCatalog = ReturnType<typeof useCommandCatalog>;
