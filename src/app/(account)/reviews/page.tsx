import ReviewsView from "@/components/ReviewsView";
import { SAMPLE_REVIEWS } from "@/lib/sampleData";

// Shows sample data for now. We connect it to real reviews later.
export default function ReviewsPage() {
  return <ReviewsView data={SAMPLE_REVIEWS} sample />;
}