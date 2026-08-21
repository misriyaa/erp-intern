import * as orderService from "./restaurantOrder.service.js";

export const createOrder = async (req, res, next) => {
  try {
    const companyId = req.companyId || req.user?.companyId;
    const data = { ...req.body, companyId, createdBy: req.user?.fullName };
    const order = await orderService.createOrder(data);
    return res.status(201).json({ success: true, message: "Order created", data: order });
  } catch (error) { next(error); }
};

export const getOrders = async (req, res, next) => {
  try {
    const companyId = req.companyId || req.user?.companyId;
    const params = { ...req.query, companyId };
    const orders = await orderService.getOrders(params);
    return res.status(200).json({ success: true, data: orders });
  } catch (error) { next(error); }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    return res.status(200).json({ success: true, data: order });
  } catch (error) { next(error); }
};

export const updateOrder = async (req, res, next) => {
  try {
    const order = await orderService.updateOrder(req.params.id, req.body);
    return res.status(200).json({ success: true, message: "Order updated", data: order });
  } catch (error) { next(error); }
};

export const checkStockAvailability = async (req, res, next) => {
  try {
    const { warehouseId } = req.query;
    const result = await orderService.checkStockAvailability(req.params.id, warehouseId);
    return res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
};

export const confirmOrderAndSendKOT = async (req, res, next) => {
  try {
    const { warehouseId, allowStockOverride } = req.body;
    const result = await orderService.confirmOrderAndSendKOT(req.params.id, warehouseId, allowStockOverride);
    return res.status(200).json({
      success: true,
      message: "Order confirmed & KOT generated successfully",
      data: result,
    });
  } catch (error) { next(error); }
};

export const completeOrderAndPay = async (req, res, next) => {
  try {
    const result = await orderService.completeOrderAndPay(req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: "Order completed & payment processed successfully",
      data: result,
    });
  } catch (error) { next(error); }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const order = await orderService.cancelOrder(req.params.id, reason || "Cancelled by user");
    return res.status(200).json({ success: true, message: "Order cancelled", data: order });
  } catch (error) { next(error); }
};
