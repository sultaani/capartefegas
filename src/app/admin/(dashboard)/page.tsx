import { getAnalytics } from "@/lib/analytics";
import { DashboardCharts } from "@/components/admin/DashboardCharts";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const analytics = await getAnalytics();
  return <DashboardCharts analytics={analytics} />;
}
