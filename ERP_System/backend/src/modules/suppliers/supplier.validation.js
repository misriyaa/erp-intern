import { body } from "express-validator";

export const createSupplierValidation = [
  body("companyName")
    .trim()
    .notEmpty()
    .withMessage("Company name is required")
    .isLength({ min: 2, max: 150 })
    .withMessage("Company name must be between 2 and 150 characters"),

  body("contactPerson")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Contact person cannot exceed 100 characters"),

  body("email")
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage("Invalid email address"),

  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .isLength({ min: 8, max: 20 })
    .withMessage("Phone number must be between 8 and 20 characters"),

  body("address")
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

  body("taxNumber")
    .optional()
    .trim(),

  body("status")
    .optional()
    .isIn(["ACTIVE", "INACTIVE"])
    .withMessage("Status must be ACTIVE or INACTIVE"),

  body("category")
    .optional()
    .trim(),

  body("isTextile")
    .optional()
    .isBoolean()
    .toBoolean(),
];

export const updateSupplierValidation = [
  body("companyName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 150 })
    .withMessage("Company name must be between 2 and 150 characters"),

  body("contactPerson")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Contact person cannot exceed 100 characters"),

  body("email")
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage("Invalid email address"),

  body("phone")
    .optional()
    .trim()
    .isLength({ min: 8, max: 20 })
    .withMessage("Phone number must be between 8 and 20 characters"),

  body("address")
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

  body("taxNumber")
    .optional()
    .trim(),

  body("status")
    .optional()
    .isIn(["ACTIVE", "INACTIVE"])
    .withMessage("Status must be ACTIVE or INACTIVE"),
];