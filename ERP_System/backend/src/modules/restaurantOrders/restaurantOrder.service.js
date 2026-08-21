import * as orderRepo from "./restaurantOrder.repository.js";

export const createOrder = async (data) => {
  if (!data.restaurantId || !data.branchId) {
    throw new Error("Restaurant ID and branch ID are required.");
  }
  return await orderRepo.createOrder(data);
};

export const getOrders = async (params) => {
  return await orderRepo.getOrders(params);
};

export const getOrderById = async (id) => {
  const order = await orderRepo.getOrderById(id);
  if (!order) throw new Error("Order not found.");
  return order;
};

export const updateOrder = async (id, data) => {
  const existing = await orderRepo.getOrderById(id);
  if (!existing) throw new Error("Order not found.");
  return await orderRepo.updateOrder(id, data);
};

export const checkStockAvailability = async (orderId, warehouseId) => {
  return await orderRepo.checkStockAvailability(orderId, warehouseId);
};

export const confirmOrderAndSendKOT = async (orderId, warehouseId, allowStockOverride) => {
  return await orderRepo.confirmOrderAndSendKOT(orderId, warehouseId, allowStockOverride);
};

export const completeOrderAndPay = async (orderId, paymentData) => {
  return await orderRepo.completeOrderAndPay(orderId, paymentData);
};

export const cancelOrder = async (orderId, reason) => {
  return await orderRepo.cancelOrder(orderId, reason);
};
