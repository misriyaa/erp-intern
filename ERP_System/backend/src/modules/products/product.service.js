import * as productRepository from "./product.repository.js";
import * as categoryRepository from "../categories/category.repository.js";
import * as brandRepository from "../brands/brand.repository.js";
import * as unitRepository from "../units/unit.repository.js";
import * as barcodeService from "../barcode/barcode.service.js";

export const createProduct = async (data) => {
  let categoryId = data.categoryId;
  if (categoryId) {
    const category = await categoryRepository.getCategoryById(categoryId).catch(() => null);
    if (!category) categoryId = null;
  }
  if (!categoryId) {
    let defaultCat = await categoryRepository.getAllCategories().then((cats) => cats[0]).catch(() => null);
    if (!defaultCat) {
      defaultCat = await categoryRepository.createCategory({ name: "General", code: "GEN" }).catch(() => null);
    }
    if (defaultCat) categoryId = defaultCat.id;
  }

  let unitId = data.unitId || data.baseUnitId;
  if (unitId) {
    const unit = await unitRepository.getUnitById(unitId).catch(() => null);
    if (!unit) unitId = null;
  }
  if (!unitId) {
    let defaultUnit = await unitRepository.getAllUnits().then((units) => units[0]).catch(() => null);
    if (!defaultUnit) {
      defaultUnit = await unitRepository.createUnit({ name: "Pieces", code: "PCS" }).catch(() => null);
    }
    if (defaultUnit) unitId = defaultUnit.id;
  }

  let brandId = data.brandId;
  if (brandId) {
    const brand = await brandRepository.getBrandById(brandId).catch(() => null);
    if (!brand) brandId = null;
  }

  const sku = data.sku || `SKU-${Date.now().toString().slice(-6)}`;

  const cleanData = {
    name: data.name,
    sku,
    description: data.description || "",
    costPrice: parseFloat(data.costPrice || 0),
    sellingPrice: parseFloat(data.sellingPrice || 0),
    categoryId,
    unitId,
    ...(brandId ? { brandId } : {}),
  };

  const product = await productRepository.createProduct(cleanData);

  try {
    const barcode = await barcodeService.createBarcodeForProduct(product.id);
    return { ...product, barcode };
  } catch (err) {
    return product;
  }
};

export const getAllProducts = async (companyId) => {
  return await productRepository.getAllProducts(companyId);
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