"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  Pencil,
  Plus,
  RefreshCcw,
  RotateCcw,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserX,
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
import { useRoles } from "@/features/roles/hooks/use-roles";
import { getApiErrorMessage, getValidationErrors } from "@/lib/api";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/format-date";

import { useUserMutations, useUsers } from "../hooks/use-users";
import { createUserSchema, updateUserSchema, type UserFormValues } from "../schemas/user.schema";
import type { ManagedUser, UserFormPayload, UserListParams } from "../types/user-management.types";

type UserDialogMode = "create" | "edit";
type SortField = NonNullable<UserListParams["sort"]>;
type SortDirection = NonNullable<UserListParams["direction"]>;

type ConfirmAction =
  | { type: "delete"; user: ManagedUser }
  | { type: "restore"; user: ManagedUser }
  | { type: "status"; user: ManagedUser; isActive: boolean };

const DEFAULT_PER_PAGE = 10;
const sortFields: Array<{ label: string; value: SortField }> = [
  { label: "Created", value: "created_at" },
  { label: "Name", value: "name" },
  { label: "Email", value: "email" },
  { label: "Updated", value: "updated_at" },
];

function roleNames(user: ManagedUser): string[] {
  return Array.isArray(user.roles) ? user.roles.map(String) : [];
}

function toUserPayload(values: UserFormValues): UserFormPayload {
  return {
    name: values.name,
    email: values.email,
    password: values.password || undefined,
    password_confirmation: values.password_confirmation || undefined,
    is_active: values.is_active,
    roles: values.roles,
  };
}

