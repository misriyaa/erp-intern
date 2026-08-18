import axios from "axios";

const API_URL = "http://localhost:5000/api/designations";

export const getDesignations = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const getDesignationById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export const createDesignation = async (data) => {
  const response = await axios.post(API_URL, data);
  return response.data;
};

export const updateDesignation = async (id, data) => {
  const response = await axios.put(`${API_URL}/${id}`, data);
  return response.data;
};

export const deleteDesignation = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};
