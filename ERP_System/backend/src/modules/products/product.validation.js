import { body } from "express-validator";

export const createProductValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Product name is required")
    .isLength({ min: 2, max: 150 })
    .withMessage("Product name must be between 2 and 150 characters"),

  body("sku")
    .trim()
    .notEmpty()
    .withMessage("SKU is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("SKU must be between 2 and 50 characters"),

  body("categoryId")
    .optional({ nullable: true })
    .custom((val) => {
      if (!val) return true;
      const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(val);
      if (isUuid) return true;
      throw new Error("Invalid Category ID");
    }),

  body("brandId")
    .optional({ nullable: true })
    .custom((val) => {
      if (!val) return true;
      const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(val);
      if (isUuid) return true;
      throw new Error("Invalid Brand ID");
    }),

  body("costPrice")
    .notEmpty()
    .withMessage("Cost price is required")
    .isFloat({ min: 0 })
    .withMessage("Cost price must be greater than or equal to 0")
    .toFloat(),

  body("sellingPrice")
    .notEmpty()
    .withMessage("Selling price is required")
    .isFloat({ min: 0 })
    .withMessage("Selling price must be greater than or equal to 0")
    .toFloat(),

 body("discountType")
  .optional()
  .isIn(["PERCENT", "FIXED"])
  .withMessage("Discount type must be PERCENT or FIXED"),

body("discountValue")
  .optional()
  .isFloat({ min: 0 })
  .withMessage("Discount value must be greater than or equal to 0")
  .toFloat(),

 body("unitId")
  .optional({ nullable: true })
  .custom((val) => {
    if (!val) return true;
    const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(val);
    if (isUuid) return true;
    throw new Error("Invalid Unit ID");
  }),

  body("image")
    .optional()
    .custom((value) => {
      if (!value) return true;

      // Accept URL
      const isUrl = /^https?:\/\/.+/i.test(value);

      // Accept local upload path
      const isUploadPath =
        value.startsWith("/uploads/") ||
        value.startsWith("uploads/");

      if (isUrl || isUploadPath) {
        return true;
      }

      throw new Error(
        "Image must be a valid URL or uploaded image path"
      );
    }),

  body("description")
    .optional()
    .trim(),

  body("status")
    .optional()
    .isIn(["ACTIVE", "INACTIVE"])
    .withMessage("Status must be ACTIVE or INACTIVE"),
];

export const updateProductValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 150 })
    .withMessage("Product name must be between 2 and 150 characters"),

  body("sku")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("SKU must be between 2 and 50 characters"),

  body("categoryId")
    .optional()
    .isUUID()
    .withMessage("Invalid Category ID"),

  body("brandId")
    .optional({ nullable: true })
    .isUUID()
    .withMessage("Invalid Brand ID"),

  body("costPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Cost price must be greater than or equal to 0")
    .toFloat(),

  body("sellingPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Selling price must be greater than or equal to 0")
    .toFloat(),

    body("discountType")
  .optional()
  .isIn(["PERCENT", "FIXED"])
  .withMessage("Discount type must be PERCENT or FIXED"),

body("discountValue")
  .optional()
  .isFloat({ min: 0 })
  .withMessage("Discount value must be greater than or equal to 0")
  .toFloat(),

body("unitId")
  .optional()
  .isUUID()
  .withMessage("Invalid Unit ID"),
  
  body("image")
    .optional()
    .custom((value) => {
      if (!value) return true;

      // Accept URL
      const isUrl = /^https?:\/\/.+/i.test(value);

      // Accept local upload path
      const isUploadPath =
        value.startsWith("/uploads/") ||
        value.startsWith("uploads/");

      if (isUrl || isUploadPath) {
        return true;
      }

      throw new Error(
        "Image must be a valid URL or uploaded image path"
      );
    }),

  body("description")
    .optional()
    .trim(),

  body("status")
    .optional()
    .isIn(["ACTIVE", "INACTIVE"])
    .withMessage("Status must be ACTIVE or INACTIVE"),
];