import { Router } from "express";
import * as purchaseController from "./purchase.controller.js";
import {
  createPurchaseValidation,
  updatePurchaseValidation,
} from "./purchase.validation.js";

import validateRequest from "../../middlewares/validateRequest.js";

const router = Router();

router.post(
  "/",
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
  updatePurchaseValidation,
  validateRequest,
  purchaseController.updatePurchase
);

router.delete(
  "/:id",
  purchaseController.deletePurchase
);

export default router;