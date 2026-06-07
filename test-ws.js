const { io } = require('socket.io-client');

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:3012';
const USER_ID = process.env.USER_ID || 'user_123';

const socket = io(GATEWAY_URL);

socket.on('connect', () => {
  console.log('✅ Connected:', socket.id);
  socket.emit('join', { userId: USER_ID });
  console.log(`✅ Joined room: user_${USER_ID}`);
  console.log('⏳ Waiting for notifications... (publish an event in another terminal)\n');
});

socket.on('notification', (data) => {
  console.log('🔔 Received notification:');
  console.log(JSON.stringify(data, null, 2));
  socket.emit('ack', { eventId: data.eventId });
  console.log('✅ Ack sent for event:', data.eventId);
});

socket.on('connect_error', (err) => {
  console.error('❌ Connection failed:', err.message);
  console.error('   Make sure gateway is running: npm run start:gateway');
  process.exit(1);
});

process.on('SIGINT', () => {
  socket.disconnect();
  process.exit(0);
});
