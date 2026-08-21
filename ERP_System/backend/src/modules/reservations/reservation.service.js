import * as resRepo from "./reservation.repository.js";

export const createReservation = async (data) => {
  if (!data.restaurantId || !data.reservationDate || !data.reservationTime) {
    throw new Error("Restaurant ID, date, and time are required.");
  }
  return await resRepo.createReservation(data);
};

export const getReservations = async (restaurantId, status, date) => {
  return await resRepo.getReservations(restaurantId, status, date);
};

export const getReservationById = async (id) => {
  const res = await resRepo.getReservationById(id);
  if (!res) throw new Error("Reservation not found.");
  return res;
};

export const updateReservation = async (id, data) => {
  const existing = await resRepo.getReservationById(id);
  if (!existing) throw new Error("Reservation not found.");
  return await resRepo.updateReservation(id, data);
};

export const updateReservationStatus = async (id, status) => {
  const validStatuses = ["PENDING", "CONFIRMED", "SEATED", "COMPLETED", "CANCELLED", "NO_SHOW"];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status. Allowed: ${validStatuses.join(", ")}`);
  }
  return await resRepo.updateReservationStatus(id, status);
};

export const deleteReservation = async (id) => {
  const existing = await resRepo.getReservationById(id);
  if (!existing) throw new Error("Reservation not found.");
  return await resRepo.deleteReservation(id);
};
