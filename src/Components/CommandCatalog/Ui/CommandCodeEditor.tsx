import { useI18n } from '@/I18n/Hooks/UseI18n';
import type { RuntimeCommand } from '@/Assembler/Types/Registry';
import type { Action, Update } from '@/Shared/Types/Common';
import { ActionIcon } from './ActionIcon';

type SelectedCode = Pick<RuntimeCommand, 'lines'> | null | undefined;

interface CommandCodeEditorProps {
  selected: SelectedCode;
  isCreatingNew: boolean;
  editCommandEnabled: boolean;
  editCommandField: string;
  newCommandLines: string;
  setEditCommandField: Update<string>;
  setNewCommandLines: Update<string>;
}

/** Keeps existing-command edits and the new-command microcode draft in separate inputs. */
export const CommandCodeEditor = ({
  selected,
  isCreatingNew,
  editCommandEnabled,
  editCommandField,
  newCommandLines,
  setEditCommandField,
  setNewCommandLines,
}: CommandCodeEditorProps) => {
  const { t } = useI18n();
  return (
    <>
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
    </>
  );
};

interface CommandCodeActionsProps {
  selected: SelectedCode;
  editCommandEnabled: boolean;
  deleteCommand: Action;
  startCodeEdit: Action;
  saveCommand: Action;
}

/** Renders code actions in their original toolbar position, outside the code input wrapper. */
export const CommandCodeActions = ({
  selected,
  editCommandEnabled,
  deleteCommand,
  startCodeEdit,
  saveCommand,
}: CommandCodeActionsProps) => {
  const { t } = useI18n();
  return (
    <>
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
    </>
  );
};
