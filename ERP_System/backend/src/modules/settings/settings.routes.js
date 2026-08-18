import express from "express";
import * as controller from "./settings.controller.js";
import upload from "../../middlewares/upload.middleware.js";
import { validateSettingsInput } from "./settings.validation.js";

const router = express.Router();

// Get settings
router.get("/", controller.getSettings);

// Update settings (supports both JSON body or FormData with logo file)
router.put("/", upload.single("companyLogo"), validateSettingsInput, controller.updateSettings);

// Separate endpoint for uploading company logo
router.post("/logo", upload.single("companyLogo"), controller.uploadLogo);

// Reset settings to default
router.post("/reset", controller.resetSettings);

export default router;
