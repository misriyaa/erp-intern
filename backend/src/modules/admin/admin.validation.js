import Joi from "joi";

export const createAdminSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      "string.empty": "Name is required",
      "string.min": "Name must contain at least 2 characters",
      "string.max": "Name cannot exceed 100 characters",
      "any.required": "Name is required",
    }),

  email: Joi.string()
    .trim()
    .lowercase()
    .email()
    .required()
    .messages({
      "string.empty": "Email is required",
      "string.email": "Please enter a valid email",
      "any.required": "Email is required",
    }),

  phone: Joi.string()
    .trim()
    .min(7)
    .max(20)
    .required()
    .messages({
      "string.empty": "Phone number is required",
      "string.min": "Phone number must contain at least 7 characters",
      "string.max": "Phone number cannot exceed 20 characters",
      "any.required": "Phone number is required",
    }),

  password: Joi.string()
    .min(6)
    .max(50)
    .required()
    .messages({
      "string.empty": "Password is required",
      "string.min": "Password must contain at least 6 characters",
      "string.max": "Password cannot exceed 50 characters",
      "any.required": "Password is required",
    }),

  companyName: Joi.string()
    .trim()
    .max(150)
    .allow("", null)
    .optional(),

  type: Joi.string()
    .trim()
    .min(2)
    .max(150)
    .required()
    .messages({
      "string.empty": "Business type is required",
      "string.min": "Business type must contain at least 2 characters",
      "string.max": "Business type cannot exceed 150 characters",
      "any.required": "Business type is required",
    }),

  enabledModules: Joi.array().items(Joi.string()).optional(),
});