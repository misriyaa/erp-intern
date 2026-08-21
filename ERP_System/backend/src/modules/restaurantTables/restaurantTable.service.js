import * as tableRepo from "./restaurantTable.repository.js";

export const createTable = async (data) => {
  if (!data.tableNumber || !data.restaurantId || !data.areaId) {
    throw new Error("Table number, restaurant ID, and area ID are required.");
  }
  return await tableRepo.createTable(data);
};

export const getTables = async (restaurantId, areaId) => {
  return await tableRepo.getTables(restaurantId, areaId);
};

export const getTableById = async (id) => {
  const table = await tableRepo.getTableById(id);
  if (!table) throw new Error("Table not found.");
  return table;
};

export const updateTable = async (id, data) => {
  const existing = await tableRepo.getTableById(id);
  if (!existing) throw new Error("Table not found.");
  return await tableRepo.updateTable(id, data);
};

export const updateTableStatus = async (id, status) => {
  const validStatuses = ["AVAILABLE", "OCCUPIED", "RESERVED", "CLEANING", "BLOCKED"];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
  }
  return await tableRepo.updateTableStatus(id, status);
};

export const deleteTable = async (id) => {
  const existing = await tableRepo.getTableById(id);
  if (!existing) throw new Error("Table not found.");
  return await tableRepo.deleteTable(id);
};
