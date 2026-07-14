export type ReportType = "users" | "projects" | "tasks" | "project_progress" | "workload";

export type ReportFilters = {
  date_from?: string;
  date_to?: string;
  project_id?: number;
  user_id?: number;
  task_status_id?: number;
  role?: string;
  limit?: number;
};

export type ReportValue = string | number | boolean | null | string[] | number[];
export type ReportRow = Record<string, ReportValue>;
export type ReportChartRow = Record<string, ReportValue>;

export type ReportResponse = {
  type: ReportType;
  scope: "system" | "managed_projects" | string;
  filters: ReportFilters;
  summary: Record<string, number>;
  charts: Record<string, ReportChartRow[]>;
  table: ReportRow[];
};

export type ReportsDashboard = {
  users: ReportResponse;
  projects: ReportResponse;
  tasks: ReportResponse;
  projectProgress: ReportResponse;
  workload: ReportResponse;
};

export type ReportCardDefinition = {
  key: keyof ReportsDashboard;
  title: string;
  description: string;
};
