"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  ClipboardList,
  Loader2,
  LockKeyhole,
  Mail,
  UsersRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/constants";
import { getValidationErrors } from "@/lib/api";
import { getAccessToken } from "@/lib/auth/token-storage";
import { cn } from "@/lib/utils";

import { useAuth } from "../hooks/use-auth";
import { useCurrentUser } from "../hooks/use-current-user";
import { loginSchema, type LoginFormValues } from "../schemas/auth.schema";

const featureCards = [
  {
    title: "Team Collaboration",
    description: "Work together efficiently across every project.",
    icon: UsersRound,
  },
  {
    title: "Task Management",
    description: "Assign, organize, and monitor project tasks.",
    icon: ClipboardList,
  },
  {
    title: "Progress & Reports",
    description: "Track performance with timely workspace insights.",
    icon: ChartNoAxesCombined,
  },
];

export function LoginForm() {
  const router = useRouter();
  const token = getAccessToken();
  const { data: user, isLoading: isCheckingSession } = useCurrentUser(Boolean(token));
  const { loginAsync, isLoggingIn } = useAuth();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  useEffect(() => {
    if (token && user) {
      router.replace(ROUTES.dashboard);
    }
  }, [router, token, user]);

  async function onSubmit(values: LoginFormValues) {
    form.clearErrors("root");

    try {
      await loginAsync(values);
    } catch (error) {
      const validationErrors = getValidationErrors(error);
      const entries = Object.entries(validationErrors);

      if (entries.length > 0) {
        entries.forEach(([field, messages]) => {
          form.setError(field as keyof LoginFormValues, {
            type: "server",
            message: messages[0],
          });
        });

        return;
      }

      form.setError("root", {
        type: "server",
        message: "We could not sign you in with those details. Please check your email and password.",
      });
    }
  }

  if (token && isCheckingSession) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-border bg-card px-4 py-3 text-xs text-muted-foreground shadow-sm">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Preparing your workspace...
      </div>
    );
  }

  return (
    <section className="grid w-full max-w-6xl overflow-hidden rounded-xl border border-border bg-card shadow-xl shadow-foreground/5 md:grid-cols-[1.05fr_0.95fr]">
      <div className="hidden border-r border-border bg-muted/35 p-8 md:flex md:flex-col md:justify-between lg:p-10">
        <div>
          <div className="mb-8 inline-flex size-12 items-center justify-center rounded-lg border border-border bg-background text-foreground shadow-sm">
            <BriefcaseBusiness className="size-6" aria-hidden="true" />
          </div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Workspace Management
          </p>
          <h1 className="mt-3 max-w-md text-balance text-3xl font-semibold tracking-tight lg:text-4xl">
            Project Team Management Platform
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-6 text-muted-foreground">
            Manage projects, collaborate with your team, assign tasks, track progress, and generate reports from one centralized workspace.
          </p>
        </div>

        <div className="mt-10 grid gap-3 text-xs text-muted-foreground lg:grid-cols-3">
          {featureCards.map((feature) => {
            const Icon = feature.icon;

            return (
              <div key={feature.title} className="rounded-lg border border-border bg-background/90 p-4 shadow-sm transition-colors hover:border-primary/30 hover:bg-background">
                <div className="mb-3 flex size-9 items-center justify-center rounded-md border border-border bg-muted/50 text-foreground">
                  <Icon className="size-4" aria-hidden="true" />
                </div>
                <p className="font-medium text-foreground">{feature.title}</p>
                <p className="mt-1.5 leading-5">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      <Card className="border-0 bg-card/95 p-2 shadow-none ring-0 sm:p-4">
        <CardHeader className="space-y-2 pb-5">
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>
            Sign in to continue managing your projects, team workload, and reports.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium" htmlFor="email">
                Email address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@example.com"
                  aria-invalid={Boolean(form.formState.errors.email)}
                  className="h-10 pl-9"
                  {...form.register("email")}
                />
              </div>
              {form.formState.errors.email ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.email.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  aria-invalid={Boolean(form.formState.errors.password)}
                  className="h-10 pl-9"
                  {...form.register("password")}
                />
              </div>
              {form.formState.errors.password ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.password.message}
                </p>
              ) : null}
            </div>

            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                className="size-4 rounded-sm border border-input bg-background accent-foreground"
                {...form.register("remember")}
              />
              Keep me signed in on this device
            </label>

            {form.formState.errors.root ? (
              <div className="flex gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <p>{form.formState.errors.root.message}</p>
              </div>
            ) : null}

            <button
              className={cn(buttonVariants({ size: "lg" }), "h-10 w-full rounded-md")}
              disabled={isLoggingIn}
              type="button"
              onClick={form.handleSubmit(onSubmit)}
            >
              {isLoggingIn ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : null}
              {isLoggingIn ? "Signing in..." : "Sign in"}
            </button>

            <p className="text-center text-xs leading-5 text-muted-foreground">
              Access is managed by your organization administrator.
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

