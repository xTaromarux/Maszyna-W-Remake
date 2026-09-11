'use client';

import { useEffect, useRef } from 'react';
import { useI18n } from '@/i18n';

export default function LabCatalogDialog({ visible = false, labs = [], selectedLabId = '', onClose, onSelectLab, onLoadLab }) {
  const { t } = useI18n();
  const dialog = useRef(null);
  const selectedLab = labs.find((lab) => lab.id === selectedLabId) || labs[0];
  useEffect(() => {
    if (!visible) return;
    const previous = document.activeElement;
    dialog.current?.focus();
    return () => previous?.focus?.();
  }, [visible]);
  if (!visible) return null;
  return (
    <div
      data-component="LabCatalogDialog"
      className="labDialogBackdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <section
        ref={dialog}
        tabIndex={-1}
        className="labDialog"
        role="dialog"
        aria-modal="true"
        aria-label={t('labs.dialog.aria')}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.stopPropagation();
            onClose?.();
          }
        }}
      >
        <header className="labDialogHeader">
          <h2>{t('labs.dialog.title')}</h2>
          <button className="closeBtn" type="button" onClick={onClose} aria-label={t('labs.dialog.closeAria')}>
            &times;
          </button>
        </header>
        <div className="labDialogBody">
          <aside className="labList">
            {labs.map((lab) => (
              <button
                key={lab.id}
                type="button"
                className={`labListItem${lab.id === selectedLab?.id ? ' active' : ''}`}
                onClick={() => onSelectLab?.(lab.id)}
              >
                <span className="labListItemTitle">{lab.title}</span>
              </button>
            ))}
          </aside>
          {selectedLab && (
            <article className="labDetails">
              <h3>{selectedLab.title}</h3>
              <p>{selectedLab.description}</p>
              <h4>{t('labs.dialog.outcomesTitle')}</h4>
              <ul className="labOutcomeList">
                {selectedLab.outcomes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <h4>{t('labs.dialog.pythonOverview')}</h4>
              <pre className="pythonPreview">
                <code>{selectedLab.pythonOverview}</code>
              </pre>
              <h4>{t('labs.dialog.asmMapping')}</h4>
              <pre className="asmPreview">
                <code>{selectedLab.asmStub}</code>
              </pre>
            </article>
          )}
        </div>
        <footer className="labDialogFooter">
          <button
            className="SvgAndTextButton compact-button execution-btn execution-btn--step"
            type="button"
            disabled={!selectedLab}
            onClick={onLoadLab}
          >
            {t('labs.dialog.load')}
          </button>
        </footer>
      </section>
    </div>
  );
}
