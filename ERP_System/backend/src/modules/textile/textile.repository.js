import prisma from "../../config/prisma.js";

export const getTextileProductsRepo = async (companyId, query = {}) => {
  const where = {};
  if (companyId) where.companyId = companyId;
  if (query.fabricType) where.fabricType = query.fabricType;
  if (query.search) {
    where.name = { contains: query.search, mode: "insensitive" };
  }
  return await prisma.textileProduct?.findMany({ where }) || [];
};

export const getTextileProductByIdRepo = async (companyId, id) => {
  const where = { id };
  if (companyId) where.companyId = companyId;
  return await prisma.textileProduct?.findFirst({ where });
};

export const createTextileProductRepo = async (data) => {
  return await prisma.textileProduct?.create({ data });
};

export const updateTextileProductRepo = async (companyId, id, data) => {
  return await prisma.textileProduct?.update({ where: { id }, data });
};

export const deleteTextileProductRepo = async (companyId, id) => {
  return await prisma.textileProduct?.delete({ where: { id } });
};
