import BookingsView from "@/components/BookingsView";
import { SAMPLE_BOOKINGS, SAMPLE_PARTNER } from "@/lib/sampleData";

// Shows sample data for now. We connect it to real bookings later.
export default function BookingsPage() {
  return (
    <BookingsView bookings={SAMPLE_BOOKINGS} partner={SAMPLE_PARTNER} sample />
  );
}