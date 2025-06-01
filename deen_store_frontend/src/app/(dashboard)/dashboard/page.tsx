import Dashboard from "./Dashboard";
import { dashboardMetadata } from "./metadata";

export const metadata = dashboardMetadata;

export default function DashboardPage() {
  // For example, just hardcode false for now or get from state/context
  const isSidebarCollapsed = false;

  return <Dashboard isSidebarCollapsed={isSidebarCollapsed} />;
}