import * as kitchenService from "./kitchen.service.js";

export const getKitchenOrders = async (req, res, next) => {
  try {
    const { restaurantId, status } = req.query;
    const orders = await kitchenService.getKitchenOrders(restaurantId, status);
    return res.status(200).json({ success: true, data: orders });
  } catch (error) { next(error); }
};

export const getKitchenOrderById = async (req, res, next) => {
  try {
    const kot = await kitchenService.getKitchenOrderById(req.params.id);
    return res.status(200).json({ success: true, data: kot });
  } catch (error) { next(error); }
};

export const startPreparation = async (req, res, next) => {
  try {
    const kot = await kitchenService.updateKOTStatus(req.params.id, "PREPARING");
    return res.status(200).json({ success: true, message: "Started preparation", data: kot });
  } catch (error) { next(error); }
};

export const markReady = async (req, res, next) => {
  try {
    const kot = await kitchenService.updateKOTStatus(req.params.id, "READY");
    return res.status(200).json({ success: true, message: "Order marked ready", data: kot });
  } catch (error) { next(error); }
};

export const markServed = async (req, res, next) => {
  try {
    const kot = await kitchenService.updateKOTStatus(req.params.id, "SERVED");
    return res.status(200).json({ success: true, message: "Order marked served", data: kot });
  } catch (error) { next(error); }
};
