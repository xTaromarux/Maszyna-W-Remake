import { useI18n } from '@/I18n/Hooks/UseI18n';
import type { Action, Update } from '@/Shared/Types/Common';
import type { KeyboardEvent } from 'react';
import { ActionIcon } from './ActionIcon';

interface CommandNameEditorProps {
  commandInputValue: string;
  isEditingName: boolean;
  hasMatchingCommand: boolean;
  placeholder: string;
  changeInput: Update<string>;
  confirmNameEdit: Action;
  cancelNameEdit: Action;
  startNameEdit: Action;
  addCommand: Action;
}

/** Renders the command name draft, keyboard shortcuts and name editing actions. */
export const CommandNameEditor = ({
  commandInputValue,
  isEditingName,
  hasMatchingCommand,
  placeholder,
  changeInput,
  confirmNameEdit,
  cancelNameEdit,
  startNameEdit,
  addCommand,
}: CommandNameEditorProps) => {
  const { t } = useI18n();
  const handleNameKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!isEditingName) {
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      confirmNameEdit();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      cancelNameEdit();
    }
  };

  return (
    <div data-editor-command-list="" className="commandInputSection">
      <div data-editor-command-list="" className="unifiedCommandInput">
        <input
          data-editor-command-list=""
          type="text"
          value={commandInputValue}
          onChange={(event) => changeInput(event.target.value)}
          onKeyDown={handleNameKey}
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
      ) : hasMatchingCommand ? (
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
  );
};
