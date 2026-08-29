import { Server } from "socket.io";

let io = null;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`🔌 Socket Connected: ${socket.id}`);

    // Join authorized outlet room
    socket.on("joinOutlet", (data) => {
      const restaurantId = typeof data === "string" ? data : data?.restaurantId || data?.outletId;
      if (restaurantId) {
        const roomName = `restaurant:${restaurantId}`;
        socket.join(roomName);
        console.log(`👤 Socket ${socket.id} joined room ${roomName}`);
      }
    });

    // Leave outlet room
    socket.on("leaveOutlet", (data) => {
      const restaurantId = typeof data === "string" ? data : data?.restaurantId || data?.outletId;
      if (restaurantId) {
        const roomName = `restaurant:${restaurantId}`;
        socket.leave(roomName);
        console.log(`👋 Socket ${socket.id} left room ${roomName}`);
      }
    });

    socket.on("disconnect", () => {
      console.log(`❌ Socket Disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    console.warn("⚠️ Socket.io is not initialized yet.");
  }
  return io;
};

/**
 * Emit order status update event to the specific restaurant outlet room
 */
export const emitOrderStatusUpdate = (orderData) => {
  if (!io) return;
  const restaurantId = orderData?.restaurantId || orderData?.kot?.restaurantId;
  if (!restaurantId) return;

  const roomName = `restaurant:${restaurantId}`;
  console.log(`📢 Emitting orderStatusUpdated to room ${roomName} for Order ${orderData.orderNumber || orderData.id}`);

  io.to(roomName).emit("orderStatusUpdated", {
    orderId: orderData.id,
    orderNumber: orderData.orderNumber,
    tableId: orderData.tableId,
    tableNumber: orderData.table?.tableNumber || orderData.tableNumber || null,
    status: orderData.status,
    restaurantId: restaurantId,
    orderType: orderData.orderType,
    items: orderData.items || [],
    kot: orderData.kot || null,
    updatedAt: new Date().toISOString(),
    order: orderData,
  });
};
