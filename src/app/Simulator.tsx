'use client';

import dynamic from 'next/dynamic';
const Main = dynamic(() => import('@/components/Main'), {
  ssr: false,
  loading: () => (
    <div className="app-loading" role="status">
      Ładowanie Maszyny W…
    </div>
  ),
});
export default function Simulator() {
  return <Main />;
}
