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
  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Delete dependent child relations
      await tx.restaurantTable.deleteMany({ where: { restaurantId: id } });
      await tx.restaurantArea.deleteMany({ where: { restaurantId: id } });
      await tx.recipe.deleteMany({ where: { menuItem: { restaurantId: id } } }).catch(() => null);
      await tx.restaurantOrderItem.deleteMany({ where: { order: { restaurantId: id } } }).catch(() => null);
      await tx.kitchenOrderItem.deleteMany({ where: { kitchenOrder: { restaurantId: id } } }).catch(() => null);
      await tx.kitchenOrder.deleteMany({ where: { restaurantId: id } });
      await tx.restaurantOrder.deleteMany({ where: { restaurantId: id } });
      await tx.menuItemModifierGroup.deleteMany({ where: { menuItem: { restaurantId: id } } }).catch(() => null);
      await tx.menuItem.deleteMany({ where: { restaurantId: id } });
      await tx.menuCategory.deleteMany({ where: { restaurantId: id } });
      await tx.modifierGroup.deleteMany({ where: { restaurantId: id } });
      await tx.reservation.deleteMany({ where: { restaurantId: id } });
      await tx.wastage.deleteMany({ where: { restaurantId: id } });

      // 2. Delete main Restaurant record
      return await tx.restaurant.delete({ where: { id } });
    });
  } catch (err) {
    if (err.code === "P2025") {
      return { id };
    }
    return await prisma.restaurant.delete({ where: { id } });
  }
};
