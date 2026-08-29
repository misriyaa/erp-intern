import prisma from "../../config/prisma.js";

/**
 * Helper to ensure a dedicated category exists for Raw Materials & Ingredients
 */
export const getOrCreateRawMaterialCategory = async (companyId) => {
  if (companyId) {
    const existing = await prisma.category.findFirst({
      where: {
        companyId,
        name: { in: ["Raw Materials", "Ingredients", "Raw Materials & Ingredients", "Restaurant Raw Materials"] },
      },
    });
    if (existing) return existing.id;

    // Create default category
    const created = await prisma.category.create({
      data: {
        name: "Raw Materials & Ingredients",
        code: "RAW_MATERIALS",
        companyId,
        status: "ACTIVE",
      },
    });
    return created.id;
  }

  // Fallback to any category
  const firstCat = await prisma.category.findFirst();
  if (firstCat) return firstCat.id;

  const fallback = await prisma.category.create({
    data: {
      name: "Raw Materials & Ingredients",
      code: "RAW_MATERIALS",
      status: "ACTIVE",
    },
  });
  return fallback.id;
};

/**
 * Helper to resolve or create unit
 */
export const resolveUnitId = async (unitInput, companyId) => {
  if (!unitInput) {
    const firstUnit = await prisma.unit.findFirst();
    if (firstUnit) return firstUnit.id;
    const def = await prisma.unit.create({
      data: { name: "Kilogram", code: "kg", companyId },
    });
    return def.id;
  }

  // Check if unitInput is a valid UUID
  const byId = await prisma.unit.findUnique({
    where: { id: unitInput },
  });
  if (byId) return byId.id;

  // Search by code or name
  const byCode = await prisma.unit.findFirst({
    where: {
      OR: [
        { code: { equals: unitInput, mode: "insensitive" } },
        { name: { equals: unitInput, mode: "insensitive" } },
      ],
    },
  });
  if (byCode) return byCode.id;

  // Create new unit
  const newUnit = await prisma.unit.create({
    data: {
      name: unitInput,
      code: unitInput.toLowerCase().slice(0, 10),
      companyId,
    },
  });
  return newUnit.id;
};

/**
 * Helper to get default warehouse for inventory tracking
 */
export const getDefaultWarehouseId = async (companyId) => {
  if (companyId) {
    const wh = await prisma.warehouse.findFirst({
      where: { companyId },
    });
    if (wh) return wh.id;

    const created = await prisma.warehouse.create({
      data: {
        name: "Main Kitchen Store",
        code: "WH-KITCHEN",
        companyId,
        status: "ACTIVE",
      },
    });
    return created.id;
  }

  const anyWh = await prisma.warehouse.findFirst();
  if (anyWh) return anyWh.id;

  const defWh = await prisma.warehouse.create({
    data: {
      name: "Main Kitchen Store",
      code: "WH-KITCHEN",
      status: "ACTIVE",
    },
  });
  return defWh.id;
};

const ingredientInclude = {
  unit: true,
  supplier: true,
  inventories: {
    include: {
      warehouse: true,
    },
  },
};

/**
 * Create a new Restaurant Raw Material / Ingredient
 */
export const createIngredient = async (payload) => {
  const {
    companyId,
    name,
    ingredientName,
    sku,
    ingredientCode,
    description,
    status = "ACTIVE",
    baseUnitId,
    unitId,
    baseUnit,
    openingStock = 0,
    initialStock = 0,
    minimumStockLevel = 0,
    minimumStock = 0,
    reorderQuantity = 0,
    purchaseCost = 0,
    costPrice = 0,
    restaurantOutletId,
    preferredSupplierId,
    supplierId,
    defaultStorageLocation = "Main Store",
    warehouseLocation,
    storageType = "Dry",
    isPerishable = false,
    expiryTracking = false,
    isExpiryTracking = false,
    batchTracking = false,
    isBatchTracking = false,
    image = null,
  } = payload;

  const finalName = (name || ingredientName || "").trim();
  const finalSku = (sku || ingredientCode || `ING-${Date.now().toString().slice(-6)}`).trim();
  const finalCost = parseFloat(purchaseCost || costPrice || 0);
  const finalOpeningStock = parseFloat(openingStock || initialStock || 0);
  const finalMinStock = parseInt(minimumStockLevel || minimumStock || 0, 10);
  const finalReorderQty = parseFloat(reorderQuantity || 0);
  const finalSupplierId = preferredSupplierId || supplierId || null;
  const finalLocation = (defaultStorageLocation || warehouseLocation || "Main Store").trim();
  const finalStorageType = storageType || "Dry";

  const resolvedUnitId = await resolveUnitId(baseUnitId || unitId || baseUnit, companyId);
  const resolvedCategoryId = await getOrCreateRawMaterialCategory(companyId);

  return await prisma.$transaction(async (tx) => {
    // 1. Create the ingredient product
    const ingredient = await tx.product.create({
      data: {
        companyId: companyId || null,
        name: finalName,
        sku: finalSku,
        barcode: finalSku,
        description: description ? description.trim() : null,
        status: status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
        productType: "RAW_MATERIAL",
        isTextile: false,
        categoryId: resolvedCategoryId,
        unitId: resolvedUnitId,
        costPrice: finalCost,
        sellingPrice: 0,
        averageCost: finalCost,
        lastPurchaseCost: finalCost,
        initialStock: finalOpeningStock,
        minimumStock: finalMinStock,
        reorderQuantity: finalReorderQty,
        supplierId: finalSupplierId,
        restaurantOutletId: restaurantOutletId || null,
        defaultStorageLocation: finalLocation,
        warehouseLocation: finalLocation,
        storageType: finalStorageType,
        isPerishable: Boolean(isPerishable),
        isExpiryTracking: Boolean(expiryTracking || isExpiryTracking),
        isBatchTracking: Boolean(batchTracking || isBatchTracking),
        image: image || null,
      },
      include: ingredientInclude,
    });

    // 2. Initialize stock in inventory
    const warehouseId = await getDefaultWarehouseId(companyId);
    if (warehouseId) {
      await tx.inventory.create({
        data: {
          productId: ingredient.id,
          warehouseId,
          quantity: finalOpeningStock,
          minimumStock: finalMinStock,
          reorderLevel: parseInt(finalReorderQty, 10) || 0,
        },
      });
    }

    return ingredient;
  });
};

