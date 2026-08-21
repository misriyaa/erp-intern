import * as tableService from "./restaurantTable.service.js";

export const createTable = async (req, res, next) => {
  try {
    const table = await tableService.createTable(req.body);
    return res.status(201).json({ success: true, message: "Table created", data: table });
  } catch (error) { next(error); }
};

export const getTables = async (req, res, next) => {
  try {
    const { restaurantId, areaId } = req.query;
    const tables = await tableService.getTables(restaurantId, areaId);
    return res.status(200).json({ success: true, data: tables });
  } catch (error) { next(error); }
};

export const getTableById = async (req, res, next) => {
  try {
    const table = await tableService.getTableById(req.params.id);
    return res.status(200).json({ success: true, data: table });
  } catch (error) { next(error); }
};

export const updateTable = async (req, res, next) => {
  try {
    const table = await tableService.updateTable(req.params.id, req.body);
    return res.status(200).json({ success: true, message: "Table updated", data: table });
  } catch (error) { next(error); }
};

export const updateTableStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const table = await tableService.updateTableStatus(req.params.id, status);
    return res.status(200).json({ success: true, message: "Table status updated", data: table });
  } catch (error) { next(error); }
};

export const deleteTable = async (req, res, next) => {
  try {
    await tableService.deleteTable(req.params.id);
    return res.status(200).json({ success: true, message: "Table deleted" });
  } catch (error) { next(error); }
};
