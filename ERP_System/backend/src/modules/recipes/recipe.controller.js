import * as recipeService from "./recipe.service.js";

export const upsertRecipe = async (req, res, next) => {
  try {
    const { menuItemId } = req.params;
    const recipe = await recipeService.upsertRecipe(menuItemId, req.body);
    return res.status(200).json({ success: true, message: "Recipe saved successfully", data: recipe });
  } catch (error) { next(error); }
};

export const getRecipeByMenuItem = async (req, res, next) => {
  try {
    const { menuItemId } = req.params;
    const recipe = await recipeService.getRecipeByMenuItem(menuItemId);
    return res.status(200).json({ success: true, data: recipe });
  } catch (error) { next(error); }
};

export const getAllRecipes = async (req, res, next) => {
  try {
    const { restaurantId } = req.query;
    const recipes = await recipeService.getAllRecipes(restaurantId);
    return res.status(200).json({ success: true, data: recipes });
  } catch (error) { next(error); }
};

export const deleteRecipe = async (req, res, next) => {
  try {
    await recipeService.deleteRecipe(req.params.id);
    return res.status(200).json({ success: true, message: "Recipe deleted" });
  } catch (error) { next(error); }
};
