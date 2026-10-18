'use client';

import { useI18n } from '@/I18n/Hooks/UseI18n';
import ExecutionControls from '@/Components/MicrocodeEditor/ExecutionControls';
import type { ExecutionControlsProps } from '@/Components/MicrocodeEditor/Types';

/** Keeps navigation and execution within reach while inspecting the mobile diagram. */
const MobileControls = ({ execution }: { execution: ExecutionControlsProps }) => {
  const { t } = useI18n();
  const showSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ block: 'start' });
  };

  return (
    <nav id="mobileControls" className="mobile-controls" aria-label={t('workspace.mobileControls')}>
      <button type="button" onClick={() => showSection('processorViewport')} aria-controls="processorViewport">
        {t('workspace.diagram')}
      </button>
      <button type="button" onClick={() => showSection('editorWorkspace')} aria-controls="editorWorkspace">
        {t('workspace.editor')}
      </button>
      <ExecutionControls {...execution} showCompilation={false} compact />
    </nav>
  );
};

export default MobileControls;
