import type { Machine, MachineActions } from '@/Machine/Types/Machine';

type Actions = Pick<
  MachineActions,
  | 'reconnectWS'
  | 'initWebsocket'
  | 'handleRemoteToggleLocalWebSocket'
  | 'handleRemoteToggleESPWebSocket'
  | 'sendSignalToESP'
  | 'sendPartialData'
  | 'sendMemUpdate'
  | 'sendFullDataToESP'
  | 'sendColorToESP'
  | 'handleRemoteMemUpdate'
>;

/** Existing websocket operations, bound to the machine by the store. */
export const webSocketActions: Actions & ThisType<Machine> = {
  reconnectWS() {
    try {
      clearTimeout(this.reconnectTimer ?? undefined);
      if (this.ws) {
        try {
          this.ws.close();
        } catch (_) {}
        this.ws = null;
      }
      this.wsStatus = 'connecting';
      this.reconnectTimer = setTimeout(() => {
        this.reconnectTimer = null;
        this.initWebsocket();
      }, 150);
    } catch (e) {
      this.wsStatus = 'error';
      this.addLog(this.t('logs.wsReconnectFailed'), 'error', { message: String(e) });
    }
  },

  initWebsocket() {
    try {
      const previousSocket = this.ws;
      this.wsStatus = 'connecting';
      const socket = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080');
      this.ws = socket;
      previousSocket?.close();
      clearInterval(this.wsPingTimer ?? undefined);
      this.wsPingTimer = null;
      this.ws.binaryType = 'arraybuffer';

      this.ws.addEventListener('open', () => {
        if (this.ws !== socket) return;
        this.wsStatus = 'connected';
        this.addLog(this.t('logs.wsConnected'), 'system');
        this.sendFullDataToESP();

        // prosty ping, by utrzymać i weryfikować połączenie
        clearInterval(this.wsPingTimer ?? undefined);
        this.wsPingTimer = setInterval(() => {
          if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: 'ping', t: Date.now() }));
          }
        }, 10000);
      });

      this.ws.addEventListener('close', () => {
        if (this.ws !== socket) return;
        this.wsStatus = 'disconnected';
        this.addLog(this.t('logs.wsDisconnected'), 'system');
        clearInterval(this.wsPingTimer ?? undefined);
        this.wsPingTimer = null;
      });

      this.ws.addEventListener('error', (err) => {
        if (this.ws !== socket) return;
        this.wsStatus = 'error';
        this.addLog(this.t('logs.wsError'), 'error', { message: String(err) });
      });

      this.ws.addEventListener('message', async ({ data }) => {
        if (this.ws !== socket) return;
        let text;
        if (data instanceof Blob) text = await data.text();
        else if (data instanceof ArrayBuffer) text = new TextDecoder().decode(data);
        else text = data;
        if (this.ws !== socket) return;

        let msg;
        try {
          msg = JSON.parse(text);
        } catch (_) {
          return;
        }

        if (msg.type === 'pong') return;

        // ESP32 sygnały z przycisków
        if (msg.type === 'button_press') {
          this.handleRemoteToggleESPWebSocket(msg.buttonName);
        }

        if (msg.type === 'signal-toggle') {
          this.handleRemoteToggleLocalWebSocket(msg.signal, msg.state);
        }
      });
    } catch (e) {
      this.wsStatus = 'error';
      this.addLog(this.t('logs.wsInitFailed'), 'error', { message: String(e) });
    }
  },

  handleRemoteToggleLocalWebSocket(id, value) {
    this.suppressBroadcast = true;
    if (value) {
      this.nextLine.add(id);
    } else {
      this.nextLine.delete(id);
    }
    this.signals[id] = value;
    this.addLog(this.t('logs.wsSignalReceived', { id, state: this.t(`logs.breakpointStatus.${value ? 'on' : 'off'}`) }), 'system');
    this.suppressBroadcast = false;
  },

  handleRemoteToggleESPWebSocket(value) {
    this.suppressBroadcast = true;

    if (!this.signals[value]) {
      this.nextLine.add(value);
    } else {
      this.nextLine.delete(value);
    }
    this.signals[value] = !this.signals[value];

    this.addLog(
      this.t('logs.espButton', { button: value, state: this.t(`logs.breakpointStatus.${this.signals[value] ? 'on' : 'off'}`) }),
      'system'
    );

    this.sendSignalToESP(value, this.signals[value]);

    this.suppressBroadcast = false;
  },

  sendSignalToESP(signalName, state) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'signal-toggle',
          signal: signalName,
          state: state,
        })
      );
      this.addLog(
        this.t('logs.wsSignalSent', { signal: signalName, state: this.t(`logs.breakpointStatus.${state ? 'on' : 'off'}`) }),
        'system'
      );
    }
  },

  sendPartialData(fieldName, newValue) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'reg-update',
          field: fieldName,
          value: newValue,
        })
      );
    }
  },

  sendMemUpdate() {
    const addrs = this.mem.slice(0, 4).map((_, idx) => idx);
    const args = this.mem.slice(0, 4).map((val) => this.decToArgument(val));
    const vals = this.mem.slice(0, 4);

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'mem-update',
          data: {
            addrs: addrs,
            args: args,
            vals: vals,
          },
        })
      );
    }
  },

  sendFullDataToESP() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const addrs = this.mem.slice(0, 4).map((val, idx) => idx);
      const args = this.mem.slice(0, 4).map((val) => this.decToArgument(val));
      const vals = this.mem.slice(0, 4);

      const data = {
        acc: this.ACC,
        a: this.A,
        s: this.S,
        c: this.programCounter,
        i: this.I,
        addrs: addrs,
        args: args,
        vals,
      };

      this.ws.send(
        JSON.stringify({
          type: 'mem-update',
          data: data,
        })
      );
    }
  },

  sendColorToESP(colorData) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'color-update',
          data: {
            colorType: colorData.type,
            hex: colorData.hex,
            r: colorData.rgbScaled.r,
            g: colorData.rgbScaled.g,
            b: colorData.rgbScaled.b,
            brightness: Math.round(colorData.brightness * 255),
            timestamp: Date.now(),
          },
        })
      );
      this.addLog(
        this.t('logs.ledColorSent', {
          type: colorData.type,
          hex: colorData.hex,
          r: colorData.rgbScaled.r,
          g: colorData.rgbScaled.g,
          b: colorData.rgbScaled.b,
        }),
        'system'
      );

      // Wyślij pełne dane po zmianie koloru, aby ESP32 od razu zaktualizował LED z nowymi wartościami
      this.sendFullDataToESP();
    }
  },

  handleRemoteMemUpdate(idx, value) {
    this.suppressBroadcast = true;
    this.mem[idx] = value;
    this.suppressBroadcast = false;
  },
};
