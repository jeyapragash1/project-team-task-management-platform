import { z } from "zod";

export const roleSchema = z.object({
  name: z.string().min(1, "Role name is required.").max(255),
  permissions: z.array(z.string()).optional(),
});

export const permissionAssignmentSchema = z.object({
  permissions: z.array(z.string()).min(1, "Select at least one permission."),
});

export type RoleFormValues = z.infer<typeof roleSchema>;
export type PermissionAssignmentValues = z.infer<typeof permissionAssignmentSchema>;
