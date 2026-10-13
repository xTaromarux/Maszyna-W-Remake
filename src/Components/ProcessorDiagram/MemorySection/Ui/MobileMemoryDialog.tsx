import { useI18n } from '@/I18n/Hooks/UseI18n';
import { useModalFocus } from '@/Shared/Hooks/UseModalFocus';
import type { MemorySectionProps } from '@/Components/ProcessorDiagram/MemorySection/Types';
import { createPortal } from 'react-dom';
import MemoryContent from './MemoryContent';

interface MobileMemoryDialogProps {
  memory: MemorySectionProps;
  onClose: () => void;
}

const MobileMemoryDialog = ({ memory, onClose }: MobileMemoryDialogProps) => {
  const { t } = useI18n();
  const dialog = useModalFocus(true, onClose);

  return createPortal(
    <div
      className="mobile-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="mobileModalContent" ref={dialog} role="dialog" aria-modal="true" aria-label={t('memory.sectionTitle')} tabIndex={-1}>
        <MemoryContent {...memory} />
        <button type="button" className="closeBtn closeButtonModal" onClick={onClose} aria-label={t('memory.closeModal')}>
          &times;
        </button>
      </div>
    </div>,
    document.body
  );
};

export default MobileMemoryDialog;
