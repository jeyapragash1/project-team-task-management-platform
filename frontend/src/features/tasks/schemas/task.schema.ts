import { z } from "zod";

export const taskPriorities = ["low", "medium", "high", "urgent"] as const;

export const fallbackTaskStatuses = [
  { status_id: 1, name: "To Do", slug: "to-do", total: 0 },
  { status_id: 2, name: "In Progress", slug: "in-progress", total: 0 },
  { status_id: 3, name: "Completed", slug: "completed", total: 0 },
] as const;

export const taskSchema = z.object({
  project_id: z.number().positive("Select a project."),
  status_id: z.number().positive("Select a status."),
  assigned_to_id: z.number().optional().nullable(),
  title: z.string().min(1, "Title is required.").max(255),
  description: z.string().optional().nullable(),
  priority: z.enum(taskPriorities),
  progress: z.number().min(0, "Progress cannot be below 0.").max(100, "Progress cannot exceed 100."),
  due_date: z.string().optional().nullable(),
});

export const assignTaskSchema = z.object({
  assigned_to_id: z.number().positive("Select an assignee."),
});

export const updateTaskStatusSchema = z.object({
  status_id: z.number().positive("Select a status."),
  progress: z.number().min(0, "Progress cannot be below 0.").max(100, "Progress cannot exceed 100."),
});

export type TaskFormValues = z.infer<typeof taskSchema>;
export type AssignTaskFormValues = z.infer<typeof assignTaskSchema>;
export type UpdateTaskStatusFormValues = z.infer<typeof updateTaskStatusSchema>;

