import type { Action } from '../../Shared/Types/Common';
import type { WsStatus } from '../../Machine/Types/Machine';

export interface TopBarProps {
  hasConsoleErrors?: boolean;
  wsStatus?: WsStatus;
  platform?: string;
  onWsReconnect?: Action;
  onToggleConsole?: Action;
  onOpenChat?: Action;
  onOpenSettings?: Action;
}
