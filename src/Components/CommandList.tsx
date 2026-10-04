'use client';

import type { CommandListProps } from '@/Types/Components';
import { useCommandCatalog } from './CommandList/Hooks/UseCommandCatalog';
import { useCommandCatalogFiles } from './CommandList/Hooks/UseCommandCatalogFiles';
import { CommandCatalogDialog } from './CommandList/Ui/CommandCatalogDialog';

/** Connects catalog editing and file transfers to the command-list dialog. */
const CommandList = ({ visible = false, commandList, codeBits, onUpdateCommandList, ...dialogProps }: CommandListProps) => {
  const catalog = useCommandCatalog({ commandList, codeBits, onUpdateCommandList });
  const files = useCommandCatalogFiles(catalog);

  if (!visible) {
    return null;
  }

  return <CommandCatalogDialog {...dialogProps} catalog={catalog} files={files} />;
};

export default CommandList;
