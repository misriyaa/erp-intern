import prisma from "../../config/prisma.js";

export const createTable = async (data) => {
  return await prisma.restaurantTable.create({
    data,
    include: {
      area: true,
      restaurant: true,
    },
  });
};

export const getTables = async (restaurantId, areaId) => {
  const where = {};
  if (restaurantId) where.restaurantId = restaurantId;
  if (areaId) where.areaId = areaId;

  return await prisma.restaurantTable.findMany({
    where,
    include: {
      area: true,
      orders: {
        where: {
          status: {
            in: ["DRAFT", "HELD", "CONFIRMED", "PREPARING", "READY", "SERVED"],
          },
        },
        include: {
          items: {
            include: {
              menuItem: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { tableNumber: "asc" },
  });
};

export const getTableById = async (id) => {
  return await prisma.restaurantTable.findUnique({
    where: { id },
    include: {
      area: true,
      orders: {
        where: {
          status: {
            in: ["DRAFT", "HELD", "CONFIRMED", "PREPARING", "READY", "SERVED"],
          },
        },
        include: {
          items: {
            include: {
              menuItem: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
};

export const updateTable = async (id, data) => {
  return await prisma.restaurantTable.update({
    where: { id },
    data,
    include: { area: true },
  });
};

export const updateTableStatus = async (id, status) => {
  return await prisma.restaurantTable.update({
    where: { id },
    data: { status },
  });
};

export const deleteTable = async (id) => {
  return await prisma.restaurantTable.delete({
    where: { id },
  });
};
