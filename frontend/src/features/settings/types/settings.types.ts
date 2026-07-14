export type AppearanceTheme = "light" | "dark" | "system";
export type DashboardDefaultPage = "dashboard" | "tasks" | "projects" | "reports";
export type TableDensity = "compact" | "comfortable";

export type SettingsState = {
  appearance: {
    theme: AppearanceTheme;
  };
  notifications: {
    email: boolean;
    browser: boolean;
    taskReminders: boolean;
  };
  preferences: {
    itemsPerPage: number;
    defaultDashboardPage: DashboardDefaultPage;
    tableDensity: TableDensity;
  };
};
