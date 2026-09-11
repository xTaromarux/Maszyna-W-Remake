'use client';

import { useEffect, useState } from 'react';
import { useI18n } from '@/i18n';
import SettingsPanel from './SettingsPanel';
import CreatorsPanel from './CreatorsPanel';

const DEFAULT_CREATORS = [
  { name: 'Szymon Woźnica', linkedin: 'https://pl.linkedin.com/in/szymon-wo%C5%BAnica-b46b7b201' },
  { name: 'Maja Kucab' },
  { name: 'Kacper Sikorski', linkedin: 'https://www.linkedin.com/in/kacper-sikorski-049b4a334/', github: 'https://github.com/Sikor915' },
  { name: 'Sławomir Put', linkedin: 'https://www.linkedin.com/in/slawomir-put/', github: 'https://github.com/xTaromarux' },
  { name: 'Paweł Linek', linkedin: 'https://www.linkedin.com/in/paweloslinek/', github: 'https://github.com/pawelos231' },
  { name: 'Bartek Faruga', linkedin: 'https://www.linkedin.com/in/bartosz-faruga/', github: 'https://github.com/MrRooby' },
  ...['Marcin Ryt', 'Oskar Forreiter', 'Michał Kostrzewski', 'Sebastian Legierski', 'Paweł Janus'].map((name) => ({ name })),
];
const DEFAULT_CAREGIVERS = [
  { baseName: 'Robert Tutajewicz', titles: ['dr', 'inz'] },
  { baseName: 'Krzysztof Simiński', titles: ['drHab', 'inz'] },
  { baseName: 'Tomasz Rudnicki', titles: ['dr', 'inz'] },
];

export default function SettingsOverlay({
  settingsOpen = false,
  isMobile,
  creators = DEFAULT_CREATORS,
  caregivers = DEFAULT_CAREGIVERS,
  platform = process.env.NEXT_PUBLIC_APP_PLATFORM,
  onClose,
  ...props
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(settingsOpen);
  const [isAnimated, setIsAnimated] = useState(false);
  useEffect(() => {
    let animationTimer;
    let closeTimer;
    if (settingsOpen) {
      setOpen(true);
      animationTimer = setTimeout(() => setIsAnimated(true), 10);
    } else {
      setIsAnimated(false);
      closeTimer = setTimeout(() => setOpen(false), 400);
    }
    return () => {
      clearTimeout(animationTimer);
      clearTimeout(closeTimer);
    };
  }, [settingsOpen]);
  useEffect(() => {
    if (!settingsOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [settingsOpen, onClose]);
  const localize = (people) =>
    people.map((person) =>
      person.baseName && Array.isArray(person.titles)
        ? {
            ...person,
            name: `${person.titles
              .map((title) => t(`titles.${title}`))
              .filter(Boolean)
              .join(' ')} ${person.baseName}`.trim(),
          }
        : person
    );
  if (!open) return null;
  return (
    <div
      id="settings-overlay"
      data-component="SettingsOverlay"
      className={!settingsOpen ? 'is-closing' : ''}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <CreatorsPanel isMobile={isMobile} isAnimated={isAnimated} creators={localize(creators)} caregivers={localize(caregivers)} />
      <SettingsPanel
        {...props}
        platform={platform}
        isMobile={isMobile}
        isAnimated={isAnimated}
        creators={localize(creators)}
        caregivers={localize(caregivers)}
        onClose={onClose}
      />
    </div>
  );
}
