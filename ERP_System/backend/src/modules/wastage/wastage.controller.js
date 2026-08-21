import * as wastageService from "./wastage.service.js";

export const createWastage = async (req, res, next) => {
  try {
    const companyId = req.companyId || req.user?.companyId;
    const data = { ...req.body, companyId, createdBy: req.user?.fullName };
    const wastage = await wastageService.createWastage(data);
    return res.status(201).json({ success: true, message: "Wastage recorded successfully", data: wastage });
  } catch (error) { next(error); }
};

export const getWastages = async (req, res, next) => {
  try {
    const companyId = req.companyId || req.user?.companyId;
    const params = { ...req.query, companyId };
    const wastages = await wastageService.getWastages(params);
    return res.status(200).json({ success: true, data: wastages });
  } catch (error) { next(error); }
};

export const getWastageById = async (req, res, next) => {
  try {
    const wastage = await wastageService.getWastageById(req.params.id);
    return res.status(200).json({ success: true, data: wastage });
  } catch (error) { next(error); }
};

export const deleteWastage = async (req, res, next) => {
  try {
    await wastageService.deleteWastage(req.params.id);
    return res.status(200).json({ success: true, message: "Wastage deleted" });
  } catch (error) { next(error); }
};
