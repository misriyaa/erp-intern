import { Router } from "express";
import * as laundryController from "./laundry.controller.js";
import {
  createLaundryValidation,
  createCategoryValidation,
  createServiceValidation,
  createOrderValidation,
  updateOrderStatusValidation,
  updateDeliveryStatusValidation
} from "./laundry.validation.js";
import validateRequest from "../../middlewares/validateRequest.js";
import { requireModuleAccess } from "../../middlewares/moduleAccess.middleware.js";

const router = Router();

// Dashboard Stats
router.get("/dashboard/stats", requireModuleAccess("LAUNDRY"), laundryController.getLaundryStatsController);

// Laundry Profiles
router.post("/", requireModuleAccess("LAUNDRY"), createLaundryValidation, validateRequest, laundryController.createLaundryController);
router.get("/", requireModuleAccess("LAUNDRY"), laundryController.getLaundriesController);
router.get("/:id", requireModuleAccess("LAUNDRY"), laundryController.getLaundryByIdController);
router.put("/:id", requireModuleAccess("LAUNDRY"), createLaundryValidation, validateRequest, laundryController.updateLaundryController);
router.delete("/:id", requireModuleAccess("LAUNDRY"), laundryController.deleteLaundryController);

// Service Categories
router.post("/categories", requireModuleAccess("LAUNDRY"), createCategoryValidation, validateRequest, laundryController.createCategoryController);
router.get("/categories/list", requireModuleAccess("LAUNDRY"), laundryController.getCategoriesController);
router.get("/categories/:id", requireModuleAccess("LAUNDRY"), laundryController.getCategoryByIdController);
router.put("/categories/:id", requireModuleAccess("LAUNDRY"), createCategoryValidation, validateRequest, laundryController.updateCategoryController);
router.delete("/categories/:id", requireModuleAccess("LAUNDRY"), laundryController.deleteCategoryController);

// Services
router.post("/services", requireModuleAccess("LAUNDRY"), createServiceValidation, validateRequest, laundryController.createServiceController);
router.get("/services/list", requireModuleAccess("LAUNDRY"), laundryController.getServicesController);
router.get("/services/:id", requireModuleAccess("LAUNDRY"), laundryController.getServiceByIdController);
router.put("/services/:id", requireModuleAccess("LAUNDRY"), createServiceValidation, validateRequest, laundryController.updateServiceController);
router.delete("/services/:id", requireModuleAccess("LAUNDRY"), laundryController.deleteServiceController);

// Orders
router.post("/orders", requireModuleAccess("LAUNDRY"), createOrderValidation, validateRequest, laundryController.createOrderController);
router.get("/orders/list", requireModuleAccess("LAUNDRY"), laundryController.getOrdersController);
router.get("/orders/:id", requireModuleAccess("LAUNDRY"), laundryController.getOrderByIdController);
router.put("/orders/:id/status", requireModuleAccess("LAUNDRY"), updateOrderStatusValidation, validateRequest, laundryController.updateOrderStatusController);

// Garment tracking (barcode scanning)
router.get("/garments/scan/:barcode", requireModuleAccess("LAUNDRY"), laundryController.getGarmentByBarcodeController);
router.put("/garments/:id/status", requireModuleAccess("LAUNDRY"), laundryController.updateGarmentStatusController);

// Delivery Tracking
router.put("/orders/:orderId/delivery", requireModuleAccess("LAUNDRY"), updateDeliveryStatusValidation, validateRequest, laundryController.updateDeliveryStatusController);

export default router;
