import express from "express";
import {
  getRoles,
  getRole,
  createRole,
  updateRole,
  deleteRole,
} from "./roles.controller.js";

const router = express.Router();

router.get("/", getRoles);
router.get("/:id", getRole);
router.post("/", createRole);
router.put("/:id", updateRole);
router.delete("/:id", deleteRole);

export default router;
