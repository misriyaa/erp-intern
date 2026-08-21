import * as wastageRepo from "./wastage.repository.js";

export const createWastage = async (data) => {
  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    throw new Error("Wastage items are required.");
  }
  return await wastageRepo.createWastage(data);
};

export const getWastages = async (params) => {
  return await wastageRepo.getWastages(params);
};

export const getWastageById = async (id) => {
  const wastage = await wastageRepo.getWastageById(id);
  if (!wastage) throw new Error("Wastage record not found.");
  return wastage;
};

export const deleteWastage = async (id) => {
  const existing = await wastageRepo.getWastageById(id);
  if (!existing) throw new Error("Wastage record not found.");
  return await wastageRepo.deleteWastage(id);
};
