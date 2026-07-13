import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
  .regex(/[0-9]/, "Password must contain at least one number.");

export const createUserSchema = z
  .object({
    name: z.string().min(1, "Name is required.").max(255),
    email: z.string().email("Enter a valid email address.").max(255),
    password: passwordSchema,
    password_confirmation: z.string().min(1, "Confirm the password."),
    is_active: z.boolean(),
    roles: z.array(z.string()).min(1, "Select at least one role."),
  })
  .refine((data) => data.password === data.password_confirmation, {
    path: ["password_confirmation"],
    message: "Passwords do not match.",
  });

export const updateUserSchema = z
  .object({
    name: z.string().min(1, "Name is required.").max(255),
    email: z.string().email("Enter a valid email address.").max(255),
    password: z.union([passwordSchema, z.literal("")]).optional(),
    password_confirmation: z.string().optional(),
    is_active: z.boolean(),
    roles: z.array(z.string()).min(1, "Select at least one role."),
  })
  .refine((data) => !data.password || data.password === data.password_confirmation, {
    path: ["password_confirmation"],
    message: "Passwords do not match.",
  });

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;
export type UserFormValues = CreateUserFormValues | UpdateUserFormValues;
