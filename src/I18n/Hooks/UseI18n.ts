import { useSyncExternalStore } from 'react';
import { getLocale, setLocale, subscribe, translate } from '../Translator';

/** Subscribes to language changes and exposes the current translator. */
export const useI18n = () => {
  const locale = useSyncExternalStore(subscribe, getLocale, () => 'pl');
  return { t: translate, locale, setLocale };
};
