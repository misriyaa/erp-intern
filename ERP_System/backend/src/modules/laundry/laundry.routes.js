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
import { requireRoles } from "../../middlewares/auth.middleware.js";

const router = Router();

// Dashboard Stats (All active laundry staff)
router.get(
  "/dashboard/stats",
  requireModuleAccess("LAUNDRY"),
  requireRoles(["ADMIN", "SUPER_ADMIN", "OWNER", "MANAGER", "CASHIER", "PROCESSING_STAFF", "DELIVERY_DRIVER"]),
  laundryController.getLaundryStatsController
);

// Laundry Profiles (Manager / Admin only)
router.post("/", requireModuleAccess("LAUNDRY"), requireRoles(["ADMIN", "SUPER_ADMIN", "OWNER", "MANAGER"]), createLaundryValidation, validateRequest, laundryController.createLaundryController);
router.get("/", requireModuleAccess("LAUNDRY"), requireRoles(["ADMIN", "SUPER_ADMIN", "OWNER", "MANAGER"]), laundryController.getLaundriesController);
router.get("/:id", requireModuleAccess("LAUNDRY"), requireRoles(["ADMIN", "SUPER_ADMIN", "OWNER", "MANAGER"]), laundryController.getLaundryByIdController);
router.put("/:id", requireModuleAccess("LAUNDRY"), requireRoles(["ADMIN", "SUPER_ADMIN", "OWNER", "MANAGER"]), createLaundryValidation, validateRequest, laundryController.updateLaundryController);
router.delete("/:id", requireModuleAccess("LAUNDRY"), requireRoles(["ADMIN", "SUPER_ADMIN", "OWNER", "MANAGER"]), laundryController.deleteLaundryController);

// Service Categories (Management: Manager/Admin; List: Manager/Admin/Cashier)
router.post("/categories", requireModuleAccess("LAUNDRY"), requireRoles(["ADMIN", "SUPER_ADMIN", "OWNER", "MANAGER"]), createCategoryValidation, validateRequest, laundryController.createCategoryController);
router.get("/categories/list", requireModuleAccess("LAUNDRY"), requireRoles(["ADMIN", "SUPER_ADMIN", "OWNER", "MANAGER", "CASHIER"]), laundryController.getCategoriesController);
router.get("/categories/:id", requireModuleAccess("LAUNDRY"), requireRoles(["ADMIN", "SUPER_ADMIN", "OWNER", "MANAGER"]), laundryController.getCategoryByIdController);
router.put("/categories/:id", requireModuleAccess("LAUNDRY"), requireRoles(["ADMIN", "SUPER_ADMIN", "OWNER", "MANAGER"]), createCategoryValidation, validateRequest, laundryController.updateCategoryController);
router.delete("/categories/:id", requireModuleAccess("LAUNDRY"), requireRoles(["ADMIN", "SUPER_ADMIN", "OWNER", "MANAGER"]), laundryController.deleteCategoryController);

// Services (Management: Manager/Admin; List: Manager/Admin/Cashier)
router.post("/services", requireModuleAccess("LAUNDRY"), requireRoles(["ADMIN", "SUPER_ADMIN", "OWNER", "MANAGER"]), createServiceValidation, validateRequest, laundryController.createServiceController);
router.get("/services/list", requireModuleAccess("LAUNDRY"), requireRoles(["ADMIN", "SUPER_ADMIN", "OWNER", "MANAGER", "CASHIER"]), laundryController.getServicesController);
router.get("/services/:id", requireModuleAccess("LAUNDRY"), requireRoles(["ADMIN", "SUPER_ADMIN", "OWNER", "MANAGER"]), laundryController.getServiceByIdController);
router.put("/services/:id", requireModuleAccess("LAUNDRY"), requireRoles(["ADMIN", "SUPER_ADMIN", "OWNER", "MANAGER"]), createServiceValidation, validateRequest, laundryController.updateServiceController);
router.delete("/services/:id", requireModuleAccess("LAUNDRY"), requireRoles(["ADMIN", "SUPER_ADMIN", "OWNER", "MANAGER"]), laundryController.deleteServiceController);

// Orders (Create: Manager/Cashier; Read: Manager/Cashier/Processing/Delivery; Status: Manager/Cashier/Processing)
router.post("/orders", requireModuleAccess("LAUNDRY"), requireRoles(["ADMIN", "SUPER_ADMIN", "OWNER", "MANAGER", "CASHIER"]), createOrderValidation, validateRequest, laundryController.createOrderController);
router.get("/orders/list", requireModuleAccess("LAUNDRY"), requireRoles(["ADMIN", "SUPER_ADMIN", "OWNER", "MANAGER", "CASHIER", "PROCESSING_STAFF", "DELIVERY_DRIVER"]), laundryController.getOrdersController);
router.get("/orders/:id", requireModuleAccess("LAUNDRY"), requireRoles(["ADMIN", "SUPER_ADMIN", "OWNER", "MANAGER", "CASHIER", "PROCESSING_STAFF", "DELIVERY_DRIVER"]), laundryController.getOrderByIdController);
router.put("/orders/:id/status", requireModuleAccess("LAUNDRY"), requireRoles(["ADMIN", "SUPER_ADMIN", "OWNER", "MANAGER", "CASHIER", "PROCESSING_STAFF"]), updateOrderStatusValidation, validateRequest, laundryController.updateOrderStatusController);

// Garment tracking (barcode scanning: Manager/Processing Staff)
router.get("/garments/scan/:barcode", requireModuleAccess("LAUNDRY"), requireRoles(["ADMIN", "SUPER_ADMIN", "OWNER", "MANAGER", "PROCESSING_STAFF"]), laundryController.getGarmentByBarcodeController);
router.put("/garments/:id/status", requireModuleAccess("LAUNDRY"), requireRoles(["ADMIN", "SUPER_ADMIN", "OWNER", "MANAGER", "PROCESSING_STAFF"]), laundryController.updateGarmentStatusController);

// Delivery Tracking (Manager/Cashier/Delivery Driver)
router.put("/orders/:orderId/delivery", requireModuleAccess("LAUNDRY"), requireRoles(["ADMIN", "SUPER_ADMIN", "OWNER", "MANAGER", "CASHIER", "DELIVERY_DRIVER"]), updateDeliveryStatusValidation, validateRequest, laundryController.updateDeliveryStatusController);

export default router;

