const WebSocket = require('ws');

const PORT = 8080;
const wss = new WebSocket.Server({ port: PORT });

wss.on('connection', (ws) => {
  console.log('▶ Client connected');

  ws.on('message', (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch {
      return;
    }
    if (msg.type === 'signal-toggle' || msg.type === 'mem-update') {
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(raw);
        }
      });
    }

  });

  ws.on('close', () => console.log('◀ Client disconnected'));
});

console.log(`WebSocket server running on ws://localhost:${PORT}`);
