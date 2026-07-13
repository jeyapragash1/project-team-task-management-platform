import { z } from "zod";

export const projectStatuses = ["active", "on_hold", "completed", "cancelled", "archived"] as const;

export const projectSchema = z
  .object({
    name: z.string().min(1, "Project name is required.").max(255),
    description: z.string().optional(),
    manager_id: z.number().int().positive("Select a project manager."),
    start_date: z.string().optional(),
    due_date: z.string().optional(),
    status: z.enum(projectStatuses),
  })
  .refine(
    (data) => !data.start_date || !data.due_date || data.due_date >= data.start_date,
    {
      path: ["due_date"],
      message: "Due date must be after or equal to the start date.",
    },
  );

export type ProjectFormValues = z.infer<typeof projectSchema>;

