import { useI18n } from '@/I18n/Hooks/UseI18n';
import type { CommandCatalog } from '../Hooks/UseCommandCatalog';
import type { useCommandCatalogFiles } from '../Hooks/UseCommandCatalogFiles';
import { ActionIcon } from './ActionIcon';
import { CommandCodeActions, CommandCodeEditor } from './CommandCodeEditor';
import { CommandNameEditor } from './CommandNameEditor';

interface CommandEditorPanelProps {
  catalog: Pick<
    CommandCatalog,
    | 'editCommandEnabled'
    | 'editCommandField'
    | 'commandInputValue'
    | 'isCreatingNew'
    | 'isEditingName'
    | 'newCommandLines'
    | 'selected'
    | 'matchingCommand'
    | 'changeInput'
    | 'saveCommand'
    | 'deleteCommand'
    | 'cancelNameEdit'
    | 'confirmNameEdit'
    | 'addCommand'
    | 'startCodeEdit'
    | 'startNameEdit'
    | 'setEditCommandField'
    | 'setNewCommandLines'
    | 'placeholder'
  >;
  files: ReturnType<typeof useCommandCatalogFiles>;
}

/** Renders opcode name and microcode editing alongside catalog file actions. */
export const CommandEditorPanel = ({ catalog, files }: CommandEditorPanelProps) => {
  const { t } = useI18n();
  const {
    editCommandEnabled,
    editCommandField,
    commandInputValue,
    isCreatingNew,
    isEditingName,
    newCommandLines,
    selected,
    matchingCommand,
    changeInput,
    saveCommand,
    deleteCommand,
    cancelNameEdit,
    confirmNameEdit,
    addCommand,
    startCodeEdit,
    startNameEdit,
    setEditCommandField,
    setNewCommandLines,
    placeholder,
  } = catalog;
  const { loadCommandList, downloadCommandList } = files;

  return (
    <div data-editor-command-list="" className="right-panel">
      <CommandCodeEditor
        selected={selected}
        isCreatingNew={isCreatingNew}
        editCommandEnabled={editCommandEnabled}
        editCommandField={editCommandField}
        newCommandLines={newCommandLines}
        setEditCommandField={setEditCommandField}
        setNewCommandLines={setNewCommandLines}
      />
      <div data-editor-command-list="" className="actionButtons">
        <CommandCodeActions
          selected={selected}
          editCommandEnabled={editCommandEnabled}
          deleteCommand={deleteCommand}
          startCodeEdit={startCodeEdit}
          saveCommand={saveCommand}
        />
        <CommandNameEditor
          commandInputValue={commandInputValue}
          isEditingName={isEditingName}
          hasMatchingCommand={Boolean(matchingCommand)}
          placeholder={placeholder}
          changeInput={changeInput}
          confirmNameEdit={confirmNameEdit}
          cancelNameEdit={cancelNameEdit}
          startNameEdit={startNameEdit}
          addCommand={addCommand}
        />
        <div data-editor-command-list="" className="fileActions">
          <button
            data-editor-command-list=""
            onClick={loadCommandList}
            title={t('commandList.loadTitle')}
            className="execution-btn execution-btn--run"
          >
            <ActionIcon name="load" />
            <span data-editor-command-list="">{t('commandList.load')}</span>
          </button>
          <button
            data-editor-command-list=""
            onClick={downloadCommandList}
            title={t('commandList.downloadTitle')}
            className="execution-btn execution-btn--run"
          >
            <ActionIcon name="download" />
            <span data-editor-command-list="">{t('commandList.download')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
