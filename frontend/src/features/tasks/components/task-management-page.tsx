"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Eye,
  Pencil,
  Plus,
  RefreshCcw,
  RotateCcw,
  Search,
  Send,
  Trash2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useDashboard } from "@/features/dashboard/hooks/use-dashboard";
import type { DashboardTaskStatus } from "@/features/dashboard/types/dashboard.types";
import { useProjectMembers } from "@/features/project-members/hooks/use-project-members";
import { TaskCommentsPanel } from "@/features/task-comments";
import { useProjects } from "@/features/projects/hooks/use-projects";
import type { ManagedProject } from "@/features/projects/types/project-management.types";
import { useUsers } from "@/features/users/hooks/use-users";
import type { ManagedUser } from "@/features/users/types/user-management.types";
import { getApiErrorMessage, getValidationErrors } from "@/lib/api";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/format-date";

import { useTaskMutations, useTasks } from "../hooks/use-tasks";
import {
  assignTaskSchema,
  fallbackTaskStatuses,
  taskPriorities,
  taskSchema,
  updateTaskStatusSchema,
  type AssignTaskFormValues,
  type TaskFormValues,
  type UpdateTaskStatusFormValues,
} from "../schemas/task.schema";
import type { ManagedTask, TaskFormPayload, TaskListParams, TaskPriority } from "../types/task-management.types";

type SortField = NonNullable<TaskListParams["sort"]>;
type SortDirection = NonNullable<TaskListParams["direction"]>;
type TaskDialogState = { mode: "create" | "edit"; task?: ManagedTask } | null;
type ConfirmAction = { type: "delete" | "restore"; task: ManagedTask } | null;

const sortOptions: Array<{ label: string; value: SortField }> = [
  { label: "Created", value: "created_at" },
  { label: "Title", value: "title" },
  { label: "Priority", value: "priority" },
  { label: "Progress", value: "progress" },
  { label: "Due Date", value: "due_date" },
  { label: "Updated", value: "updated_at" },
];

