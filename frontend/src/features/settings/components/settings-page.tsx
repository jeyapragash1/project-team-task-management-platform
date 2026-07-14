"use client";

import { Bell, Laptop, Mail, MonitorCog, Moon, RefreshCcw, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { APP_NAME } from "@/constants";

import type { AppearanceTheme, DashboardDefaultPage, SettingsState, TableDensity } from "../types/settings.types";

const SETTINGS_STORAGE_KEY = "cyphlab.settings.v1";
const APP_VERSION = "0.1.0";
const NEXT_VERSION = "16.2.10";
const LARAVEL_VERSION = "v12.63.0";

const defaultSettings: SettingsState = {
  appearance: { theme: "system" },
  notifications: {
    email: true,
    browser: false,
    taskReminders: true,
  },
  preferences: {
    itemsPerPage: 15,
    defaultDashboardPage: "dashboard",
    tableDensity: "comfortable",
  },
};

const themeOptions: Array<{ value: AppearanceTheme; label: string; icon: typeof Sun }> = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Laptop },
];

const dashboardPageOptions: Array<{ value: DashboardDefaultPage; label: string }> = [
  { value: "dashboard", label: "Dashboard" },
  { value: "tasks", label: "Tasks" },
  { value: "projects", label: "Projects" },
  { value: "reports", label: "Reports" },
];

const densityOptions: Array<{ value: TableDensity; label: string }> = [
  { value: "compact", label: "Compact" },
  { value: "comfortable", label: "Comfortable" },
];

function readSettings(): SettingsState {
  if (typeof window === "undefined") return defaultSettings;

  try {
    const stored = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!stored) return defaultSettings;
    const parsed = JSON.parse(stored) as Partial<SettingsState>;

    return {
      appearance: { ...defaultSettings.appearance, ...parsed.appearance },
      notifications: { ...defaultSettings.notifications, ...parsed.notifications },
      preferences: { ...defaultSettings.preferences, ...parsed.preferences },
    };
  } catch {
    return defaultSettings;
  }
}

function saveSettings(settings: SettingsState) {
  window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

export function SettingsPage() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const buildDate = process.env.NEXT_PUBLIC_BUILD_DATE || "Not configured";
  const environment = process.env.NODE_ENV;

  useEffect(() => {
    queueMicrotask(() => {
      const stored = readSettings();
      setSettings(stored);
      setTheme(stored.appearance.theme);
      setIsLoading(false);
    });
  }, [setTheme]);

  function updateSettings(updater: (current: SettingsState) => SettingsState, message = "Settings saved.") {
    setSettings((current) => {
      const next = updater(current);
      saveSettings(next);
      return next;
    });
    toast.success(message);
  }

  function updateTheme(value: AppearanceTheme) {
    setTheme(value);
    updateSettings((current) => ({ ...current, appearance: { theme: value } }), `${value === "system" ? "System" : value === "dark" ? "Dark" : "Light"} theme enabled.`);
  }

  function resetSettings() {
    setTheme(defaultSettings.appearance.theme);
    saveSettings(defaultSettings);
    setSettings(defaultSettings);
    toast.success("Settings reset successfully.");
  }

  const aboutRows = useMemo(
    () => [
      { label: "Application Name", value: APP_NAME },
      { label: "Version", value: APP_VERSION },
      { label: "Laravel Version", value: LARAVEL_VERSION },
      { label: "Next.js Version", value: NEXT_VERSION },
      { label: "Environment", value: environment },
      { label: "Build Date", value: buildDate },
    ],
    [buildDate, environment],
  );

  if (isLoading) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Configure local application preferences, appearance, notification toggles, and environment details.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={resetSettings}>
          <RefreshCcw className="size-4" />
          Reset Settings
        </Button>
      </header>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Theme preference is synced with the existing next-themes provider.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-3">
              {themeOptions.map((option) => {
                const Icon = option.icon;
                const active = settings.appearance.theme === option.value;
                return (
                  <Button key={option.value} type="button" variant={active ? "default" : "outline"} className="justify-start" onClick={() => updateTheme(option.value)}>
                    <Icon className="size-4" />
                    {option.label}
                  </Button>
                );
              })}
            </div>
            <div className="border border-border p-3 text-xs">
              <p className="text-muted-foreground">Current resolved theme</p>
              <Badge className="mt-2" variant="outline">{resolvedTheme ?? theme ?? "system"}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>These controls are UI-only preferences persisted in this browser.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ToggleRow icon={Mail} label="Email notifications" description="Receive account and workflow updates by email." checked={settings.notifications.email} onChange={(checked) => updateSettings((current) => ({ ...current, notifications: { ...current.notifications, email: checked } }))} />
            <ToggleRow icon={Bell} label="Browser notifications" description="Allow browser-level notifications when future support is enabled." checked={settings.notifications.browser} onChange={(checked) => updateSettings((current) => ({ ...current, notifications: { ...current.notifications, browser: checked } }))} />
            <ToggleRow icon={MonitorCog} label="Task reminders" description="Keep task reminder preference ready for future notification workflows." checked={settings.notifications.taskReminders} onChange={(checked) => updateSettings((current) => ({ ...current, notifications: { ...current.notifications, taskReminders: checked } }))} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Local defaults for high-volume dashboard and table workflows.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
            <Field label="Items per page">
              <Input type="number" min={5} max={100} value={settings.preferences.itemsPerPage} onChange={(event) => updateSettings((current) => ({ ...current, preferences: { ...current.preferences, itemsPerPage: Number(event.target.value) || defaultSettings.preferences.itemsPerPage } }))} />
            </Field>
            <Field label="Default dashboard page">
              <NativeSelect value={settings.preferences.defaultDashboardPage} onChange={(value) => updateSettings((current) => ({ ...current, preferences: { ...current.preferences, defaultDashboardPage: value as DashboardDefaultPage } }))} options={dashboardPageOptions} />
            </Field>
            <Field label="Default table density">
              <NativeSelect value={settings.preferences.tableDensity} onChange={(value) => updateSettings((current) => ({ ...current, preferences: { ...current.preferences, tableDensity: value as TableDensity } }))} options={densityOptions} />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
            <CardDescription>Application and runtime metadata for reviewers and developers.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {aboutRows.map((row) => (
                <div key={row.label} className="flex flex-col gap-1 border border-border p-3 text-xs sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-medium">{row.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ToggleRow({ icon: Icon, label, description, checked, onChange }: { icon: typeof Bell; label: string; description: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 border border-border p-3">
      <input type="checkbox" className="mt-1 size-4 accent-foreground" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <Icon className="mt-0.5 size-4 text-muted-foreground" />
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-medium">{label}</span>
        <span className="mt-1 block text-xs leading-5 text-muted-foreground">{description}</span>
      </span>
      <Badge variant={checked ? "secondary" : "outline"}>{checked ? "On" : "Off"}</Badge>
    </label>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="space-y-1.5 text-xs font-medium"><span>{label}</span>{children}</label>;
}

function NativeSelect({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: Array<{ label: string; value: string }> }) {
  return <select value={value} onChange={(event) => onChange(event.target.value)} className="h-8 w-full border border-input bg-background px-2.5 text-xs outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50">{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>;
}

function SettingsSkeleton() {
  return <div className="space-y-6"><Skeleton className="h-20 w-full" /><div className="grid gap-6 xl:grid-cols-2">{Array.from({ length: 4 }).map((_, index) => <Card key={index}><CardHeader><Skeleton className="h-5 w-40" /><Skeleton className="h-4 w-64" /></CardHeader><CardContent className="space-y-3"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></CardContent></Card>)}</div></div>;
}


