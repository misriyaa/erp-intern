import Joi from "joi";

const branchSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      "string.empty": "Branch name is required",
      "string.min": "Branch name must be at least 2 characters",
      "string.max": "Branch name must not exceed 100 characters",
      "any.required": "Branch name is required",
    }),

  code: Joi.string()
    .trim()
    .uppercase()
    .min(2)
    .max(20)
    .required()
    .messages({
      "string.empty": "Branch code is required",
      "string.min": "Branch code must be at least 2 characters",
      "string.max": "Branch code must not exceed 20 characters",
      "any.required": "Branch code is required",
    }),

  address: Joi.string()
    .trim()
    .max(255)
    .allow("", null),

  city: Joi.string()
    .trim()
    .max(100)
    .allow("", null),

  state: Joi.string()
    .trim()
    .max(100)
    .allow("", null),

  phone: Joi.string()
    .trim()
    .pattern(/^[\+\d\s\-\(\)]{7,20}$/)
    .allow("", null)
    .messages({
      "string.pattern.base": "Enter a valid phone number",
    }),

  email: Joi.string()
    .trim()
    .email()
    .max(150)
    .allow("", null)
    .messages({
      "string.email": "Enter a valid email address",
    }),

  isActive: Joi.boolean().default(true),
});

const updateBranchSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .messages({
      "string.min": "Branch name must be at least 2 characters",
      "string.max": "Branch name must not exceed 100 characters",
    }),

  code: Joi.string()
    .trim()
    .uppercase()
    .min(2)
    .max(20)
    .messages({
      "string.min": "Branch code must be at least 2 characters",
      "string.max": "Branch code must not exceed 20 characters",
    }),

  address: Joi.string()
    .trim()
    .max(255)
    .allow("", null),

  city: Joi.string()
    .trim()
    .max(100)
    .allow("", null),

  state: Joi.string()
    .trim()
    .max(100)
    .allow("", null),

  phone: Joi.string()
    .trim()
    .pattern(/^[\+\d\s\-\(\)]{7,20}$/)
    .allow("", null)
    .messages({
      "string.pattern.base": "Enter a valid phone number",
    }),

  email: Joi.string()
    .trim()
    .email()
    .max(150)
    .allow("", null)
    .messages({
      "string.email": "Enter a valid email address",
    }),

  isActive: Joi.boolean(),
}).min(1);

export {
  branchSchema,
  updateBranchSchema,
};