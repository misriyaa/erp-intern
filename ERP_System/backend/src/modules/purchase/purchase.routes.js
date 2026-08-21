import { Router } from "express";
import { requireRoles } from "../../middlewares/auth.middleware.js";
import * as purchaseController from "./purchase.controller.js";
import {
  createPurchaseValidation,
  updatePurchaseValidation,
} from "./purchase.validation.js";

import validateRequest from "../../middlewares/validateRequest.js";

const router = Router();

router.post(
  "/",
  requireRoles(["ADMIN", "OWNER", "WAREHOUSE_MANAGER", "INVENTORY_MANAGER", "BRAND_MANAGER"]),
  createPurchaseValidation,
  validateRequest,
  purchaseController.createPurchase
);

router.get(
  "/",
  purchaseController.getAllPurchases
);

router.get(
  "/:id",
  purchaseController.getPurchaseById
);

router.put(
  "/:id",
  requireRoles(["ADMIN", "OWNER", "WAREHOUSE_MANAGER", "INVENTORY_MANAGER", "BRAND_MANAGER"]),
  updatePurchaseValidation,
  validateRequest,
  purchaseController.updatePurchase
);

router.delete(
  "/:id",
  requireRoles(["ADMIN", "OWNER", "WAREHOUSE_MANAGER", "INVENTORY_MANAGER", "BRAND_MANAGER"]),
  purchaseController.deletePurchase
);

export default router;