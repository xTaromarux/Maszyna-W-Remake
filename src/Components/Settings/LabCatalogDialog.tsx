'use client';

import { useI18n } from '@/I18n/Index';
import type { LabCatalogDialogProps } from '@/Types/Components';
import { useModalFocus } from '@/Shared/Hooks/UseModalFocus';
import LabDetails from './LabCatalogDialog/Ui/LabDetails';

const LabCatalogDialog = ({
  visible = false,
  labs = [],
  selectedLabId = '',
  onClose,
  onSelectLab,
  onLoadLab,
}: LabCatalogDialogProps) => {
  const { t } = useI18n();
  const dialog = useModalFocus<HTMLElement>(visible, onClose);
  const selectedLab = labs.find((lab) => lab.id === selectedLabId) || labs[0];
  if (!visible) {
    return null;
  }

  return () => {
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, [visible]);
  if (!visible) return null;
  return (
    <div
      data-component="LabCatalogDialog"
      className="labDialogBackdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <section
        ref={dialog}
        tabIndex={-1}
        className="labDialog"
        role="dialog"
        aria-modal="true"
        aria-label={t('labs.dialog.aria')}
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
          {selectedLab && <LabDetails lab={selectedLab} />}
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
};

export default LabCatalogDialog;
