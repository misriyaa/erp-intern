import * as menuItemRepo from "./menuItem.repository.js";

export const createMenuItem = async (data) => {
  if (!data.name || !data.restaurantId || !data.categoryId || data.sellingPrice === undefined) {
    throw new Error("Name, restaurant ID, category ID, and selling price are required.");
  }
  return await menuItemRepo.createMenuItem(data);
};

export const getMenuItems = async (restaurantId, categoryId) => {
  return await menuItemRepo.getMenuItems(restaurantId, categoryId);
};

export const getMenuItemById = async (id) => {
  const item = await menuItemRepo.getMenuItemById(id);
  if (!item) throw new Error("Menu item not found.");
  return item;
};

export const updateMenuItem = async (id, data) => {
  const existing = await menuItemRepo.getMenuItemById(id);
  if (!existing) throw new Error("Menu item not found.");
  return await menuItemRepo.updateMenuItem(id, data);
};

export const deleteMenuItem = async (id) => {
  const existing = await menuItemRepo.getMenuItemById(id);
  if (!existing) throw new Error("Menu item not found.");
  return await menuItemRepo.deleteMenuItem(id);
};
