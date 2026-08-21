import * as menuCategoryRepo from "./menuCategory.repository.js";

export const createMenuCategory = async (data) => {
  if (!data.name || !data.restaurantId) {
    throw new Error("Category name and restaurant ID are required.");
  }
  return await menuCategoryRepo.createMenuCategory(data);
};

export const getMenuCategories = async (restaurantId) => {
  return await menuCategoryRepo.getMenuCategories(restaurantId);
};

export const getMenuCategoryById = async (id) => {
  const cat = await menuCategoryRepo.getMenuCategoryById(id);
  if (!cat) throw new Error("Category not found.");
  return cat;
};

export const updateMenuCategory = async (id, data) => {
  const existing = await menuCategoryRepo.getMenuCategoryById(id);
  if (!existing) throw new Error("Category not found.");
  return await menuCategoryRepo.updateMenuCategory(id, data);
};

export const deleteMenuCategory = async (id) => {
  const existing = await menuCategoryRepo.getMenuCategoryById(id);
  if (!existing) throw new Error("Category not found.");
  return await menuCategoryRepo.deleteMenuCategory(id);
};
