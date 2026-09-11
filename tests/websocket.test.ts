import assert from 'node:assert/strict';
import test, { type TestContext } from 'node:test';
import { once } from 'node:events';
import { createRequire } from 'node:module';
import type { AddressInfo } from 'node:net';
import WebSocket from 'ws';

const require = createRequire(import.meta.url);
const { createRelayServer } = require('../server.cjs');

async function fixture(context: TestContext) {
  const server = createRelayServer({ port: 0, host: '127.0.0.1', logger: null });
  const sockets: WebSocket[] = [];
  context.after(async () => {
    for (const socket of sockets) socket.terminate();
    for (const socket of server.clients) socket.terminate();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });
  await once(server, 'listening');
  const address = server.address() as AddressInfo;
  const url = `ws://127.0.0.1:${address.port}`;
  const first = new WebSocket(url);
  sockets.push(first);
  await once(first, 'open');
  const second = new WebSocket(url);
  sockets.push(second);
  await once(second, 'open');
  return { first, second };
}

async function sendAndReceive(sender: WebSocket, recipient: WebSocket, message: object) {
  const response = once(recipient, 'message');
  sender.send(JSON.stringify(message));
  const [raw, isBinary] = await response;
  assert.equal(isBinary, false, 'JSON protocol packets must be sent as text frames');
  return JSON.parse(raw.toString());
}

test('relay forwards signals, registers, memory, colors and hardware buttons without echo', { timeout: 5000 }, async (context) => {
  const { first, second } = await fixture(context);
  const senderMessages: object[] = [];
  first.on('message', (raw) => senderMessages.push(JSON.parse(raw.toString())));
  const packets = [
    { type: 'signal-toggle', signal: 'czyt', state: true },
    { type: 'reg-update', field: 'acc', value: 42 },
    { type: 'reg-update', field: 'busS', value: true },
    { type: 'mem-update', data: { addrs: [0, 1], args: [1, 2], vals: [17, 34] } },
    { type: 'color-update', data: { colorType: 'active', hex: '#FF5733', r: 255, g: 87, b: 51, brightness: 200 } },
  ];
  for (const packet of packets) assert.deepEqual(await sendAndReceive(first, second, packet), packet);
  const ping = { type: 'ping', t: 123456 };
  assert.deepEqual(await sendAndReceive(first, first, ping), { type: 'pong', t: ping.t });
  assert.deepEqual(senderMessages, [{ type: 'pong', t: ping.t }], 'the sender must not receive its own broadcast packets');

  const button = { type: 'button_press', buttonName: 'czyt' };
  assert.deepEqual(await sendAndReceive(second, first, button), button);
});

test('JSON ping receives a matching pong only on the requesting connection', { timeout: 5000 }, async (context) => {
  const { first, second } = await fixture(context);
  const secondMessages: object[] = [];
  second.on('message', (raw) => secondMessages.push(JSON.parse(raw.toString())));
  assert.deepEqual(await sendAndReceive(first, first, { type: 'ping', t: 987654321 }), { type: 'pong', t: 987654321 });
  // The second ping is a delivery barrier on the other connection.
  assert.deepEqual(await sendAndReceive(second, second, { type: 'ping', t: 42 }), { type: 'pong', t: 42 });
  assert.deepEqual(secondMessages, [{ type: 'pong', t: 42 }]);
});

test('malformed JSON, non-object values and unknown packets leave both clients usable', { timeout: 5000 }, async (context) => {
  const { first, second } = await fixture(context);
  const received: object[] = [];
  second.on('message', (raw) => received.push(JSON.parse(raw.toString())));
  for (const raw of ['{invalid', 'null', '[]', '42', '"hello"', '{}', '{"type":"unknown"}']) first.send(raw);
  const valid = { type: 'reg-update', field: 'c', value: 9 };
  assert.deepEqual(await sendAndReceive(first, second, valid), valid);
  assert.deepEqual(received, [valid]);
  assert.equal(first.readyState, WebSocket.OPEN);
  assert.equal(second.readyState, WebSocket.OPEN);
  assert.deepEqual(await sendAndReceive(second, second, { type: 'ping', t: 10 }), { type: 'pong', t: 10 });
});

test('invalid relay ports fail before opening a listener', () => {
  for (const port of [-1, 65536, 'not-a-port', '', 12.5]) {
    assert.throws(() => createRelayServer({ port, logger: null }), /WS_PORT/);
  }
});

test('relay reads its port and host from the process environment', { timeout: 5000 }, async (context) => {
  const previousPort = process.env.WS_PORT;
  const previousHost = process.env.WS_HOST;
  process.env.WS_PORT = '0';
  process.env.WS_HOST = '127.0.0.1';
  const server = createRelayServer({ logger: null });
  context.after(async () => {
    if (previousPort === undefined) delete process.env.WS_PORT;
    else process.env.WS_PORT = previousPort;
    if (previousHost === undefined) delete process.env.WS_HOST;
    else process.env.WS_HOST = previousHost;
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });
  await once(server, 'listening');
  const address = server.address() as AddressInfo;
  assert.equal(address.address, '127.0.0.1');
  assert.ok(address.port > 0);
});
