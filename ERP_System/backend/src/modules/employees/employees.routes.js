import express from "express";
import { requireRoles } from "../../middlewares/auth.middleware.js";

import {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "./employees.controller.js";

import { validateAddEmployee } from "./employees.validation.js";

const router = express.Router();

router.get("/", getEmployees);
router.get("/:id", getEmployee);
router.post("/", requireRoles(["ADMIN", "OWNER", "MANAGER"]), validateAddEmployee, createEmployee);
router.put("/:id", requireRoles(["ADMIN", "OWNER", "MANAGER"]), updateEmployee);
router.delete("/:id", requireRoles(["ADMIN", "OWNER", "MANAGER"]), deleteEmployee);

export default router;