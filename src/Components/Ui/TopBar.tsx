'use client';

import ConsoleIcon from '@/Assets/Svg/ConsoleIcon';
import KogWheelIcon from '@/Assets/Svg/KogWheelIcon';
import PolslLogoLongWhite from '@/Assets/Svg/PolslLogoLongWhite';
import AiChatIcon from '@/Components/AiChat/Ui/AiChatIcon';
import { useI18n } from '@/I18n/Index';
import type { TopBarProps } from '@/Types/Components';

const CONNECTION_STATUSES: Record<string, { translationSuffix: string; className: string }> = {
  disconnected: { translationSuffix: 'Disconnected', className: 'off' },
  connected: { translationSuffix: 'Connected', className: 'ok' },
  connecting: { translationSuffix: 'Connecting', className: 'pending' },
  error: { translationSuffix: 'Error', className: 'err' },
};

const TopBar = ({
  hasConsoleErrors = false,
  wsStatus = 'disconnected',
  platform = process.env.NEXT_PUBLIC_APP_PLATFORM,
  onWsReconnect,
  onToggleConsole,
  onOpenChat,
  onOpenSettings,
}: TopBarProps) => {
  const { t } = useI18n();
  const connectionStatus = CONNECTION_STATUSES[wsStatus] || CONNECTION_STATUSES.disconnected;

  return (
    <header id="topBar" data-component="TopBar">
      <PolslLogoLongWhite className="logo" />
      <div className="flexRow">
        {platform === 'esp' && (
          <button
            type="button"
            className={`wsBadge ws--${connectionStatus.className}`}
            title={t(`topBar.ws${connectionStatus.translationSuffix}Title`)}
            aria-label={t('topBar.wsStatusAria')}
            onClick={onWsReconnect}
          >
            <span className={`dot${wsStatus === 'connecting' ? ' spin' : ''}`} />
            <span className="label">{t(`topBar.ws${connectionStatus.translationSuffix}`)}</span>
          </button>
        )}
        <button type="button" className="simpleSvgButton" aria-label={t('topBar.openConsole')} onClick={onToggleConsole}>
          <ConsoleIcon hasError={hasConsoleErrors} />
        </button>
        {platform !== 'esp' && (
          <button type="button" className="simpleSvgButton" aria-label={t('topBar.openChat')} onClick={onOpenChat}>
            <AiChatIcon fillColor="#ddd" strokeColor="#ddd" strokeWidth="250" />
          </button>
        )}
        <button type="button" className="simpleSvgButton" aria-label={t('topBar.openSettings')} onClick={onOpenSettings}>
          <KogWheelIcon />
        </button>
      </div>
    </header>
  );
};

export default TopBar;
