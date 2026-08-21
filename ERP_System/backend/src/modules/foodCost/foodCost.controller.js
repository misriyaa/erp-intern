import * as foodCostService from "./foodCost.service.js";

export const getFoodCostingReport = async (req, res, next) => {
  try {
    const { restaurantId } = req.query;
    const report = await foodCostService.getFoodCostingReport(restaurantId);
    return res.status(200).json({ success: true, data: report });
  } catch (error) { next(error); }
};
