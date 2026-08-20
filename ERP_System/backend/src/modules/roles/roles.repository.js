import prisma from "../../config/prisma.js";

const getAllRoles = async (companyId) => {
  const where = companyId ? { companyId } : {};
  return await prisma.role.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { users: true },
      },
    },
  });
};

const getRoleById = async (id) => {
  return await prisma.role.findUnique({
    where: { id },
    include: {
      _count: {
        select: { users: true },
      },
    },
  });
};

const getRoleByName = async (name) => {
  return await prisma.role.findFirst({
    where: {
      name: {
        equals: name.trim(),
        mode: "insensitive",
      },
    },
  });
};

const createRole = async (data) => {
  return await prisma.role.create({
    data: {
      name: data.name.trim(),
      isTextile: data.isTextile === true || data.category === "TEXTILE",
      category: data.category || (data.isTextile ? "TEXTILE" : "RETAIL"),
    },
    include: {
      _count: {
        select: { users: true },
      },
    },
  });
};

const updateRole = async (id, data) => {
  return await prisma.role.update({
    where: { id },
    data: {
      name: data.name ? data.name.trim() : undefined,
    },
    include: {
      _count: {
        select: { users: true },
      },
    },
  });
};

const deleteRole = async (id) => {
  return await prisma.role.delete({
    where: { id },
  });
};

const unassignUsersFromRole = async (roleId) => {
  return await prisma.user.updateMany({
    where: { roleId },
    data: {
      roleId: null,
      role: "Employee",
    },
  });
};

export {
  getAllRoles,
  getRoleById,
  getRoleByName,
  createRole,
  updateRole,
  deleteRole,
  unassignUsersFromRole,
};
