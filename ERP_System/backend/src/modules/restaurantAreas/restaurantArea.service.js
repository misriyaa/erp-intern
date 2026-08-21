import * as areaRepo from "./restaurantArea.repository.js";

export const createArea = async (data) => {
  if (!data.name || !data.restaurantId) {
    throw new Error("Area name and restaurant ID are required.");
  }
  return await areaRepo.createArea(data);
};

export const getAreasByRestaurant = async (restaurantId) => {
  return await areaRepo.getAreasByRestaurant(restaurantId);
};

export const getAreaById = async (id) => {
  const area = await areaRepo.getAreaById(id);
  if (!area) throw new Error("Area not found.");
  return area;
};

export const updateArea = async (id, data) => {
  const existing = await areaRepo.getAreaById(id);
  if (!existing) throw new Error("Area not found.");
  return await areaRepo.updateArea(id, data);
};

export const deleteArea = async (id) => {
  const existing = await areaRepo.getAreaById(id);
  if (!existing) throw new Error("Area not found.");
  return await areaRepo.deleteArea(id);
};
