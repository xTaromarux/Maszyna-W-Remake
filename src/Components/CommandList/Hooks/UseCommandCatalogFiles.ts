import { useI18n } from '@/I18n/Index';
import { parseCommandCatalog } from '../Helpers/CommandCatalog';
import type { CommandCatalog } from './UseCommandCatalog';

/** Imports validated catalogs and exports the full list, including temporarily hidden opcodes. */
export const useCommandCatalogFiles = ({ importCommands, fullListRef }: Pick<CommandCatalog, 'importCommands' | 'fullListRef'>) => {
  const { t } = useI18n();

  const loadCommandList = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.lst,.json';

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        return;
      }

      try {
        const commands = parseCommandCatalog(await file.text());
        importCommands(commands);
      } catch {
        alert(t('commandList.errors.loadFailed'));
      }
    };

    input.click();
  };

  const downloadCommandList = () => {
    const contents = JSON.stringify(fullListRef.current, null, 2);
    const url = URL.createObjectURL(new Blob([contents], { type: 'application/json' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'commandList.json';
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  return { loadCommandList, downloadCommandList };
};
