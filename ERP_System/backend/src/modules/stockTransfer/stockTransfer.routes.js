import { Router } from "express";
import { requireRoles } from "../../middlewares/auth.middleware.js";
import * as stockTransferController from "./stockTransfer.controller.js";
import {
  createStockTransferValidation,
  updateStockTransferValidation,
} from "./stockTransfer.validation.js";

import validateRequest from "../../middlewares/validateRequest.js";

const router = Router();

router.post(
  "/",
  requireRoles(["ADMIN", "OWNER", "WAREHOUSE_MANAGER", "INVENTORY_MANAGER"]),
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
  requireRoles(["ADMIN", "OWNER", "WAREHOUSE_MANAGER", "INVENTORY_MANAGER"]),
  updateStockTransferValidation,
  validateRequest,
  stockTransferController.updateStockTransfer
);

router.delete(
  "/:id",
  requireRoles(["ADMIN", "OWNER", "WAREHOUSE_MANAGER", "INVENTORY_MANAGER"]),
  stockTransferController.deleteStockTransfer
);

export default router;