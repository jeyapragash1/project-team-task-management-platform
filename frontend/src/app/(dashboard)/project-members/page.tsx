import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Project Members",
};

export default function PlaceholderPage() {
  return (
    <section className="border border-border bg-card p-6 shadow-sm">
      <div className="max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Dashboard Shell</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Project Members</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Project membership management placeholder. Business functionality will be implemented in a later frontend module.
        </p>
      </div>
    </section>
  );
}
