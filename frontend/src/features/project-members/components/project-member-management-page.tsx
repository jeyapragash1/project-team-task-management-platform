"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
  UserPlus,
  UsersRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
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
import { useProjects } from "@/features/projects/hooks/use-projects";
import type { ManagedProject } from "@/features/projects/types/project-management.types";
import { useUsers } from "@/features/users/hooks/use-users";
import type { ManagedUser } from "@/features/users/types/user-management.types";
import { getApiErrorMessage, getValidationErrors } from "@/lib/api";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/format-date";

import { useProjectMemberMutations, useProjectMembers } from "../hooks/use-project-members";
import {
  addProjectMemberSchema,
  type AddProjectMemberFormValues,
} from "../schemas/project-member.schema";
import type { ProjectMember, ProjectMemberListParams } from "../types/project-member-management.types";

type SortField = NonNullable<ProjectMemberListParams["sort"]>;
type SortDirection = NonNullable<ProjectMemberListParams["direction"]>;
type ConfirmAction = { type: "remove"; member: ProjectMember } | null;

const sortOptions: Array<{ label: string; value: SortField }> = [
  { label: "Created", value: "created_at" },
  { label: "Updated", value: "updated_at" },
  { label: "ID", value: "id" },
];

function rolesLabel(user?: ManagedUser | null) {
  if (!user?.roles?.length) {
    return "No role";
  }

  return user.roles.join(", ");
}

export function ProjectMemberManagementPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortField>("created_at");
  const [direction, setDirection] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [viewMember, setViewMember] = useState<ProjectMember | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  const projectParams = useMemo(
    () => ({ per_page: 100, sort: "name", direction: "asc" as const }),
    [],
  );
  const memberParams = useMemo<ProjectMemberListParams>(
    () => ({
      page,
      per_page: 10,
      search: search || undefined,
      sort,
      direction,
    }),
    [direction, page, search, sort],
  );

  const projectsQuery = useProjects(projectParams);
  const usersQuery = useUsers({ status: "active", per_page: 100, sort: "name", direction: "asc" });
  const projects = projectsQuery.data?.data ?? [];
  const activeProjectId = selectedProjectId ?? projects[0]?.id;
  const membersQuery = useProjectMembers(activeProjectId, memberParams);
  const mutations = useProjectMemberMutations();

  const users = usersQuery.data?.data ?? [];
  const members = membersQuery.data?.data ?? [];
  const meta = membersQuery.data?.meta;
  const selectedProject = projects.find((project) => project.id === activeProjectId);
  const existingUserIds = new Set(members.map((member) => member.user?.id).filter(Boolean));
  const availableUsers = users.filter((user) => !existingUserIds.has(user.id));
