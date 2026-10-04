'use client';

import { useI18n } from '@/I18n/Index';
import type { SettingsOverlayProps } from '@/Types/Components';
import { useMemo } from 'react';
import { useModalFocus } from '@/Shared/Hooks/UseModalFocus';
import { DEFAULT_CREATORS, DEFAULT_CAREGIVERS } from './SettingsOverlay/Data/People';
import { localizePeople } from './SettingsOverlay/Helpers/LocalizePeople';
import { useOverlayPresence } from './SettingsOverlay/Hooks/UseOverlayPresence';
import CreatorsPanel from './CreatorsPanel';
import SettingsPanel from './SettingsPanel';

const SettingsOverlay = ({
  settingsOpen = false,
  isMobile,
  creators = DEFAULT_CREATORS,
  caregivers = DEFAULT_CAREGIVERS,
  platform = process.env.NEXT_PUBLIC_APP_PLATFORM,
  onClose,
  ...props
}: SettingsOverlayProps) => {
  const { t } = useI18n();
  const { open, isAnimated } = useOverlayPresence(settingsOpen);
  const dialog = useModalFocus(open && settingsOpen, onClose);
  const localizedCreators = useMemo(() => localizePeople(creators, t), [creators, t]);
  const localizedCaregivers = useMemo(() => localizePeople(caregivers, t), [caregivers, t]);

  if (!open) {
    return null;
  }

  return (
    <div
      ref={dialog}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={t('settings.title')}
      id="settings-overlay"
      data-component="SettingsOverlay"
      className={!settingsOpen ? 'is-closing' : ''}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <CreatorsPanel isMobile={isMobile} isAnimated={isAnimated} creators={localizedCreators} caregivers={localizedCaregivers} />
      <SettingsPanel
        {...props}
        platform={platform}
        isMobile={isMobile}
        isAnimated={isAnimated}
        creators={localizedCreators}
        caregivers={localizedCaregivers}
        onClose={onClose}
      />
    </div>
  );
};

export default SettingsOverlay;
