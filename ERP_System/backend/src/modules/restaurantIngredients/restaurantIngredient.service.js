import * as ingredientRepo from "./restaurantIngredient.repository.js";

export const createIngredient = async (data) => {
  return await ingredientRepo.createIngredient(data);
};

export const getAllIngredients = async (params) => {
  return await ingredientRepo.getAllIngredients(params);
};

export const getIngredientById = async (id) => {
  return await ingredientRepo.getIngredientById(id);
};

export const updateIngredient = async (id, data) => {
  return await ingredientRepo.updateIngredient(id, data);
};

export const deleteIngredient = async (id) => {
  return await ingredientRepo.deleteIngredient(id);
};
