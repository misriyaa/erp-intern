import prisma from "../../config/prisma.js";

export const createRestaurant = async (data) => {
  return await prisma.restaurant.create({
    data,
    include: {
      branch: true,
      areas: true,
      tables: true,
    },
  });
};

export const getAllRestaurants = async (companyId, branchId) => {
  const where = {};
  if (companyId) where.companyId = companyId;
  if (branchId) where.branchId = branchId;

  return await prisma.restaurant.findMany({
    where,
    include: {
      branch: true,
      areas: {
        include: {
          tables: true,
        },
      },
      tables: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getRestaurantById = async (id) => {
  return await prisma.restaurant.findUnique({
    where: { id },
    include: {
      branch: true,
      areas: {
        include: {
          tables: true,
        },
      },
      tables: true,
      menuCategories: true,
    },
  });
};

export const updateRestaurant = async (id, data) => {
  return await prisma.restaurant.update({
    where: { id },
    data,
    include: {
      branch: true,
      areas: true,
      tables: true,
    },
  });
};

export const deleteRestaurant = async (id) => {
  return await prisma.restaurant.delete({
    where: { id },
  });
};
