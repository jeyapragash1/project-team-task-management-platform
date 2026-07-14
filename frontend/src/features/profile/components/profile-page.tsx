"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, ShieldCheck, UserRound } from "lucide-react";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage, getValidationErrors } from "@/lib/api";
import type { User } from "@/types";

import { useProfile, useProfileMutations } from "../hooks/use-profile";
import {
  changePasswordSchema,
  profileSchema,
  type ChangePasswordFormValues,
  type ProfileFormValues,
} from "../schemas/profile.schema";

function initials(name?: string | null) {
  if (!name) return "?";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function roleNames(user: User) {
  return user.roles?.map((role) => role.name) ?? [];
}

export function ProfilePage() {
  const profileQuery = useProfile();
  const mutations = useProfileMutations();
  const user = profileQuery.data;

  if (profileQuery.isLoading) {
    return <ProfileSkeleton />;
  }

  if (profileQuery.isError) {
    return <ProfileError message={getApiErrorMessage(profileQuery.error)} onRetry={() => profileQuery.refetch()} />;
  }

  if (!user) {
    return <ProfileError message="Unable to load profile." onRetry={() => profileQuery.refetch()} />;
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Review your account information, update your profile, and change your password.
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <ProfileSummary user={user} />
        <div className="space-y-6">
          <EditProfileCard
            user={user}
            isSubmitting={mutations.updateProfile.isPending}
            onSubmit={(values) => mutations.updateProfile.mutateAsync(values)}
          />
          <ChangePasswordCard
            isSubmitting={mutations.changePassword.isPending}
            onSubmit={(values) => mutations.changePassword.mutateAsync(values)}
          />
        </div>
      </div>
    </div>
  );
}

function ProfileSummary({ user }: { user: User }) {
  const roles = roleNames(user);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Summary</CardTitle>
        <CardDescription>Authenticated user profile from Laravel Sanctum.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center gap-4">
          <Avatar size="lg" className="size-14">
            <AvatarFallback className="text-base font-semibold">{initials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <SummaryRow icon={UserRound} label="Name" value={user.name} />
          <SummaryRow icon={Mail} label="Email" value={user.email} />
          <div className="border border-border p-3">
            <p className="text-muted-foreground">Role(s)</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {roles.length > 0 ? roles.map((role, index) => <Badge key={`${role}-${index}`} variant="outline">{role}</Badge>) : <span className="text-muted-foreground">No roles assigned</span>}
            </div>
          </div>
          <div className="border border-border p-3">
            <p className="text-muted-foreground">Active Status</p>
            <Badge className="mt-2" variant={user.is_active ? "secondary" : "destructive"}>{user.is_active ? "Active" : "Inactive"}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EditProfileCard({ user, isSubmitting, onSubmit }: { user: User; isSubmitting: boolean; onSubmit: (values: ProfileFormValues) => Promise<User> }) {
  const form = useForm<ProfileFormValues>({ resolver: zodResolver(profileSchema), defaultValues: { name: user.name, email: user.email } });

  useEffect(() => {
    form.reset({ name: user.name, email: user.email });
  }, [form, user.email, user.name]);

  async function submit(values: ProfileFormValues) {
    try {
      await onSubmit(values);
    } catch (error) {
      Object.entries(getValidationErrors(error)).forEach(([field, messages]) => {
        form.setError(field as keyof ProfileFormValues, { type: "server", message: messages[0] });
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription>Update your display name and email address.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Name" error={form.formState.errors.name?.message}>
            <Input aria-invalid={Boolean(form.formState.errors.name)} {...form.register("name")} />
          </Field>
          <Field label="Email" error={form.formState.errors.email?.message}>
            <Input type="email" aria-invalid={Boolean(form.formState.errors.email)} {...form.register("email")} />
          </Field>
        </div>
        <div className="flex justify-end">
          <Button type="button" onClick={form.handleSubmit(submit)} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ChangePasswordCard({ isSubmitting, onSubmit }: { isSubmitting: boolean; onSubmit: (values: ChangePasswordFormValues) => Promise<void> }) {
  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { current_password: "", password: "", password_confirmation: "" },
  });

  async function submit(values: ChangePasswordFormValues) {
    try {
      await onSubmit(values);
      form.reset();
    } catch (error) {
      Object.entries(getValidationErrors(error)).forEach(([field, messages]) => {
        form.setError(field as keyof ChangePasswordFormValues, { type: "server", message: messages[0] });
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>Use a strong password and keep it private.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Current Password" error={form.formState.errors.current_password?.message}>
            <Input type="password" autoComplete="current-password" aria-invalid={Boolean(form.formState.errors.current_password)} {...form.register("current_password")} />
          </Field>
          <Field label="New Password" error={form.formState.errors.password?.message}>
            <Input type="password" autoComplete="new-password" aria-invalid={Boolean(form.formState.errors.password)} {...form.register("password")} />
          </Field>
          <Field label="Confirm Password" error={form.formState.errors.password_confirmation?.message}>
            <Input type="password" autoComplete="new-password" aria-invalid={Boolean(form.formState.errors.password_confirmation)} {...form.register("password_confirmation")} />
          </Field>
        </div>
        <div className="flex justify-end">
          <Button type="button" onClick={form.handleSubmit(submit)} disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Change Password"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryRow({ icon: Icon, label, value }: { icon: typeof ShieldCheck; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 border border-border p-3">
      <Icon className="size-4 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-muted-foreground">{label}</p>
        <p className="truncate font-medium">{value}</p>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return <label className="space-y-1.5 text-xs font-medium"><span>{label}</span>{children}{error ? <p className="text-xs text-destructive">{error}</p> : null}</label>;
}

function ProfileSkeleton() {
  return <div className="grid gap-6 xl:grid-cols-[360px_1fr]"><Card><CardHeader><Skeleton className="h-5 w-40" /><Skeleton className="h-4 w-64" /></CardHeader><CardContent className="space-y-4"><Skeleton className="h-16 w-full" /><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></CardContent></Card><div className="space-y-6"><Skeleton className="h-48 w-full" /><Skeleton className="h-48 w-full" /></div></div>;
}

function ProfileError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div className="border border-destructive/30 bg-destructive/10 p-4"><p className="text-sm font-medium text-destructive">Unable to load profile</p><p className="mt-1 text-xs text-muted-foreground">{message}</p><Button type="button" variant="outline" className="mt-3" onClick={onRetry}>Retry</Button></div>;
}

