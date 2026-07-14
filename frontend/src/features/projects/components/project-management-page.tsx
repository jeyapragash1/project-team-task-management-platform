"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Archive,
  ArrowDown,
  ArrowUp,
  Eye,
  FolderKanban,
  Pencil,
  Plus,
  RefreshCcw,
  RotateCcw,
  Search,
  Trash2,
  Users,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useUsers } from "@/features/users/hooks/use-users";
import type { ManagedUser } from "@/features/users/types/user-management.types";
import { getApiErrorMessage, getValidationErrors } from "@/lib/api";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/format-date";

import { useProjectMutations, useProjects } from "../hooks/use-projects";
import { projectSchema, projectStatuses, type ProjectFormValues } from "../schemas/project.schema";
import type {
  ManagedProject,
  ProjectFormPayload,
  ProjectListParams,
  ProjectStatus,
} from "../types/project-management.types";

type SortField = NonNullable<ProjectListParams["sort"]>;
type SortDirection = NonNullable<ProjectListParams["direction"]>;
type ProjectDialogState = { mode: "create" | "edit"; project?: ManagedProject } | null;
type ConfirmAction =
  | { type: "archive"; project: ManagedProject }
  | { type: "activate"; project: ManagedProject }
  | { type: "delete"; project: ManagedProject }
  | { type: "restore"; project: ManagedProject };

const sortOptions: Array<{ label: string; value: SortField }> = [
  { label: "Created", value: "created_at" },
  { label: "Name", value: "name" },
  { label: "Status", value: "status" },
  { label: "Start Date", value: "start_date" },
  { label: "Due Date", value: "due_date" },
  { label: "Updated", value: "updated_at" },
];

