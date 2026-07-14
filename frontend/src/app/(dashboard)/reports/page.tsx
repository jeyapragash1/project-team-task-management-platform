import type { Metadata } from "next";

import { ReportsDashboardPage } from "@/features/reports";

export const metadata: Metadata = {
  title: "Reports",
};

export default function ReportsPage() {
  return <ReportsDashboardPage />;
}
