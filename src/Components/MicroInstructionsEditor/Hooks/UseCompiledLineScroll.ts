import { useEffect, useRef } from 'react';

/** Keeps the active microinstruction visible when the compiled view opens or execution advances. */
export const useCompiledLineScroll = (activeLine?: number) => {
  const compiledView = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const activeRow = compiledView.current?.querySelector(`[data-row="${activeLine}"]`);
    activeRow?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
  }, [activeLine]);

  return compiledView;
};
