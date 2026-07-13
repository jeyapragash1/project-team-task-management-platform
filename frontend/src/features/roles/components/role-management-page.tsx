"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  KeyRound,
  Pencil,
  Plus,
  RefreshCcw,
  Search,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

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
import { useAllPermissions } from "@/features/permissions/hooks/use-permissions";
import type { ManagedPermission } from "@/features/permissions/types/permission-management.types";
import { getApiErrorMessage, getValidationErrors } from "@/lib/api";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/format-date";

import { useRoleList, useRoleMutations } from "../hooks/use-roles";
import {
  permissionAssignmentSchema,
  roleSchema,
  type PermissionAssignmentValues,
  type RoleFormValues,
} from "../schemas/role.schema";
import type { ManagedRole, RoleListParams } from "../types/role-management.types";

type SortField = NonNullable<RoleListParams["sort"]>;
type SortDirection = NonNullable<RoleListParams["direction"]>;
type RoleDialogState = { mode: "create" | "edit"; role?: ManagedRole } | null;
type PermissionDialogState = { mode: "assign" | "remove"; role: ManagedRole } | null;
type ConfirmAction = { type: "delete"; role: ManagedRole };

const sortOptions: Array<{ label: string; value: SortField }> = [
  { label: "Name", value: "name" },
  { label: "Guard", value: "guard_name" },
  { label: "Created", value: "created_at" },
  { label: "Updated", value: "updated_at" },
];

function groupPermissions(permissions: ManagedPermission[]) {
  return permissions.reduce<Record<string, ManagedPermission[]>>((groups, permission) => {
    const [moduleName = "system"] = permission.name.split(".");
    const label = moduleName.replaceAll("-", " ").replaceAll("_", " ");
    groups[label] = [...(groups[label] ?? []), permission];
    return groups;
  }, {});
}

function rolePermissions(role: ManagedRole): ManagedPermission[] {
  return Array.isArray(role.permissions) ? role.permissions : [];
}

