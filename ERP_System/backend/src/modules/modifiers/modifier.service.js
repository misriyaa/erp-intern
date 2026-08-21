import * as modifierRepo from "./modifier.repository.js";

export const createModifierGroup = async (data) => {
  if (!data.name || !data.restaurantId) {
    throw new Error("Name and restaurant ID are required.");
  }
  return await modifierRepo.createModifierGroup(data);
};

export const getModifierGroups = async (restaurantId) => {
  return await modifierRepo.getModifierGroups(restaurantId);
};

export const getModifierGroupById = async (id) => {
  const group = await modifierRepo.getModifierGroupById(id);
  if (!group) throw new Error("Modifier group not found.");
  return group;
};

export const updateModifierGroup = async (id, data) => {
  const existing = await modifierRepo.getModifierGroupById(id);
  if (!existing) throw new Error("Modifier group not found.");
  return await modifierRepo.updateModifierGroup(id, data);
};

export const linkMenuItemModifierGroup = async (menuItemId, modifierGroupId) => {
  return await modifierRepo.linkMenuItemModifierGroup(menuItemId, modifierGroupId);
};

export const unlinkMenuItemModifierGroup = async (menuItemId, modifierGroupId) => {
  return await modifierRepo.unlinkMenuItemModifierGroup(menuItemId, modifierGroupId);
};

export const deleteModifierGroup = async (id) => {
  const existing = await modifierRepo.getModifierGroupById(id);
  if (!existing) throw new Error("Modifier group not found.");
  return await modifierRepo.deleteModifierGroup(id);
};
