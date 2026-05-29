const { Server } = require("socket.io");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.auth?.userId;
    const role = socket.handshake.auth?.role;

    if (userId) socket.join(`user:${userId}`);
    if (role) socket.join(`role:${role}`);

    socket.on("disconnect", () => {});
  });

  return io;
};

const getIo = () => io;

const emitNotification = (event, payload = {}, rooms = []) => {
  if (!io) return;

  const notification = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    event,
    createdAt: new Date().toISOString(),
    ...payload,
  };

  if (rooms.length) {
    rooms.forEach((room) => io.to(room).emit("notification", notification));
    return;
  }

  io.emit("notification", notification);
};

module.exports = {
  initSocket,
  getIo,
  emitNotification,
};
