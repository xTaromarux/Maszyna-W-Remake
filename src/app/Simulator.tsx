'use client';

import { useI18n } from '@/I18n/Index';
import dynamic from 'next/dynamic';

const SimulatorLoading = () => {
  const { t } = useI18n();
  return (
    <div className="app-loading" role="status">
      {t('app.loading')}
    </div>
  );
};

const Main = dynamic(() => import('@/Components/Main'), {
  ssr: false,
  loading: SimulatorLoading,
});

const Simulator = () => <Main />;

export default Simulator;
