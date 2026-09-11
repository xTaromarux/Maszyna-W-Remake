'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import MemoryContent from './MemoryContent';
import MobileMemoryHeader from './MobileMemoryHeader';
import useWindowWidth from '@/hooks/useWindowWidth';
import { useI18n } from '@/i18n';

export default function MemorySection(props) {
  const { t } = useI18n();
  const isMobile = useWindowWidth() < 1080;
  const [showMobileModal, setShowMobileModal] = useState(false);
  const dialogRef = useRef(null);
  useEffect(() => { if (!isMobile) setShowMobileModal(false); }, [isMobile]);
  useEffect(() => {
    if (!showMobileModal) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setShowMobileModal(false);
      if (event.key === 'Tab') {
        const focusable = dialogRef.current?.querySelectorAll('button:not([disabled]), input:not([disabled]), [tabindex="0"]');
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
      previousFocus?.focus?.();
    };
  }, [showMobileModal]);

  return <div className="memorySection">
    {isMobile && <MobileMemoryHeader {...props} onOpen={() => setShowMobileModal(true)} />}
    {showMobileModal && createPortal(<div className="mobile-overlay" onClick={(event) => {
      if (event.target === event.currentTarget) setShowMobileModal(false);
    }}>
      <div className="mobileModalContent" ref={dialogRef} role="dialog" aria-modal="true" aria-label={t('memory.sectionTitle')} tabIndex={-1}>
        <MemoryContent {...props} />
        <button type="button" className="closeBtn closeButtonModal" onClick={() => setShowMobileModal(false)} aria-label={t('memory.closeModal')}>&times;</button>
      </div>
    </div>, document.body)}
    {!isMobile && <MemoryContent {...props} />}
  </div>;
}
