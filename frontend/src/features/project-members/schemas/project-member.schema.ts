import { z } from "zod";

export const addProjectMemberSchema = z.object({
  user_id: z.number().positive("Select a user to add."),
});

export type AddProjectMemberFormValues = z.infer<typeof addProjectMemberSchema>;
