"use client";

import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  FolderKanban,
  RefreshCcw,
  Timer,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { getApiErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/format-date";

import { useDashboard } from "../hooks/use-dashboard";
import type {
  DashboardActivity,
  DashboardResponse,
  DashboardStatistics,
  DashboardTaskStatus,
} from "../types/dashboard.types";

const numberFormatter = new Intl.NumberFormat("en");

function formatNumber(value: number | undefined): string {
  return numberFormatter.format(value ?? 0);
}

function pendingTasks(statistics: DashboardStatistics): number {
  return Math.max((statistics.total_tasks ?? 0) - (statistics.completed_tasks ?? 0), 0);
}

function displayRoleLabel(
  roles: Array<{ name?: string } | string> | undefined,
  fallback: string,
): string {
  const firstRole = roles?.[0];

  if (typeof firstRole === "string" && firstRole.trim().length > 0) {
    return firstRole;
  }

  if (typeof firstRole === "object" && firstRole?.name?.trim()) {
    return firstRole.name;
  }

  return fallback;
}

export function DashboardPage() {
  const dashboardQuery = useDashboard();
  const { data: user } = useCurrentUser();

  if (dashboardQuery.isLoading) {
    return <DashboardSkeleton />;
  }

  if (dashboardQuery.isError) {
    return (
      <DashboardError
        message={getApiErrorMessage(dashboardQuery.error)}
        onRetry={() => dashboardQuery.refetch()}
      />
    );
  }

  if (!dashboardQuery.data) {
    return <DashboardEmpty onRefresh={() => dashboardQuery.refetch()} />;
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
            <Badge variant="outline">{displayRoleLabel(user?.roles, dashboardQuery.data.role)}</Badge>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Monitor project progress, team workload, upcoming work, and recent updates from your workspace.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={dashboardQuery.isFetching}
          onClick={() => dashboardQuery.refetch()}
        >
          <RefreshCcw className={cn("size-4", dashboardQuery.isFetching && "animate-spin")} />
          Refresh
        </Button>
      </header>

      <SummaryCards statistics={dashboardQuery.data.statistics} />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <TaskStatusOverview
          statuses={dashboardQuery.data.tasks_by_status}
          totalTasks={dashboardQuery.data.statistics.total_tasks}
        />
        <PersonalSummary dashboard={dashboardQuery.data} userName={user?.name} />
      </div>

      <RecentActivity activities={dashboardQuery.data.recent_activity} />
    </div>
  );
}

function SummaryCards({ statistics }: { statistics: DashboardStatistics }) {
  const items = [
    {
      label: "Total Users",
      value: statistics.total_users,
      icon: Users,
      tone: "text-sky-600 dark:text-sky-300",
    },
    {
      label: "Total Projects",
      value: statistics.total_projects,
      icon: FolderKanban,
      tone: "text-emerald-600 dark:text-emerald-300",
    },
    {
      label: "Total Tasks",
      value: statistics.total_tasks,
      icon: ClipboardList,
      tone: "text-violet-600 dark:text-violet-300",
    },
    {
      label: "Completed Tasks",
      value: statistics.completed_tasks,
      icon: CheckCircle2,
      tone: "text-teal-600 dark:text-teal-300",
    },
    {
      label: "Pending Tasks",
      value: pendingTasks(statistics),
      icon: Timer,
      tone: "text-amber-600 dark:text-amber-300",
    },
    {
      label: "Overdue Tasks",
      value: statistics.overdue_tasks,
      icon: AlertTriangle,
      tone: "text-red-600 dark:text-red-300",
    },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <Card key={item.label} size="sm" className="hover:-translate-y-0.5">
            <CardContent className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight">
                  {formatNumber(item.value)}
                </p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-md border border-border bg-muted/40 shadow-sm">
                <Icon className={cn("size-4", item.tone)} aria-hidden="true" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}

function TaskStatusOverview({
  statuses,
  totalTasks,
}: {
  statuses: DashboardTaskStatus[];
  totalTasks: number;
}) {
  if (statuses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Task Status Overview</CardTitle>
          <CardDescription>Task progress will appear here once work is assigned and updated.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Status Overview</CardTitle>
        <CardDescription>A quick view of how current tasks are moving through the workflow.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {statuses.map((status) => {
          const percentage = totalTasks > 0 ? Math.round((status.total / totalTasks) * 100) : 0;

          return (
            <div key={status.status_id} className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{status.name}</p>
                  <p className="text-xs text-muted-foreground">{formatNumber(status.total)} tasks</p>
                </div>
                <Badge variant="secondary">{percentage}%</Badge>
              </div>
              <div className="h-2 overflow-hidden border border-border bg-muted">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${percentage}%` }}
                  aria-hidden="true"
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function RecentActivity({ activities }: { activities: DashboardActivity[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Recent workspace updates you have access to view.</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="No recent activity"
            description="New updates will appear here as your team manages projects, tasks, and comments."
          />
        ) : (
          <ol className="space-y-3">
            {activities.map((activity) => (
              <li key={activity.id} className="flex flex-col gap-3 rounded-lg border border-border bg-muted/20 p-4 transition-colors hover:bg-muted/35 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {humanizeAction(activity.action)}
                    {activity.entity_label ? (
                      <span className="text-muted-foreground"> · {activity.entity_label}</span>
                    ) : null}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {activity.user?.name ?? "System"} · {activity.subject_type.split("\\").at(-1) ?? "Record"} #{activity.subject_id}
                  </p>
                </div>
                <time className="shrink-0 text-xs text-muted-foreground" dateTime={activity.created_at}>
                  {formatDate(activity.created_at)}
                </time>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}

function PersonalSummary({
  dashboard,
  userName,
}: {
  dashboard: DashboardResponse;
  userName?: string;
}) {
  const statistics = dashboard.statistics;
  const items = [
    { label: "Workspace scope", value: scopeLabel(dashboard.scope) },
    { label: "Assigned tasks", value: formatNumber(statistics.assigned_tasks) },
    { label: "Active projects", value: formatNumber(statistics.active_projects) },
    { label: "Archived projects", value: formatNumber(statistics.archived_projects) },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Summary</CardTitle>
        <CardDescription>
          {userName ? `${userName}'s workspace summary.` : "Your current workspace summary."}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item.label} className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className="mt-1 text-sm font-medium">{item.value}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-8 w-24" />
      </div>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} size="sm">
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </section>
      <div className="grid gap-6 xl:grid-cols-2">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
      <Skeleton className="h-96" />
    </div>
  );
}

function DashboardError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-start gap-4 p-6">
        <div className="flex size-11 items-center justify-center rounded-lg border border-destructive/30 bg-destructive/10 text-destructive">
          <AlertTriangle className="size-5" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-lg font-semibold">Dashboard could not be loaded</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{message}</p>
        </div>
        <Button type="button" variant="outline" onClick={onRetry}>
          <RefreshCcw className="size-4" />
          Try again
        </Button>
      </CardContent>
    </Card>
  );
}

function DashboardEmpty({ onRefresh }: { onRefresh: () => void }) {
  return (
    <Card>
      <CardContent className="p-6">
        <EmptyState
          icon={ClipboardList}
          title="No dashboard data"
          description="Your workspace summary is not available yet. Refresh once work has been added."
        />
        <div className="mt-4">
          <Button type="button" variant="outline" onClick={onRefresh}>
            <RefreshCcw className="size-4" />
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof ClipboardList;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-44 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 p-8 text-center">
      <div className="flex size-11 items-center justify-center rounded-lg border border-border bg-background shadow-sm">
        <Icon className="size-5 text-muted-foreground" aria-hidden="true" />
      </div>
      <h2 className="mt-4 text-sm font-medium">{title}</h2>
      <p className="mt-2 max-w-md text-xs leading-5 text-muted-foreground">{description}</p>
    </div>
  );
}

function humanizeAction(action: string): string {
  return action
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function scopeLabel(scope: string): string {
  return humanizeAction(scope);
}




