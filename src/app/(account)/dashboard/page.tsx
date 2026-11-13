import DashboardView from "@/components/DashboardView";
import { SAMPLE_DASHBOARD } from "@/lib/sampleData";

// Shows sample data for now. We connect it to real bookings later.
export default function DashboardPage() {
  return <DashboardView data={SAMPLE_DASHBOARD} sample />;
}