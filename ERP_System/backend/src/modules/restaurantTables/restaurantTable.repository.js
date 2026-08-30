import prisma from "../../config/prisma.js";

export const createTable = async (companyId, data) => {
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

  // Validate area belongs to company
  if (data.areaId) {
    const area = await prisma.restaurantArea.findFirst({
      where: {
        id: data.areaId,
        restaurant: { companyId },
      },
    });

    if (!area) {
      const error = new Error("Floor/Area not found or access denied.");
      error.statusCode = 404;
      throw error;
    }
  }

  return await prisma.restaurantTable.create({
    data,
    include: {
      area: true,
      restaurant: true,
    },
  });
};

export const getTables = async (companyId, restaurantId, areaId) => {
  if (!companyId) return [];

  const where = {
    restaurant: {
      companyId,
    },
  };

  if (restaurantId && restaurantId !== "ALL" && restaurantId !== "undefined" && restaurantId !== "null" && String(restaurantId).trim() !== "") {
    where.restaurantId = restaurantId;
  }
  if (areaId && areaId !== "ALL" && areaId !== "undefined" && areaId !== "null" && String(areaId).trim() !== "") {
    where.areaId = areaId;
  }

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

export const getTableById = async (id, companyId) => {
  if (!id) return null;

  const where = { id };
  if (companyId) {
    where.restaurant = { companyId };
  }

  return await prisma.restaurantTable.findFirst({
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
  });
};

export const updateTable = async (id, companyId, data) => {
  const existing = await getTableById(id, companyId);
  if (!existing) {
    const error = new Error("Table not found or access denied.");
    error.statusCode = 404;
    throw error;
  }

  if (data.restaurantId && data.restaurantId !== existing.restaurantId) {
    const rest = await prisma.restaurant.findFirst({
      where: { id: data.restaurantId, companyId },
    });
    if (!rest) {
      const error = new Error("Target restaurant not found or access denied.");
      error.statusCode = 404;
      throw error;
    }
  }

  if (data.areaId && data.areaId !== existing.areaId) {
    const area = await prisma.restaurantArea.findFirst({
      where: { id: data.areaId, restaurant: { companyId } },
    });
    if (!area) {
      const error = new Error("Target area not found or access denied.");
      error.statusCode = 404;
      throw error;
    }
  }

  return await prisma.restaurantTable.update({
    where: { id },
    data,
    include: { area: true },
  });
};

export const updateTableStatus = async (id, companyId, status) => {
  const existing = await getTableById(id, companyId);
  if (!existing) {
    const error = new Error("Table not found or access denied.");
    error.statusCode = 404;
    throw error;
  }

  return await prisma.restaurantTable.update({
    where: { id },
    data: { status },
  });
};

export const deleteTable = async (id, companyId) => {
  const existing = await getTableById(id, companyId);
  if (!existing) {
    const error = new Error("Table not found or access denied.");
    error.statusCode = 404;
    throw error;
  }

  return await prisma.restaurantTable.delete({
    where: { id },
  });
};
