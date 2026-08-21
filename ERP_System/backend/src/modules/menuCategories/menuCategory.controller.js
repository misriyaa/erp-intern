import * as menuCategoryService from "./menuCategory.service.js";

export const createMenuCategory = async (req, res, next) => {
  try {
    const category = await menuCategoryService.createMenuCategory(req.body);
    return res.status(201).json({ success: true, message: "Menu Category created", data: category });
  } catch (error) { next(error); }
};

export const getMenuCategories = async (req, res, next) => {
  try {
    const { restaurantId } = req.query;
    const categories = await menuCategoryService.getMenuCategories(restaurantId);
    return res.status(200).json({ success: true, data: categories });
  } catch (error) { next(error); }
};

export const getMenuCategoryById = async (req, res, next) => {
  try {
    const category = await menuCategoryService.getMenuCategoryById(req.params.id);
    return res.status(200).json({ success: true, data: category });
  } catch (error) { next(error); }
};

export const updateMenuCategory = async (req, res, next) => {
  try {
    const category = await menuCategoryService.updateMenuCategory(req.params.id, req.body);
    return res.status(200).json({ success: true, message: "Menu Category updated", data: category });
  } catch (error) { next(error); }
};

export const deleteMenuCategory = async (req, res, next) => {
  try {
    await menuCategoryService.deleteMenuCategory(req.params.id);
    return res.status(200).json({ success: true, message: "Menu Category deleted" });
  } catch (error) { next(error); }
};
