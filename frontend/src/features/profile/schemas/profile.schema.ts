import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
  .regex(/[0-9]/, "Password must contain at least one number.");

export const profileSchema = z.object({
  name: z.string().min(1, "Name is required.").max(255),
  email: z.string().email("Enter a valid email address.").max(255),
});

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required."),
    password: passwordSchema,
    password_confirmation: z.string().min(1, "Confirm the new password."),
  })
  .refine((values) => values.password === values.password_confirmation, {
    path: ["password_confirmation"],
    message: "Passwords do not match.",
  });

export type ProfileFormValues = z.infer<typeof profileSchema>;
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
