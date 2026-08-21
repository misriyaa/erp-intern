import prisma from "../../config/prisma.js";

export const createArea = async (data) => {
  return await prisma.restaurantArea.create({
    data,
    include: {
      restaurant: true,
      tables: true,
    },
  });
};

export const getAreasByRestaurant = async (restaurantId) => {
  return await prisma.restaurantArea.findMany({
    where: { restaurantId },
    include: {
      tables: {
        orderBy: { tableNumber: "asc" },
      },
    },
    orderBy: { sortOrder: "asc" },
  });
};

export const getAreaById = async (id) => {
  return await prisma.restaurantArea.findUnique({
    where: { id },
    include: {
      restaurant: true,
      tables: true,
    },
  });
};

export const updateArea = async (id, data) => {
  return await prisma.restaurantArea.update({
    where: { id },
    data,
    include: {
      tables: true,
    },
  });
};

export const deleteArea = async (id) => {
  return await prisma.restaurantArea.delete({
    where: { id },
  });
};
