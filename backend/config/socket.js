const { Server } = require("socket.io");
const { verifyToken } = require("@clerk/backend");
const User = require("../models/User");
const { normalizeRole } = require("../utils/roleUtils");

let io;

const isProduction = process.env.NODE_ENV === "production";
const clientUrl =
  process.env.CLIENT_URL ||
  (isProduction
    ? "https://verify-e2n4jjdke-jithendra-kumars-projects-3b533de6.vercel.app"
    : "http://localhost:5173");

const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token || typeof token !== "string") {
      return next(new Error("Unauthorized"));
    }

    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    const clerkId = payload?.sub;

    if (!clerkId) {
      return next(new Error("Unauthorized"));
    }

    const user = await User.findOne({ clerkId });

    if (!user) {
      return next(new Error("Unauthorized"));
    }

    socket.data.userId = clerkId;
    socket.data.role = normalizeRole(user.role);

    return next();
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[SocketAuth] Connection rejected:", error.message);
    }

    return next(new Error("Unauthorized"));
  }
};

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: clientUrl,
      credentials: true,
    },
  });

  io.use(authenticateSocket);

  io.on("connection", (socket) => {
    const { userId, role } = socket.data;

    if (userId) {
      socket.join(`user:${userId}`);
    }

    if (role) {
      socket.join(`role:${role}`);
    }

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
