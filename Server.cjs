const WebSocket = require('ws');

const forwardedTypes = new Set(['signal-toggle', 'reg-update', 'mem-update', 'color-update', 'button_press']);

function parsePort(value) {
  const port = Number(value);
  if (!String(value).trim() || !Number.isInteger(port) || port < 0 || port > 65535) {
    throw new RangeError('WS_PORT must be an integer between 0 and 65535.');
  }
  return port;
}

function createRelayServer({ port = process.env.WS_PORT ?? 8080, host = process.env.WS_HOST || '127.0.0.1', logger = console } = {}) {
  const server = new WebSocket.Server({ port: parsePort(port), host });

  server.on('connection', (socket) => {
    logger?.log('WebSocket client connected');
    socket.on('message', (raw) => {
      let message;
      try {
        message = JSON.parse(raw.toString());
      } catch {
        return;
      }
      if (!message || typeof message !== 'object' || Array.isArray(message)) return;

      if (message.type === 'ping') {
        socket.send(JSON.stringify({ type: 'pong', t: message.t }));
        return;
      }

      if (!forwardedTypes.has(message.type)) return;
      for (const client of server.clients) {
        if (client !== socket && client.readyState === WebSocket.OPEN) {
          client.send(raw, { binary: false });
        }
      }
    });
    socket.on('error', (error) => logger?.error('WebSocket client error:', error.message));
    socket.on('close', () => logger?.log('WebSocket client disconnected'));
  });

  return server;
}

if (require.main === module) {
  try {
    const server = createRelayServer();
    server.on('listening', () => {
      const address = server.address();
      const host = address.family === 'IPv6' ? `[${address.address}]` : address.address;
      console.log(`WebSocket server running on ws://${host}:${address.port}`);
    });
    server.on('error', (error) => {
      console.error('WebSocket server error:', error.message);
      process.exitCode = 1;
    });
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = { createRelayServer };
