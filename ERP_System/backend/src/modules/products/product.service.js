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

  let brandId = data.brandId || null;
  if (brandId) {
    const brand = await brandRepository.getBrandById(brandId).catch(() => null);
    if (!brand) brandId = null;
  }

  let supplierId = data.supplierId || null;

  let variants = data.variants;
  if (typeof variants === "string") {
    try {
      variants = JSON.parse(variants);
    } catch (e) {
      variants = [];
    }
  }

  const sku = data.sku || `SKU-${Date.now().toString().slice(-6)}`;

  const cleanData = {
    name: data.name,
    sku,
    barcode: data.barcode || null,
    description: data.description || "",
    costPrice: parseFloat(data.costPrice || 0),
    sellingPrice: parseFloat(data.sellingPrice || 0),
    wholesalePrice: data.wholesalePrice ? parseFloat(data.wholesalePrice) : null,
    retailPrice: data.retailPrice ? parseFloat(data.retailPrice) : null,
    discountType: data.discountType || null,
    discountValue: data.discountValue ? parseFloat(data.discountValue) : null,
    taxRate: data.taxRate ? parseFloat(data.taxRate) : null,
    image: data.image || null,
    status: data.status || "ACTIVE",
    categoryId,
    subcategory: data.subcategory || null,
    unitId,
    ...(brandId ? { brandId } : {}),
    ...(supplierId ? { supplierId } : {}),

    // Fabric Specs
    isTextile: data.isTextile !== undefined ? Boolean(data.isTextile) : Boolean(data.fabricComposition || data.gsm || (data.sku && (data.sku.startsWith("TEX-") || data.sku.startsWith("FAB-")))),
    fabricComposition: data.fabricComposition || null,
    gsm: data.gsm ? parseFloat(data.gsm) : null,
    rollWidth: data.rollWidth ? parseFloat(data.rollWidth) : null,
    widthUnit: data.widthUnit || "Inches",
    color: data.color || null,
    colorCode: data.colorCode || null,
    pattern: data.pattern || null,
    weaveType: data.weaveType || null,
    textureFinish: data.textureFinish || null,

    // Inventory Details
    stockUnit: data.stockUnit || null,
    initialStock: data.initialStock ? parseFloat(data.initialStock) : 0,
    openingStockDate: data.openingStockDate ? new Date(data.openingStockDate) : null,
    reorderLevel: data.reorderLevel ? parseInt(data.reorderLevel) : 0,
    minimumStock: data.minimumStock ? parseInt(data.minimumStock) : 0,
    maximumStock: data.maximumStock ? parseInt(data.maximumStock) : null,
    warehouseLocation: data.warehouseLocation || null,
    rackLocation: data.rackLocation || null,
    numberOfRolls: data.numberOfRolls ? parseInt(data.numberOfRolls) : 0,

    // Supplier Details
    supplierProductCode: data.supplierProductCode || null,
    leadTime: data.leadTime ? parseInt(data.leadTime) : null,
    hasVariants: Boolean(data.hasVariants || (Array.isArray(variants) && variants.length > 0)),
    variants: Array.isArray(variants) ? variants : [],
  };

  const product = await productRepository.createProduct(cleanData);

  if (data.barcode || !product.barcodes || product.barcodes.length === 0) {
    try {
      const barcodeVal = data.barcode || product.sku;
      await barcodeService.createBarcodeForProduct(product.id, barcodeVal);
    } catch (err) {
      // Barcode generation soft fallback
    }
  }

  return await productRepository.getProductById(product.id);
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
    const category = await categoryRepository.getCategoryById(data.categoryId);
    if (!category) {
      throw new Error("Category not found.");
    }
  }

  if (data.brandId) {
    const brand = await brandRepository.getBrandById(data.brandId);
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
    const existingProduct = await productRepository.getProductBySku(data.sku);
    if (existingProduct) {
      throw new Error("SKU already exists.");
    }
  }

  let variants = data.variants;
  if (typeof variants === "string") {
    try {
      variants = JSON.parse(variants);
    } catch (e) {
      variants = undefined;
    }
  }

  const cleanUpdate = {
    ...(data.name && { name: data.name }),
    ...(data.sku && { sku: data.sku }),
    ...(data.barcode !== undefined && { barcode: data.barcode }),
    ...(data.description !== undefined && { description: data.description }),
    ...(data.costPrice !== undefined && { costPrice: parseFloat(data.costPrice) }),
    ...(data.sellingPrice !== undefined && { sellingPrice: parseFloat(data.sellingPrice) }),
    ...(data.wholesalePrice !== undefined && { wholesalePrice: data.wholesalePrice ? parseFloat(data.wholesalePrice) : null }),
    ...(data.retailPrice !== undefined && { retailPrice: data.retailPrice ? parseFloat(data.retailPrice) : null }),
    ...(data.discountType !== undefined && { discountType: data.discountType }),
    ...(data.discountValue !== undefined && { discountValue: data.discountValue ? parseFloat(data.discountValue) : null }),
    ...(data.taxRate !== undefined && { taxRate: data.taxRate ? parseFloat(data.taxRate) : null }),
    ...(data.image !== undefined && { image: data.image }),
    ...(data.status && { status: data.status }),
    ...(data.categoryId && { categoryId: data.categoryId }),
    ...(data.subcategory !== undefined && { subcategory: data.subcategory }),
    ...(data.unitId && { unitId: data.unitId }),
    ...(data.brandId !== undefined && { brandId: data.brandId || null }),
    ...(data.supplierId !== undefined && { supplierId: data.supplierId || null }),

    // Fabric Specs
    ...(data.fabricComposition !== undefined && { fabricComposition: data.fabricComposition }),
    ...(data.gsm !== undefined && { gsm: data.gsm ? parseFloat(data.gsm) : null }),
    ...(data.rollWidth !== undefined && { rollWidth: data.rollWidth ? parseFloat(data.rollWidth) : null }),
    ...(data.widthUnit !== undefined && { widthUnit: data.widthUnit }),
    ...(data.color !== undefined && { color: data.color }),
    ...(data.colorCode !== undefined && { colorCode: data.colorCode }),
    ...(data.pattern !== undefined && { pattern: data.pattern }),
    ...(data.weaveType !== undefined && { weaveType: data.weaveType }),
    ...(data.textureFinish !== undefined && { textureFinish: data.textureFinish }),

    // Inventory Details
    ...(data.stockUnit !== undefined && { stockUnit: data.stockUnit }),
    ...(data.initialStock !== undefined && { initialStock: data.initialStock ? parseFloat(data.initialStock) : 0 }),
    ...(data.openingStockDate !== undefined && { openingStockDate: data.openingStockDate ? new Date(data.openingStockDate) : null }),
    ...(data.reorderLevel !== undefined && { reorderLevel: data.reorderLevel ? parseInt(data.reorderLevel) : 0 }),
    ...(data.minimumStock !== undefined && { minimumStock: data.minimumStock ? parseInt(data.minimumStock) : 0 }),
    ...(data.maximumStock !== undefined && { maximumStock: data.maximumStock ? parseInt(data.maximumStock) : null }),
    ...(data.warehouseLocation !== undefined && { warehouseLocation: data.warehouseLocation }),
    ...(data.rackLocation !== undefined && { rackLocation: data.rackLocation }),
    ...(data.numberOfRolls !== undefined && { numberOfRolls: data.numberOfRolls ? parseInt(data.numberOfRolls) : 0 }),

    // Supplier Details
    ...(data.supplierProductCode !== undefined && { supplierProductCode: data.supplierProductCode }),
    ...(data.leadTime !== undefined && { leadTime: data.leadTime ? parseInt(data.leadTime) : null }),
    ...(data.hasVariants !== undefined && { hasVariants: Boolean(data.hasVariants) }),
    ...(variants !== undefined && { variants: Array.isArray(variants) ? variants : [] }),
  };

  return await productRepository.updateProduct(id, cleanUpdate);
};

export const deleteProduct = async (id) => {
  const product = await productRepository.getProductById(id);

  if (!product) {
    throw new Error("Product not found.");
  }

  return await productRepository.deleteProduct(id);
};