export function UserManagementPage() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [trashed, setTrashed] = useState<"" | "with" | "only">("");
  const [sort, setSort] = useState<SortField>("created_at");
  const [direction, setDirection] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);
  const [dialogState, setDialogState] = useState<
    | { mode: UserDialogMode; user?: ManagedUser }
    | null
  >(null);
  const [viewUser, setViewUser] = useState<ManagedUser | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  const params = useMemo<UserListParams>(
    () => ({
      page,
      per_page: DEFAULT_PER_PAGE,
      search: search || undefined,
      role: role || undefined,
      status: status === "active" || status === "inactive" ? status : undefined,
      trashed: trashed || undefined,
      sort,
      direction,
    }),
    [direction, page, role, search, sort, status, trashed],
  );

  const usersQuery = useUsers(params);
  const rolesQuery = useRoles();
  const mutations = useUserMutations();

  const users = usersQuery.data?.data ?? [];
  const meta = usersQuery.data?.meta;
  const roleOptions = rolesQuery.data ?? [];

  function resetToFirstPage() {
    setPage(1);
  }

  async function runConfirmAction() {
    if (!confirmAction) {
      return;
    }

    if (confirmAction.type === "delete") {
      await mutations.delete.mutateAsync(confirmAction.user.id);
    }

    if (confirmAction.type === "restore") {
      await mutations.restore.mutateAsync(confirmAction.user.id);
    }

    if (confirmAction.type === "status") {
      await mutations.updateStatus.mutateAsync({
        userId: confirmAction.user.id,
        payload: { is_active: confirmAction.isActive },
      });
    }

    setConfirmAction(null);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">User Management</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Manage platform users, account status, roles, and soft-deleted user records.
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => usersQuery.refetch()} disabled={usersQuery.isFetching}>
            <RefreshCcw className={cn("size-4", usersQuery.isFetching && "animate-spin")} />
            Refresh
          </Button>
          <Button type="button" onClick={() => setDialogState({ mode: "create" })}>
            <Plus className="size-4" />
            Create User
          </Button>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Search, filter, sort, and manage administrator-created users.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  resetToFirstPage();
                }}
                className="pl-8"
                placeholder="Search name or email"
              />
            </div>
            <NativeSelect
              label="Role"
              value={role}
              onChange={(value) => {
                setRole(value);
                resetToFirstPage();
              }}
              options={[
                { label: "All roles", value: "" },
                ...roleOptions.map((item) => ({ label: item.name, value: item.name })),
              ]}
            />
            <NativeSelect
              label="Status"
              value={status}
              onChange={(value) => {
                setStatus(value);
                resetToFirstPage();
              }}
              options={[
                { label: "All statuses", value: "" },
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
              ]}
            />
            <NativeSelect
              label="Deleted"
              value={trashed}
              onChange={(value) => {
                setTrashed(value as "" | "with" | "only");
                resetToFirstPage();
              }}
              options={[
                { label: "Active records", value: "" },
                { label: "Include deleted", value: "with" },
                { label: "Deleted only", value: "only" },
              ]}
            />
            <NativeSelect
              label="Sort"
              value={sort}
              onChange={(value) => {
                setSort(value as SortField);
                resetToFirstPage();
              }}
              options={sortFields}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDirection(direction === "asc" ? "desc" : "asc");
                resetToFirstPage();
              }}
            >
              {direction === "asc" ? <ArrowUp className="size-4" /> : <ArrowDown className="size-4" />}
              {direction.toUpperCase()}
            </Button>
          </div>

          {usersQuery.isLoading ? <UsersTableSkeleton /> : null}

          {usersQuery.isError ? (
            <ErrorState message={getApiErrorMessage(usersQuery.error)} onRetry={() => usersQuery.refetch()} />
          ) : null}

          {!usersQuery.isLoading && !usersQuery.isError && users.length === 0 ? <EmptyState /> : null}

          {!usersQuery.isLoading && !usersQuery.isError && users.length > 0 ? (
            <UsersTable
              users={users}
              onView={setViewUser}
              onEdit={(user) => setDialogState({ mode: "edit", user })}
              onConfirm={setConfirmAction}
            />
          ) : null}

          {meta ? (
            <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                Showing {meta.from ?? 0}-{meta.to ?? 0} of {meta.total} users
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={meta.current_page <= 1}
                  onClick={() => setPage((current) => Math.max(current - 1, 1))}
                >
                  Previous
                </Button>
                <span className="text-xs text-muted-foreground">
                  Page {meta.current_page} of {meta.last_page}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  disabled={meta.current_page >= meta.last_page}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <UserFormDialog
        state={dialogState}
        roles={roleOptions.map((item) => item.name)}
        isSubmitting={mutations.create.isPending || mutations.update.isPending}
        onClose={() => setDialogState(null)}
        onSubmit={async (values) => {
          if (!dialogState) {
            return;
          }

          if (dialogState.mode === "create") {
            await mutations.create.mutateAsync(toUserPayload(values));
          } else if (dialogState.user) {
            await mutations.update.mutateAsync({
              userId: dialogState.user.id,
              payload: toUserPayload(values),
            });
          }

          setDialogState(null);
        }}
      />

      <UserViewDialog user={viewUser} onClose={() => setViewUser(null)} />
      <ConfirmUserActionDialog
        action={confirmAction}
        isSubmitting={mutations.delete.isPending || mutations.restore.isPending || mutations.updateStatus.isPending}
        onClose={() => setConfirmAction(null)}
        onConfirm={runConfirmAction}
      />
    </div>
  );
}

