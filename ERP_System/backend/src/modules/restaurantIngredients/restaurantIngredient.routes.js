import { Router } from "express";
import * as ingredientController from "./restaurantIngredient.controller.js";
import upload from "../../middlewares/upload.middleware.js";

const router = Router();

router.post("/", upload.single("image"), ingredientController.createIngredient);
router.get("/", ingredientController.getAllIngredients);
router.get("/:id", ingredientController.getIngredientById);
router.put("/:id", upload.single("image"), ingredientController.updateIngredient);
router.delete("/:id", ingredientController.deleteIngredient);

export default router;
