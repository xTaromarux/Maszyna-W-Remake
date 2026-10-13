'use client';

import { useI18n } from '@/I18n/Hooks/UseI18n';
import type { ErrorPageProps } from '@/Shared/Types/React';

const ErrorPage = ({ retry }: ErrorPageProps) => {
  const { t } = useI18n();

  return (
    <div role="alert" className="app-loading">
      <div>
        <p>{t('app.startupError')}</p>
        <button type="button" onClick={retry}>
          {t('app.retry')}
        </button>
      </div>
    </div>
  );
};

export default ErrorPage;
