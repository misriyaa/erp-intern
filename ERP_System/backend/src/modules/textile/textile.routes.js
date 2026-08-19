import { Router } from "express";
import * as textileController from "./textile.controller.js";
import {
  createTextileProductValidation,
  updateTextileProductValidation,
} from "./textile.validation.js";
import validateRequest from "../../middlewares/validateRequest.js";

const router = Router();

router.get("/", textileController.getTextileProducts);
router.get("/:id", textileController.getTextileProductById);
router.post(
  "/",
  createTextileProductValidation,
  validateRequest,
  textileController.createTextileProduct
);
router.put(
  "/:id",
  updateTextileProductValidation,
  validateRequest,
  textileController.updateTextileProduct
);
router.delete("/:id", textileController.deleteTextileProduct);

export default router;
