import { useI18n } from '@/I18n/Hooks/UseI18n';
import type { CommandCatalog } from '../Hooks/UseCommandCatalog';
import type { useCommandCatalogFiles } from '../Hooks/UseCommandCatalogFiles';
import { ActionIcon } from './ActionIcon';

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
      {(selected || isCreatingNew) && (
        <div data-editor-command-list="" id="commandDetails">
          <div data-editor-command-list="" className="roskazCode">
            {selected ? (
              <textarea
                data-editor-command-list=""
                value={editCommandEnabled ? editCommandField : selected.lines || ''}
                onChange={(event) => setEditCommandField(event.target.value)}
                disabled={!editCommandEnabled}
                aria-label={t('commandList.codePlaceholder')}
              />
            ) : (
              <textarea
                data-editor-command-list=""
                value={newCommandLines}
                onChange={(event) => setNewCommandLines(event.target.value)}
                placeholder={t('commandList.codePlaceholder')}
              />
            )}
          </div>
        </div>
      )}
      <div data-editor-command-list="" className="actionButtons">
        {selected && (
          <div data-editor-command-list="" className="top-actions">
            <button
              data-editor-command-list=""
              onClick={deleteCommand}
              title={t('commandList.deleteTitle')}
              className="execution-btn execution-btn--run"
            >
              <ActionIcon name="trash" />
              <span data-editor-command-list="">{t('commandList.delete')}</span>
            </button>
            <button
              data-editor-command-list=""
              onClick={startCodeEdit}
              disabled={!selected || editCommandEnabled}
              title={t('commandList.editTitle')}
              className="execution-btn execution-btn--run"
            >
              <span data-editor-command-list="">{t('commandList.edit')}</span>
            </button>
            <button
              data-editor-command-list=""
              onClick={saveCommand}
              disabled={!editCommandEnabled}
              title={t('commandList.saveTitle')}
              className="execution-btn execution-btn--run"
            >
              <span data-editor-command-list="">{t('commandList.save')}</span>
            </button>
          </div>
        )}
        <div data-editor-command-list="" className="commandInputSection">
          <div data-editor-command-list="" className="unifiedCommandInput">
            <input
              data-editor-command-list=""
              type="text"
              value={commandInputValue}
              onChange={(event) => changeInput(event.target.value)}
              onKeyDown={(event) => {
                if (!isEditingName) return;
                if (event.key === 'Enter') {
                  event.preventDefault();
                  confirmNameEdit();
                } else if (event.key === 'Escape') {
                  event.preventDefault();
                  cancelNameEdit();
                }
              }}
              placeholder={placeholder}
              className="commandInput"
            />
          </div>
          {isEditingName ? (
            <div data-editor-command-list="" className="editingButtons">
              <button
                data-editor-command-list=""
                onClick={confirmNameEdit}
                title={t('commandList.confirmTitle')}
                className="execution-btn execution-btn--run"
              >
                <ActionIcon name="confirm" />
                <span data-editor-command-list="">{t('commandList.confirm')}</span>
              </button>
              <button
                data-editor-command-list=""
                onClick={cancelNameEdit}
                title={t('commandList.cancelTitle')}
                className="execution-btn execution-btn--run"
              >
                <ActionIcon name="cancel" />
                <span data-editor-command-list="">{t('commandList.cancel')}</span>
              </button>
            </div>
          ) : matchingCommand ? (
            <button
              data-editor-command-list=""
              onClick={startNameEdit}
              title={t('commandList.editNameTitle')}
              className="execution-btn execution-btn--run"
            >
              <ActionIcon name="edit" />
              <span data-editor-command-list="">{t('commandList.edit')}</span>
            </button>
          ) : (
            <button
              data-editor-command-list=""
              onClick={addCommand}
              disabled={!commandInputValue.trim()}
              title={t('commandList.addTitle')}
              className="execution-btn execution-btn--run"
            >
              <ActionIcon name="add" />
              <span data-editor-command-list="">{t('commandList.add')}</span>
            </button>
          )}
        </div>
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
