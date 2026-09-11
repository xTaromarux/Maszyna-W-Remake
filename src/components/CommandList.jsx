'use client';

import { useEffect, useRef, useState } from 'react';
import { useI18n } from '@/i18n';

const clone = (value) => JSON.parse(JSON.stringify(value));
const nameKey = (name) => String(name ?? '').trim().toLowerCase();
function ActionIcon({ name }) {
  const paths = {
    trash: <><polyline data-editor-command-list="" points="3 6 5 6 21 6" /><path data-editor-command-list="" d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path data-editor-command-list="" d="M10 11v6m4-6v6" /><path data-editor-command-list="" d="M15 6V4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v2" /></>,
    confirm: <polyline data-editor-command-list="" points="20 6 9 17 4 12" />,
    cancel: <path data-editor-command-list="" d="M18 6L6 18M6 6l12 12" />,
    edit: <path data-editor-command-list="" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />,
    add: <><path data-editor-command-list="" d="M12 16V8m4 4H8" /><circle data-editor-command-list="" cx="12" cy="12" r="9" /></>,
    load: <path data-editor-command-list="" d="M12 10v9m0-9l3 3m-3-3l-3 3m8.5 2c1.519 0 2.5-1.231 2.5-2.75a2.75 2.75 0 00-2.016-2.65A5 5 0 008.37 8.108a3.5 3.5 0 00-1.87 6.746" />,
    download: <path data-editor-command-list="" d="M12 5v8.5m0 0l3-3m-3 3l-3-3M5 15v2a2 2 0 002 2h10a2 2 0 002-2v-2" />,
  };
  return <svg data-editor-command-list="" xmlns="http://www.w3.org/2000/svg" width={name === 'trash' ? 24 : 20} height={name === 'trash' ? 24 : 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

export default function CommandList({ visible = false, commandList = [], codeBits = 6, onUpdateCommandList, onClose, className = '', ...rest }) {
  const { t, locale } = useI18n();
  const [localList, setLocalList] = useState(() => clone(commandList));
  const fullListRef = useRef(clone(commandList));
  const [selectedCommand, setSelectedCommand] = useState(commandList.length ? 0 : null);
  const [editCommandEnabled, setEditCommandEnabled] = useState(false);
  const [editCommandField, setEditCommandField] = useState('');
  const [commandInputValue, setCommandInputValue] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingCommandOriginalName, setEditingCommandOriginalName] = useState('');
  const [newCommandLines, setNewCommandLines] = useState('');
  const listRef = useRef(null);
  const previousBits = useRef(codeBits);
  const lastEmitted = useRef(null);
  const incomingJson = JSON.stringify(commandList);
  const maxCommands = 2 ** codeBits;
  const matchingCommand = commandInputValue.trim() ? localList.find((command) => nameKey(command.name) === nameKey(commandInputValue)) : null;
  const selected = selectedCommand == null ? null : localList[selectedCommand];

  const emitUpdate = (next) => {
    const seen = new Set();
    const duplicates = new Set();
    for (const command of next) {
      const key = nameKey(command.name);
      if (seen.has(key)) duplicates.add(command.name.trim());
      seen.add(key);
    }
    if (duplicates.size) {
      alert(t('commandList.errors.duplicatesFound', { names: [...duplicates].join(', ') }));
      return false;
    }
    const copy = clone(next);
    lastEmitted.current = JSON.stringify(copy);
    onUpdateCommandList?.(copy);
    return true;
  };

  useEffect(() => {
    if (incomingJson === lastEmitted.current) return;
    const next = JSON.parse(incomingJson);
    fullListRef.current = clone(next);
    setLocalList(next);
    setSelectedCommand((current) => next.length ? Math.min(current ?? 0, next.length - 1) : null);
    setEditCommandEnabled(false);
    setIsEditingName(false);
  }, [incomingJson]);

  useEffect(() => {
    if (codeBits === previousBits.current) return;
    previousBits.current = codeBits;
    const next = clone(fullListRef.current.slice(0, maxCommands));
    setLocalList(next);
    setSelectedCommand((current) => next.length ? Math.min(current ?? 0, next.length - 1) : null);
    setEditCommandEnabled(false);
    emitUpdate(next);
  }, [codeBits]);

  const selectCommand = (index) => {
    setSelectedCommand(index);
    setCommandInputValue(localList[index]?.name || '');
    setIsCreatingNew(false);
    setEditCommandEnabled(false);
    setIsEditingName(false);
  };
  const changeInput = (value) => {
    setCommandInputValue(value);
    if (isEditingName) return;
    const index = localList.findIndex((command) => nameKey(command.name) === nameKey(value));
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
    if (!selected) return;
    const next = localList.map((command, index) => index === selectedCommand ? { ...command, lines: editCommandField } : command);
    fullListRef.current = fullListRef.current.map((command) => command.name === selected.name ? { ...command, lines: editCommandField } : command);
    setLocalList(next);
    setEditCommandEnabled(false);
    emitUpdate(next);
  };
  const deleteCommand = () => {
    if (!selected) return;
    const next = localList.filter((_, index) => index !== selectedCommand);
    fullListRef.current = fullListRef.current.filter((command) => command.name !== selected.name);
    const nextIndex = next.length ? Math.min(selectedCommand, next.length - 1) : null;
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
    const originalKey = nameKey(editingCommandOriginalName);
    const index = localList.findIndex((command) => nameKey(command.name) === originalKey);
    if (index < 0) { alert(t('commandList.errors.notFound')); cancelNameEdit(); return; }
    if (fullListRef.current.some((command) => nameKey(command.name) !== originalKey && nameKey(command.name) === nameKey(nextName))) {
      alert(t('commandList.errors.duplicate', { name: nextName }));
      setCommandInputValue(editingCommandOriginalName);
      return;
    }
    const rename = (command) => nameKey(command.name) === originalKey ? { ...command, name: nextName } : command;
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
    if (localList.length >= maxCommands) { alert(t('commandList.errors.limitReached')); return; }
    const name = commandInputValue.trim();
    if (!name) { alert(t('commandList.errors.emptyName')); return; }
    if (fullListRef.current.some((command) => nameKey(command.name) === nameKey(name))) { alert(t('commandList.errors.duplicate', { name })); return; }
    const command = { name, args: 0, kind: 'exec', description: { [locale || 'pl']: t('commandList.commandDescription', { name }) }, lines: newCommandLines || '' };
    const next = [...localList, command];
    fullListRef.current = [...fullListRef.current, clone(command)];
    setLocalList(next);
    setSelectedCommand(next.length - 1);
    setCommandInputValue(name);
    setIsCreatingNew(false);
    setNewCommandLines('');
    emitUpdate(next);
    requestAnimationFrame(() => listRef.current?.querySelectorAll('button')[next.length - 1]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }));
  };
  const loadCommandList = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.lst,.json';
    input.onchange = async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      try {
        const parsed = JSON.parse(await file.text());
        if (!Array.isArray(parsed) || parsed.some((command) => !command || typeof command.name !== 'string' || (command.lines != null && typeof command.lines !== 'string'))) throw new Error('Invalid command list');
        const normalized = parsed.map((command) => ({ ...command, kind: command.kind || 'exec', lines: command.lines || '' }));
        const next = normalized.slice(0, maxCommands);
        if (!emitUpdate(next)) return;
        fullListRef.current = normalized;
        setLocalList(next);
        setSelectedCommand(next.length ? 0 : null);
        setCommandInputValue(next[0]?.name || '');
        setEditCommandEnabled(false);
        setIsEditingName(false);
        setIsCreatingNew(false);
      } catch { alert(t('commandList.errors.loadFailed')); }
    };
    input.click();
  };
  const downloadCommandList = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(fullListRef.current, null, 2)], { type: 'application/json' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'commandList.json';
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };
  const placeholder = isEditingName ? t('commandList.placeholder.editName', { name: editingCommandOriginalName }) : matchingCommand ? t('commandList.placeholder.editCommand', { name: matchingCommand.name }) : t('commandList.placeholder.newName');

  if (!visible) return null;
  return <div data-editor-command-list="" {...rest} className={`modal-overlay ${className}`} onClick={(event) => { if (event.target === event.currentTarget) onClose?.(); }}>
    <div data-editor-command-list="" id="commandList" role="dialog" aria-modal="true" aria-labelledby="command-list-title">
      <div data-editor-command-list="" className="header"><h1 data-editor-command-list="" id="command-list-title">{t('commandList.title')}</h1><button data-editor-command-list="" className="closeBtn closeButton" onClick={onClose} aria-label={t('commandList.closeAria')}>&times;</button></div>
      <div data-editor-command-list="" id="commandListTable" ref={listRef}><span data-editor-command-list="">{localList.length} / {maxCommands}</span>{localList.map((command, index) => <button data-editor-command-list="" key={index} onClick={() => selectCommand(index)} className={`execution-btn execution-btn--run${selectedCommand === index ? ' selected' : ''}`}><span data-editor-command-list="">{command.name}</span></button>)}</div>
      <div data-editor-command-list="" className="right-panel">
        {(selected || isCreatingNew) && <div data-editor-command-list="" id="commandDetails"><div data-editor-command-list="" className="roskazCode">
          {selected ? <textarea data-editor-command-list="" value={editCommandEnabled ? editCommandField : selected.lines || ''} onChange={(event) => setEditCommandField(event.target.value)} disabled={!editCommandEnabled} aria-label={t('commandList.codePlaceholder')} /> : <textarea data-editor-command-list="" value={newCommandLines} onChange={(event) => setNewCommandLines(event.target.value)} placeholder={t('commandList.codePlaceholder')} />}
        </div></div>}
        <div data-editor-command-list="" className="actionButtons">
          {selected && <div data-editor-command-list="" className="top-actions">
            <button data-editor-command-list="" onClick={deleteCommand} title={t('commandList.deleteTitle')} className="execution-btn execution-btn--run"><ActionIcon name="trash" /><span data-editor-command-list="">{t('commandList.delete')}</span></button>
            <button data-editor-command-list="" onClick={() => { setEditCommandField(selected.lines || ''); setEditCommandEnabled(true); }} disabled={!selected || editCommandEnabled} title={t('commandList.editTitle')} className="execution-btn execution-btn--run"><span data-editor-command-list="">{t('commandList.edit')}</span></button>
            <button data-editor-command-list="" onClick={saveCommand} disabled={!editCommandEnabled} title={t('commandList.saveTitle')} className="execution-btn execution-btn--run"><span data-editor-command-list="">{t('commandList.save')}</span></button>
          </div>}
          <div data-editor-command-list="" className="commandInputSection">
            <div data-editor-command-list="" className="unifiedCommandInput"><input data-editor-command-list="" type="text" value={commandInputValue} onChange={(event) => changeInput(event.target.value)} onKeyDown={(event) => { if (!isEditingName) return; if (event.key === 'Enter') { event.preventDefault(); confirmNameEdit(); } else if (event.key === 'Escape') { event.preventDefault(); cancelNameEdit(); } }} placeholder={placeholder} className="commandInput" /></div>
            {isEditingName ? <div data-editor-command-list="" className="editingButtons"><button data-editor-command-list="" onClick={confirmNameEdit} title={t('commandList.confirmTitle')} className="execution-btn execution-btn--run"><ActionIcon name="confirm" /><span data-editor-command-list="">{t('commandList.confirm')}</span></button><button data-editor-command-list="" onClick={cancelNameEdit} title={t('commandList.cancelTitle')} className="execution-btn execution-btn--run"><ActionIcon name="cancel" /><span data-editor-command-list="">{t('commandList.cancel')}</span></button></div> : matchingCommand ? <button data-editor-command-list="" onClick={() => { setIsEditingName(true); setEditingCommandOriginalName(matchingCommand.name); }} title={t('commandList.editNameTitle')} className="execution-btn execution-btn--run"><ActionIcon name="edit" /><span data-editor-command-list="">{t('commandList.edit')}</span></button> : <button data-editor-command-list="" onClick={addCommand} disabled={!commandInputValue.trim()} title={t('commandList.addTitle')} className="execution-btn execution-btn--run"><ActionIcon name="add" /><span data-editor-command-list="">{t('commandList.add')}</span></button>}
          </div>
          <div data-editor-command-list="" className="fileActions"><button data-editor-command-list="" onClick={loadCommandList} title={t('commandList.loadTitle')} className="execution-btn execution-btn--run"><ActionIcon name="load" /><span data-editor-command-list="">{t('commandList.load')}</span></button><button data-editor-command-list="" onClick={downloadCommandList} title={t('commandList.downloadTitle')} className="execution-btn execution-btn--run"><ActionIcon name="download" /><span data-editor-command-list="">{t('commandList.download')}</span></button></div>
        </div>
      </div>
    </div>
  </div>;
}
