import prisma from "../../config/prisma.js";

const getAllDepartments = async () => {
  return await prisma.department.findMany({
    orderBy: { createdAt: "desc" },
  });
};

const getDepartmentById = async (id) => {
  return await prisma.department.findUnique({
    where: { id },
  });
};

const getDepartmentByName = async (name) => {
  return await prisma.department.findFirst({
    where: { name },
  });
};

const getDepartmentByCode = async (code) => {
  return await prisma.department.findFirst({
    where: { code },
  });
};

const createDepartment = async (data) => {
  return await prisma.department.create({
    data,
  });
};

const updateDepartment = async (id, data) => {
  return await prisma.department.update({
    where: { id },
    data,
  });
};

const deleteDepartment = async (id) => {
  return await prisma.department.delete({
    where: { id },
  });
};

export {
  getAllDepartments,
  getDepartmentById,
  getDepartmentByName,
  getDepartmentByCode,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
