import prisma from "../../config/prisma.js";

export const createReservation = async (data) => {
  return await prisma.reservation.create({
    data,
    include: {
      restaurant: true,
      table: true,
      customer: true,
    },
  });
};

export const getReservations = async (restaurantId, status, date) => {
  const where = {};
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

export const getReservationById = async (id) => {
  return await prisma.reservation.findUnique({
    where: { id },
    include: {
      restaurant: true,
      table: true,
      customer: true,
    },
  });
};

export const updateReservation = async (id, data) => {
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

export const updateReservationStatus = async (id, status) => {
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

export const deleteReservation = async (id) => {
  return await prisma.reservation.delete({
    where: { id },
  });
};
