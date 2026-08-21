import * as menuItemService from "./menuItem.service.js";

export const createMenuItem = async (req, res, next) => {
  try {
    if (req.file) {
      req.body.image = "/uploads/" + req.file.filename;
    }
    const item = await menuItemService.createMenuItem(req.body);
    return res.status(201).json({ success: true, message: "Menu item created", data: item });
  } catch (error) { next(error); }
};

export const getMenuItems = async (req, res, next) => {
  try {
    const { restaurantId, categoryId } = req.query;
    const items = await menuItemService.getMenuItems(restaurantId, categoryId);
    return res.status(200).json({ success: true, data: items });
  } catch (error) { next(error); }
};

export const getMenuItemById = async (req, res, next) => {
  try {
    const item = await menuItemService.getMenuItemById(req.params.id);
    return res.status(200).json({ success: true, data: item });
  } catch (error) { next(error); }
};

export const updateMenuItem = async (req, res, next) => {
  try {
    if (req.file) {
      req.body.image = "/uploads/" + req.file.filename;
    }
    const item = await menuItemService.updateMenuItem(req.params.id, req.body);
    return res.status(200).json({ success: true, message: "Menu item updated", data: item });
  } catch (error) { next(error); }
};

export const deleteMenuItem = async (req, res, next) => {
  try {
    await menuItemService.deleteMenuItem(req.params.id);
    return res.status(200).json({ success: true, message: "Menu item deleted" });
  } catch (error) { next(error); }
};
