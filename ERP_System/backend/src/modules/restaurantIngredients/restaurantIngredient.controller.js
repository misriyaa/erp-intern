import * as ingredientService from "./restaurantIngredient.service.js";

export const createIngredient = async (req, res, next) => {
  try {
    const companyId = req.companyId || req.user?.companyId;
    const body = req.body || {};

    const name = (body.name || body.ingredientName || "").trim();
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Ingredient Name is required",
      });
    }

    const payload = {
      ...body,
      companyId,
      name,
    };

    if (req.file) {
      payload.image = `/uploads/${req.file.filename}`;
    }

    const ingredient = await ingredientService.createIngredient(payload);

    return res.status(201).json({
      success: true,
      message: `Ingredient "${name}" created successfully`,
      data: ingredient,
    });
  } catch (error) {
    console.error("Restaurant Ingredient Creation Error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Unable to add ingredient. Please check the entered information.",
    });
  }
};

export const getAllIngredients = async (req, res, next) => {
  try {
    const companyId = req.companyId || req.user?.companyId;
    const { restaurantOutletId, search, status } = req.query;

    const params = {
      companyId,
      restaurantOutletId,
      search,
      status,
    };

    const ingredients = await ingredientService.getAllIngredients(params);

    return res.status(200).json({
      success: true,
      data: ingredients,
    });
  } catch (error) {
    console.error("Fetch Ingredients Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch ingredients",
    });
  }
};

export const getIngredientById = async (req, res, next) => {
  try {
    const ingredient = await ingredientService.getIngredientById(req.params.id);
    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: "Ingredient not found",
      });
    }
    return res.status(200).json({
      success: true,
      data: ingredient,
    });
  } catch (error) {
    next(error);
  }
};

export const updateIngredient = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (req.file) {
      payload.image = `/uploads/${req.file.filename}`;
    }
    const ingredient = await ingredientService.updateIngredient(req.params.id, payload);
    return res.status(200).json({
      success: true,
      message: "Ingredient updated successfully",
      data: ingredient,
    });
  } catch (error) {
    console.error("Update Ingredient Error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update ingredient",
    });
  }
};

export const deleteIngredient = async (req, res, next) => {
  try {
    await ingredientService.deleteIngredient(req.params.id);
    return res.status(200).json({
      success: true,
      message: "Ingredient deleted successfully",
    });
  } catch (error) {
    console.error("Delete Ingredient Error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to delete ingredient",
    });
  }
};
