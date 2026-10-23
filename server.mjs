import express from 'express';
import http from 'node:http';
import { WebSocketServer, WebSocket } from 'ws';
import { TikTokLiveConnection, WebcastEvent } from 'tiktok-live-connector';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/events' });
const PORT = Number(process.env.PORT || 3000);
const username = (process.env.TIKTOK_USERNAME || '').trim().replace(/^@/, '');
const clients = new Set();

app.use(express.static('public'));
app.get('/health', (_req, res) => res.json({ ok: true, tiktokUsernameConfigured: Boolean(username), clients: clients.size }));
app.get('/setup', (_req, res) => res.type('text').send(
  'Territory LIVE bridge\n\nSet the TIKTOK_USERNAME environment variable to your public TikTok username without @.\nOpen the main URL to use the game.\nCheck /health to see whether a username is configured.\n'
));

wss.on('connection', (ws) => {
  clients.add(ws);
  ws.send(JSON.stringify({ type: 'connection', connected: true, tiktokConfigured: Boolean(username) }));
  ws.on('close', () => clients.delete(ws));
});
function broadcast(payload) {
  const data = JSON.stringify(payload);
  for (const ws of clients) if (ws.readyState === WebSocket.OPEN) ws.send(data);
}

// Game mapping: Rose -> Netherlands, GG -> Morocco, Coffee -> USA, Ice Cream -> Turkey.
function getGiftName(data) {
  return String(data?.giftDetails?.giftName || data?.giftName || data?.gift?.name || data?.extendedGiftInfo?.name || '').toLowerCase();
}
function teamForGift(name) {
  if (name.includes('rose')) return 0;
  if (name === 'gg' || name.includes('gg')) return 1;
  if (name.includes('coffee')) return 2;
  if (name.includes('ice cream') || name.includes('icecream')) return 3;
  return null;
}

let connection;
if (username) {
  connection = new TikTokLiveConnection(username, { enableExtendedGiftInfo: true });
  connection.on(WebcastEvent.GIFT, (data) => {
    const giftName = getGiftName(data);
    const team = teamForGift(giftName);
    if (team === null) return;
    // Streak gifts can send multiple update events; only count the final event when repeatEnd is present.
    const repeatEnd = data?.repeatEnd;
    const giftType = data?.giftType;
    if (giftType === 1 && repeatEnd === 0) return;
    const count = Math.max(1, Number(data?.repeatCount || 1));
    broadcast({ type: 'gift', team, count, giftName: giftName || 'Gift', username: data?.user?.uniqueId || data?.uniqueId || 'viewer' });
    console.log(`Gift ${giftName} x${count} -> team ${team}`);
  });
  connection.on('error', (err) => console.error('TikTok connector error:', err?.message || err));
  connection.connect()
    .then((state) => console.log(`Connected to TikTok LIVE @${username}; room ${state.roomId}`))
    .catch((err) => console.error(`Could not connect to @${username}. Is the account LIVE?`, err?.message || err));
} else {
  console.warn('TIKTOK_USERNAME is not configured; game runs in simulation mode only.');
}

server.listen(PORT, '0.0.0.0', () => console.log(`Territory LIVE server listening on port ${PORT}`));
