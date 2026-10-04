import { generateId } from '@/Shared/Utils/Identifiers';
import { ErrorLevel } from '@/Shared/Errors/Types';
import type { LogEntry, LogError, Machine, MachineActions } from '@/Machine/Types/Machine';
import { formatRadix, toSigned } from '../../Shared/Utils/Numbers';

type Actions = Pick<
  MachineActions,
  | 'showToast'
  | 'addLog'
  | 'translateLogMessage'
  | 'formatNumber'
  | 'decToCommand'
  | 'decToArgument'
  | 'closePopups'
  | 'openLabDialog'
  | 'closeLabDialog'
  | 'selectLab'
  | 'openCommandList'
  | 'toggleConsole'
  | 'closeConsole'
  | 'clearConsole'
  | 'handleKeyPress'
  | 'testEnhancedConsole'
>;

/** Existing presentation operations, bound to the machine by the store. */
export const presentationActions: Actions & ThisType<Machine> = {
  showToast(message, options = {}) {
    if (!message) return;
    const { type = 'warning', duration = 2400 } = options || {};
    this.toast.message = message;
    this.toast.type = type;
    this.toast.visible = true;

    if (this.toastTimer) {
      clearTimeout(this.toastTimer ?? undefined);
      this.toastTimer = null;
    }

    this.toastTimer = setTimeout(() => {
      this.toast.visible = false;
    }, duration);
  },

  addLog(message, classification = 'info', errorObj = null) {
    const translatedMessage = String(message ?? '');
    const timestamp = new Date();
    const key = `${classification}|${translatedMessage}`;
    const now = timestamp.getTime();

    // reset liczników po przerwie > 1000 ms
    if (now - (this._lastLogTs || 0) > 1000) {
      this._lastLogKey = null;
      this._lastLogCount = 0;
    }

    if (this._lastLogKey === key) {
      this._lastLogCount += 1;
      const last = this.logs[this.logs.length - 1];
      if (last) {
        last.message = `${translatedMessage} ×${this._lastLogCount + 1}`;
        last.timestamp = timestamp;
      }
      this._lastLogTs = now;
      return; // nie dopisujemy nowej pozycji
    } else {
      this._lastLogKey = key;
      this._lastLogCount = 0;
      this._lastLogTs = now;
    }

    // Enhanced log entry structure that supports both legacy and new error formats
    const logEntry: LogEntry = {
      id: generateId('log'),
      timestamp,
      message: translatedMessage,
      class: classification,
    };

    // If an error object is provided (e.g., WlanError or BaseAppError)
    if (errorObj) {
      logEntry.error = {
        message: errorObj.message || message,
        level: errorObj.level,
        timestamp: errorObj.timestamp,
        code: errorObj.code,
        hint: errorObj.hint,
        loc: errorObj.loc,
        frame: errorObj.frame,
        context: errorObj.context,
      };
    }

    this.logs.push(logEntry);

    // Check if this is an error and set the error flag
    const errorTypes = ['error', 'critical'];
    const isError =
      errorTypes.some((type) => String(classification).toLowerCase().includes(type.toLowerCase())) ||
      (errorObj && ['ERROR', 'CRITICAL'].includes(errorObj.level || ''));

    if (isError) {
      this.hasConsoleErrors = true;
    }
  },

  translateLogMessage(message) {
    return String(message ?? '');
  },

  formatNumber(number) {
    if (typeof number !== 'number' || isNaN(number)) {
      return this.t('errors.invalidNumber');
    }

    const formatters = {
      dec: () => {
        if (this.decSigned) {
          return toSigned(number | 0, this.codeBits + this.addresBits);
        }
        return number | 0;
      },
      hex: () => formatRadix(Math.floor(number), 'hex'),
      bin: () => formatRadix(Math.floor(number), 'bin'),
    };

    return formatters[this.numberFormat]?.() ?? `EE${number}`;
  },

  decToCommand(dec) {
    return this.commandList[dec >> this.addresBits];
  },

  decToArgument(dec) {
    return dec & ((1 << this.addresBits) - 1);
  },

  closePopups(popupName) {
    if (typeof popupName === 'string' && popupName in this) {
      this[popupName] = false;
    }

    if (this.blurHideTimer) {
      clearTimeout(this.blurHideTimer ?? undefined);
      this.blurHideTimer = null;
    }

    if (!this.globalBackdropOpen) {
      this.blurHideTimer = setTimeout(() => {
        this.blurHideTimer = null;
        if (!this.globalBackdropOpen) {
          this.disappearBlour = false;
        }
      }, 1000);
    }
  },

  openLabDialog() {
    if (!this.selectedLab && this.labCatalog.length > 0) {
      this.selectedLabId = this.labCatalog[0].id;
    }
    this.labDialogOpen = true;
  },

  closeLabDialog() {
    this.labDialogOpen = false;
  },

  selectLab(labId) {
    if (typeof labId !== 'string' || !labId) return;
    this.selectedLabId = labId;
  },

  openCommandList() {
    this.closePopups('settingsOpen');
    this.commandListOpen = true;
  },

  toggleConsole() {
    this.consoleOpen = !this.consoleOpen;

    if (this.consoleOpen) {
      this.hasConsoleErrors = false;

      requestAnimationFrame(() => {
        if (window.innerWidth <= 1080) document.querySelector('.console-dock')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  },

  closeConsole() {
    this.consoleOpen = false;
  },

  clearConsole() {
    this.logs = [];
    this.hasConsoleErrors = false;
    this.addLog(this.t('logs.consoleCleared'), 'system');
  },

  handleKeyPress(event) {
    if (event.key === 'Escape' && this.labDialogOpen) {
      this.labDialogOpen = false;
      return;
    }

    // Close console with Escape key
    if (event.key === 'Escape' && this.consoleOpen) {
      this.consoleOpen = false;
    }
  },

  // Test method to demonstrate enhanced console with different error types
  testEnhancedConsole() {
    // Test different error levels and formats
    this.addLog(this.t('logs.systemInit'), 'system');

    // Test BaseAppError structure
    const mockWlanError: LogError = {
      message: this.t('wlan.lexer.unknownChar', { char: '#' }),
      level: ErrorLevel.ERROR,
      timestamp: new Date().toISOString(),
      code: 'LEX_UNKNOWN_CHAR',
      hint: this.t('wlan.lexer.unknownCharHint'),
      loc: { line: 5, col: 12, length: 1 },
      frame: '    3 | ŁAD 15\n    4 | DOD 20\n  > 5 | BŁĘDNY#ZNAK\n        |           ^\n    6 | SOB start',
    };

    this.addLog(this.t('logs.lexError'), 'error', mockWlanError);

    // Test warning
    const mockWarning: LogError = {
      message: this.t('logs.mockUnusedLabel'),
      level: ErrorLevel.WARNING,
      timestamp: new Date().toISOString(),
      code: 'SEM_UNUSED_LABEL',
      hint: this.t('logs.mockUnusedLabelHint'),
    };

    this.addLog(this.t('logs.compilerWarning'), 'warning', mockWarning);

    // Test critical error
    const mockCritical: LogError = {
      message: this.t('logs.mockCriticalMessage'),
      level: ErrorLevel.CRITICAL,
      timestamp: new Date().toISOString(),
      code: 'SYS_CRITICAL',
      hint: this.t('logs.mockCriticalHint'),
    };

    this.addLog(this.t('logs.criticalError'), 'critical', mockCritical);
  },
};