function UsersTable({
  users,
  onView,
  onEdit,
  onConfirm,
}: {
  users: ManagedUser[];
  onView: (user: ManagedUser) => void;
  onEdit: (user: ManagedUser) => void;
  onConfirm: (action: ConfirmAction) => void;
}) {
  return (
    <div className="border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Roles</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const deleted = Boolean(user.deleted_at);

            return (
              <TableRow key={user.id} className={deleted ? "bg-muted/30" : undefined}>
                <TableCell>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-muted-foreground">{user.email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {roleNames(user).length > 0 ? (
                      roleNames(user).map((role) => (
                        <Badge key={role} variant="outline">
                          <ShieldCheck className="size-3" />
                          {role}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground">No roles</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant={user.is_active ? "secondary" : "destructive"}>
                      {user.is_active ? "Active" : "Inactive"}
                    </Badge>
                    {deleted ? <Badge variant="outline">Deleted</Badge> : null}
                  </div>
                </TableCell>
                <TableCell>{formatDate(user.created_at)}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <IconButton label="View user" onClick={() => onView(user)} icon={Eye} />
                    {!deleted ? <IconButton label="Edit user" onClick={() => onEdit(user)} icon={Pencil} /> : null}
                    {!deleted ? (
                      <IconButton
                        label={user.is_active ? "Deactivate user" : "Activate user"}
                        onClick={() => onConfirm({ type: "status", user, isActive: !user.is_active })}
                        icon={user.is_active ? UserX : UserCheck}
                      />
                    ) : null}
                    {!deleted ? (
                      <IconButton label="Delete user" onClick={() => onConfirm({ type: "delete", user })} icon={Trash2} destructive />
                    ) : (
                      <IconButton label="Restore user" onClick={() => onConfirm({ type: "restore", user })} icon={RotateCcw} />
                    )}
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

function UserFormDialog({
  state,
  roles,
  isSubmitting,
  onClose,
  onSubmit,
}: {
  state: { mode: UserDialogMode; user?: ManagedUser } | null;
  roles: string[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: UserFormValues) => Promise<void>;
}) {
  const isEdit = state?.mode === "edit";
  const schema = isEdit ? updateUserSchema : createUserSchema;
  const form = useForm<UserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
      is_active: true,
      roles: [],
    },
  });

  useEffect(() => {
    if (!state) {
      return;
    }

    form.reset({
      name: state.user?.name ?? "",
      email: state.user?.email ?? "",
      password: "",
      password_confirmation: "",
      is_active: state.user?.is_active ?? true,
      roles: state.user ? roleNames(state.user) : [],
    });
  }, [form, state]);

  async function submit(values: UserFormValues) {
    try {
      await onSubmit(values);
      form.reset();
    } catch (error) {
      const validationErrors = getValidationErrors(error);
      Object.entries(validationErrors).forEach(([field, messages]) => {
        form.setError(field as keyof UserFormValues, {
          type: "server",
          message: messages[0],
        });
      });
    }
  }

  const selectedRoles = useWatch({ control: form.control, name: "roles" }) ?? [];

  return (
    <Dialog open={Boolean(state)} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit User" : "Create User"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update user profile, account status, and role assignments." : "Create an administrator-managed user account."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" error={form.formState.errors.name?.message}>
            <Input aria-invalid={Boolean(form.formState.errors.name)} {...form.register("name")} />
          </Field>
          <Field label="Email" error={form.formState.errors.email?.message}>
            <Input type="email" aria-invalid={Boolean(form.formState.errors.email)} {...form.register("email")} />
          </Field>
          <Field label={isEdit ? "New Password" : "Password"} error={form.formState.errors.password?.message}>
            <Input type="password" aria-invalid={Boolean(form.formState.errors.password)} {...form.register("password")} />
          </Field>
          <Field label="Confirm Password" error={form.formState.errors.password_confirmation?.message}>
            <Input
              type="password"
              aria-invalid={Boolean(form.formState.errors.password_confirmation)}
              {...form.register("password_confirmation")}
            />
          </Field>
          <label className="flex items-center gap-2 text-xs sm:col-span-2">
            <input type="checkbox" className="size-4 accent-foreground" {...form.register("is_active")} />
            Active account
          </label>
          <div className="space-y-2 sm:col-span-2">
            <p className="text-xs font-medium">Roles</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {roles.map((role) => (
                <label key={role} className="flex items-center gap-2 border border-border p-2 text-xs">
                  <input
                    type="checkbox"
                    className="size-4 accent-foreground"
                    checked={selectedRoles.includes(role)}
                    onChange={(event) => {
                      const next = event.target.checked
                        ? [...selectedRoles, role]
                        : selectedRoles.filter((item) => item !== role);
                      form.setValue("roles", next, { shouldDirty: true, shouldValidate: true });
                    }}
                  />
                  {role}
                </label>
              ))}
            </div>
            {form.formState.errors.roles?.message ? (
              <p className="text-xs text-destructive">{form.formState.errors.roles.message}</p>
            ) : null}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="button" onClick={form.handleSubmit(submit)} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEdit ? "Save Changes" : "Create User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function UserViewDialog({ user, onClose }: { user: ManagedUser | null; onClose: () => void }) {
  return (
    <Dialog open={Boolean(user)} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>Profile and account information for the selected user.</DialogDescription>
        </DialogHeader>
        {user ? (
          <div className="space-y-3 text-xs">
            <Detail label="Name" value={user.name} />
            <Detail label="Email" value={user.email} />
            <Detail label="Status" value={user.is_active ? "Active" : "Inactive"} />
            <Detail label="Roles" value={roleNames(user).join(", ") || "No roles"} />
            <Detail label="Created" value={formatDate(user.created_at)} />
            <Detail label="Updated" value={formatDate(user.updated_at)} />
            {user.deleted_at ? <Detail label="Deleted" value={formatDate(user.deleted_at)} /> : null}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function ConfirmUserActionDialog({
  action,
  isSubmitting,
  onClose,
  onConfirm,
}: {
  action: ConfirmAction | null;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const copy = getConfirmCopy(action);

  return (
    <Dialog open={Boolean(action)} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>{copy.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="button" variant={action?.type === "delete" ? "destructive" : "default"} onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? "Working..." : copy.actionLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function getConfirmCopy(action: ConfirmAction | null) {
  if (!action) {
    return { title: "Confirm action", description: "Confirm this user action.", actionLabel: "Confirm" };
  }

  if (action.type === "delete") {
    return {
      title: "Move to deleted records user",
      description: `Move to deleted records ${action.user.name}? The user can be restored later from deleted records.`,
      actionLabel: "Delete User",
    };
  }

  if (action.type === "restore") {
    return {
      title: "Restore user",
      description: `Restore ${action.user.name} and make the account available again?`,
      actionLabel: "Restore User",
    };
  }

  return {
    title: action.isActive ? "Activate user" : "Deactivate user",
    description: `${action.isActive ? "Activate" : "Deactivate"} ${action.user.name}?`,
    actionLabel: action.isActive ? "Activate" : "Deactivate",
  };
}

function UsersTableSkeleton() {
  return (
    <div className="space-y-2 border border-border p-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} className="h-10 w-full" />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="border border-dashed border-border bg-muted/20 p-8 text-center">
      <h2 className="text-sm font-medium">No users found</h2>
      <p className="mt-2 text-xs text-muted-foreground">Try adjusting the search or filters.</p>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="border border-destructive/30 bg-destructive/10 p-4">
      <p className="text-sm font-medium text-destructive">Unable to load users</p>
      <p className="mt-1 text-xs text-muted-foreground">{message}</p>
      <Button type="button" variant="outline" className="mt-3" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="space-y-1.5 text-xs font-medium">
      <span>{label}</span>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </label>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-3 border-b border-border pb-2 last:border-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function NativeSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
}) {
  return (
    <label className="sr-only has-[select:focus-visible]:not-sr-only">
      {label}
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 w-full border border-input bg-background px-2.5 text-xs outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
      >
        {options.map((option) => (
          <option key={`${label}-${option.value}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function IconButton({
  label,
  onClick,
  icon: Icon,
  destructive = false,
}: {
  label: string;
  onClick: () => void;
  icon: typeof Eye;
  destructive?: boolean;
}) {
  return (
    <Button
      type="button"
      variant={destructive ? "destructive" : "ghost"}
      size="icon-sm"
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      <Icon className="size-4" />
    </Button>
  );
}


