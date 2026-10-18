'use client';

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { useI18n } from '@/I18n/Hooks/UseI18n';
import type { Action, Update } from '@/Shared/Types/Common';
import SegmentedToggle from '@/Shared/Ui/SegmentedToggle/SegmentedToggle';
import ExpandEditorIcon from '@/Editor/CodeMirrorEditor/Ui/ExpandEditorIcon';

type ContentView = 'asm' | 'microcode' | 'devices';
type View = ContentView | 'console';

interface Props {
  manualMode: boolean;
  consoleOpen: boolean;
  hasConsoleErrors: boolean;
  onSetManualMode: Update<boolean>;
  onOpenConsole: Action;
  onCloseConsole: Action;
  asm: ReactNode;
  microcode: ReactNode;
  devices: ReactNode;
  console: ReactNode;
  controls: ReactNode;
}

/** Keeps editing sessions and device state mounted while switching workspace views. */
const EditorWorkspace = ({
  manualMode,
  consoleOpen,
  hasConsoleErrors,
  onSetManualMode,
  onOpenConsole,
  onCloseConsole,
  asm,
  microcode,
  devices,
  console,
  controls,
}: Props) => {
  const { t } = useI18n();
  const [contentView, setContentView] = useState<ContentView>('asm');
  const [expanded, setExpanded] = useState(false);
  const expandButton = useRef<HTMLButtonElement>(null);
  const tabs = useRef<HTMLDivElement>(null);
  const lastFocusedElement = useRef<HTMLElement | null>(null);
  const activeView: View = consoleOpen ? 'console' : manualMode && contentView === 'asm' ? 'microcode' : contentView;
  const views: View[] = manualMode ? ['microcode', 'devices', 'console'] : ['asm', 'microcode', 'devices', 'console'];

  useEffect(() => {
    const previousFocus = lastFocusedElement.current;
    const previousPanel = previousFocus?.closest<HTMLElement>('.workspace-view');
    if (previousPanel?.hidden && (document.activeElement === previousFocus || document.activeElement === document.body)) {
      tabs.current?.querySelector<HTMLButtonElement>('[aria-selected="true"]')?.focus({ preventScroll: true });
    }
  }, [activeView]);

  useEffect(() => {
    if (!expanded) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeExpanded = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented && !consoleOpen) {
        setExpanded(false);
        expandButton.current?.focus();
      }
    };
    window.addEventListener('keydown', closeExpanded);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeExpanded);
    };
  }, [expanded, consoleOpen]);

  const selectView = (view: View) => {
    if (view === 'console') {
      if (!consoleOpen) onOpenConsole();
    } else {
      setContentView(view);
      onCloseConsole();
    }
  };

  const navigateTabs = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next: number;
    if (event.key === 'ArrowRight') next = (index + 1) % views.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + views.length) % views.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = views.length - 1;
    else return;
    event.preventDefault();
    selectView(views[next]);
    tabs.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
  };

  return (
    <section
      id="editorWorkspace"
      className={expanded ? 'workspace-expanded' : ''}
      aria-label={t('workspace.title')}
      onFocusCapture={(event) => {
        lastFocusedElement.current = event.target;
      }}
    >
      <div className="workspace-mode">
        <SegmentedToggle
          options={[
            { label: t('programEditor.modeToggle.manual'), value: true },
            { label: t('programEditor.modeToggle.program'), value: false },
          ]}
          modelValue={manualMode}
          onUpdateModelValue={(value) => {
            setContentView('asm');
            onSetManualMode(value);
          }}
        />
        <button
          ref={expandButton}
          type="button"
          className="workspace-expand"
          onClick={() => setExpanded((previous) => !previous)}
          aria-label={t(expanded ? 'editor.collapse' : 'editor.expand')}
          aria-expanded={expanded}
        >
          <ExpandEditorIcon expanded={expanded} />
        </button>
      </div>
      <div className="workspace-tabs" role="tablist" aria-label={t('workspace.views')} ref={tabs}>
        {views.map((view, index) => (
          <button
            key={view}
            type="button"
            role="tab"
            id={`workspace-tab-${view}`}
            className={view === 'console' && hasConsoleErrors ? 'workspace-tab has-errors' : 'workspace-tab'}
            aria-selected={activeView === view}
            aria-controls={`workspace-view-${view}`}
            tabIndex={activeView === view ? 0 : -1}
            onClick={() => selectView(view)}
            onKeyDown={(event) => navigateTabs(event, index)}
          >
            {t(`workspace.${view}`)}
            {view === 'console' && hasConsoleErrors && <span className="workspace-error-dot" aria-hidden="true" />}
          </button>
        ))}
      </div>
      <div className="workspace-body">
        {(['asm', 'microcode', 'devices', 'console'] as const).map((view) => (
          <div
            key={view}
            id={`workspace-view-${view}`}
            className="workspace-view"
            role="tabpanel"
            aria-labelledby={`workspace-tab-${view}`}
            hidden={activeView !== view}
          >
            {view === 'asm' ? asm : view === 'microcode' ? microcode : view === 'devices' ? devices : console}
          </div>
        ))}
      </div>
      {activeView === 'console' && <div className="workspace-footer">{controls}</div>}
    </section>
  );
};

export default EditorWorkspace;
