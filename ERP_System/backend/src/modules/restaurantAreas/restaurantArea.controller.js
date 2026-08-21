import * as areaService from "./restaurantArea.service.js";

export const createArea = async (req, res, next) => {
  try {
    const area = await areaService.createArea(req.body);
    return res.status(201).json({ success: true, message: "Area created", data: area });
  } catch (error) { next(error); }
};

export const getAreasByRestaurant = async (req, res, next) => {
  try {
    const { restaurantId } = req.query;
    const areas = await areaService.getAreasByRestaurant(restaurantId);
    return res.status(200).json({ success: true, data: areas });
  } catch (error) { next(error); }
};

export const getAreaById = async (req, res, next) => {
  try {
    const area = await areaService.getAreaById(req.params.id);
    return res.status(200).json({ success: true, data: area });
  } catch (error) { next(error); }
};

export const updateArea = async (req, res, next) => {
  try {
    const area = await areaService.updateArea(req.params.id, req.body);
    return res.status(200).json({ success: true, message: "Area updated", data: area });
  } catch (error) { next(error); }
};

export const deleteArea = async (req, res, next) => {
  try {
    await areaService.deleteArea(req.params.id);
    return res.status(200).json({ success: true, message: "Area deleted" });
  } catch (error) { next(error); }
};
