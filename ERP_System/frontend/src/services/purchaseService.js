import axios from "axios";
import API_URL from "@/config/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const BASE_URL = API_URL || `${API_BASE}/api`;

const purchaseAPI = axios.create({
  baseURL: `${BASE_URL}/purchases`,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getPurchases = async () => {
  const response = await purchaseAPI.get("/");
  return response.data;
};

export const getPurchase = async (id) => {
  const response = await purchaseAPI.get(`/${id}`);
  return response.data;
};

export const createPurchase = async (data) => {
  const response = await purchaseAPI.post("/", data);
  return response.data;
};

export const updatePurchase = async (id, data) => {
  const response = await purchaseAPI.put(`/${id}`, data);
  return response.data;
};

export const deletePurchase = async (id) => {
  const response = await purchaseAPI.delete(`/${id}`);
  return response.data;
};