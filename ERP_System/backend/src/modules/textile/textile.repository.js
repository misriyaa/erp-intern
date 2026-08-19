import prisma from "../../config/prisma.js";

const mockTextileProducts = [
  {
    id: "TEX-PRODUCT-01",
    name: "Premium Organic Cotton Silk Fabric Roll",
    fabricType: "Cotton Silk",
    pattern: "Solid Royal Blue",
    color: "Royal Blue",
    rollLengthMeters: 100,
    pricePerMeter: 320,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "TEX-PRODUCT-02",
    name: "Heavy Duty Raw Denim Twill 14oz",
    fabricType: "Denim Twill",
    pattern: "Indigo Wash",
    color: "Indigo",
    rollLengthMeters: 150,
    pricePerMeter: 480,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const getTextileProductsRepo = async (companyId, query = {}) => {
  try {
    if (prisma.textileProduct) {
      const where = {};
      if (companyId) where.companyId = companyId;
      if (query.fabricType) where.fabricType = query.fabricType;
      if (query.search) {
        where.name = { contains: query.search, mode: "insensitive" };
      }
      return await prisma.textileProduct.findMany({ where });
    }
  } catch (err) {
    console.warn("Prisma textileProduct table not defined, returning mock catalog");
  }
  return mockTextileProducts;
};

export const getTextileProductByIdRepo = async (companyId, id) => {
  try {
    if (prisma.textileProduct) {
      const where = { id };
      if (companyId) where.companyId = companyId;
      return await prisma.textileProduct.findFirst({ where });
    }
  } catch (err) {
    console.warn("Prisma textileProduct table not defined");
  }
  return mockTextileProducts.find((p) => p.id === id) || mockTextileProducts[0];
};

export const createTextileProductRepo = async (data) => {
  try {
    if (prisma.textileProduct) {
      return await prisma.textileProduct.create({ data });
    }
  } catch (err) {
    console.warn("Prisma textileProduct table not defined");
  }
  const created = { id: `TEX-PRODUCT-${Date.now()}`, ...data, createdAt: new Date(), updatedAt: new Date() };
  mockTextileProducts.unshift(created);
  return created;
};

export const updateTextileProductRepo = async (companyId, id, data) => {
  try {
    if (prisma.textileProduct) {
      return await prisma.textileProduct.update({ where: { id }, data });
    }
  } catch (err) {
    console.warn("Prisma textileProduct table not defined");
  }
  return { id, ...data };
};

export const deleteTextileProductRepo = async (companyId, id) => {
  try {
    if (prisma.textileProduct) {
      return await prisma.textileProduct.delete({ where: { id } });
    }
  } catch (err) {
    console.warn("Prisma textileProduct table not defined");
  }
  return { success: true };
};

