import type { Metadata } from "next";

import { SettingsPage } from "@/features/settings";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsRoutePage() {
  return <SettingsPage />;
}
