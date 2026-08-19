import { body } from "express-validator";

export const createDesignationValidation = [
  body("name")
    .notEmpty()
    .withMessage("Designation name is required")
    .trim(),

  body("departmentId")
    .optional()
    .isUUID()
    .withMessage("Invalid Department ID"),

  body("description")
    .optional()
    .trim(),
];

export const updateDesignationValidation = [
  body("name")
    .optional()
    .notEmpty()
    .withMessage("Designation name cannot be empty")
    .trim(),

  body("departmentId")
    .optional()
    .isUUID()
    .withMessage("Invalid Department ID"),

  body("description")
    .optional()
    .trim(),
];
