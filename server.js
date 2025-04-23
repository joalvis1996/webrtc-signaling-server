// server.js
const http = require('http').createServer();
const io = require('socket.io')(http, {
  cors: { origin: '*' }
});

// { roomId: [socketId, ...] }
let rooms = {};

io.on('connection', (socket) => {
  socket.on('join', (roomId) => {
    socket.join(roomId);

    // 방에 참가자 목록 저장
    if (!rooms[roomId]) rooms[roomId] = [];
    rooms[roomId].push(socket.id);

    // 방에 2명이 모이면 'ready' 신호를 양쪽에 전달
    if (rooms[roomId].length === 2) {
      io.to(roomId).emit('ready');
    }
  });

  socket.on('signal', ({ roomId, data }) => {
    // 같은 방에 있는 다른 유저에게 신호 전달
    socket.to(roomId).emit('signal', data);
  });

  socket.on('disconnect', () => {
    // disconnect 시 rooms 정보에서 제거
    for (const roomId in rooms) {
      rooms[roomId] = rooms[roomId].filter(id => id !== socket.id);
      if (rooms[roomId].length === 0) {
        delete rooms[roomId];
      }
    }
  });
});

// Railway에서는 반드시 process.env.PORT 사용
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Signaling server running on port ${PORT}`);
});
