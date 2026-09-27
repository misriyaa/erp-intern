import apiClient from "./apiClient";

/**
 * Fetch all batches for a specific product
 * GET /api/products/:productId/batches
 */
export const getProductBatches = async (productId) => {
  const response = await apiClient.get(`/products/${productId}/batches`);
  return response.data;
};

/**
 * Create a new batch for a specific product
 * POST /api/products/:productId/batches
 */
export const createProductBatch = async (productId, data) => {
  const response = await apiClient.post(`/products/${productId}/batches`, data);
  return response.data;
};

/**
 * Get single batch by ID
 * GET /api/batches/:batchId
 */
export const getBatchById = async (batchId) => {
  const response = await apiClient.get(`/batches/${batchId}`);
  return response.data;
};

/**
 * Update an existing batch
 * PUT /api/batches/:batchId
 */
export const updateBatch = async (batchId, data) => {
  const response = await apiClient.put(`/batches/${batchId}`, data);
  return response.data;
};

/**
 * Delete a batch
 * DELETE /api/batches/:batchId
 */
export const deleteBatch = async (batchId) => {
  const response = await apiClient.delete(`/batches/${batchId}`);
  return response.data;
};

const batchService = {
  getProductBatches,
  createProductBatch,
  getBatchById,
  updateBatch,
  deleteBatch,
};

export default batchService;
