import { body, param } from "express-validator";

const optFalsy = { checkFalsy: true, nullable: true };

export const createBatchValidation = [
  body("batchNumber")
    .trim()
    .notEmpty()
    .withMessage("Batch number is required")
    .isLength({ min: 1, max: 100 })
    .withMessage("Batch number must be between 1 and 100 characters"),

  body("mrp")
    .notEmpty()
    .withMessage("MRP is required")
    .isFloat({ min: 0.01 })
    .withMessage("MRP must be greater than 0")
    .toFloat()
    .custom((value, { req }) => {
      const sellingPrice = parseFloat(req.body.sellingPrice);
      if (!isNaN(sellingPrice) && value < sellingPrice) {
        throw new Error("MRP must be greater than or equal to selling price");
      }
      return true;
    }),

  body("purchasePrice")
    .notEmpty()
    .withMessage("Purchase price is required")
    .isFloat({ min: 0.01 })
    .withMessage("Purchase price must be greater than 0")
    .toFloat(),

  body("sellingPrice")
    .notEmpty()
    .withMessage("Selling price is required")
    .isFloat({ min: 0.01 })
    .withMessage("Selling price must be greater than 0")
    .toFloat(),

  body("quantity")
    .optional({ nullable: true })
    .isInt({ min: 0 })
    .withMessage("Quantity cannot be negative")
    .toInt(),

  body("expiryDate")
    .optional(optFalsy)
    .isISO8601()
    .withMessage("Expiry date must be a valid date"),
];

export const updateBatchValidation = [
  param("batchId")
    .trim()
    .notEmpty()
    .withMessage("Batch ID is required"),

  body("mrp")
    .optional(optFalsy)
    .isFloat({ min: 0.01 })
    .withMessage("MRP must be greater than 0")
    .toFloat()
    .custom((value, { req }) => {
      if (req.body.sellingPrice !== undefined) {
        const sellingPrice = parseFloat(req.body.sellingPrice);
        if (!isNaN(sellingPrice) && value < sellingPrice) {
          throw new Error("MRP must be greater than or equal to selling price");
        }
      }
      return true;
    }),

  body("purchasePrice")
    .optional(optFalsy)
    .isFloat({ min: 0.01 })
    .withMessage("Purchase price must be greater than 0")
    .toFloat(),

  body("sellingPrice")
    .optional(optFalsy)
    .isFloat({ min: 0.01 })
    .withMessage("Selling price must be greater than 0")
    .toFloat(),

  body("expiryDate")
    .optional(optFalsy)
    .isISO8601()
    .withMessage("Expiry date must be a valid date"),
];
