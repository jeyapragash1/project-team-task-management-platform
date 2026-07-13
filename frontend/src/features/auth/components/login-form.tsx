"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2, LockKeyhole, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { APP_NAME, ROUTES } from "@/constants";
import { getValidationErrors } from "@/lib/api";
import { getAccessToken } from "@/lib/auth/token-storage";

import { useAuth } from "../hooks/use-auth";
import { useCurrentUser } from "../hooks/use-current-user";
import { loginSchema, type LoginFormValues } from "../schemas/auth.schema";

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
        message: "Unable to sign in with the provided credentials.",
      });
    }
  }

  if (token && isCheckingSession) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Checking your session...
      </div>
    );
  }

  return (
    <section className="grid w-full max-w-5xl overflow-hidden border border-border bg-card shadow-sm md:grid-cols-[1fr_0.9fr]">
      <div className="hidden border-r border-border bg-muted/40 p-8 md:flex md:flex-col md:justify-between">
        <div>
          <div className="mb-8 inline-flex size-10 items-center justify-center border border-border bg-background">
            <LockKeyhole className="size-5" aria-hidden="true" />
          </div>
          <h1 className="max-w-sm text-balance text-2xl font-semibold tracking-tight">
            Project and Team Task Management Platform
          </h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
            Secure access for administrators, project managers, and team members.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-xs text-muted-foreground">
          <div className="border border-border bg-background p-3">
            <p className="font-medium text-foreground">RBAC</p>
            <p className="mt-1">Role-aware access</p>
          </div>
          <div className="border border-border bg-background p-3">
            <p className="font-medium text-foreground">Sanctum</p>
            <p className="mt-1">Token auth</p>
          </div>
          <div className="border border-border bg-background p-3">
            <p className="font-medium text-foreground">REST</p>
            <p className="mt-1">API driven</p>
          </div>
        </div>
      </div>

      <Card className="border-0 shadow-none ring-0">
        <CardHeader className="space-y-2 pb-4">
          <CardTitle className="text-xl">Sign in</CardTitle>
          <CardDescription>
            Use your administrator-created account to continue to {APP_NAME}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <div className="space-y-1.5">
              <label className="text-xs font-medium" htmlFor="email">
                Email address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@example.com"
                  aria-invalid={Boolean(form.formState.errors.email)}
                  className="pl-8"
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
                <LockKeyhole className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Password@123"
                  aria-invalid={Boolean(form.formState.errors.password)}
                  className="pl-8"
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
                className="size-3.5 border border-input bg-background accent-foreground"
                {...form.register("remember")}
              />
              Keep me signed in on this device
            </label>

            {form.formState.errors.root ? (
              <div className="flex gap-2 border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                <p>{form.formState.errors.root.message}</p>
              </div>
            ) : null}

            <Button className="h-9 w-full" disabled={isLoggingIn} type="submit">
              {isLoggingIn ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : null}
              {isLoggingIn ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
