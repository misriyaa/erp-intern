import * as textileRepo from "./textile.repository.js";

export const getTextileProducts = async (companyId, query) => {
  return await textileRepo.getTextileProductsRepo(companyId, query);
};

export const getTextileProductById = async (companyId, id) => {
  return await textileRepo.getTextileProductByIdRepo(companyId, id);
};

export const createTextileProduct = async (companyId, data) => {
  return await textileRepo.createTextileProductRepo({ ...data, companyId });
};

export const updateTextileProduct = async (companyId, id, data) => {
  return await textileRepo.updateTextileProductRepo(companyId, id, data);
};

export const deleteTextileProduct = async (companyId, id) => {
  return await textileRepo.deleteTextileProductRepo(companyId, id);
};
