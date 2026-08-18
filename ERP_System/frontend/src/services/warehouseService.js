import axios from "axios";
import API_URL from "@/config/api";

const warehouseAPI = axios.create({
  baseURL: `${API_URL}/warehouses`,
  headers: {
    "Content-Type": "application/json",
  },
});

// GET /api/warehouses
export const getWarehouses = async () => {
  const response = await warehouseAPI.get("/");
  return response.data;
};

// GET /api/warehouses/:id
export const getWarehouseById = async (id) => {
  const response = await warehouseAPI.get(`/${id}`);
  return response.data;
};

// GET /api/warehouses/search
export const searchWarehouses = async (query) => {
  const response = await warehouseAPI.get("/search", {
    params: {
      search: query,
    },
  });

  return response.data;
};

// POST /api/warehouses
export const createWarehouse = async (data) => {
  const response = await warehouseAPI.post("/", data);
  return response.data;
};

// PUT /api/warehouses/:id
export const updateWarehouse = async (id, data) => {
  const response = await warehouseAPI.put(`/${id}`, data);
  return response.data;
};

// DELETE /api/warehouses/:id
export const deleteWarehouse = async (id) => {
  const response = await warehouseAPI.delete(`/${id}`);
  return response.data;
};