import { body } from "express-validator";

export const createGymMemberValidation = [
  body("fullName")
    .notEmpty()
    .withMessage("Full name is required")
    .trim(),

  body("phone")
    .notEmpty()
    .withMessage("Phone number is required")
    .trim(),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email address")
    .normalizeEmail(),

  body("membershipPlanId")
    .notEmpty()
    .withMessage("Membership plan ID is required"),

  body("joinDate")
    .notEmpty()
    .withMessage("Join date is required")
    .isISO8601()
    .withMessage("Invalid join date format"),

  body("expiryDate")
    .notEmpty()
    .withMessage("Expiry date is required")
    .isISO8601()
    .withMessage("Invalid expiry date format"),
];

export const updateGymMemberValidation = [
  body("fullName")
    .optional()
    .notEmpty()
    .withMessage("Full name cannot be empty")
    .trim(),

  body("phone")
    .optional()
    .notEmpty()
    .withMessage("Phone number cannot be empty")
    .trim(),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email address")
    .normalizeEmail(),

  body("joinDate")
    .optional()
    .isISO8601()
    .withMessage("Invalid join date format"),

  body("expiryDate")
    .optional()
    .isISO8601()
    .withMessage("Invalid expiry date format"),
];

export const createGymPlanValidation = [
  body("name")
    .notEmpty()
    .withMessage("Plan name is required")
    .trim(),

  body("durationMonths")
    .notEmpty()
    .withMessage("Duration in months is required")
    .isInt({ min: 1 })
    .withMessage("Duration must be at least 1 month"),

  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ min: 0 })
    .withMessage("Price must be 0 or greater"),
];

export const createGymTrainerValidation = [
  body("name")
    .notEmpty()
    .withMessage("Trainer name is required")
    .trim(),

  body("phone")
    .notEmpty()
    .withMessage("Phone number is required")
    .trim(),
];

export const recordAttendanceValidation = [
  body("memberId")
    .notEmpty()
    .withMessage("Member ID is required"),
];

export const createGymPaymentValidation = [
  body("memberId")
    .notEmpty()
    .withMessage("Member ID is required"),

  body("amount")
    .notEmpty()
    .withMessage("Payment amount is required")
    .isFloat({ min: 0.01 })
    .withMessage("Amount must be greater than 0"),
];