export function RoleManagementPage() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortField>("name");
  const [direction, setDirection] = useState<SortDirection>("asc");
  const [page, setPage] = useState(1);
  const [roleDialog, setRoleDialog] = useState<RoleDialogState>(null);
  const [permissionDialog, setPermissionDialog] = useState<PermissionDialogState>(null);
  const [viewRole, setViewRole] = useState<ManagedRole | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  const params = useMemo<RoleListParams>(
    () => ({
      page,
      per_page: 10,
      search: search || undefined,
      sort,
      direction,
    }),
    [direction, page, search, sort],
  );

  const rolesQuery = useRoleList(params);
  const permissionsQuery = useAllPermissions();
  const mutations = useRoleMutations();
  const roles = rolesQuery.data?.data ?? [];
  const meta = rolesQuery.data?.meta;
  const permissions = permissionsQuery.data ?? [];

  async function confirmDelete() {
    if (!confirmAction) {
      return;
    }

    await mutations.delete.mutateAsync(confirmAction.role.id);
    setConfirmAction(null);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Roles & Permissions</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Manage scalable role-based access using backend roles, permissions, and policy-aware authorization.
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => rolesQuery.refetch()} disabled={rolesQuery.isFetching}>
            <RefreshCcw className={cn("size-4", rolesQuery.isFetching && "animate-spin")} />
            Refresh
          </Button>
          <Button type="button" onClick={() => setRoleDialog({ mode: "create" })}>
            <Plus className="size-4" />
            Create Role
          </Button>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Roles</CardTitle>
            <CardDescription>Search, sort, inspect, and manage application roles.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  className="pl-8"
                  placeholder="Search roles"
                />
              </div>
              <NativeSelect
                label="Sort"
                value={sort}
                onChange={(value) => {
                  setSort(value as SortField);
                  setPage(1);
                }}
                options={sortOptions}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDirection(direction === "asc" ? "desc" : "asc");
                  setPage(1);
                }}
              >
                {direction === "asc" ? <ArrowUp className="size-4" /> : <ArrowDown className="size-4" />}
                {direction.toUpperCase()}
              </Button>
            </div>

            {rolesQuery.isLoading ? <RolesTableSkeleton /> : null}
            {rolesQuery.isError ? (
              <ErrorState message={getApiErrorMessage(rolesQuery.error)} onRetry={() => rolesQuery.refetch()} />
            ) : null}
            {!rolesQuery.isLoading && !rolesQuery.isError && roles.length === 0 ? <EmptyState /> : null}
            {!rolesQuery.isLoading && !rolesQuery.isError && roles.length > 0 ? (
              <RolesTable
                roles={roles}
                onView={setViewRole}
                onEdit={(role) => setRoleDialog({ mode: "edit", role })}
                onAssign={(role) => setPermissionDialog({ mode: "assign", role })}
                onRemove={(role) => setPermissionDialog({ mode: "remove", role })}
                onDelete={(role) => setConfirmAction({ type: "delete", role })}
              />
            ) : null}

            {meta ? (
              <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground">
                  Showing {meta.from ?? 0}-{meta.to ?? 0} of {meta.total} roles
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

        <PermissionsPanel permissions={permissions} isLoading={permissionsQuery.isLoading} isError={permissionsQuery.isError} />
      </div>

      <RoleFormDialog
        state={roleDialog}
        permissions={permissions}
        isSubmitting={mutations.create.isPending || mutations.update.isPending}
        onClose={() => setRoleDialog(null)}
        onSubmit={async (values) => {
          if (!roleDialog) return;
          if (roleDialog.mode === "create") {
            await mutations.create.mutateAsync(values);
          } else if (roleDialog.role) {
            await mutations.update.mutateAsync({ roleId: roleDialog.role.id, payload: values });
          }
          setRoleDialog(null);
        }}
      />

      <PermissionDialog
        state={permissionDialog}
        permissions={permissions}
        isSubmitting={mutations.assignPermissions.isPending || mutations.removePermissions.isPending}
        onClose={() => setPermissionDialog(null)}
        onSubmit={async (values) => {
          if (!permissionDialog) return;
          const payload = { permissions: values.permissions };
          if (permissionDialog.mode === "assign") {
            await mutations.assignPermissions.mutateAsync({ roleId: permissionDialog.role.id, payload });
          } else {
            await mutations.removePermissions.mutateAsync({ roleId: permissionDialog.role.id, payload });
          }
          setPermissionDialog(null);
        }}
      />

      <RoleViewDialog role={viewRole} onClose={() => setViewRole(null)} />
      <ConfirmDeleteDialog
        action={confirmAction}
        isSubmitting={mutations.delete.isPending}
        onClose={() => setConfirmAction(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

function RolesTable({
  roles,
  onView,
  onEdit,
  onAssign,
  onRemove,
  onDelete,
}: {
  roles: ManagedRole[];
  onView: (role: ManagedRole) => void;
  onEdit: (role: ManagedRole) => void;
  onAssign: (role: ManagedRole) => void;
  onRemove: (role: ManagedRole) => void;
  onDelete: (role: ManagedRole) => void;
}) {
  return (
    <div className="border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Role</TableHead>
            <TableHead>Permissions</TableHead>
            <TableHead>Guard</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.map((role) => (
            <TableRow key={role.id}>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <p className="font-medium">{role.name}</p>
                  {role.is_protected ? <Badge variant="secondary">Protected</Badge> : null}
                </div>
              </TableCell>
              <TableCell>
                <PermissionBadges permissions={rolePermissions(role)} max={4} />
              </TableCell>
              <TableCell>{role.guard_name}</TableCell>
              <TableCell>{formatDate(role.created_at)}</TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <IconButton label="View role" icon={Eye} onClick={() => onView(role)} />
                  <IconButton label="Assign permissions" icon={KeyRound} onClick={() => onAssign(role)} />
                  <IconButton label="Remove permissions" icon={ShieldCheck} onClick={() => onRemove(role)} />
                  {!role.is_protected ? <IconButton label="Edit role" icon={Pencil} onClick={() => onEdit(role)} /> : null}
                  {!role.is_protected ? <IconButton label="Delete role" icon={Trash2} onClick={() => onDelete(role)} destructive /> : null}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function RoleFormDialog({
  state,
  permissions,
  isSubmitting,
  onClose,
  onSubmit,
}: {
  state: RoleDialogState;
  permissions: ManagedPermission[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: RoleFormValues) => Promise<void>;
}) {
  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: { name: "", permissions: [] },
  });
  const selectedPermissions = useWatch({ control: form.control, name: "permissions" }) ?? [];
  const isEdit = state?.mode === "edit";

  useEffect(() => {
    if (!state) return;
    form.reset({
      name: state.role?.name ?? "",
      permissions: state.mode === "create" ? [] : rolePermissions(state.role as ManagedRole).map((item) => item.name),
    });
  }, [form, state]);

  async function submit(values: RoleFormValues) {
    try {
      await onSubmit(values);
      form.reset();
    } catch (error) {
      Object.entries(getValidationErrors(error)).forEach(([field, messages]) => {
        form.setError(field as keyof RoleFormValues, { type: "server", message: messages[0] });
      });
    }
  }

  return (
    <Dialog open={Boolean(state)} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Role" : "Create Role"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Protected system roles cannot be renamed." : "Create a role and optionally assign permissions immediately."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Field label="Role name" error={form.formState.errors.name?.message}>
            <Input disabled={state?.role?.is_protected} aria-invalid={Boolean(form.formState.errors.name)} {...form.register("name")} />
          </Field>
          {!isEdit ? (
            <PermissionCheckboxGroups
              permissions={permissions}
              selected={selectedPermissions}
              onChange={(next) => form.setValue("permissions", next, { shouldDirty: true, shouldValidate: true })}
            />
          ) : null}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button type="button" onClick={form.handleSubmit(submit)} disabled={isSubmitting || state?.role?.is_protected}>
            {isSubmitting ? "Saving..." : isEdit ? "Save Changes" : "Create Role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PermissionDialog({
  state,
  permissions,
  isSubmitting,
  onClose,
  onSubmit,
}: {
  state: PermissionDialogState;
  permissions: ManagedPermission[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: PermissionAssignmentValues) => Promise<void>;
}) {
  const form = useForm<PermissionAssignmentValues>({
    resolver: zodResolver(permissionAssignmentSchema),
    defaultValues: { permissions: [] },
  });
  const selectedPermissions = useWatch({ control: form.control, name: "permissions" }) ?? [];
  const assigned = state ? rolePermissions(state.role).map((item) => item.name) : [];
  const available = state?.mode === "remove" ? permissions.filter((item) => assigned.includes(item.name)) : permissions;

  useEffect(() => {
    form.reset({ permissions: [] });
  }, [form, state]);

  async function submit(values: PermissionAssignmentValues) {
    try {
      await onSubmit(values);
      form.reset();
    } catch (error) {
      Object.entries(getValidationErrors(error)).forEach(([field, messages]) => {
        form.setError(field as keyof PermissionAssignmentValues, { type: "server", message: messages[0] });
      });
    }
  }

  return (
    <Dialog open={Boolean(state)} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{state?.mode === "remove" ? "Remove Permissions" : "Assign Permissions"}</DialogTitle>
          <DialogDescription>
            {state ? `${state.role.name}: select permissions to ${state.mode === "remove" ? "remove from" : "assign to"} this role.` : "Manage role permissions."}
          </DialogDescription>
        </DialogHeader>
        <PermissionCheckboxGroups
          permissions={available}
          selected={selectedPermissions}
          onChange={(next) => form.setValue("permissions", next, { shouldDirty: true, shouldValidate: true })}
        />
        {form.formState.errors.permissions?.message ? <p className="text-xs text-destructive">{form.formState.errors.permissions.message}</p> : null}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button type="button" variant={state?.mode === "remove" ? "destructive" : "default"} onClick={form.handleSubmit(submit)} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : state?.mode === "remove" ? "Remove Permissions" : "Assign Permissions"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RoleViewDialog({ role, onClose }: { role: ManagedRole | null; onClose: () => void }) {
  return (
    <Dialog open={Boolean(role)} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Role Details</DialogTitle>
          <DialogDescription>Role metadata and assigned permissions.</DialogDescription>
        </DialogHeader>
        {role ? (
          <div className="space-y-4">
            <div className="grid gap-2 text-xs sm:grid-cols-2">
              <Detail label="Name" value={role.name} />
              <Detail label="Guard" value={role.guard_name} />
              <Detail label="Protected" value={role.is_protected ? "Yes" : "No"} />
              <Detail label="Created" value={formatDate(role.created_at)} />
            </div>
            <PermissionBadges permissions={rolePermissions(role)} />
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function ConfirmDeleteDialog({ action, isSubmitting, onClose, onConfirm }: { action: ConfirmAction | null; isSubmitting: boolean; onClose: () => void; onConfirm: () => Promise<void> }) {
  return (
    <Dialog open={Boolean(action)} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Role</DialogTitle>
          <DialogDescription>
            {action ? `Delete ${action.role.name}? Roles assigned to users or protected system roles cannot be deleted.` : "Confirm role deletion."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button type="button" variant="destructive" onClick={onConfirm} disabled={isSubmitting}>{isSubmitting ? "Deleting..." : "Delete Role"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PermissionsPanel({ permissions, isLoading, isError }: { permissions: ManagedPermission[]; isLoading: boolean; isError: boolean }) {
  const grouped = groupPermissions(permissions);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Permissions</CardTitle>
        <CardDescription>Available permissions grouped by module.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? <RolesTableSkeleton /> : null}
        {isError ? <p className="text-xs text-destructive">Unable to load permissions.</p> : null}
        {!isLoading && !isError && permissions.length === 0 ? <p className="text-xs text-muted-foreground">No permissions found.</p> : null}
        {Object.entries(grouped).map(([moduleName, items]) => (
          <div key={moduleName} className="space-y-2 border border-border p-3">
            <p className="text-xs font-medium capitalize">{moduleName}</p>
            <PermissionBadges permissions={items} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function PermissionCheckboxGroups({ permissions, selected, onChange }: { permissions: ManagedPermission[]; selected: string[]; onChange: (next: string[]) => void }) {
  const grouped = groupPermissions(permissions);
  if (permissions.length === 0) {
    return <p className="text-xs text-muted-foreground">No permissions available.</p>;
  }
  return (
    <div className="max-h-[420px] space-y-4 overflow-y-auto border border-border p-3">
      {Object.entries(grouped).map(([moduleName, items]) => (
        <div key={moduleName} className="space-y-2">
          <p className="text-xs font-medium capitalize">{moduleName}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {items.map((permission) => (
              <label key={permission.id} className="flex items-center gap-2 border border-border p-2 text-xs">
                <input
                  type="checkbox"
                  className="size-4 accent-foreground"
                  checked={selected.includes(permission.name)}
                  onChange={(event) => {
                    const next = event.target.checked ? [...selected, permission.name] : selected.filter((item) => item !== permission.name);
                    onChange(next);
                  }}
                />
                {permission.name}
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function PermissionBadges({ permissions, max }: { permissions: ManagedPermission[]; max?: number }) {
  if (permissions.length === 0) return <span className="text-xs text-muted-foreground">No permissions</span>;
  const visible = typeof max === "number" ? permissions.slice(0, max) : permissions;
  const hidden = typeof max === "number" ? Math.max(permissions.length - max, 0) : 0;
  return (
    <div className="flex flex-wrap gap-1">
      {visible.map((permission) => <Badge key={permission.id} variant="outline">{permission.name}</Badge>)}
      {hidden > 0 ? <Badge variant="secondary">+{hidden}</Badge> : null}
    </div>
  );
}

function RolesTableSkeleton() {
  return <div className="space-y-2 border border-border p-3">{Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-10 w-full" />)}</div>;
}

function EmptyState() {
  return <div className="border border-dashed border-border bg-muted/20 p-8 text-center"><h2 className="text-sm font-medium">No roles found</h2><p className="mt-2 text-xs text-muted-foreground">Try adjusting your search criteria.</p></div>;
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div className="border border-destructive/30 bg-destructive/10 p-4"><p className="text-sm font-medium text-destructive">Unable to load roles</p><p className="mt-1 text-xs text-muted-foreground">{message}</p><Button type="button" variant="outline" className="mt-3" onClick={onRetry}>Retry</Button></div>;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <label className="space-y-1.5 text-xs font-medium"><span>{label}</span>{children}{error ? <p className="text-xs text-destructive">{error}</p> : null}</label>;
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div className="border border-border p-3"><p className="text-muted-foreground">{label}</p><p className="mt-1 font-medium">{value}</p></div>;
}

function NativeSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: Array<{ label: string; value: string }> }) {
  return <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} className="h-8 w-full border border-input bg-background px-2.5 text-xs outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50">{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>;
}

function IconButton({ label, onClick, icon: Icon, destructive = false }: { label: string; onClick: () => void; icon: typeof Eye; destructive?: boolean }) {
  return <Button type="button" variant={destructive ? "destructive" : "ghost"} size="icon-sm" onClick={onClick} aria-label={label} title={label}><Icon className="size-4" /></Button>;
}
