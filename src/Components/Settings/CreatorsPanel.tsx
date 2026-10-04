'use client';

import { useI18n } from '@/I18n/Index';
import type { CreatorsPanelProps } from '@/Types/Components';
import PeopleSection from './PeopleSection';

export default function CreatorsPanel({ isMobile = false, isAnimated = false, creators = [], caregivers = [] }: CreatorsPanelProps) {
  const { t } = useI18n();
  if (isMobile) return null;
  return (
    <div
      id="creators"
      data-component="CreatorsPanel"
      className={isAnimated ? 'slide-in-left' : 'slide-out-left'}
      onClick={(event) => event.stopPropagation()}
      aria-label={t('settings.people.creators')}
    >
      <PeopleSection title={t('settings.people.caregivers')} people={caregivers} showGithub={false} />
      <PeopleSection title={t('settings.people.creators')} people={creators} />
    </div>
  );
}
