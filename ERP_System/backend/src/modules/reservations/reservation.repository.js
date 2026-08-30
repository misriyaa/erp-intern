import prisma from "../../config/prisma.js";

export const createReservation = async (companyId, data) => {
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

  if (data.tableId) {
    const table = await prisma.restaurantTable.findFirst({
      where: { id: data.tableId, restaurant: { companyId } },
    });
    if (!table) {
      const error = new Error("Table not found or access denied.");
      error.statusCode = 404;
      throw error;
    }
  }

  return await prisma.reservation.create({
    data,
    include: {
      restaurant: true,
      table: true,
      customer: true,
    },
  });
};

export const getReservations = async (companyId, restaurantId, status, date) => {
  if (!companyId) return [];

  const where = {
    restaurant: {
      companyId,
    },
  };

  if (restaurantId && restaurantId !== "ALL" && restaurantId !== "undefined" && restaurantId !== "null" && String(restaurantId).trim() !== "") {
    where.restaurantId = restaurantId;
  }
  if (status && status !== "ALL" && status !== "undefined" && status !== "null") {
    where.status = status;
  }
  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    where.reservationDate = {
      gte: startOfDay,
      lte: endOfDay,
    };
  }

  return await prisma.reservation.findMany({
    where,
    include: {
      restaurant: true,
      table: {
        include: {
          area: true,
        },
      },
      customer: true,
    },
    orderBy: [{ reservationDate: "asc" }, { reservationTime: "asc" }],
  });
};

export const getReservationById = async (id, companyId) => {
  if (!id) return null;

  const where = { id };
  if (companyId) {
    where.restaurant = { companyId };
  }

  return await prisma.reservation.findFirst({
    where,
    include: {
      restaurant: true,
      table: true,
      customer: true,
    },
  });
};

export const updateReservation = async (id, companyId, data) => {
  const existing = await getReservationById(id, companyId);
  if (!existing) {
    const error = new Error("Reservation not found or access denied.");
    error.statusCode = 404;
    throw error;
  }

  return await prisma.reservation.update({
    where: { id },
    data,
    include: {
      restaurant: true,
      table: true,
      customer: true,
    },
  });
};

export const updateReservationStatus = async (id, companyId, status) => {
  const existing = await getReservationById(id, companyId);
  if (!existing) {
    const error = new Error("Reservation not found or access denied.");
    error.statusCode = 404;
    throw error;
  }

  return await prisma.$transaction(async (tx) => {
    const reservation = await tx.reservation.update({
      where: { id },
      data: { status },
      include: {
        table: true,
      },
    });

    if (status === "CONFIRMED" && reservation.tableId) {
      await tx.restaurantTable.update({
        where: { id: reservation.tableId },
        data: { status: "RESERVED" },
      });
    } else if (status === "SEATED" && reservation.tableId) {
      await tx.restaurantTable.update({
        where: { id: reservation.tableId },
        data: { status: "OCCUPIED" },
      });
    } else if (["COMPLETED", "CANCELLED", "NO_SHOW"].includes(status) && reservation.tableId) {
      await tx.restaurantTable.update({
        where: { id: reservation.tableId },
        data: { status: "AVAILABLE" },
      });
    }

    return reservation;
  });
};

export const deleteReservation = async (id, companyId) => {
  const existing = await getReservationById(id, companyId);
  if (!existing) {
    const error = new Error("Reservation not found or access denied.");
    error.statusCode = 404;
    throw error;
  }

  return await prisma.reservation.delete({
    where: { id },
  });
};
