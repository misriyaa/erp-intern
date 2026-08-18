import { Router } from "express";
import * as stockTransferController from "./stockTransfer.controller.js";
import {
  createStockTransferValidation,
  updateStockTransferValidation,
} from "./stockTransfer.validation.js";

import validateRequest from "../../middlewares/validateRequest.js";

const router = Router();

router.post(
  "/",
  createStockTransferValidation,
  validateRequest,
  stockTransferController.createStockTransfer
);

router.get(
  "/",
  stockTransferController.getAllStockTransfers
);

router.get(
  "/:id",
  stockTransferController.getStockTransferById
);

router.put(
  "/:id",
  updateStockTransferValidation,
  validateRequest,
  stockTransferController.updateStockTransfer
);

router.delete(
  "/:id",
  stockTransferController.deleteStockTransfer
);

export default router;