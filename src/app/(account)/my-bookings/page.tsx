import MyBookingsView from "@/components/MyBookingsView";
import { SAMPLE_ME, SAMPLE_MY_BOOKINGS } from "@/lib/sampleData";

// Shows sample data for now. We connect it to real bookings later.
export default function MyBookingsPage() {
  return <MyBookingsView bookings={SAMPLE_MY_BOOKINGS} me={SAMPLE_ME} sample />;
}