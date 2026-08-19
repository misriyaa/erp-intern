import prisma from "../../config/prisma.js";

export const createInventory = async (data) => {
  return await prisma.inventory.create({
    data,
    include: {
      product: {
        include: {
          category: true,
        },
      },
      warehouse: true,
    },
  });
};

export const getAllInventories = async () => {
  return await prisma.inventory.findMany({
    include: {
      product: {
        include: {
          category: true,
        },
      },
      warehouse: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getInventoryById = async (id) => {
  return await prisma.inventory.findUnique({
    where: { id },
    include: {
      product: {
        include: {
          category: true,
        },
      },
      warehouse: true,
    },
  });
};

export const getInventoryByProductAndWarehouse = async (
  productId,
  warehouseId
) => {
  return await prisma.inventory.findFirst({
    where: {
      productId,
      warehouseId,
    },
  });
};

export const getInventoryByProduct = async (productId) => {
  return await prisma.inventory.findMany({
    where: { productId },
    include: {
      warehouse: true,
    },
  });
};

export const getInventoryByWarehouse = async (warehouseId) => {
  return await prisma.inventory.findMany({
    where: { warehouseId },
    include: {
      product: true,
    },
  });
};

export const updateInventory = async (id, data) => {
  return await prisma.inventory.update({
    where: { id },
    data,
    include: {
      product: {
        include: {
          category: true,
        },
      },
      warehouse: true,
    },
  });
};

export const deleteInventory = async (id) => {
  return await prisma.inventory.delete({
    where: { id },
  });
};