import DashboardView from "@/components/DashboardView";
import { SAMPLE_DASHBOARD } from "@/lib/sampleData";

export default function PreviewDashboardPage() {
  return <DashboardView data={SAMPLE_DASHBOARD} sample />;
}