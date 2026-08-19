import prisma from "../../config/prisma.js";


export const createProduct = async (data) => {
  return await prisma.product.create({
    data,
    include: {
      category: true,
      brand: true,
      unit: true,
    },
  });
};

export const getAllProducts = async () => {
  return await prisma.product.findMany({
    include: {
      category: true,
      brand: true,
      unit: true,
      barcodes: true,
      inventories: {
        include: {
          warehouse: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getProductById = async (id) => {
  return await prisma.product.findUnique({
    where: {
      id,
    },
    include: {
      category: true,
      brand: true,
     unit: true,
      barcodes: true,
      inventories: {
        include: {
          warehouse: true,
        },
      },
    },
  });
};

export const getProductBySku = async (sku) => {
  return await prisma.product.findUnique({
    where: {
      sku,
    },
  });
};

export const updateProduct = async (id, data) => {
  return await prisma.product.update({
    where: {
      id,
    },
    data,
    include: {
      category: true,
      brand: true,
      unit: true,
    },
  });
};


export const deleteProduct = async (id) => {
  return await prisma.$transaction(async (tx) => {
    // Delete related barcodes
    await tx.barcode.deleteMany({
      where: { productId: id },
    });

    // Delete related inventories
    await tx.inventory.deleteMany({
      where: { productId: id },
    });

    // Finally delete the product
    return await tx.product.delete({
      where: {
        id,
      },
    });
  });
};

export const searchProducts = async (search) => {
  return await prisma.product.findMany({
    where: {
      OR: [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          sku: {
            contains: search,
            mode: "insensitive",
          },
        },
      ],
    },
    include: {
      category: true,
      brand: true,
      unit: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};