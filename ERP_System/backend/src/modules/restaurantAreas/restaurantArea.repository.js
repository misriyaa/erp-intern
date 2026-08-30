import prisma from "../../config/prisma.js";

export const createArea = async (companyId, data) => {
  if (!companyId) {
    const error = new Error("Tenant company context required.");
    error.statusCode = 403;
    throw error;
  }

  // Validate restaurant belongs to company
  const restaurant = await prisma.restaurant.findFirst({
    where: { id: data.restaurantId, companyId },
  });

  if (!restaurant) {
    const error = new Error("Restaurant outlet not found or access denied.");
    error.statusCode = 404;
    throw error;
  }

  return await prisma.restaurantArea.create({
    data,
    include: {
      restaurant: true,
      tables: true,
    },
  });
};

export const getAreasByRestaurant = async (companyId, restaurantId) => {
  if (!companyId) return [];

  const where = {
    restaurant: {
      companyId,
    },
  };

  if (restaurantId && restaurantId !== "ALL" && restaurantId !== "undefined" && restaurantId !== "null" && String(restaurantId).trim() !== "") {
    where.restaurantId = restaurantId;
  }

  return await prisma.restaurantArea.findMany({
    where,
    include: {
      tables: {
        orderBy: { tableNumber: "asc" },
      },
    },
    orderBy: { sortOrder: "asc" },
  });
};

export const getAreaById = async (id, companyId) => {
  if (!id) return null;

  const where = { id };
  if (companyId) {
    where.restaurant = { companyId };
  }

  return await prisma.restaurantArea.findFirst({
    where,
    include: {
      restaurant: true,
      tables: true,
    },
  });
};

export const updateArea = async (id, companyId, data) => {
  const existing = await getAreaById(id, companyId);
  if (!existing) {
    const error = new Error("Floor/Area not found or access denied.");
    error.statusCode = 404;
    throw error;
  }

  // If restaurantId is being changed, verify new restaurant belongs to company
  if (data.restaurantId && data.restaurantId !== existing.restaurantId) {
    const targetRest = await prisma.restaurant.findFirst({
      where: { id: data.restaurantId, companyId },
    });
    if (!targetRest) {
      const error = new Error("Target restaurant outlet not found or access denied.");
      error.statusCode = 404;
      throw error;
    }
  }

  return await prisma.restaurantArea.update({
    where: { id },
    data,
    include: {
      tables: true,
    },
  });
};

export const deleteArea = async (id, companyId) => {
  const existing = await getAreaById(id, companyId);
  if (!existing) {
    const error = new Error("Floor/Area not found or access denied.");
    error.statusCode = 404;
    throw error;
  }

  return await prisma.restaurantArea.delete({
    where: { id },
  });
};
