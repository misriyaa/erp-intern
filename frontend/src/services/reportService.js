import axios from "axios";
import API_URL from "@/config/api";

const reportsAPI = axios.create({
  baseURL: `${API_URL}/reports`,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Fetch Sales Report with parameters (startDate, endDate, groupBy, customerId)
 */
export const getSalesReport = async (params) => {
  const response = await reportsAPI.get("/sales", { params });
  return response.data;
};

/**
 * Fetch Purchase Report with parameters (startDate, endDate, groupBy, supplierId)
 */
export const getPurchaseReport = async (params) => {
  const response = await reportsAPI.get("/purchases", { params });
  return response.data;
};

/**
 * Fetch Inventory Report with parameters (warehouseId)
 */
export const getInventoryReport = async (params) => {
  const response = await reportsAPI.get("/inventory", { params });
  return response.data;
};

/**
 * Fetch Report filter options (customers, suppliers, warehouses)
 */
export const getReportFilters = async () => {
  const response = await reportsAPI.get("/filters");
  return response.data;
};
