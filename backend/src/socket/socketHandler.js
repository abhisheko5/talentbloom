/**
 * Initialize Socket.io event handlers
 */
const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`✅ New client connected: ${socket.id}`);

    // Handle user joining
    socket.on('join', (data) => {
      console.log(`User joined: ${data.username || 'Anonymous'}`);
      socket.broadcast.emit('userJoined', {
        message: `${data.username || 'Anonymous'} joined the forum`
      });
    });

    // Handle typing indicator
    socket.on('typing', (data) => {
      socket.broadcast.emit('userTyping', {
        postId: data.postId,
        username: data.username
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  return io;
};

module.exports = {
  initializeSocket
};