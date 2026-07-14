import { z } from "zod";

const optionalPositiveNumber = z.number().positive().optional();

export const reportFilterSchema = z
  .object({
    date_from: z.string().optional(),
    date_to: z.string().optional(),
    project_id: optionalPositiveNumber,
    user_id: optionalPositiveNumber,
    task_status_id: optionalPositiveNumber,
    role: z.string().optional(),
    limit: z.number().min(1).max(100),
  })
  .refine((values) => !values.date_from || !values.date_to || values.date_to >= values.date_from, {
    path: ["date_to"],
    message: "Date To must be after or equal to Date From.",
  });

export type ReportFilterValues = z.infer<typeof reportFilterSchema>;