function statusLabel(status: ProjectStatus): string {
  return status.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusVariant(status: ProjectStatus): "default" | "secondary" | "destructive" | "outline" {
  if (status === "active") return "secondary";
  if (status === "cancelled") return "destructive";
  if (status === "archived") return "outline";
  return "default";
}

function toProjectPayload(values: ProjectFormValues): ProjectFormPayload {
  return {
    name: values.name,
    description: values.description || null,
    manager_id: values.manager_id,
    status: values.status,
    start_date: values.start_date || null,
    due_date: values.due_date || null,
  };
}

export function ProjectManagementPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"" | ProjectStatus>("");
  const [managerId, setManagerId] = useState("");
  const [trashed, setTrashed] = useState<"" | "with" | "only">("");
  const [sort, setSort] = useState<SortField>("created_at");
  const [direction, setDirection] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);
  const [dialogState, setDialogState] = useState<ProjectDialogState>(null);
  const [viewProject, setViewProject] = useState<ManagedProject | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  const params = useMemo<ProjectListParams>(
    () => ({
      page,
      per_page: 10,
      search: search || undefined,
      status: status || undefined,
      manager_id: managerId ? Number(managerId) : undefined,
      trashed: trashed || undefined,
      sort,
      direction,
    }),
    [direction, managerId, page, search, sort, status, trashed],
  );

  const projectsQuery = useProjects(params);
  const managersQuery = useUsers({ role: "Project Manager", per_page: 100, sort: "name", direction: "asc" });
  const mutations = useProjectMutations();
  const projects = projectsQuery.data?.data ?? [];
  const meta = projectsQuery.data?.meta;
  const managers = managersQuery.data?.data ?? [];

  function resetPage() {
    setPage(1);
  }

  async function runConfirmAction() {
    if (!confirmAction) return;
    if (confirmAction.type === "archive") await mutations.archive.mutateAsync(confirmAction.project.id);
    if (confirmAction.type === "activate") await mutations.activate.mutateAsync(confirmAction.project.id);
    if (confirmAction.type === "delete") await mutations.delete.mutateAsync(confirmAction.project.id);
    if (confirmAction.type === "restore") await mutations.restore.mutateAsync(confirmAction.project.id);
    setConfirmAction(null);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Manage project records, manager assignments, project lifecycle status, archived projects, and soft-deleted records.
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => projectsQuery.refetch()} disabled={projectsQuery.isFetching}>
            <RefreshCcw className={cn("size-4", projectsQuery.isFetching && "animate-spin")} />
            Refresh
          </Button>
          <Button type="button" onClick={() => setDialogState({ mode: "create" })}>
            <Plus className="size-4" />
            Create Project
          </Button>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Project List</CardTitle>
          <CardDescription>Search, filter, sort, and manage projects from the backend API.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 xl:grid-cols-[1.4fr_1fr_1fr_1fr_1fr_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  resetPage();
                }}
                className="pl-8"
                placeholder="Search projects"
              />
            </div>
            <NativeSelect label="Status" value={status} onChange={(value) => { setStatus(value as "" | ProjectStatus); resetPage(); }} options={[{ label: "All statuses", value: "" }, ...projectStatuses.map((item) => ({ label: statusLabel(item), value: item }))]} />
            <NativeSelect label="Manager" value={managerId} onChange={(value) => { setManagerId(value); resetPage(); }} options={[{ label: "All managers", value: "" }, ...managers.map((manager) => ({ label: manager.name, value: String(manager.id) }))]} />
            <NativeSelect label="Deleted" value={trashed} onChange={(value) => { setTrashed(value as "" | "with" | "only"); resetPage(); }} options={[{ label: "Active records", value: "" }, { label: "Include deleted", value: "with" }, { label: "Deleted only", value: "only" }]} />
            <NativeSelect label="Sort" value={sort} onChange={(value) => { setSort(value as SortField); resetPage(); }} options={sortOptions} />
            <Button type="button" variant="outline" onClick={() => { setDirection(direction === "asc" ? "desc" : "asc"); resetPage(); }}>
              {direction === "asc" ? <ArrowUp className="size-4" /> : <ArrowDown className="size-4" />}
              {direction.toUpperCase()}
            </Button>
          </div>

          {projectsQuery.isLoading ? <ProjectsTableSkeleton /> : null}
          {projectsQuery.isError ? <ErrorState message={getApiErrorMessage(projectsQuery.error)} onRetry={() => projectsQuery.refetch()} /> : null}
          {!projectsQuery.isLoading && !projectsQuery.isError && projects.length === 0 ? <EmptyState /> : null}
          {!projectsQuery.isLoading && !projectsQuery.isError && projects.length > 0 ? (
            <ProjectsTable
              projects={projects}
              onView={setViewProject}
              onEdit={(project) => setDialogState({ mode: "edit", project })}
              onConfirm={setConfirmAction}
            />
          ) : null}

          {meta ? (
            <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">Showing {meta.from ?? 0}-{meta.to ?? 0} of {meta.total} projects</p>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" disabled={meta.current_page <= 1} onClick={() => setPage((current) => Math.max(current - 1, 1))}>Previous</Button>
                <span className="text-xs text-muted-foreground">Page {meta.current_page} of {meta.last_page}</span>
                <Button type="button" variant="outline" disabled={meta.current_page >= meta.last_page} onClick={() => setPage((current) => current + 1)}>Next</Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <ProjectFormDialog
        state={dialogState}
        managers={managers}
        isSubmitting={mutations.create.isPending || mutations.update.isPending}
        onClose={() => setDialogState(null)}
        onSubmit={async (values) => {
          if (!dialogState) return;
          if (dialogState.mode === "create") await mutations.create.mutateAsync(toProjectPayload(values));
          if (dialogState.mode === "edit" && dialogState.project) await mutations.update.mutateAsync({ projectId: dialogState.project.id, payload: toProjectPayload(values) });
          setDialogState(null);
        }}
      />
      <ProjectViewDialog project={viewProject} onClose={() => setViewProject(null)} />
      <ConfirmProjectActionDialog action={confirmAction} isSubmitting={mutations.archive.isPending || mutations.activate.isPending || mutations.delete.isPending || mutations.restore.isPending} onClose={() => setConfirmAction(null)} onConfirm={runConfirmAction} />
    </div>
  );
}

