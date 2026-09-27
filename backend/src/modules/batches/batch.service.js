import prisma from "../../config/prisma.js";
import * as batchRepository from "./batch.repository.js";

/**
 * Create a new batch for a specific product
 */
export const createProductBatch = async (productId, data, user = null) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { inventories: true },
  });

  if (!product) {
    throw new Error("Product not found.");
  }

  const batchNumber = String(data.batchNumber || "").trim();
  if (!batchNumber) {
    throw new Error("Batch number is required.");
  }

  // Prevent duplicate batch numbers for the same product
  const existingBatch = await batchRepository.getBatchByNumber(productId, batchNumber);
  if (existingBatch) {
    throw new Error(`Batch "${batchNumber}" already exists for this product.`);
  }

  const mrp = parseFloat(data.mrp);
  const purchasePrice = parseFloat(data.purchasePrice);
  const sellingPrice = parseFloat(data.sellingPrice);
  const quantity = Math.max(0, parseInt(data.quantity ?? 0, 10));

  if (isNaN(mrp) || mrp <= 0) {
    throw new Error("MRP must be greater than 0.");
  }
  if (isNaN(purchasePrice) || purchasePrice <= 0) {
    throw new Error("Purchase price must be greater than 0.");
  }
  if (isNaN(sellingPrice) || sellingPrice <= 0) {
    throw new Error("Selling price must be greater than 0.");
  }
  if (mrp < sellingPrice) {
    throw new Error("MRP must be greater than or equal to selling price.");
  }

  const companyId = product.companyId || user?.companyId || null;

  return await prisma.$transaction(async (tx) => {
    // 1. Create the ProductBatch
    const batch = await batchRepository.createBatch(
      {
        productId,
        batchNumber,
        mrp,
        purchasePrice,
        sellingPrice,
        quantity,
        expiryDate: data.expiryDate || null,
        companyId,
      },
      tx
    );

    // 2. If quantity > 0, update or create inventory record in warehouse
    if (quantity > 0) {
      let warehouse = await tx.warehouse.findFirst({
        where: companyId ? { companyId, status: "ACTIVE" } : { status: "ACTIVE" },
      });

      if (!warehouse) {
        warehouse = await tx.warehouse.create({
          data: {
            name: "Main Warehouse",
            code: "WH-MAIN",
            location: "Main Store",
            companyId,
            status: "ACTIVE",
          },
        });
      }

      const invRecord = await tx.inventory.findFirst({
        where: {
          productId,
          warehouseId: warehouse.id,
        },
      });

      if (invRecord) {
        await tx.inventory.update({
          where: { id: invRecord.id },
          data: {
            quantity: {
              increment: quantity,
            },
          },
        });
      } else {
        await tx.inventory.create({
          data: {
            productId,
            warehouseId: warehouse.id,
            quantity,
            minimumStock: product.minimumStock || 5,
            maximumStock: product.maximumStock || 500,
            reorderLevel: product.reorderLevel || 10,
          },
        });
      }

      // 3. Log stock movement
      await tx.stockMovement.create({
        data: {
          productId,
          warehouseId: warehouse.id,
          type: "IN",
          quantity,
          referenceNo: batchNumber,
          batchNumber,
          batchId: batch.id,
          remarks: `Initial stock for Batch ${batchNumber}`,
          performedBy: user?.fullName || user?.email || "Admin",
          companyId,
        },
      });
    }

    // 4. Synchronize denormalized product initialStock with total batch stock
    const allBatches = await tx.productBatch.findMany({
      where: { productId },
    });
    const totalBatchStock = allBatches.reduce((acc, b) => acc + (b.quantity || 0), 0);

    await tx.product.update({
      where: { id: productId },
      data: {
        initialStock: totalBatchStock,
      },
    });

    return batch;
  });
};

/**
 * Get all batches for a specific product
 */
export const getBatchesByProductId = async (productId) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new Error("Product not found.");
  }

  const batches = await batchRepository.getBatchesByProductId(productId);
  const now = new Date();

  return batches.map((b) => {
    let status = "In Stock";
    if (b.quantity === 0) {
      status = "Out of Stock";
    } else if (b.quantity <= 10) {
      status = "Low Stock";
    }

    if (b.expiryDate && new Date(b.expiryDate) < now) {
      status = "Expired";
    }

    return {
      ...b,
      status,
    };
  });
};

/**
 * Get single batch by ID
 */
export const getBatchById = async (batchId) => {
  const batch = await batchRepository.getBatchById(batchId);
  if (!batch) {
    throw new Error("Batch not found.");
  }

  const now = new Date();
  let status = "In Stock";
  if (batch.quantity === 0) {
    status = "Out of Stock";
  } else if (batch.quantity <= 10) {
    status = "Low Stock";
  }

  if (batch.expiryDate && new Date(batch.expiryDate) < now) {
    status = "Expired";
  }

  return {
    ...batch,
    status,
  };
};

/**
 * Update an existing batch (MRP, Purchase Price, Selling Price, Expiry Date)
 */
export const updateBatch = async (batchId, data) => {
  const batch = await batchRepository.getBatchById(batchId);
  if (!batch) {
    throw new Error("Batch not found.");
  }

  if (data.batchNumber && data.batchNumber.trim() !== batch.batchNumber) {
    const existing = await batchRepository.getBatchByNumber(batch.productId, data.batchNumber.trim());
    if (existing && existing.id !== batchId) {
      throw new Error(`Batch "${data.batchNumber.trim()}" already exists for this product.`);
    }
  }

  const mrp = data.mrp !== undefined ? parseFloat(data.mrp) : Number(batch.mrp);
  const sellingPrice = data.sellingPrice !== undefined ? parseFloat(data.sellingPrice) : Number(batch.sellingPrice);

  if (mrp < sellingPrice) {
    throw new Error("MRP must be greater than or equal to selling price.");
  }

  const cleanData = {};
  if (data.batchNumber) cleanData.batchNumber = data.batchNumber.trim();
  if (data.mrp !== undefined) cleanData.mrp = mrp;
  if (data.purchasePrice !== undefined) cleanData.purchasePrice = parseFloat(data.purchasePrice);
  if (data.sellingPrice !== undefined) cleanData.sellingPrice = sellingPrice;
  if (data.expiryDate !== undefined) cleanData.expiryDate = data.expiryDate;

  return await batchRepository.updateBatch(batchId, cleanData);
};

/**
 * Delete batch if permitted
 */
export const deleteBatch = async (batchId, user = null) => {
  const batch = await batchRepository.getBatchById(batchId);
  if (!batch) {
    throw new Error("Batch not found.");
  }

  if (batch.quantity > 0) {
    throw new Error(
      `Cannot delete batch "${batch.batchNumber}" because it currently has ${batch.quantity} units in stock. Please adjust stock to 0 first.`
    );
  }

  return await prisma.$transaction(async (tx) => {
    const deleted = await batchRepository.deleteBatch(batchId, tx);

    // Sync product initialStock
    const remainingBatches = await tx.productBatch.findMany({
      where: { productId: batch.productId },
    });
    const totalStock = remainingBatches.reduce((acc, b) => acc + (b.quantity || 0), 0);

    await tx.product.update({
      where: { id: batch.productId },
      data: { initialStock: totalStock },
    });

    return deleted;
  });
};
