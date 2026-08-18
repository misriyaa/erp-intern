import axios from "axios";
import API_URL from "@/config/api";

const inventoryAPI = axios.create({
  baseURL: `${API_URL}/inventory`,
  headers: {
    "Content-Type": "application/json",
  },
});

// GET /api/inventory
export const getInventories = async () => {
  const response = await inventoryAPI.get("/");
  return response.data;
};

// GET /api/inventory/:id
export const getInventoryById = async (id) => {
  const response = await inventoryAPI.get(`/${id}`);
  return response.data;
};

// POST /api/inventory
export const createInventory = async (data) => {
  const response = await inventoryAPI.post("/", data);
  return response.data;
};

// PUT /api/inventory/:id
export const updateInventory = async (id, data) => {
  const response = await inventoryAPI.put(`/${id}`, data);
  return response.data;
};

// DELETE /api/inventory/:id
export const deleteInventory = async (id) => {
  const response = await inventoryAPI.delete(`/${id}`);
  return response.data;
};
