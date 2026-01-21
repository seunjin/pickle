import type { Metadata } from "next";
import { DashboardContent } from "./DashboardContent";

export const metadata: Metadata = {
  title: "Dashboard | Pickle",
};

export default function DashboardPage() {
  return <DashboardContent />;
}
