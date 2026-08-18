import * as reportsService from "./reports.service.js";

/**
 * GET Sales Report
 */
export const getSalesReport = async (req, res, next) => {
  try {
    const { startDate, endDate, groupBy, customerId } = req.query;

    // Default dates if not specified: last 30 days
    let start = startDate;
    let end = endDate;

    if (!start || !end) {
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      
      start = start || thirtyDaysAgo.toISOString();
      end = end || today.toISOString();
    }

    const report = await reportsService.getSalesReport(
      start,
      end,
      groupBy || "day",
      customerId || null
    );

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET Purchase Report
 */
export const getPurchaseReport = async (req, res, next) => {
  try {
    const { startDate, endDate, groupBy, supplierId } = req.query;

    // Default dates if not specified: last 30 days
    let start = startDate;
    let end = endDate;

    if (!start || !end) {
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      
      start = start || thirtyDaysAgo.toISOString();
      end = end || today.toISOString();
    }

    const report = await reportsService.getPurchaseReport(
      start,
      end,
      groupBy || "day",
      supplierId || null
    );

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET Inventory Report
 */
export const getInventoryReport = async (req, res, next) => {
  try {
    const { warehouseId } = req.query;
    const report = await reportsService.getInventoryReport(warehouseId || null);

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET Report Filters
 */
export const getReportFilters = async (req, res, next) => {
  try {
    const filters = await reportsService.getReportFilters();

    res.status(200).json({
      success: true,
      data: filters,
    });
  } catch (error) {
    next(error);
  }
};
