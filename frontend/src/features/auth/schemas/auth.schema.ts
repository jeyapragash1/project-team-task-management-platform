import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required."),
  remember: z.boolean().optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