function resetPage() {
    setPage(1);
  }

  async function confirmRemove() {
    if (!confirmAction || !selectedProjectId) return;

    await mutations.remove.mutateAsync({ projectId: selectedProjectId, memberId: confirmAction.member.id });
    setConfirmAction(null);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Project Members</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Select a project, review its assigned members, and manage membership through the Laravel project member API.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => membersQuery.refetch()}
            disabled={!activeProjectId || membersQuery.isFetching}
          >
            <RefreshCcw className={cn("size-4", membersQuery.isFetching && "animate-spin")} />
            Refresh
          </Button>
          <Button type="button" onClick={() => setIsAddDialogOpen(true)} disabled={!activeProjectId}>
            <Plus className="size-4" />
            Add Member
          </Button>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Select Project</CardTitle>
          <CardDescription>Membership actions are scoped to the selected project.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <NativeSelect
            label="Project"
            value={activeProjectId ? String(activeProjectId) : ""}
            onChange={(value) => {
              setSelectedProjectId(value ? Number(value) : undefined);
              resetPage();
            }}
            options={[
              { label: projectsQuery.isLoading ? "Loading projects..." : "Select project", value: "" },
              ...projects.map((project) => ({ label: project.name, value: String(project.id) })),
            ]}
          />
          <ProjectSummary project={selectedProject} isLoading={projectsQuery.isLoading} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Member List</CardTitle>
          <CardDescription>Search, sort, view, and remove members from the selected project.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_180px_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  resetPage();
                }}
                className="pl-8"
                placeholder="Search by name or email"
                disabled={!selectedProjectId}
              />
            </div>
            <NativeSelect
              label="Sort"
              value={sort}
              onChange={(value) => {
                setSort(value as SortField);
                resetPage();
              }}
              options={sortOptions}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDirection(direction === "asc" ? "desc" : "asc");
                resetPage();
              }}
              disabled={!selectedProjectId}
            >
              {direction === "asc" ? <ArrowUp className="size-4" /> : <ArrowDown className="size-4" />}
              {direction.toUpperCase()}
            </Button>
          </div>

          {!activeProjectId ? <NoProjectState /> : null}
          {activeProjectId && membersQuery.isLoading ? <MembersTableSkeleton /> : null}
          {activeProjectId && membersQuery.isError ? (
            <ErrorState message={getApiErrorMessage(membersQuery.error)} onRetry={() => membersQuery.refetch()} />
          ) : null}
          {activeProjectId && !membersQuery.isLoading && !membersQuery.isError && members.length === 0 ? <EmptyState /> : null}
          {activeProjectId && !membersQuery.isLoading && !membersQuery.isError && members.length > 0 ? (
            <MembersTable members={members} onView={setViewMember} onRemove={(member) => setConfirmAction({ type: "remove", member })} />
          ) : null}

          {meta ? (
            <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                Showing {meta.from ?? 0}-{meta.to ?? 0} of {meta.total} members
              </p>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" disabled={meta.current_page <= 1} onClick={() => setPage((current) => Math.max(current - 1, 1))}>
                  Previous
                </Button>
                <span className="text-xs text-muted-foreground">
                  Page {meta.current_page} of {meta.last_page}
                </span>
                <Button type="button" variant="outline" disabled={meta.current_page >= meta.last_page} onClick={() => setPage((current) => current + 1)}>
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <AddMemberDialog
        open={isAddDialogOpen}
        project={selectedProject}
        users={availableUsers}
        isLoadingUsers={usersQuery.isLoading || membersQuery.isLoading}
        isSubmitting={mutations.add.isPending}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={async (values) => {
          if (!selectedProjectId) return;
          await mutations.add.mutateAsync({ projectId: selectedProjectId, payload: { user_ids: [values.user_id] } });
          setIsAddDialogOpen(false);
        }}
      />
      <MemberViewDialog member={viewMember} onClose={() => setViewMember(null)} />
      <ConfirmRemoveDialog
        action={confirmAction}
        isSubmitting={mutations.remove.isPending}
        onClose={() => setConfirmAction(null)}
        onConfirm={confirmRemove}
      />
    </div>
  );
}

function ProjectSummary({ project, isLoading }: { project?: ManagedProject; isLoading: boolean }) {
  if (isLoading) {
    return <Skeleton className="h-16 w-full" />;
  }

  if (!project) {
    return <div className="border border-dashed border-border p-4 text-xs text-muted-foreground">No project selected.</div>;
  }

  return (
    <div className="grid gap-2 border border-border p-3 text-xs sm:grid-cols-2 lg:grid-cols-1">
      <Detail label="Project Manager" value={project.manager?.name ?? "-"} />
      <Detail label="Members" value={String(project.members_count ?? 0)} />
    </div>
  );
}

