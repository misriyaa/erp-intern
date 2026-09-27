import { Router } from "express";
import * as batchController from "./batch.controller.js";
import {
  createBatchValidation,
  updateBatchValidation,
} from "./batch.validation.js";
import validateRequest from "../../middlewares/validateRequest.js";

const router = Router({ mergeParams: true });

// Batch operations nested under product: /api/products/:productId/batches
router.post(
  "/",
  createBatchValidation,
  validateRequest,
  batchController.createProductBatch
);

router.get("/", batchController.getBatchesByProductId);

// Direct batch operations: /api/batches/:batchId
router.get("/:batchId", batchController.getBatchById);

router.put(
  "/:batchId",
  updateBatchValidation,
  validateRequest,
  batchController.updateBatch
);

router.delete("/:batchId", batchController.deleteBatch);

export default router;
