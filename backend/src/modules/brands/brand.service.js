import * as brandRepository from "./brand.repository.js";

export const createBrand = async (data) => {
 
  const existingBrand = await brandRepository.getBrandByName(data.name);

  if (existingBrand) {
    throw new Error("Brand already exists.");
  }

  return await brandRepository.createBrand(data);
};

export const getAllBrands = async () => {
  return await brandRepository.getAllBrands();
};

export const getBrandById = async (id) => {
  const brand = await brandRepository.getBrandById(id);

  if (!brand) {
    throw new Error("Brand not found.");
  }

  return brand;
};

export const updateBrand = async (id, data) => {
  const brand = await brandRepository.getBrandById(id);

  if (!brand) {
    throw new Error("Brand not found.");
  }

  if (data.name && data.name !== brand.name) {
    const existingBrand = await brandRepository.getBrandByName(data.name);

    if (existingBrand) {
      throw new Error("Brand already exists.");
    }
  }

  return await brandRepository.updateBrand(id, data);
};

export const deleteBrand = async (id) => {
  const brand = await brandRepository.getBrandById(id);

  if (!brand) {
    throw new Error("Brand not found.");
  }

  return await brandRepository.deleteBrand(id);
};