import prisma from "../../config/prisma.js";

export const createBatch = async (data, tx = prisma) => {
  return await tx.productBatch.create({
    data: {
      productId: data.productId,
      batchNumber: data.batchNumber.trim(),
      mrp: data.mrp,
      purchasePrice: data.purchasePrice,
      sellingPrice: data.sellingPrice,
      quantity: parseInt(data.quantity ?? 0, 10),
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      companyId: data.companyId || null,
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          sku: true,
        },
      },
    },
  });
};

export const getBatchesByProductId = async (productId, tx = prisma) => {
  return await tx.productBatch.findMany({
    where: {
      productId,
    },
    orderBy: [
      { expiryDate: "asc" },
      { createdAt: "asc" },
    ],
  });
};

export const getBatchById = async (id, tx = prisma) => {
  return await tx.productBatch.findUnique({
    where: { id },
    include: {
      product: true,
    },
  });
};

export const getBatchByNumber = async (productId, batchNumber, tx = prisma) => {
  return await tx.productBatch.findUnique({
    where: {
      productId_batchNumber: {
        productId,
        batchNumber: batchNumber.trim(),
      },
    },
  });
};

export const updateBatch = async (id, data, tx = prisma) => {
  const updateData = {};

  if (data.batchNumber !== undefined) updateData.batchNumber = data.batchNumber.trim();
  if (data.mrp !== undefined) updateData.mrp = data.mrp;
  if (data.purchasePrice !== undefined) updateData.purchasePrice = data.purchasePrice;
  if (data.sellingPrice !== undefined) updateData.sellingPrice = data.sellingPrice;
  if (data.quantity !== undefined) updateData.quantity = parseInt(data.quantity, 10);
  if (data.expiryDate !== undefined) {
    updateData.expiryDate = data.expiryDate ? new Date(data.expiryDate) : null;
  }

  return await tx.productBatch.update({
    where: { id },
    data: updateData,
    include: {
      product: true,
    },
  });
};

export const deleteBatch = async (id, tx = prisma) => {
  return await tx.productBatch.delete({
    where: { id },
  });
};

export const decrementBatchStock = async (id, quantity, tx = prisma) => {
  return await tx.productBatch.update({
    where: { id },
    data: {
      quantity: {
        decrement: parseInt(quantity, 10),
      },
    },
  });
};

export const incrementBatchStock = async (id, quantity, tx = prisma) => {
  return await tx.productBatch.update({
    where: { id },
    data: {
      quantity: {
        increment: parseInt(quantity, 10),
      },
    },
  });
};
