import { Router } from "express";
import * as warehouseController from "./warehouse.controller.js";
import {
  createWarehouseValidation,
  updateWarehouseValidation,
} from "./warehouse.validation.js";

import validateRequest from "../../middlewares/validateRequest.js";

const router = Router();
router.post(
  "/",
  createWarehouseValidation,
  validateRequest,
  warehouseController.createWarehouse
);
router.get(
  "/",
  warehouseController.getAllWarehouses
);

router.get(
  "/search",
  warehouseController.searchWarehouses
);

router.get(
  "/:id",
  warehouseController.getWarehouseById
);

router.put(
  "/:id",
  updateWarehouseValidation,
  validateRequest,
  warehouseController.updateWarehouse
);
router.delete(
  "/:id",
  warehouseController.deleteWarehouse
);

export default router;