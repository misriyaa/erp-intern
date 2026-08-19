import { z } from "zod";

export const createCustomerSchema = z.object({
  branchId: z.string().uuid().optional(),

  name: z
    .string()
    .trim()
    .min(2, "Customer name is required"),

  phone: z
    .string()
    .trim()
    .min(8, "Phone number is required"),

  email: z
    .string()
    .email()
    .optional(),

  address: z
    .string()
    .optional(),

  loyaltyId: z
    .string()
    .optional(),

  creditLimit: z
    .number()
    .default(0),

  currentBalance: z
    .number()
    .default(0)
});