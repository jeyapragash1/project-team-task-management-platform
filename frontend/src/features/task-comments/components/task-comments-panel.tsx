"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, RefreshCcw, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { getApiErrorMessage, getValidationErrors } from "@/lib/api";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/format-date";

import { useTaskCommentMutations, useTaskComments } from "../hooks/use-task-comments";
import { taskCommentSchema, type TaskCommentFormValues } from "../schemas/task-comment.schema";
import type { TaskComment } from "../types/task-comment-management.types";

function initials(name?: string | null) {
  if (!name) return "?";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function isEdited(comment: TaskComment) {
  if (!comment.created_at || !comment.updated_at) return false;

  return new Date(comment.updated_at).getTime() > new Date(comment.created_at).getTime() + 1000;
}

export function TaskCommentsPanel({ taskId }: { taskId: number }) {
  const commentsQuery = useTaskComments(taskId, { sort: "created_at", direction: "desc", per_page: 100 });
  const currentUserQuery = useCurrentUser();
  const mutations = useTaskCommentMutations(taskId);
  const [editingComment, setEditingComment] = useState<TaskComment | null>(null);
  const [deleteComment, setDeleteComment] = useState<TaskComment | null>(null);
  const comments = commentsQuery.data?.data ?? [];
  const currentUserId = currentUserQuery.data?.id;

  return (
    <section className="space-y-4 border-t border-border pt-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-medium">Comments</h3>
          <p className="mt-1 text-xs text-muted-foreground">Newest comments appear first.</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => commentsQuery.refetch()} disabled={commentsQuery.isFetching}>
          <RefreshCcw className={cn("size-4", commentsQuery.isFetching && "animate-spin")} />
          Refresh
        </Button>
      </div>

      <CommentForm isSubmitting={mutations.create.isPending} onSubmit={(values) => mutations.create.mutateAsync(values)} />

      {commentsQuery.isLoading ? <CommentsSkeleton /> : null}
      {commentsQuery.isError ? <CommentsError message={getApiErrorMessage(commentsQuery.error)} onRetry={() => commentsQuery.refetch()} /> : null}
      {!commentsQuery.isLoading && !commentsQuery.isError && comments.length === 0 ? <CommentsEmpty /> : null}
      {!commentsQuery.isLoading && !commentsQuery.isError && comments.length > 0 ? (
        <div className="space-y-3">
          {comments.map((comment) => {
            const canManage = currentUserId === comment.user_id;
            return (
              <article key={comment.id} className="border border-border p-3">
                <div className="flex items-start gap-3">
                  <Avatar size="sm">
                    <AvatarFallback>{initials(comment.user?.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs font-medium">{comment.user?.name ?? "Unknown user"}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(comment.created_at)}{isEdited(comment) ? " · edited" : ""}
                        </p>
                      </div>
                      {canManage ? (
                        <div className="flex gap-1">
                          <Button type="button" variant="ghost" size="icon-sm" aria-label="Edit comment" title="Edit comment" onClick={() => setEditingComment(comment)}>
                            <Pencil className="size-4" />
                          </Button>
                          <Button type="button" variant="destructive" size="icon-sm" aria-label="Delete comment" title="Delete comment" onClick={() => setDeleteComment(comment)}>
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      ) : null}
                    </div>
                    <p className="whitespace-pre-wrap text-xs leading-6 text-foreground">{comment.body}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}

      <EditCommentDialog
        comment={editingComment}
        isSubmitting={mutations.update.isPending}
        onClose={() => setEditingComment(null)}
        onSubmit={async (values) => {
          if (!editingComment) return;
          await mutations.update.mutateAsync({ commentId: editingComment.id, payload: values });
          setEditingComment(null);
        }}
      />
      <DeleteCommentDialog
        comment={deleteComment}
        isSubmitting={mutations.delete.isPending}
        onClose={() => setDeleteComment(null)}
        onConfirm={async () => {
          if (!deleteComment) return;
          await mutations.delete.mutateAsync(deleteComment.id);
          setDeleteComment(null);
        }}
      />
    </section>
  );
}

function CommentForm({ isSubmitting, onSubmit }: { isSubmitting: boolean; onSubmit: (values: TaskCommentFormValues) => Promise<unknown> }) {
  const form = useForm<TaskCommentFormValues>({ resolver: zodResolver(taskCommentSchema), defaultValues: { body: "" } });

  async function submit(values: TaskCommentFormValues) {
    try {
      await onSubmit(values);
      form.reset();
    } catch (error) {
      Object.entries(getValidationErrors(error)).forEach(([field, messages]) => {
        form.setError(field as keyof TaskCommentFormValues, { type: "server", message: messages[0] });
      });
    }
  }

  return (
    <div className="space-y-2">
      <Textarea rows={3} placeholder="Write a comment" aria-invalid={Boolean(form.formState.errors.body)} {...form.register("body")} />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {form.formState.errors.body?.message ? <p className="text-xs text-destructive">{form.formState.errors.body.message}</p> : <span />}
        <Button type="button" size="sm" onClick={form.handleSubmit(submit)} disabled={isSubmitting}>
          {isSubmitting ? "Posting..." : "Post Comment"}
        </Button>
      </div>
    </div>
  );
}

function EditCommentDialog({ comment, isSubmitting, onClose, onSubmit }: { comment: TaskComment | null; isSubmitting: boolean; onClose: () => void; onSubmit: (values: TaskCommentFormValues) => Promise<void> }) {
  const form = useForm<TaskCommentFormValues>({ resolver: zodResolver(taskCommentSchema), defaultValues: { body: "" } });

  useEffect(() => {
    if (comment) {
      form.reset({ body: comment.body });
    }
  }, [comment, form]);

  async function submit(values: TaskCommentFormValues) {
    try {
      await onSubmit(values);
    } catch (error) {
      Object.entries(getValidationErrors(error)).forEach(([field, messages]) => {
        form.setError(field as keyof TaskCommentFormValues, { type: "server", message: messages[0] });
      });
    }
  }

  return (
    <Dialog open={Boolean(comment)} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Comment</DialogTitle>
          <DialogDescription>Update your task comment.</DialogDescription>
        </DialogHeader>
        <Textarea rows={5} aria-invalid={Boolean(form.formState.errors.body)} {...form.register("body")} />
        {form.formState.errors.body?.message ? <p className="text-xs text-destructive">{form.formState.errors.body.message}</p> : null}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button type="button" onClick={form.handleSubmit(submit)} disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Comment"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteCommentDialog({ comment, isSubmitting, onClose, onConfirm }: { comment: TaskComment | null; isSubmitting: boolean; onClose: () => void; onConfirm: () => Promise<void> }) {
  return (
    <Dialog open={Boolean(comment)} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Comment</DialogTitle>
          <DialogDescription>Delete this comment? This action removes it from the task discussion.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button type="button" variant="destructive" onClick={onConfirm} disabled={isSubmitting}>{isSubmitting ? "Deleting..." : "Delete Comment"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CommentsSkeleton() {
  return <div className="space-y-2">{Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-20 w-full" />)}</div>;
}

function CommentsEmpty() {
  return <div className="border border-dashed border-border bg-muted/20 p-6 text-center"><p className="text-xs font-medium">No comments yet</p><p className="mt-1 text-xs text-muted-foreground">Start the discussion with the first update.</p></div>;
}

function CommentsError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div className="border border-destructive/30 bg-destructive/10 p-4"><p className="text-xs font-medium text-destructive">Unable to load comments</p><p className="mt-1 text-xs text-muted-foreground">{message}</p><Button type="button" variant="outline" size="sm" className="mt-3" onClick={onRetry}>Retry</Button></div>;
}
