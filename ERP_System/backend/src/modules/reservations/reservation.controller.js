import * as reservationService from "./reservation.service.js";

export const createReservation = async (req, res, next) => {
  try {
    const reservation = await reservationService.createReservation(req.body);
    return res.status(201).json({ success: true, message: "Reservation created", data: reservation });
  } catch (error) { next(error); }
};

export const getReservations = async (req, res, next) => {
  try {
    const { restaurantId, status, date } = req.query;
    const reservations = await reservationService.getReservations(restaurantId, status, date);
    return res.status(200).json({ success: true, data: reservations });
  } catch (error) { next(error); }
};

export const getReservationById = async (req, res, next) => {
  try {
    const reservation = await reservationService.getReservationById(req.params.id);
    return res.status(200).json({ success: true, data: reservation });
  } catch (error) { next(error); }
};

export const updateReservation = async (req, res, next) => {
  try {
    const reservation = await reservationService.updateReservation(req.params.id, req.body);
    return res.status(200).json({ success: true, message: "Reservation updated", data: reservation });
  } catch (error) { next(error); }
};

export const updateReservationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const reservation = await reservationService.updateReservationStatus(req.params.id, status);
    return res.status(200).json({ success: true, message: "Status updated", data: reservation });
  } catch (error) { next(error); }
};

export const deleteReservation = async (req, res, next) => {
  try {
    await reservationService.deleteReservation(req.params.id);
    return res.status(200).json({ success: true, message: "Reservation deleted" });
  } catch (error) { next(error); }
};
