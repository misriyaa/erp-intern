import * as modifierService from "./modifier.service.js";

export const createModifierGroup = async (req, res, next) => {
  try {
    const group = await modifierService.createModifierGroup(req.body);
    return res.status(201).json({ success: true, message: "Modifier group created", data: group });
  } catch (error) { next(error); }
};

export const getModifierGroups = async (req, res, next) => {
  try {
    const { restaurantId } = req.query;
    const groups = await modifierService.getModifierGroups(restaurantId);
    return res.status(200).json({ success: true, data: groups });
  } catch (error) { next(error); }
};

export const getModifierGroupById = async (req, res, next) => {
  try {
    const group = await modifierService.getModifierGroupById(req.params.id);
    return res.status(200).json({ success: true, data: group });
  } catch (error) { next(error); }
};

export const updateModifierGroup = async (req, res, next) => {
  try {
    const group = await modifierService.updateModifierGroup(req.params.id, req.body);
    return res.status(200).json({ success: true, message: "Modifier group updated", data: group });
  } catch (error) { next(error); }
};

export const linkMenuItemModifierGroup = async (req, res, next) => {
  try {
    const { menuItemId, modifierGroupId } = req.body;
    const link = await modifierService.linkMenuItemModifierGroup(menuItemId, modifierGroupId);
    return res.status(200).json({ success: true, message: "Modifier linked to menu item", data: link });
  } catch (error) { next(error); }
};

export const unlinkMenuItemModifierGroup = async (req, res, next) => {
  try {
    const { menuItemId, modifierGroupId } = req.body;
    await modifierService.unlinkMenuItemModifierGroup(menuItemId, modifierGroupId);
    return res.status(200).json({ success: true, message: "Modifier unlinked" });
  } catch (error) { next(error); }
};

export const deleteModifierGroup = async (req, res, next) => {
  try {
    await modifierService.deleteModifierGroup(req.params.id);
    return res.status(200).json({ success: true, message: "Modifier group deleted" });
  } catch (error) { next(error); }
};
