import { z } from "zod";

export const taskCommentSchema = z.object({
  body: z.string().min(1, "Comment is required.").max(5000, "Comment cannot exceed 5000 characters."),
});

export type TaskCommentFormValues = z.infer<typeof taskCommentSchema>;
