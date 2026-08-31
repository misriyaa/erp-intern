import { io } from "socket.io-client";

let socket = null;
let currentOutletId = null;

const getBackendUrl = () => {
  if (typeof window !== "undefined") {
    const host = window.location.hostname || "localhost";
    return process.env.NEXT_PUBLIC_SOCKET_URL || `http://${host}:5000`;
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
};

export const getSocket = () => {
  if (!socket) {
    const backendUrl = getBackendUrl();
    socket = io(backendUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("🔌 Connected to Socket Server:", socket.id);
      if (currentOutletId) {
        socket.emit("joinOutlet", { restaurantId: currentOutletId });
      }
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ Socket Disconnected:", reason);
    });

    socket.on("connect_error", (error) => {
      console.warn("⚠️ Socket Connection Error:", error.message);
    });
  }

  return socket;
};

export const joinOutletRoom = (restaurantId) => {
  if (!restaurantId) return;
  currentOutletId = restaurantId;
  const s = getSocket();
  if (s.connected) {
    s.emit("joinOutlet", { restaurantId });
    console.log(`👤 Joined socket outlet room: restaurant:${restaurantId}`);
  }
};

export const leaveOutletRoom = (restaurantId) => {
  if (!restaurantId) return;
  const s = getSocket();
  if (s.connected) {
    s.emit("leaveOutlet", { restaurantId });
  }
  if (currentOutletId === restaurantId) {
    currentOutletId = null;
  }
};

export const subscribeToOrderStatus = (callback) => {
  const s = getSocket();
  s.on("orderStatusUpdated", callback);
  return () => {
    s.off("orderStatusUpdated", callback);
  };
};

export const subscribeToReconnect = (callback) => {
  const s = getSocket();
  s.on("connect", callback);
  return () => {
    s.off("connect", callback);
  };
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    currentOutletId = null;
  }
};

export const socketService = {
  getSocket,
  joinOutletRoom,
  leaveOutletRoom,
  subscribeToOrderStatus,
  subscribeToReconnect,
  disconnectSocket,
  on: (event, callback) => {
    const s = getSocket();
    s.on(event, callback);
  },
  off: (event, callback) => {
    const s = getSocket();
    s.off(event, callback);
  },
};

export default socketService;

