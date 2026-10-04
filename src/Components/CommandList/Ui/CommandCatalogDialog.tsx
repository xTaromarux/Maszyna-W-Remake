import { useModalFocus } from '@/Shared/Hooks/UseModalFocus';
import { useI18n } from '@/I18n/Index';
import { collectCommandAliases } from '@/Shared/Utils/CommandMnemonics';
import type { CommandListProps } from '@/Types/Components';
import type { CommandCatalog } from '../Hooks/UseCommandCatalog';
import type { useCommandCatalogFiles } from '../Hooks/UseCommandCatalogFiles';
import { CommandEditorPanel } from './CommandEditorPanel';

interface CommandCatalogDialogProps extends Omit<CommandListProps, 'commandList' | 'codeBits' | 'onUpdateCommandList'> {
  catalog: CommandCatalog;
  files: ReturnType<typeof useCommandCatalogFiles>;
}

export const CommandCatalogDialog = ({ catalog, files, className = '', onClose, ...rest }: CommandCatalogDialogProps) => {
  const { t, locale } = useI18n();
  const dialog = useModalFocus(true, onClose);
  const { localList, selectedCommand, listRef, maxCommands, selectCommand } = catalog;

  return (
    <div
      data-editor-command-list=""
      {...rest}
      className={`modal-overlay ${className}`}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div
        ref={dialog}
        tabIndex={-1}
        data-editor-command-list=""
        id="commandList"
        role="dialog"
        aria-modal="true"
        aria-labelledby="command-list-title"
      >
        <div data-editor-command-list="" className="header">
          <h1 data-editor-command-list="" id="command-list-title">
            {t('commandList.title')}
          </h1>
          <button
            type="button"
            data-editor-command-list=""
            className="closeBtn closeButton"
            onClick={onClose}
            aria-label={t('commandList.closeAria')}
          >
            &times;
          </button>
        </div>
        <div data-editor-command-list="" id="commandListTable" ref={listRef}>
          <span data-editor-command-list="">
            {localList.length} / {maxCommands}
          </span>
          {localList.map((command, index) => (
            <button
              type="button"
              data-editor-command-list=""
              key={index}
              onClick={() => selectCommand(index)}
              className={`execution-btn execution-btn--run${selectedCommand === index ? ' selected' : ''}`}
            >
              <span data-editor-command-list="">{collectCommandAliases(command, { locale }).preferred[0]}</span>
            </button>
          ))}
        </div>
        <CommandEditorPanel catalog={catalog} files={files} />
      </div>
    </div>
  );
};
