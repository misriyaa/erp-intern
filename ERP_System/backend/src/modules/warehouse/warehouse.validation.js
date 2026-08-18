import { body } from "express-validator";

export const createWarehouseValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Warehouse name is required")
    .isLength({ min: 2, max: 150 })
    .withMessage("Warehouse name must be between 2 and 150 characters"),

  body("code")
    .trim()
    .notEmpty()
    .withMessage("Warehouse code is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Warehouse code must be between 2 and 50 characters"),

  body("address")
    .optional()
    .trim(),

  body("location")
    .optional()
    .trim(),

  body("city")
    .optional()
    .trim(),

  body("state")
    .optional()
    .trim(),

  body("country")
    .optional()
    .trim(),

  body("phone")
    .optional()
    .trim()
    .isLength({ min: 8, max: 20 })
    .withMessage("Phone number must be between 8 and 20 characters"),

  body("status")
    .optional()
    .isIn(["ACTIVE", "INACTIVE"])
    .withMessage("Status must be ACTIVE or INACTIVE"),
];

export const updateWarehouseValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 150 })
    .withMessage("Warehouse name must be between 2 and 150 characters"),

  body("code")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Warehouse code must be between 2 and 50 characters"),

  body("address")
    .optional()
    .trim(),

  body("location")
    .optional()
    .trim(),

  body("city")
    .optional()
    .trim(),

  body("state")
    .optional()
    .trim(),

  body("country")
    .optional()
    .trim(),

  body("phone")
    .optional()
    .trim()
    .isLength({ min: 8, max: 20 })
    .withMessage("Phone number must be between 8 and 20 characters"),

  body("status")
    .optional()
    .isIn(["ACTIVE", "INACTIVE"])
    .withMessage("Status must be ACTIVE or INACTIVE"),
];