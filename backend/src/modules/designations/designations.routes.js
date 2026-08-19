import express from "express";
import {
  getDesignations,
  getDesignation,
  createDesignation,
  updateDesignation,
  deleteDesignation,
} from "./designations.controller.js";

const router = express.Router();

router.get("/", getDesignations);
router.get("/:id", getDesignation);
router.post("/", createDesignation);
router.put("/:id", updateDesignation);
router.delete("/:id", deleteDesignation);

export default router;
