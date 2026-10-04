import { useI18n } from '@/I18n/Hooks/UseI18n';
import { normalizeMnemonicToken } from '@/Assembler/CommandMnemonics';
import { cloneJson } from '@/Shared/Utils/Json';
import type { CommandCatalogProps } from '@/Components/CommandCatalog/Types';
import type { RuntimeCommand } from '@/Assembler/Types/Registry';
import { useEffect, useRef, useState } from 'react';
import { findDuplicateNames } from '../Helpers/CommandCatalog';

/** Keeps catalog edits and selection in sync, retaining commands hidden by a smaller opcode width. */
export const useCommandCatalog = ({ commandList = [], codeBits = 6, onUpdateCommandList }: CommandCatalogProps) => {
  const { t, locale } = useI18n();
  const [localList, setLocalList] = useState(() => cloneJson(commandList));
  const fullListRef = useRef(cloneJson(commandList));
  const [selectedCommand, setSelectedCommand] = useState(commandList.length ? 0 : null);
  const [editCommandEnabled, setEditCommandEnabled] = useState(false);
  const [editCommandField, setEditCommandField] = useState('');
  const [commandInputValue, setCommandInputValue] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingCommandOriginalName, setEditingCommandOriginalName] = useState('');
  const [newCommandLines, setNewCommandLines] = useState('');
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
    setEditCommandEnabled(false);
    setIsEditingName(false);
  }, [incomingJson]);

  useEffect(() => {
    if (codeBits === previousBits.current) {
      return;
    }
    previousBits.current = codeBits;
    const next = cloneJson(fullListRef.current.slice(0, maxCommands));
    setLocalList(next);
    setSelectedCommand((current) => (next.length ? Math.min(current ?? 0, next.length - 1) : null));
    setEditCommandEnabled(false);
    emitUpdate(next);
  }, [codeBits]);

  const selectCommand = (index: number) => {
    setSelectedCommand(index);
    setCommandInputValue(localList[index]?.name || '');
    setIsCreatingNew(false);
    setEditCommandEnabled(false);
    setIsEditingName(false);
  };

  const changeInput = (value: string) => {
    setCommandInputValue(value);
    if (isEditingName) {
      return;
    }
    const index = localList.findIndex(
      (command) => normalizeMnemonicToken(command.name, 'lower') === normalizeMnemonicToken(value, 'lower')
    );
    setEditCommandEnabled(false);
    if (value.trim() && index >= 0) {
      setSelectedCommand(index);
      setIsCreatingNew(false);
    } else {
      setSelectedCommand(null);
      setIsCreatingNew(!!value.trim());
      if (!isCreatingNew) setNewCommandLines('');
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
    setEditCommandEnabled(false);
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
    setCommandInputValue(nextIndex == null ? '' : next[nextIndex].name);
    setIsCreatingNew(false);
    setEditCommandEnabled(false);
    setIsEditingName(false);
    emitUpdate(next);
  };

  const cancelNameEdit = () => {
    setCommandInputValue(editingCommandOriginalName);
    setIsEditingName(false);
    setEditingCommandOriginalName('');
  };

  const confirmNameEdit = () => {
    const nextName = commandInputValue.trim();
    if (!nextName) {
      alert(t('commandList.errors.emptyName'));
      setCommandInputValue(editingCommandOriginalName);
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
      setCommandInputValue(editingCommandOriginalName);
      return;
    }
    const rename = (command: RuntimeCommand) =>
      normalizeMnemonicToken(command.name, 'lower') === originalKey ? { ...command, name: nextName } : command;
    const next = localList.map(rename);
    fullListRef.current = fullListRef.current.map(rename);
    setLocalList(next);
    setCommandInputValue(nextName);
    setSelectedCommand(index);
    setIsEditingName(false);
    setEditingCommandOriginalName('');
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
    setCommandInputValue(name);
    setIsCreatingNew(false);
    setNewCommandLines('');
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
    setCommandInputValue(next[0]?.name || '');
    setEditCommandEnabled(false);
    setIsEditingName(false);
    setIsCreatingNew(false);
  };

  const startCodeEdit = () => {
    if (!selected) {
      return;
    }
    setEditCommandField(selected.lines || '');
    setEditCommandEnabled(true);
  };

  const startNameEdit = () => {
    if (!matchingCommand) {
      return;
    }
    setIsEditingName(true);
    setEditingCommandOriginalName(matchingCommand.name);
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
