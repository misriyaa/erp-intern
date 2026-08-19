import * as productRepository from "./product.repository.js";
import * as categoryRepository from "../categories/category.repository.js";
import * as brandRepository from "../brands/brand.repository.js";
import * as unitRepository from "../units/unit.repository.js";
import * as barcodeService from "../barcode/barcode.service.js";

export const createProduct = async (data) => {
  const category = await categoryRepository.getCategoryById(
    data.categoryId
  );

  if (!category) {
    throw new Error("Category not found.");
  }

  if (data.brandId) {
    const brand = await brandRepository.getBrandById(
      data.brandId
    );

    if (!brand) {
      throw new Error("Brand not found.");
    }
  }

  const unit = await unitRepository.getUnitById(data.unitId);

  if (!unit) {
    throw new Error("Unit not found.");
  }

  const existingProduct = await productRepository.getProductBySku(
    data.sku
  );

  if (existingProduct) {
    throw new Error("SKU already exists.");
  }

  // Create product
  const product = await productRepository.createProduct(data);

  // Automatically create barcode
  const barcode = await barcodeService.createBarcodeForProduct(
    product.id
  );

  return {
    ...product,
    barcode,
  };
};

export const getAllProducts = async () => {
  return await productRepository.getAllProducts();
};

export const getProductById = async (id) => {
  const product = await productRepository.getProductById(id);

  if (!product) {
    throw new Error("Product not found.");
  }

  return product;
};

export const searchProducts = async (search) => {
  return await productRepository.searchProducts(search);
};

export const updateProduct = async (id, data) => {
  const product = await productRepository.getProductById(id);

  if (!product) {
    throw new Error("Product not found.");
  }

  if (data.categoryId) {
    const category = await categoryRepository.getCategoryById(
      data.categoryId
    );

    if (!category) {
      throw new Error("Category not found.");
    }
  }

  if (data.brandId) {
    const brand = await brandRepository.getBrandById(
      data.brandId
    );

    if (!brand) {
      throw new Error("Brand not found.");
    }
  }

  if (data.unitId) {
    const unit = await unitRepository.getUnitById(data.unitId);
    if (!unit) {
      throw new Error("Unit not found.");
    }
  }

  if (data.sku && data.sku !== product.sku) {
    const existingProduct = await productRepository.getProductBySku(
      data.sku
    );
    if (existingProduct) {
      throw new Error("SKU already exists.");
    }
  }

  return await productRepository.updateProduct(id, data);
};

export const deleteProduct = async (id) => {
  const product = await productRepository.getProductById(id);

  if (!product) {
    throw new Error("Product not found.");
  }

  return await productRepository.deleteProduct(id);
};