function MembersTable({ members, onView, onRemove }: { members: ProjectMember[]; onView: (member: ProjectMember) => void; onRemove: (member: ProjectMember) => void }) {
  return (
    <div className="border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>System Role</TableHead>
            <TableHead>Added By</TableHead>
            <TableHead>Added Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell>
                <div>
                  <p className="font-medium">{member.user?.name ?? "Unknown user"}</p>
                  <p className="text-muted-foreground">{member.user?.email ?? "-"}</p>
                </div>
              </TableCell>
              <TableCell>
                <RoleBadges user={member.user} />
              </TableCell>
              <TableCell>{member.added_by?.name ?? "-"}</TableCell>
              <TableCell>{formatDate(member.created_at)}</TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <IconButton label="View member" icon={Eye} onClick={() => onView(member)} />
                  <IconButton label="Remove member" icon={Trash2} onClick={() => onRemove(member)} destructive />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function AddMemberDialog({
  open,
  project,
  users,
  isLoadingUsers,
  isSubmitting,
  onClose,
  onSubmit,
}: {
  open: boolean;
  project?: ManagedProject;
  users: ManagedUser[];
  isLoadingUsers: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: AddProjectMemberFormValues) => Promise<void>;
}) {
  const form = useForm<AddProjectMemberFormValues>({
    resolver: zodResolver(addProjectMemberSchema),
    defaultValues: { user_id: 0 },
  });

  useEffect(() => {
    if (open) {
      form.reset({ user_id: 0 });
    }
  }, [form, open]);

  async function submit(values: AddProjectMemberFormValues) {
    try {
      await onSubmit(values);
      form.reset();
    } catch (error) {
      const validationErrors = getValidationErrors(error);
      const userMessages = validationErrors.user_ids ?? validationErrors["user_ids.0"];

      if (userMessages?.[0]) {
        form.setError("user_id", { type: "server", message: userMessages[0] });
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (!nextOpen ? onClose() : undefined)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Project Member</DialogTitle>
          <DialogDescription>
            {project ? `Add an active user to ${project.name}. Existing members are excluded.` : "Select a project before adding members."}
          </DialogDescription>
        </DialogHeader>
        <Field label="User" error={form.formState.errors.user_id?.message}>
          <select
            aria-label="User"
            className="h-8 w-full border border-input bg-background px-2.5 text-xs outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
            disabled={isLoadingUsers || users.length === 0}
            {...form.register("user_id", { valueAsNumber: true })}
          >
            <option value={0}>{isLoadingUsers ? "Loading users..." : users.length === 0 ? "No eligible users" : "Select user"}</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
        </Field>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button type="button" onClick={form.handleSubmit(submit)} disabled={isSubmitting || users.length === 0}>
            {isSubmitting ? "Adding..." : "Add Member"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MemberViewDialog({ member, onClose }: { member: ProjectMember | null; onClose: () => void }) {
  return (
    <Dialog open={Boolean(member)} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Member Details</DialogTitle>
          <DialogDescription>Project membership and user metadata.</DialogDescription>
        </DialogHeader>
        {member ? (
          <div className="grid gap-3 text-xs sm:grid-cols-2">
            <Detail label="Name" value={member.user?.name ?? "-"} />
            <Detail label="Email" value={member.user?.email ?? "-"} />
            <Detail label="System Role" value={rolesLabel(member.user)} />
            <Detail label="Status" value={member.user?.is_active ? "Active" : "Inactive"} />
            <Detail label="Added By" value={member.added_by?.name ?? "-"} />
            <Detail label="Added Date" value={formatDate(member.created_at)} />
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function ConfirmRemoveDialog({ action, isSubmitting, onClose, onConfirm }: { action: ConfirmAction; isSubmitting: boolean; onClose: () => void; onConfirm: () => Promise<void> }) {
  return (
    <Dialog open={Boolean(action)} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Project Member</DialogTitle>
          <DialogDescription>
            {action ? `Remove ${action.member.user?.name ?? "this member"} from the selected project?` : "Confirm member removal."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button type="button" variant="destructive" onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? "Removing..." : "Remove Member"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RoleBadges({ user }: { user?: ManagedUser | null }) {
  if (!user?.roles?.length) {
    return <span className="text-xs text-muted-foreground">No role</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {user.roles.map((role) => <Badge key={role} variant="outline">{role}</Badge>)}
    </div>
  );
}

function MembersTableSkeleton() {
  return <div className="space-y-2 border border-border p-3">{Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-10 w-full" />)}</div>;
}

function NoProjectState() {
  return <div className="border border-dashed border-border bg-muted/20 p-8 text-center"><UsersRound className="mx-auto size-8 text-muted-foreground" /><h2 className="mt-3 text-sm font-medium">Select a project</h2><p className="mt-2 text-xs text-muted-foreground">Choose a project to load its members.</p></div>;
}

function EmptyState() {
  return <div className="border border-dashed border-border bg-muted/20 p-8 text-center"><UserPlus className="mx-auto size-8 text-muted-foreground" /><h2 className="mt-3 text-sm font-medium">No members found</h2><p className="mt-2 text-xs text-muted-foreground">Add a member or adjust the search criteria.</p></div>;
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div className="border border-destructive/30 bg-destructive/10 p-4"><p className="text-sm font-medium text-destructive">Unable to load project members</p><p className="mt-1 text-xs text-muted-foreground">{message}</p><Button type="button" variant="outline" className="mt-3" onClick={onRetry}>Retry</Button></div>;
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return <label className="space-y-1.5 text-xs font-medium"><span>{label}</span>{children}{error ? <p className="text-xs text-destructive">{error}</p> : null}</label>;
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div className="border border-border p-3"><p className="text-muted-foreground">{label}</p><p className="mt-1 font-medium">{value}</p></div>;
}

function NativeSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: Array<{ label: string; value: string }> }) {
  return <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} className="h-8 w-full border border-input bg-background px-2.5 text-xs outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50">{options.map((option) => <option key={`${label}-${option.value}`} value={option.value}>{option.label}</option>)}</select>;
}

function IconButton({ label, onClick, icon: Icon, destructive = false }: { label: string; onClick: () => void; icon: LucideIcon; destructive?: boolean }) {
  return <Button type="button" variant={destructive ? "destructive" : "ghost"} size="icon-sm" onClick={onClick} aria-label={label} title={label}><Icon className="size-4" /></Button>;
}



