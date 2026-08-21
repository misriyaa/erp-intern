import * as foodCostRepo from "./foodCost.repository.js";

export const getFoodCostingReport = async (restaurantId) => {
  return await foodCostRepo.getFoodCostingReport(restaurantId);
};
