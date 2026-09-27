import * as batchService from "./batch.service.js";

export const createProductBatch = async (req, res) => {
  try {
    const { productId } = req.params;
    const batch = await batchService.createProductBatch(
      productId,
      req.body,
      req.user
    );

    return res.status(201).json({
      success: true,
      message: "Batch created successfully",
      data: batch,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getBatchesByProductId = async (req, res) => {
  try {
    const { productId } = req.params;
    const batches = await batchService.getBatchesByProductId(productId);

    return res.status(200).json({
      success: true,
      message: "Batches fetched successfully",
      count: batches.length,
      data: batches,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

export const getBatchById = async (req, res) => {
  try {
    const { batchId } = req.params;
    const batch = await batchService.getBatchById(batchId);

    return res.status(200).json({
      success: true,
      message: "Batch fetched successfully",
      data: batch,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    const updated = await batchService.updateBatch(batchId, req.body);

    return res.status(200).json({
      success: true,
      message: "Batch updated successfully",
      data: updated,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    const deleted = await batchService.deleteBatch(batchId, req.user);

    return res.status(200).json({
      success: true,
      message: "Batch deleted successfully",
      data: deleted,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
