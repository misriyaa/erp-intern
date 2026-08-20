import prisma from "../../config/prisma.js";

const getAllDesignations = async (companyId) => {
  const where = companyId ? { companyId } : {};
  return await prisma.designation.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
};

const getDesignationById = async (id) => {
  return await prisma.designation.findUnique({
    where: { id },
  });
};

const getDesignationByCode = async (code) => {
  return await prisma.designation.findUnique({
    where: { code },
  });
};

const createDesignation = async (data) => {
  return await prisma.designation.create({
    data,
  });
};

const updateDesignation = async (id, data) => {
  return await prisma.designation.update({
    where: { id },
    data,
  });
};

const deleteDesignation = async (id) => {
  return await prisma.designation.delete({
    where: { id },
  });
};

export {
  getAllDesignations,
  getDesignationById,
  getDesignationByCode,
  createDesignation,
  updateDesignation,
  deleteDesignation,
};