function ProjectsTable({ projects, onView, onEdit, onConfirm }: { projects: ManagedProject[]; onView: (project: ManagedProject) => void; onEdit: (project: ManagedProject) => void; onConfirm: (action: ConfirmAction) => void }) {
  return (
    <div className="border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project</TableHead>
            <TableHead>Manager</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Counts</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => {
            const deleted = Boolean(project.deleted_at);
            return (
              <TableRow key={project.id} className={deleted ? "bg-muted/30" : undefined}>
                <TableCell>
                  <div>
                    <p className="font-medium">{project.name}</p>
                    <p className="max-w-64 truncate text-muted-foreground">{project.description || project.slug}</p>
                    <p className="text-muted-foreground">Created by {project.creator?.name ?? "-"}</p>
                  </div>
                </TableCell>
                <TableCell>{project.manager?.name ?? "-"}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant={statusVariant(project.status)}>{statusLabel(project.status)}</Badge>
                    {deleted ? <Badge variant="outline">Deleted</Badge> : null}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Users className="size-3" /> {project.members_count ?? 0} members</span>
                    <span className="inline-flex items-center gap-1"><FolderKanban className="size-3" /> {project.tasks_count ?? 0} tasks</span>
                  </div>
                </TableCell>
                <TableCell>{formatDate(project.due_date)}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <IconButton label="View project" icon={Eye} onClick={() => onView(project)} />
                    {!deleted ? <IconButton label="Edit project" icon={Pencil} onClick={() => onEdit(project)} /> : null}
                    {!deleted && project.status !== "archived" ? <IconButton label="Archive project" icon={Archive} onClick={() => onConfirm({ type: "archive", project })} /> : null}
                    {!deleted && project.status === "archived" ? <IconButton label="Activate project" icon={Zap} onClick={() => onConfirm({ type: "activate", project })} /> : null}
                    {!deleted ? <IconButton label="Delete project" icon={Trash2} onClick={() => onConfirm({ type: "delete", project })} destructive /> : <IconButton label="Restore project" icon={RotateCcw} onClick={() => onConfirm({ type: "restore", project })} />}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function ProjectFormDialog({ state, managers, isSubmitting, onClose, onSubmit }: { state: ProjectDialogState; managers: ManagedUser[]; isSubmitting: boolean; onClose: () => void; onSubmit: (values: ProjectFormValues) => Promise<void> }) {
  const isEdit = state?.mode === "edit";
  const form = useForm<ProjectFormValues>({ resolver: zodResolver(projectSchema), defaultValues: { name: "", description: "", manager_id: 0, start_date: "", due_date: "", status: "active" } });

  useEffect(() => {
    if (!state) return;
    form.reset({
      name: state.project?.name ?? "",
      description: state.project?.description ?? "",
      manager_id: state.project?.manager?.id ?? managers[0]?.id ?? 0,
      start_date: state.project?.start_date ?? "",
      due_date: state.project?.due_date ?? "",
      status: state.project?.status ?? "active",
    });
  }, [form, managers, state]);

  async function submit(values: ProjectFormValues) {
    try {
      await onSubmit(values);
      form.reset();
    } catch (error) {
      Object.entries(getValidationErrors(error)).forEach(([field, messages]) => {
        form.setError(field as keyof ProjectFormValues, { type: "server", message: messages[0] });
      });
    }
  }

  return (
    <Dialog open={Boolean(state)} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Project" : "Create Project"}</DialogTitle>
          <DialogDescription>Assign a project manager and manage lifecycle metadata.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" error={form.formState.errors.name?.message}><Input aria-invalid={Boolean(form.formState.errors.name)} {...form.register("name")} /></Field>
          <Field label="Manager" error={form.formState.errors.manager_id?.message}>
            <select aria-label="Manager" className="h-8 w-full border border-input bg-background px-2.5 text-xs" {...form.register("manager_id", { valueAsNumber: true })}>
              <option value={0}>Select manager</option>
              {managers.map((manager) => <option key={manager.id} value={manager.id}>{manager.name}</option>)}
            </select>
          </Field>
          <Field label="Start Date" error={form.formState.errors.start_date?.message}><Input type="date" {...form.register("start_date")} /></Field>
          <Field label="Due Date" error={form.formState.errors.due_date?.message}><Input type="date" {...form.register("due_date")} /></Field>
          <Field label="Status" error={form.formState.errors.status?.message}>
            <select aria-label="Status" className="h-8 w-full border border-input bg-background px-2.5 text-xs" {...form.register("status")}>
              {projectStatuses.map((item) => <option key={item} value={item}>{statusLabel(item)}</option>)}
            </select>
          </Field>
          <Field label="Description" error={form.formState.errors.description?.message}>
            <Textarea className="min-h-24 sm:col-span-2" {...form.register("description")} />
          </Field>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button type="button" onClick={form.handleSubmit(submit)} disabled={isSubmitting}>{isSubmitting ? "Saving..." : isEdit ? "Save Changes" : "Create Project"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ProjectViewDialog({ project, onClose }: { project: ManagedProject | null; onClose: () => void }) {
  return (
    <Dialog open={Boolean(project)} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader><DialogTitle>Project Details</DialogTitle><DialogDescription>Project metadata and summary counts.</DialogDescription></DialogHeader>
        {project ? <div className="grid gap-3 text-xs sm:grid-cols-2">
          <Detail label="Name" value={project.name} />
          <Detail label="Status" value={statusLabel(project.status)} />
          <Detail label="Manager" value={project.manager?.name ?? "-"} />
          <Detail label="Created By" value={project.creator?.name ?? "-"} />
          <Detail label="Members" value={String(project.members_count ?? 0)} />
          <Detail label="Tasks" value={String(project.tasks_count ?? 0)} />
          <Detail label="Start Date" value={formatDate(project.start_date)} />
          <Detail label="Due Date" value={formatDate(project.due_date)} />
          <div className="sm:col-span-2"><Detail label="Description" value={project.description || "-"} /></div>
        </div> : null}
      </DialogContent>
    </Dialog>
  );
}

function ConfirmProjectActionDialog({ action, isSubmitting, onClose, onConfirm }: { action: ConfirmAction | null; isSubmitting: boolean; onClose: () => void; onConfirm: () => Promise<void> }) {
  const copy = getConfirmCopy(action);
  return <Dialog open={Boolean(action)} onOpenChange={(open) => (!open ? onClose() : undefined)}><DialogContent><DialogHeader><DialogTitle>{copy.title}</DialogTitle><DialogDescription>{copy.description}</DialogDescription></DialogHeader><DialogFooter><Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button><Button type="button" variant={action?.type === "delete" ? "destructive" : "default"} onClick={onConfirm} disabled={isSubmitting}>{isSubmitting ? "Working..." : copy.actionLabel}</Button></DialogFooter></DialogContent></Dialog>;
}

function getConfirmCopy(action: ConfirmAction | null) {
  if (!action) return { title: "Confirm action", description: "Confirm this project action.", actionLabel: "Confirm" };
  if (action.type === "archive") return { title: "Archive Project", description: `Archive ${action.project.name}?`, actionLabel: "Archive" };
  if (action.type === "activate") return { title: "Activate Project", description: `Activate ${action.project.name}?`, actionLabel: "Activate" };
  if (action.type === "restore") return { title: "Restore Project", description: `Restore ${action.project.name}?`, actionLabel: "Restore" };
  return { title: "Move Project to Deleted Records", description: `Move ${action.project.name} to deleted records? You can restore it later.`, actionLabel: "Delete" };
}

function ProjectsTableSkeleton() { return <div className="space-y-2 border border-border p-3">{Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-10 w-full" />)}</div>; }
function EmptyState() { return <div className="border border-dashed border-border bg-muted/20 p-8 text-center"><h2 className="text-sm font-medium">No projects found</h2><p className="mt-2 text-xs text-muted-foreground">Try adjusting the search or filters.</p></div>; }
function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) { return <div className="border border-destructive/30 bg-destructive/10 p-4"><p className="text-sm font-medium text-destructive">Unable to load projects</p><p className="mt-1 text-xs text-muted-foreground">{message}</p><Button type="button" variant="outline" className="mt-3" onClick={onRetry}>Retry</Button></div>; }
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) { return <label className="space-y-1.5 text-xs font-medium"><span>{label}</span>{children}{error ? <p className="text-xs text-destructive">{error}</p> : null}</label>; }
function Detail({ label, value }: { label: string; value: string }) { return <div className="border border-border p-3"><p className="text-muted-foreground">{label}</p><p className="mt-1 font-medium whitespace-pre-wrap">{value}</p></div>; }
function NativeSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: Array<{ label: string; value: string }> }) { return <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} className="h-8 w-full border border-input bg-background px-2.5 text-xs outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50">{options.map((option) => <option key={`${label}-${option.value}`} value={option.value}>{option.label}</option>)}</select>; }
function IconButton({ label, onClick, icon: Icon, destructive = false }: { label: string; onClick: () => void; icon: typeof Eye; destructive?: boolean }) { return <Button type="button" variant={destructive ? "destructive" : "ghost"} size="icon-sm" onClick={onClick} aria-label={label} title={label}><Icon className="size-4" /></Button>; }


