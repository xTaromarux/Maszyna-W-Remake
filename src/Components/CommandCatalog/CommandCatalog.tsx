'use client';

import type { CommandCatalogProps } from '@/Components/CommandCatalog/Types';
import { useCommandCatalog } from './Hooks/UseCommandCatalog';
import { useCommandCatalogFiles } from './Hooks/UseCommandCatalogFiles';
import { CommandCatalogDialog } from './Ui/CommandCatalogDialog';

/** Connects catalog editing and file transfers to the command-list dialog. */
const CommandCatalog = ({ visible = false, commandList, codeBits, onUpdateCommandList, ...dialogProps }: CommandCatalogProps) => {
  const catalog = useCommandCatalog({ commandList, codeBits, onUpdateCommandList });
  const files = useCommandCatalogFiles(catalog);

  if (!visible) {
    return null;
  }

  return <CommandCatalogDialog {...dialogProps} catalog={catalog} files={files} />;
};

export default CommandCatalog;
