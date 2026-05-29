import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_ORIGIN ||
  "http://localhost:5000";

let socket;
let activeKey;

export const connectNotificationSocket = ({ userId, role, token, onNotification }) => {
  if (!userId || !token) return null;

  const nextKey = `${userId}:${role || "user"}`;
  if (socket && activeKey === nextKey) {
    if (onNotification) socket.off("notification").on("notification", onNotification);
    return socket;
  }

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  activeKey = nextKey;
  socket = io(SOCKET_URL, {
    transports: ["websocket"],
    auth: { userId, role, token },
    reconnectionAttempts: 5,
  });

  if (onNotification) {
    socket.on("notification", onNotification);
  }

  return socket;
};

export const disconnectNotificationSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
  }
  socket = null;
  activeKey = null;
};
