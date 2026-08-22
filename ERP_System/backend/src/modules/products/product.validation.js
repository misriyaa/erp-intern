import { body } from "express-validator";

export const createProductValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Product name is required")
    .isLength({ min: 2, max: 150 })
    .withMessage("Product name must be between 2 and 150 characters"),

  body("sku")
    .optional({ nullable: true })
    .trim(),

  body("barcode")
    .optional({ nullable: true })
    .trim(),

  body("categoryId")
    .optional({ nullable: true })
    .custom((val) => {
      if (!val) return true;
      const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(val);
      if (isUuid) return true;
      throw new Error("Invalid Category ID");
    }),

  body("subcategory")
    .optional({ nullable: true })
    .trim(),

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

  body("wholesalePrice")
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .toFloat(),

  body("retailPrice")
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .toFloat(),

  body("discountType")
    .optional({ nullable: true })
    .isIn(["PERCENT", "FIXED"])
    .withMessage("Discount type must be PERCENT or FIXED"),

  body("discountValue")
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage("Discount value must be greater than or equal to 0")
    .toFloat(),

  body("taxRate")
    .optional({ nullable: true })
    .isFloat({ min: 0 })
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
    .optional({ nullable: true })
    .custom((value) => {
      if (!value) return true;
      const isUrl = /^https?:\/\/.+/i.test(value);
      const isUploadPath = value.startsWith("/uploads/") || value.startsWith("uploads/");
      if (isUrl || isUploadPath) return true;
      throw new Error("Image must be a valid URL or uploaded image path");
    }),

  body("description")
    .optional({ nullable: true })
    .trim(),

  body("status")
    .optional()
    .isIn(["ACTIVE", "INACTIVE"])
    .withMessage("Status must be ACTIVE or INACTIVE"),

  // Textile Fabric Specifications
  body("fabricComposition").optional({ nullable: true }).trim(),
  body("gsm").optional({ nullable: true }).isFloat({ min: 0 }).toFloat(),
  body("rollWidth").optional({ nullable: true }).isFloat({ min: 0 }).toFloat(),
  body("widthUnit").optional({ nullable: true }).trim(),
  body("color").optional({ nullable: true }).trim(),
  body("colorCode").optional({ nullable: true }).trim(),
  body("pattern").optional({ nullable: true }).trim(),
  body("weaveType").optional({ nullable: true }).trim(),
  body("textureFinish").optional({ nullable: true }).trim(),

  // Inventory Details
  body("stockUnit").optional({ nullable: true }).trim(),
  body("initialStock").optional({ nullable: true }).isFloat({ min: 0 }).toFloat(),
  body("openingStockDate").optional({ nullable: true }),
  body("reorderLevel").optional({ nullable: true }).isInt({ min: 0 }).toInt(),
  body("minimumStock").optional({ nullable: true }).isInt({ min: 0 }).toInt(),
  body("maximumStock").optional({ nullable: true }).isInt({ min: 0 }).toInt(),
  body("warehouseLocation").optional({ nullable: true }).trim(),
  body("rackLocation").optional({ nullable: true }).trim(),
  body("numberOfRolls").optional({ nullable: true }).isInt({ min: 0 }).toInt(),

  // Supplier Details
  body("supplierId")
    .optional({ nullable: true })
    .custom((val) => {
      if (!val) return true;
      const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(val);
      if (isUuid) return true;
      throw new Error("Invalid Supplier ID");
    }),
  body("supplierProductCode").optional({ nullable: true }).trim(),
  body("leadTime").optional({ nullable: true }).isInt({ min: 0 }).toInt(),
  body("hasVariants").optional().isBoolean().toBoolean(),
  body("variants").optional(),
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

  body("barcode").optional({ nullable: true }).trim(),
  body("categoryId").optional({ nullable: true }),
  body("subcategory").optional({ nullable: true }).trim(),
  body("brandId").optional({ nullable: true }),
  body("costPrice").optional().isFloat({ min: 0 }).toFloat(),
  body("sellingPrice").optional().isFloat({ min: 0 }).toFloat(),
  body("wholesalePrice").optional({ nullable: true }).isFloat({ min: 0 }).toFloat(),
  body("retailPrice").optional({ nullable: true }).isFloat({ min: 0 }).toFloat(),
  body("discountType").optional({ nullable: true }).isIn(["PERCENT", "FIXED"]),
  body("discountValue").optional({ nullable: true }).isFloat({ min: 0 }).toFloat(),
  body("taxRate").optional({ nullable: true }).isFloat({ min: 0 }).toFloat(),
  body("unitId").optional({ nullable: true }),
  body("image").optional({ nullable: true }),
  body("description").optional({ nullable: true }).trim(),
  body("status").optional().isIn(["ACTIVE", "INACTIVE"]),

  // Textile Fabric Specifications
  body("fabricComposition").optional({ nullable: true }).trim(),
  body("gsm").optional({ nullable: true }).isFloat({ min: 0 }).toFloat(),
  body("rollWidth").optional({ nullable: true }).isFloat({ min: 0 }).toFloat(),
  body("widthUnit").optional({ nullable: true }).trim(),
  body("color").optional({ nullable: true }).trim(),
  body("colorCode").optional({ nullable: true }).trim(),
  body("pattern").optional({ nullable: true }).trim(),
  body("weaveType").optional({ nullable: true }).trim(),
  body("textureFinish").optional({ nullable: true }).trim(),

  // Inventory Details
  body("stockUnit").optional({ nullable: true }).trim(),
  body("initialStock").optional({ nullable: true }).isFloat({ min: 0 }).toFloat(),
  body("openingStockDate").optional({ nullable: true }),
  body("reorderLevel").optional({ nullable: true }).isInt({ min: 0 }).toInt(),
  body("minimumStock").optional({ nullable: true }).isInt({ min: 0 }).toInt(),
  body("maximumStock").optional({ nullable: true }).isInt({ min: 0 }).toInt(),
  body("warehouseLocation").optional({ nullable: true }).trim(),
  body("rackLocation").optional({ nullable: true }).trim(),
  body("numberOfRolls").optional({ nullable: true }).isInt({ min: 0 }).toInt(),

  // Supplier Details
  body("supplierId").optional({ nullable: true }),
  body("supplierProductCode").optional({ nullable: true }).trim(),
  body("leadTime").optional({ nullable: true }).isInt({ min: 0 }).toInt(),
  body("hasVariants").optional().isBoolean().toBoolean(),
  body("variants").optional(),
];