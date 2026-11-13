import MyBookingsView from "@/components/MyBookingsView";
import { SAMPLE_ME, SAMPLE_MY_BOOKINGS } from "@/lib/sampleData";

export default function PreviewMyBookingsPage() {
  return <MyBookingsView bookings={SAMPLE_MY_BOOKINGS} me={SAMPLE_ME} sample />;
}