import BookingsView from "@/components/BookingsView";
import { SAMPLE_BOOKINGS, SAMPLE_PARTNER } from "@/lib/sampleData";

export default function PreviewBookingsPage() {
  return (
    <BookingsView bookings={SAMPLE_BOOKINGS} partner={SAMPLE_PARTNER} sample />
  );
}