function titleCase(value: string) {
  return value.replaceAll("_", " ").replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function priorityVariant(priority: TaskPriority): "default" | "secondary" | "destructive" | "outline" {
  if (priority === "urgent") return "destructive";
  if (priority === "high") return "default";
  if (priority === "medium") return "secondary";
  return "outline";
}

function statusVariant(slug?: string): "default" | "secondary" | "destructive" | "outline" {
  if (slug === "completed") return "secondary";
  if (slug?.includes("progress")) return "default";
  return "outline";
}

function toTaskPayload(values: TaskFormValues): TaskFormPayload {
  return {
    project_id: values.project_id,
    status_id: values.status_id,
    assigned_to_id: values.assigned_to_id || null,
    title: values.title,
    description: values.description || null,
    priority: values.priority,
    progress: values.progress,
    due_date: values.due_date || null,
  };
}

function taskStatusOptions(statuses: DashboardTaskStatus[]) {
  return statuses.length > 0 ? statuses : [...fallbackTaskStatuses];
}

export function TaskManagementPage() {
  const [search, setSearch] = useState("");
  const [projectId, setProjectId] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [statusId, setStatusId] = useState("");
  const [priority, setPriority] = useState<"" | TaskPriority>("");
  const [trashed, setTrashed] = useState<"" | "with" | "only">("");
  const [sort, setSort] = useState<SortField>("created_at");
  const [direction, setDirection] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);
  const [taskDialog, setTaskDialog] = useState<TaskDialogState>(null);
  const [assignTask, setAssignTask] = useState<ManagedTask | null>(null);
  const [statusTask, setStatusTask] = useState<ManagedTask | null>(null);
  const [viewTask, setViewTask] = useState<ManagedTask | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  const params = useMemo<TaskListParams>(
    () => ({
      page,
      per_page: 10,
      search: search || undefined,
      project_id: projectId ? Number(projectId) : undefined,
      assigned_to_id: assigneeId ? Number(assigneeId) : undefined,
      status_id: statusId ? Number(statusId) : undefined,
      priority: priority || undefined,
      trashed: trashed || undefined,
      sort,
      direction,
    }),
    [assigneeId, direction, page, priority, projectId, search, sort, statusId, trashed],
  );

  const tasksQuery = useTasks(params);
  const projectsQuery = useProjects({ per_page: 100, sort: "name", direction: "asc" });
  const usersQuery = useUsers({ status: "active", per_page: 100, sort: "name", direction: "asc" });
  const dashboardQuery = useDashboard();
  const mutations = useTaskMutations();

  const tasks = tasksQuery.data?.data ?? [];
  const meta = tasksQuery.data?.meta;
  const projects = projectsQuery.data?.data ?? [];
  const users = usersQuery.data?.data ?? [];
  const statuses = taskStatusOptions(dashboardQuery.data?.tasks_by_status ?? []);

  function resetPage() {
    setPage(1);
  }

  async function runConfirmAction() {
    if (!confirmAction) return;

    if (confirmAction.type === "delete") await mutations.delete.mutateAsync(confirmAction.task.id);
    if (confirmAction.type === "restore") await mutations.restore.mutateAsync(confirmAction.task.id);
    setConfirmAction(null);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Manage task assignments, statuses, priorities, due dates, and deleted records from one workspace.
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => tasksQuery.refetch()} disabled={tasksQuery.isFetching}>
            <RefreshCcw className={cn("size-4", tasksQuery.isFetching && "animate-spin")} />
            Refresh
          </Button>
          <Button type="button" onClick={() => setTaskDialog({ mode: "create" })}>
            <Plus className="size-4" />
            Create Task
          </Button>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Task List</CardTitle>
          <CardDescription>Search, filter, sort, assign, update status, and manage task records.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 xl:grid-cols-[1.3fr_1fr_1fr_1fr_1fr_1fr_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(event) => { setSearch(event.target.value); resetPage(); }} className="pl-8" placeholder="Search tasks" />
            </div>
            <NativeSelect label="Project" value={projectId} onChange={(value) => { setProjectId(value); resetPage(); }} options={[{ label: "All projects", value: "" }, ...projects.map((project) => ({ label: project.name, value: String(project.id) }))]} />
            <NativeSelect label="Assignee" value={assigneeId} onChange={(value) => { setAssigneeId(value); resetPage(); }} options={[{ label: "All assignees", value: "" }, ...users.map((user) => ({ label: user.name, value: String(user.id) }))]} />
            <NativeSelect label="Status" value={statusId} onChange={(value) => { setStatusId(value); resetPage(); }} options={[{ label: "All statuses", value: "" }, ...statuses.map((status) => ({ label: status.name, value: String(status.status_id) }))]} />
            <NativeSelect label="Priority" value={priority} onChange={(value) => { setPriority(value as "" | TaskPriority); resetPage(); }} options={[{ label: "All priorities", value: "" }, ...taskPriorities.map((item) => ({ label: titleCase(item), value: item }))]} />
            <NativeSelect label="Deleted" value={trashed} onChange={(value) => { setTrashed(value as "" | "with" | "only"); resetPage(); }} options={[{ label: "Active records", value: "" }, { label: "Include deleted", value: "with" }, { label: "Deleted only", value: "only" }]} />
            <div className="flex gap-2">
              <NativeSelect label="Sort" value={sort} onChange={(value) => { setSort(value as SortField); resetPage(); }} options={sortOptions} />
              <Button type="button" variant="outline" onClick={() => { setDirection(direction === "asc" ? "desc" : "asc"); resetPage(); }}>
                {direction === "asc" ? <ArrowUp className="size-4" /> : <ArrowDown className="size-4" />}
                {direction.toUpperCase()}
              </Button>
            </div>
          </div>

          {tasksQuery.isLoading ? <TasksTableSkeleton /> : null}
          {tasksQuery.isError ? <ErrorState message={getApiErrorMessage(tasksQuery.error)} onRetry={() => tasksQuery.refetch()} /> : null}
          {!tasksQuery.isLoading && !tasksQuery.isError && tasks.length === 0 ? <EmptyState /> : null}
          {!tasksQuery.isLoading && !tasksQuery.isError && tasks.length > 0 ? (
            <TasksTable
              tasks={tasks}
              onView={setViewTask}
              onEdit={(task) => setTaskDialog({ mode: "edit", task })}
              onAssign={setAssignTask}
              onStatus={setStatusTask}
              onConfirm={setConfirmAction}
            />
          ) : null}

          {meta ? (
            <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">Showing {meta.from ?? 0}-{meta.to ?? 0} of {meta.total} tasks</p>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" disabled={meta.current_page <= 1} onClick={() => setPage((current) => Math.max(current - 1, 1))}>Previous</Button>
                <span className="text-xs text-muted-foreground">Page {meta.current_page} of {meta.last_page}</span>
                <Button type="button" variant="outline" disabled={meta.current_page >= meta.last_page} onClick={() => setPage((current) => current + 1)}>Next</Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <TaskFormDialog
        state={taskDialog}
        projects={projects}
        statuses={statuses}
        isSubmitting={mutations.create.isPending || mutations.update.isPending}
        onClose={() => setTaskDialog(null)}
        onSubmit={async (values) => {
          if (!taskDialog) return;
          if (taskDialog.mode === "create") await mutations.create.mutateAsync(toTaskPayload(values));
          if (taskDialog.mode === "edit" && taskDialog.task) await mutations.update.mutateAsync({ taskId: taskDialog.task.id, payload: toTaskPayload(values) });
          setTaskDialog(null);
        }}
      />
      <AssignTaskDialog task={assignTask} isSubmitting={mutations.assign.isPending} onClose={() => setAssignTask(null)} onSubmit={async (values) => { if (!assignTask) return; await mutations.assign.mutateAsync({ taskId: assignTask.id, payload: values }); setAssignTask(null); }} />
      <StatusTaskDialog task={statusTask} statuses={statuses} isSubmitting={mutations.updateStatus.isPending} onClose={() => setStatusTask(null)} onSubmit={async (values) => { if (!statusTask) return; await mutations.updateStatus.mutateAsync({ taskId: statusTask.id, payload: values }); setStatusTask(null); }} />
      <TaskViewDialog task={viewTask} onClose={() => setViewTask(null)} />
      <ConfirmTaskActionDialog action={confirmAction} isSubmitting={mutations.delete.isPending || mutations.restore.isPending} onClose={() => setConfirmAction(null)} onConfirm={runConfirmAction} />
    </div>
  );
}

function TasksTable({ tasks, onView, onEdit, onAssign, onStatus, onConfirm }: { tasks: ManagedTask[]; onView: (task: ManagedTask) => void; onEdit: (task: ManagedTask) => void; onAssign: (task: ManagedTask) => void; onStatus: (task: ManagedTask) => void; onConfirm: (action: ConfirmAction) => void }) {
  return (
    <div className="border border-border">
      <Table>
        <TableHeader><TableRow><TableHead>Task</TableHead><TableHead>Project</TableHead><TableHead>Assignee</TableHead><TableHead>Status</TableHead><TableHead>Priority</TableHead><TableHead>Due</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
        <TableBody>
          {tasks.map((task) => {
            const deleted = Boolean(task.deleted_at);
            return (
              <TableRow key={task.id} className={deleted ? "bg-muted/30" : undefined}>
                <TableCell><div><p className="font-medium">{task.title}</p><p className="max-w-72 truncate text-muted-foreground">{task.description || "No description"}</p><p className="text-muted-foreground">Created by {task.creator?.name ?? "-"} on {formatDate(task.created_at)}</p></div></TableCell>
                <TableCell>{task.project?.name ?? "-"}</TableCell>
                <TableCell>{task.assignee?.name ?? "Unassigned"}</TableCell>
                <TableCell><div className="flex flex-wrap gap-1"><Badge variant={statusVariant(task.status?.slug)}>{task.status?.name ?? `Status #${task.status_id}`}</Badge>{deleted ? <Badge variant="outline">Deleted</Badge> : null}<Badge variant="outline">{task.progress}%</Badge></div></TableCell>
                <TableCell><Badge variant={priorityVariant(task.priority)}>{titleCase(task.priority)}</Badge></TableCell>
                <TableCell>{formatDate(task.due_date)}</TableCell>
                <TableCell><div className="flex justify-end gap-1"><IconButton label="View task" icon={Eye} onClick={() => onView(task)} />{!deleted ? <IconButton label="Edit task" icon={Pencil} onClick={() => onEdit(task)} /> : null}{!deleted ? <IconButton label="Assign task" icon={Send} onClick={() => onAssign(task)} /> : null}{!deleted ? <IconButton label="Update status" icon={CheckCircle2} onClick={() => onStatus(task)} /> : null}{!deleted ? <IconButton label="Delete task" icon={Trash2} onClick={() => onConfirm({ type: "delete", task })} destructive /> : <IconButton label="Restore task" icon={RotateCcw} onClick={() => onConfirm({ type: "restore", task })} />}</div></TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function TaskFormDialog({ state, projects, statuses, isSubmitting, onClose, onSubmit }: { state: TaskDialogState; projects: ManagedProject[]; statuses: DashboardTaskStatus[]; isSubmitting: boolean; onClose: () => void; onSubmit: (values: TaskFormValues) => Promise<void> }) {
  const isEdit = state?.mode === "edit";
  const defaultStatus = statuses[0]?.status_id ?? fallbackTaskStatuses[0].status_id;
  const form = useForm<TaskFormValues>({ resolver: zodResolver(taskSchema), defaultValues: { project_id: 0, status_id: defaultStatus, assigned_to_id: null, title: "", description: "", priority: "medium", progress: 0, due_date: "" } });
  const selectedProjectId = useWatch({ control: form.control, name: "project_id" });
  const projectMembersQuery = useProjectMembers(selectedProjectId || undefined, { per_page: 100, sort: "created_at", direction: "desc" });
  const assignees = (projectMembersQuery.data?.data ?? []).map((member) => member.user).filter((user): user is ManagedUser => Boolean(user));

  useEffect(() => {
    if (!state) return;
    form.reset({
      project_id: state.task?.project_id ?? projects[0]?.id ?? 0,
      status_id: state.task?.status_id ?? defaultStatus,
      assigned_to_id: state.task?.assigned_to_id ?? null,
      title: state.task?.title ?? "",
      description: state.task?.description ?? "",
      priority: state.task?.priority ?? "medium",
      progress: state.task?.progress ?? 0,
      due_date: state.task?.due_date ?? "",
    });
  }, [defaultStatus, form, projects, state]);

  async function submit(values: TaskFormValues) {
    try {
      await onSubmit(values);
      form.reset();
    } catch (error) {
      Object.entries(getValidationErrors(error)).forEach(([field, messages]) => form.setError(field as keyof TaskFormValues, { type: "server", message: messages[0] }));
    }
  }

  return (
    <Dialog open={Boolean(state)} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader><DialogTitle>{isEdit ? "Edit Task" : "Create Task"}</DialogTitle><DialogDescription>Tasks can only be assigned to members of the selected project.</DialogDescription></DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title" error={form.formState.errors.title?.message}><Input aria-invalid={Boolean(form.formState.errors.title)} {...form.register("title")} /></Field>
          <Field label="Project" error={form.formState.errors.project_id?.message}><select aria-label="Project" className="h-8 w-full border border-input bg-background px-2.5 text-xs" {...form.register("project_id", { valueAsNumber: true })}><option value={0}>Select project</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></Field>
          <Field label="Status" error={form.formState.errors.status_id?.message}><select aria-label="Status" className="h-8 w-full border border-input bg-background px-2.5 text-xs" {...form.register("status_id", { valueAsNumber: true })}>{statuses.map((status) => <option key={status.status_id} value={status.status_id}>{status.name}</option>)}</select></Field>
          <Field label="Assignee" error={form.formState.errors.assigned_to_id?.message}><select aria-label="Assignee" className="h-8 w-full border border-input bg-background px-2.5 text-xs" {...form.register("assigned_to_id", { setValueAs: (value) => value ? Number(value) : null })}><option value="">Unassigned</option>{assignees.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</select></Field>
          <Field label="Priority" error={form.formState.errors.priority?.message}><select aria-label="Priority" className="h-8 w-full border border-input bg-background px-2.5 text-xs" {...form.register("priority")}>{taskPriorities.map((item) => <option key={item} value={item}>{titleCase(item)}</option>)}</select></Field>
          <Field label="Progress" error={form.formState.errors.progress?.message}><Input type="number" min={0} max={100} {...form.register("progress", { valueAsNumber: true })} /></Field>
          <Field label="Due Date" error={form.formState.errors.due_date?.message}><Input type="date" {...form.register("due_date")} /></Field>
          <Field label="Description" error={form.formState.errors.description?.message}><Textarea className="min-h-24" {...form.register("description")} /></Field>
        </div>
        <DialogFooter><Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button><Button type="button" onClick={form.handleSubmit(submit)} disabled={isSubmitting}>{isSubmitting ? "Saving..." : isEdit ? "Save Changes" : "Create Task"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AssignTaskDialog({ task, isSubmitting, onClose, onSubmit }: { task: ManagedTask | null; isSubmitting: boolean; onClose: () => void; onSubmit: (values: AssignTaskFormValues) => Promise<void> }) {
  const form = useForm<AssignTaskFormValues>({ resolver: zodResolver(assignTaskSchema), defaultValues: { assigned_to_id: 0 } });
  const membersQuery = useProjectMembers(task?.project_id, { per_page: 100, sort: "created_at", direction: "desc" });
  const assignees = (membersQuery.data?.data ?? []).map((member) => member.user).filter((user): user is ManagedUser => Boolean(user));
  useEffect(() => { if (task) form.reset({ assigned_to_id: task.assigned_to_id ?? 0 }); }, [form, task]);
  async function submit(values: AssignTaskFormValues) { try { await onSubmit(values); } catch (error) { Object.entries(getValidationErrors(error)).forEach(([field, messages]) => form.setError(field as keyof AssignTaskFormValues, { type: "server", message: messages[0] })); } }
  return <Dialog open={Boolean(task)} onOpenChange={(open) => (!open ? onClose() : undefined)}><DialogContent><DialogHeader><DialogTitle>Assign Task</DialogTitle><DialogDescription>{task ? `Assign ${task.title} to a project member.` : "Assign task."}</DialogDescription></DialogHeader><Field label="Assignee" error={form.formState.errors.assigned_to_id?.message}><select aria-label="Assignee" className="h-8 w-full border border-input bg-background px-2.5 text-xs" {...form.register("assigned_to_id", { valueAsNumber: true })}><option value={0}>Select assignee</option>{assignees.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</select></Field><DialogFooter><Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button><Button type="button" onClick={form.handleSubmit(submit)} disabled={isSubmitting || assignees.length === 0}>{isSubmitting ? "Assigning..." : "Assign Task"}</Button></DialogFooter></DialogContent></Dialog>;
}

function StatusTaskDialog({ task, statuses, isSubmitting, onClose, onSubmit }: { task: ManagedTask | null; statuses: DashboardTaskStatus[]; isSubmitting: boolean; onClose: () => void; onSubmit: (values: UpdateTaskStatusFormValues) => Promise<void> }) {
  const form = useForm<UpdateTaskStatusFormValues>({ resolver: zodResolver(updateTaskStatusSchema), defaultValues: { status_id: statuses[0]?.status_id ?? 1, progress: 0 } });
  useEffect(() => { if (task) form.reset({ status_id: task.status_id, progress: task.progress }); }, [form, task]);
  async function submit(values: UpdateTaskStatusFormValues) { try { await onSubmit(values); } catch (error) { Object.entries(getValidationErrors(error)).forEach(([field, messages]) => form.setError(field as keyof UpdateTaskStatusFormValues, { type: "server", message: messages[0] })); } }
  return <Dialog open={Boolean(task)} onOpenChange={(open) => (!open ? onClose() : undefined)}><DialogContent><DialogHeader><DialogTitle>Update Task Status</DialogTitle><DialogDescription>{task ? `Update status and progress for ${task.title}.` : "Update task status."}</DialogDescription></DialogHeader><div className="grid gap-4 sm:grid-cols-2"><Field label="Status" error={form.formState.errors.status_id?.message}><select aria-label="Status" className="h-8 w-full border border-input bg-background px-2.5 text-xs" {...form.register("status_id", { valueAsNumber: true })}>{statuses.map((status) => <option key={status.status_id} value={status.status_id}>{status.name}</option>)}</select></Field><Field label="Progress" error={form.formState.errors.progress?.message}><Input type="number" min={0} max={100} {...form.register("progress", { valueAsNumber: true })} /></Field></div><DialogFooter><Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button><Button type="button" onClick={form.handleSubmit(submit)} disabled={isSubmitting}>{isSubmitting ? "Updating..." : "Update Status"}</Button></DialogFooter></DialogContent></Dialog>;
}

function TaskViewDialog({ task, onClose }: { task: ManagedTask | null; onClose: () => void }) {
  return (
    <Dialog open={Boolean(task)} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Task Details</DialogTitle>
          <DialogDescription>Task metadata, ownership, assignment, lifecycle status, and discussion.</DialogDescription>
        </DialogHeader>
        {task ? (
          <div className="space-y-5">
            <div className="grid gap-3 text-xs sm:grid-cols-2">
              <Detail label="Title" value={task.title} />
              <Detail label="Project" value={task.project?.name ?? "-"} />
              <Detail label="Assignee" value={task.assignee?.name ?? "Unassigned"} />
              <Detail label="Status" value={task.status?.name ?? `Status #${task.status_id}`} />
              <Detail label="Priority" value={titleCase(task.priority)} />
              <Detail label="Progress" value={`${task.progress}%`} />
              <Detail label="Due Date" value={formatDate(task.due_date)} />
              <Detail label="Created By" value={task.creator?.name ?? "-"} />
              <Detail label="Created At" value={formatDate(task.created_at)} />
              <Detail label="Completed At" value={formatDate(task.completed_at)} />
              <div className="sm:col-span-2"><Detail label="Description" value={task.description || "-"} /></div>
            </div>
            <TaskCommentsPanel taskId={task.id} />
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
function ConfirmTaskActionDialog({ action, isSubmitting, onClose, onConfirm }: { action: ConfirmAction; isSubmitting: boolean; onClose: () => void; onConfirm: () => Promise<void> }) {
  const isDelete = action?.type === "delete";
  return <Dialog open={Boolean(action)} onOpenChange={(open) => (!open ? onClose() : undefined)}><DialogContent><DialogHeader><DialogTitle>{isDelete ? "Move Task to Deleted Records" : "Restore Task"}</DialogTitle><DialogDescription>{action ? `${isDelete ? "Move to deleted records" : "Restore"} ${action.task.title}?` : "Confirm task action."}</DialogDescription></DialogHeader><DialogFooter><Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button><Button type="button" variant={isDelete ? "destructive" : "default"} onClick={onConfirm} disabled={isSubmitting}>{isSubmitting ? "Working..." : isDelete ? "Delete Task" : "Restore Task"}</Button></DialogFooter></DialogContent></Dialog>;
}

function TasksTableSkeleton() { return <div className="space-y-2 border border-border p-3">{Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-10 w-full" />)}</div>; }
function EmptyState() { return <div className="border border-dashed border-border bg-muted/20 p-8 text-center"><h2 className="text-sm font-medium">No tasks found</h2><p className="mt-2 text-xs text-muted-foreground">Create a task or adjust the search and filters.</p></div>; }
function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) { return <div className="border border-destructive/30 bg-destructive/10 p-4"><p className="text-sm font-medium text-destructive">Unable to load tasks</p><p className="mt-1 text-xs text-muted-foreground">{message}</p><Button type="button" variant="outline" className="mt-3" onClick={onRetry}>Retry</Button></div>; }
function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) { return <label className="space-y-1.5 text-xs font-medium"><span>{label}</span>{children}{error ? <p className="text-xs text-destructive">{error}</p> : null}</label>; }
function Detail({ label, value }: { label: string; value: string }) { return <div className="border border-border p-3"><p className="text-muted-foreground">{label}</p><p className="mt-1 font-medium whitespace-pre-wrap">{value}</p></div>; }
function NativeSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: Array<{ label: string; value: string }> }) { return <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} className="h-8 w-full border border-input bg-background px-2.5 text-xs outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50">{options.map((option) => <option key={`${label}-${option.value}`} value={option.value}>{option.label}</option>)}</select>; }
function IconButton({ label, onClick, icon: Icon, destructive = false }: { label: string; onClick: () => void; icon: LucideIcon; destructive?: boolean }) { return <Button type="button" variant={destructive ? "destructive" : "ghost"} size="icon-sm" onClick={onClick} aria-label={label} title={label}><Icon className="size-4" /></Button>; }