/**
 * Get all ingredients with filtering
 */
export const getAllIngredients = async (params) => {
  const { companyId, restaurantOutletId, search, status } = params;

  const where = {
    productType: "RAW_MATERIAL",
  };

  if (companyId) {
    where.companyId = companyId;
  }

  if (restaurantOutletId && restaurantOutletId !== "ALL") {
    where.OR = [
      { restaurantOutletId },
      { restaurantOutletId: null },
    ];
  }

  if (status) {
    where.status = status;
  }

  if (search) {
    where.AND = [
      {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { sku: { contains: search, mode: "insensitive" } },
          { defaultStorageLocation: { contains: search, mode: "insensitive" } },
        ],
      },
    ];
  }

  const ingredients = await prisma.product.findMany({
    where,
    include: ingredientInclude,
    orderBy: { createdAt: "desc" },
  });

  return ingredients.map((item) => {
    const invQty = (item.inventories || []).reduce(
      (sum, inv) => sum + (parseFloat(inv.quantity) || 0),
      0
    );
    const currentStock = (item.inventories && item.inventories.length > 0)
      ? invQty
      : (parseFloat(item.initialStock) || 0);

    return {
      ...item,
      currentStock,
    };
  });
};

/**
 * Get ingredient by ID
 */
export const getIngredientById = async (id) => {
  const item = await prisma.product.findUnique({
    where: { id },
    include: ingredientInclude,
  });

  if (!item) return null;

  const invQty = (item.inventories || []).reduce(
    (sum, inv) => sum + (parseFloat(inv.quantity) || 0),
    0
  );
  const currentStock = (item.inventories && item.inventories.length > 0)
    ? invQty
    : (parseFloat(item.initialStock) || 0);

  return {
    ...item,
    currentStock,
  };
};

/**
 * Update ingredient
 */
export const updateIngredient = async (id, payload) => {
  const {
    name,
    ingredientName,
    sku,
    ingredientCode,
    description,
    status,
    baseUnitId,
    unitId,
    baseUnit,
    minimumStockLevel,
    minimumStock,
    reorderQuantity,
    purchaseCost,
    costPrice,
    restaurantOutletId,
    preferredSupplierId,
    supplierId,
    defaultStorageLocation,
    warehouseLocation,
    storageType,
    isPerishable,
    expiryTracking,
    isExpiryTracking,
    batchTracking,
    isBatchTracking,
    image,
  } = payload;

  const updateData = {};

  if (name || ingredientName) updateData.name = (name || ingredientName).trim();
  if (sku || ingredientCode) updateData.sku = (sku || ingredientCode).trim();
  if (description !== undefined) updateData.description = description ? description.trim() : null;
  if (status) updateData.status = status;
  if (purchaseCost !== undefined || costPrice !== undefined) {
    updateData.costPrice = parseFloat(purchaseCost !== undefined ? purchaseCost : costPrice);
  }
  if (minimumStockLevel !== undefined || minimumStock !== undefined) {
    updateData.minimumStock = parseInt(minimumStockLevel !== undefined ? minimumStockLevel : minimumStock, 10);
  }
  if (reorderQuantity !== undefined) updateData.reorderQuantity = parseFloat(reorderQuantity);
  if (preferredSupplierId !== undefined || supplierId !== undefined) {
    updateData.supplierId = preferredSupplierId || supplierId || null;
  }
  if (restaurantOutletId !== undefined) updateData.restaurantOutletId = restaurantOutletId || null;
  if (defaultStorageLocation !== undefined || warehouseLocation !== undefined) {
    const loc = (defaultStorageLocation || warehouseLocation || "").trim();
    updateData.defaultStorageLocation = loc;
    updateData.warehouseLocation = loc;
  }
  if (storageType !== undefined) updateData.storageType = storageType;
  if (isPerishable !== undefined) updateData.isPerishable = Boolean(isPerishable);
  if (expiryTracking !== undefined || isExpiryTracking !== undefined) {
    updateData.isExpiryTracking = Boolean(expiryTracking !== undefined ? expiryTracking : isExpiryTracking);
  }
  if (batchTracking !== undefined || isBatchTracking !== undefined) {
    updateData.isBatchTracking = Boolean(batchTracking !== undefined ? batchTracking : isBatchTracking);
  }
  if (image !== undefined) updateData.image = image;

  if (baseUnitId || unitId || baseUnit) {
    updateData.unitId = await resolveUnitId(baseUnitId || unitId || baseUnit);
  }

  return await prisma.product.update({
    where: { id },
    data: updateData,
    include: ingredientInclude,
  });
};

/**
 * Delete ingredient
 */
export const deleteIngredient = async (id) => {
  return await prisma.$transaction(async (tx) => {
    await tx.inventory.deleteMany({
      where: { productId: id },
    });
    return await tx.product.delete({
      where: { id },
    });
  });
};
