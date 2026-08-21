import * as kitchenRepo from "./kitchen.repository.js";

export const getKitchenOrders = async (restaurantId, status) => {
  return await kitchenRepo.getKitchenOrders(restaurantId, status);
};

export const getKitchenOrderById = async (id) => {
  const kot = await kitchenRepo.getKitchenOrderById(id);
  if (!kot) throw new Error("KOT not found.");
  return kot;
};

export const updateKOTStatus = async (id, status) => {
  const validStatuses = ["NEW", "PREPARING", "READY", "SERVED", "CANCELLED"];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid KOT status: ${status}`);
  }
  return await kitchenRepo.updateKOTStatus(id, status);
};
