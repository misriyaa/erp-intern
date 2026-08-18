import express from "express";

import {
  getDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "./department.controller.js";

import { validateDepartment } from "./department.validation.js";

const router = express.Router();

router.get("/", getDepartments);
router.get("/:id", getDepartment);
router.post("/", validateDepartment, createDepartment);
router.put("/:id", validateDepartment, updateDepartment);
router.delete("/:id", deleteDepartment);

export default router;
