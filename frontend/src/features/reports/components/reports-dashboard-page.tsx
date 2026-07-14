"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { BarChart3, BriefcaseBusiness, FolderKanban, RefreshCcw, RotateCcw, UsersRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDashboard } from "@/features/dashboard/hooks/use-dashboard";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { useRoles } from "@/features/roles/hooks/use-roles";
import { fallbackTaskStatuses } from "@/features/tasks/schemas/task.schema";
import { useUsers } from "@/features/users/hooks/use-users";
import { getApiErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/format-date";

import { useReportsDashboard } from "../hooks/use-reports";
import { reportFilterSchema, type ReportFilterValues } from "../schemas/report.schema";
import type { ReportCardDefinition, ReportChartRow, ReportFilters, ReportResponse, ReportRow, ReportValue } from "../types/report-management.types";

const reportCards: Array<ReportCardDefinition & { icon: LucideIcon }> = [
  { key: "users", title: "Users Report", description: "User status, role distribution, and assignment counts.", icon: UsersRound },
  { key: "projects", title: "Projects Report", description: "Project lifecycle, manager distribution, and task counts.", icon: FolderKanban },
  { key: "tasks", title: "Tasks Report", description: "Task assignment, completion, overdue work, and priorities.", icon: BarChart3 },
  { key: "projectProgress", title: "Project Progress", description: "Progress, completed work, and overdue tasks by project.", icon: FolderKanban },
  { key: "workload", title: "Workload", description: "Assigned, completed, and overdue tasks by team member.", icon: BriefcaseBusiness },
];

function titleCase(value: string) {
  return value.replaceAll("_", " ").replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function cleanFilters(values: ReportFilterValues): ReportFilters {
  return {
    date_from: values.date_from || undefined,
    date_to: values.date_to || undefined,
    project_id: values.project_id,
    user_id: values.user_id,
    task_status_id: values.task_status_id,
    role: values.role || undefined,
    limit: values.limit,
  };
}

function formatReportValue(value: ReportValue | undefined): string {
  if (value === undefined || value === null) return "-";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return Number.isInteger(value) ? String(value) : value.toFixed(2);
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return formatDate(value);
  return value;
}

function badgeVariant(value: string): "default" | "secondary" | "destructive" | "outline" {
  if (["active", "completed", "yes"].includes(value.toLowerCase())) return "secondary";
  if (["inactive", "archived", "urgent", "overdue", "no"].includes(value.toLowerCase())) return "destructive";
  return "outline";
}

function rowKey(row: ReportRow, index: number) {
  return String(row.user_id ?? row.project_id ?? row.task_id ?? index);
}

function chartLabel(row: ReportChartRow) {
  const label = row.name ?? row.role ?? row.status ?? row.priority ?? row.manager_name ?? row.slug ?? "Item";
  return formatReportValue(label);
}

function chartValue(row: ReportChartRow) {
  const raw = row.total ?? row.assigned_tasks ?? row.completed_tasks ?? row.average_progress ?? row.overdue_tasks ?? 0;
  return typeof raw === "number" ? raw : Number(raw) || 0;
}

export function ReportsDashboardPage() {
  const [filters, setFilters] = useState<ReportFilters>({ limit: 25 });
  const form = useForm<ReportFilterValues>({
    resolver: zodResolver(reportFilterSchema),
    defaultValues: { date_from: "", date_to: "", project_id: undefined, user_id: undefined, task_status_id: undefined, role: "", limit: 25 },
  });

  const reportsQuery = useReportsDashboard(filters);
  const projectsQuery = useProjects({ per_page: 100, sort: "name", direction: "asc" });
  const usersQuery = useUsers({ per_page: 100, sort: "name", direction: "asc" });
  const rolesQuery = useRoles();
  const dashboardQuery = useDashboard();

  const projects = projectsQuery.data?.data ?? [];
  const users = usersQuery.data?.data ?? [];
  const roles = rolesQuery.data ?? [];
  const statuses = dashboardQuery.data?.tasks_by_status.length ? dashboardQuery.data.tasks_by_status : [...fallbackTaskStatuses];
  const reports = reportsQuery.data;
  const selectedProjectId = useWatch({ control: form.control, name: "project_id" });
  const selectedUserId = useWatch({ control: form.control, name: "user_id" });
  const selectedStatusId = useWatch({ control: form.control, name: "task_status_id" });
  const selectedRole = useWatch({ control: form.control, name: "role" });

  const activeFilterCount = useMemo(() => Object.entries(filters).filter(([key, value]) => key !== "limit" && value !== undefined && value !== "").length, [filters]);

  function resetFilters() {
    form.reset({ date_from: "", date_to: "", project_id: undefined, user_id: undefined, task_status_id: undefined, role: "", limit: 25 });
    setFilters({ limit: 25 });
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Review users, projects, tasks, progress, and workload using aggregated Laravel report endpoints.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={() => reportsQuery.refetch()} disabled={reportsQuery.isFetching}>
          <RefreshCcw className={cn("size-4", reportsQuery.isFetching && "animate-spin")} />
          Refresh
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
          <CardDescription>{activeFilterCount} active filters. Filters apply to all report cards.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Field label="Date From" error={form.formState.errors.date_from?.message}><Input type="date" {...form.register("date_from")} /></Field>
            <Field label="Date To" error={form.formState.errors.date_to?.message}><Input type="date" {...form.register("date_to")} /></Field>
            <Field label="Project" error={form.formState.errors.project_id?.message}><NativeSelect label="Project" value={String(selectedProjectId ?? "")} onChange={(value) => form.setValue("project_id", value ? Number(value) : undefined, { shouldValidate: true })} options={[{ label: "All projects", value: "" }, ...projects.map((project) => ({ label: project.name, value: String(project.id) }))]} /></Field>
            <Field label="User" error={form.formState.errors.user_id?.message}><NativeSelect label="User" value={String(selectedUserId ?? "")} onChange={(value) => form.setValue("user_id", value ? Number(value) : undefined, { shouldValidate: true })} options={[{ label: "All users", value: "" }, ...users.map((user) => ({ label: user.name, value: String(user.id) }))]} /></Field>
            <Field label="Task Status" error={form.formState.errors.task_status_id?.message}><NativeSelect label="Task Status" value={String(selectedStatusId ?? "")} onChange={(value) => form.setValue("task_status_id", value ? Number(value) : undefined, { shouldValidate: true })} options={[{ label: "All statuses", value: "" }, ...statuses.map((status) => ({ label: status.name, value: String(status.status_id) }))]} /></Field>
            <Field label="Role" error={form.formState.errors.role?.message}><NativeSelect label="Role" value={selectedRole ?? ""} onChange={(value) => form.setValue("role", value, { shouldValidate: true })} options={[{ label: "All roles", value: "" }, ...roles.map((role) => ({ label: role.name, value: role.name }))]} /></Field>
            <Field label="Limit" error={form.formState.errors.limit?.message}><Input type="number" min={1} max={100} {...form.register("limit", { valueAsNumber: true })} /></Field>
            <div className="flex items-end gap-2">
              <Button type="button" className="flex-1" onClick={form.handleSubmit((values) => setFilters(cleanFilters(values)))}>Apply Filters</Button>
              <Button type="button" variant="outline" onClick={resetFilters} aria-label="Reset filters" title="Reset filters"><RotateCcw className="size-4" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {reportsQuery.isLoading ? <ReportsSkeleton /> : null}
      {reportsQuery.isError ? <ReportsError message={getApiErrorMessage(reportsQuery.error)} onRetry={() => reportsQuery.refetch()} /> : null}
      {!reportsQuery.isLoading && !reportsQuery.isError && reports ? (
        <div className="grid gap-6 xl:grid-cols-2">
          {reportCards.map((definition) => <ReportCard key={definition.key} definition={definition} report={reports[definition.key]} />)}
        </div>
      ) : null}
    </div>
  );
}

function ReportCard({ definition, report }: { definition: ReportCardDefinition & { icon: LucideIcon }; report: ReportResponse }) {
  const Icon = definition.icon;
  return (
    <Card className={definition.key === "projectProgress" ? "xl:col-span-2" : undefined}>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex size-9 items-center justify-center border border-border bg-muted/40"><Icon className="size-4" /></div>
          <div>
            <CardTitle>{definition.title}</CardTitle>
            <CardDescription>{definition.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <SummaryGrid summary={report.summary} />
        <ChartsGrid charts={report.charts} />
        <ReportTable rows={report.table} />
      </CardContent>
    </Card>
  );
}

function SummaryGrid({ summary }: { summary: Record<string, number> }) {
  const entries = Object.entries(summary);
  if (entries.length === 0) return <EmptyState label="No summary data" />;
  return <div className="grid gap-2 sm:grid-cols-2 2xl:grid-cols-3">{entries.map(([key, value]) => <div key={key} className="border border-border p-3"><p className="text-xs text-muted-foreground">{titleCase(key)}</p><p className="mt-1 text-lg font-semibold tracking-tight">{formatReportValue(value)}</p></div>)}</div>;
}

function ChartsGrid({ charts }: { charts: Record<string, ReportChartRow[]> }) {
  const entries = Object.entries(charts).filter(([, rows]) => rows.length > 0);
  if (entries.length === 0) return <EmptyState label="No breakdown data" />;
  return <div className="grid gap-3 lg:grid-cols-2">{entries.map(([key, rows]) => <ChartBlock key={key} title={titleCase(key)} rows={rows} />)}</div>;
}

function ChartBlock({ title, rows }: { title: string; rows: ReportChartRow[] }) {
  const max = Math.max(...rows.map(chartValue), 1);
  return <div className="space-y-2 border border-border p-3"><p className="text-xs font-medium">{title}</p>{rows.map((row, index) => { const value = chartValue(row); return <div key={`${title}-${index}`} className="space-y-1"><div className="flex items-center justify-between gap-2 text-xs"><span className="truncate text-muted-foreground">{chartLabel(row)}</span><span className="font-medium">{formatReportValue(value)}</span></div><div className="h-2 bg-muted"><div className="h-full bg-foreground" style={{ width: `${Math.min((value / max) * 100, 100)}%` }} /></div></div>; })}</div>;
}

function ReportTable({ rows }: { rows: ReportRow[] }) {
  if (rows.length === 0) return <EmptyState label="No table rows" />;
  const columns = Object.keys(rows[0]).slice(0, 8);
  return <div className="overflow-hidden border border-border"><Table><TableHeader><TableRow>{columns.map((column) => <TableHead key={column}>{titleCase(column)}</TableHead>)}</TableRow></TableHeader><TableBody>{rows.map((row, index) => <TableRow key={rowKey(row, index)}>{columns.map((column) => <TableCell key={`${rowKey(row, index)}-${column}`}><TableValue column={column} value={row[column]} /></TableCell>)}</TableRow>)}</TableBody></Table></div>;
}

function TableValue({ column, value }: { column: string; value: ReportValue | undefined }) {
  const formatted = formatReportValue(value);
  if (column.includes("status") || column === "priority" || column === "is_active") return <Badge variant={badgeVariant(formatted)}>{formatted}</Badge>;
  if (column.includes("progress") && typeof value === "number") return <div className="min-w-28 space-y-1"><div className="flex justify-between text-xs"><span>{formatted}%</span></div><div className="h-2 bg-muted"><div className="h-full bg-foreground" style={{ width: `${Math.min(value, 100)}%` }} /></div></div>;
  return <span>{formatted}</span>;
}

function ReportsSkeleton() {
  return <div className="grid gap-6 xl:grid-cols-2">{Array.from({ length: 5 }).map((_, index) => <Card key={index}><CardHeader><Skeleton className="h-5 w-48" /><Skeleton className="h-4 w-72" /></CardHeader><CardContent className="space-y-3"><Skeleton className="h-20 w-full" /><Skeleton className="h-28 w-full" /><Skeleton className="h-40 w-full" /></CardContent></Card>)}</div>;
}

function ReportsError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div className="border border-destructive/30 bg-destructive/10 p-4"><p className="text-sm font-medium text-destructive">Unable to load reports</p><p className="mt-1 text-xs text-muted-foreground">{message}</p><Button type="button" variant="outline" className="mt-3" onClick={onRetry}>Retry</Button></div>;
}

function EmptyState({ label }: { label: string }) {
  return <div className="border border-dashed border-border bg-muted/20 p-4 text-center text-xs text-muted-foreground">{label}</div>;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <label className="space-y-1.5 text-xs font-medium"><span>{label}</span>{children}{error ? <p className="text-xs text-destructive">{error}</p> : null}</label>;
}

function NativeSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: Array<{ label: string; value: string }> }) {
  return <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} className="h-8 w-full border border-input bg-background px-2.5 text-xs outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50">{options.map((option) => <option key={`${label}-${option.value}`} value={option.value}>{option.label}</option>)}</select>;
}



