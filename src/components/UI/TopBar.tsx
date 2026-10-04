'use client';

import ConsoleIcon from '@/assets/svg/ConsoleIcon';
import KogWheelIcon from '@/assets/svg/KogWheelIcon';
import PolslLogoLongWhite from '@/assets/svg/polslLogoLongWhite';
import AiChatIcon from '@/components/AiChatIcon';
import { useI18n } from '@/i18n';
import type { TopBarProps } from '@/types/components';

export default function TopBar({
  hasConsoleErrors = false,
  wsStatus = 'disconnected',
  platform = process.env.NEXT_PUBLIC_APP_PLATFORM,
  onWsReconnect,
  onToggleConsole,
  onOpenChat,
  onOpenSettings,
}: TopBarProps) {
  const { t } = useI18n();
  const state = {
    disconnected: ['Disconnected', 'off'],
    connected: ['Connected', 'ok'],
    connecting: ['Connecting', 'pending'],
    error: ['Error', 'err'],
  }[wsStatus] || ['Disconnected', 'off'];
  return (
    <header id="topBar" data-component="TopBar">
      <PolslLogoLongWhite className="logo" />
      <div className="flexRow">
        {platform === 'esp' && (
          <button
            className={`wsBadge ws--${state[1]}`}
            title={t(`topBar.ws${state[0]}Title`)}
            aria-label={t('topBar.wsStatusAria')}
            onClick={onWsReconnect}
          >
            <span className={`dot${wsStatus === 'connecting' ? ' spin' : ''}`} />
            <span className="label">{t(`topBar.ws${state[0]}`)}</span>
          </button>
        )}
        <button className="simpleSvgButton" aria-label={t('topBar.openConsole')} onClick={onToggleConsole}>
          <ConsoleIcon hasError={hasConsoleErrors} />
        </button>
        {platform !== 'esp' && (
          <button className="simpleSvgButton" aria-label={t('topBar.openChat')} onClick={onOpenChat}>
            <AiChatIcon fillColor="#ddd" strokeColor="#ddd" strokeWidth="250" />
          </button>
        )}
        <button className="simpleSvgButton" aria-label={t('topBar.openSettings')} onClick={onOpenSettings}>
          <KogWheelIcon />
        </button>
      </div>
    </header>
  );
}
