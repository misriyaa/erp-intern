import * as recipeRepo from "./recipe.repository.js";

export const upsertRecipe = async (menuItemId, data) => {
  if (!menuItemId) throw new Error("Menu item ID is required.");
  if (!data.ingredients || !Array.isArray(data.ingredients)) {
    throw new Error("Ingredients array is required.");
  }
  return await recipeRepo.upsertRecipe(menuItemId, data);
};

export const getRecipeByMenuItem = async (menuItemId) => {
  return await recipeRepo.getRecipeByMenuItem(menuItemId);
};

export const getAllRecipes = async (restaurantId) => {
  return await recipeRepo.getAllRecipes(restaurantId);
};

export const deleteRecipe = async (id) => {
  return await recipeRepo.deleteRecipe(id);
};
