import { io } from "socket.io-client";
import { API_ORIGIN_URL } from "../config/api";

const SOCKET_URL = API_ORIGIN_URL;

let socket;
let activeKey;

export const connectNotificationSocket = async ({
  userId,
  getToken,
  onNotification,
}) => {
  if (!userId || !getToken) {
    return null;
  }

  const token = await getToken({ skipCache: true });

  if (!token) {
    return null;
  }

  const nextKey = userId;

  if (socket && activeKey === nextKey) {
    if (onNotification) {
      socket.off("notification").on("notification", onNotification);
    }
    return socket;
  }

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  activeKey = nextKey;
  socket = io(SOCKET_URL, {
    transports: ["websocket"],
    auth: { token },
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
