import prisma from "../../config/prisma.js";

export const createMenuCategory = async (data) => {
  return await prisma.menuCategory.create({
    data,
    include: {
      menuItems: true,
    },
  });
};

export const getMenuCategories = async (restaurantId) => {
  const where = {};
  if (restaurantId && restaurantId !== "ALL" && restaurantId !== "undefined" && restaurantId !== "null" && String(restaurantId).trim() !== "") {
    where.restaurantId = restaurantId;
  }

  return await prisma.menuCategory.findMany({
    where,
    include: {
      menuItems: true,
    },
    orderBy: { sortOrder: "asc" },
  });
};

export const getMenuCategoryById = async (id) => {
  return await prisma.menuCategory.findUnique({
    where: { id },
    include: {
      menuItems: true,
    },
  });
};

export const updateMenuCategory = async (id, data) => {
  return await prisma.menuCategory.update({
    where: { id },
    data,
  });
};

export const deleteMenuCategory = async (id) => {
  return await prisma.menuCategory.delete({
    where: { id },
  });
};
