import ReviewsView from "@/components/ReviewsView";
import { SAMPLE_REVIEWS } from "@/lib/sampleData";

export default function PreviewReviewsPage() {
  return <ReviewsView data={SAMPLE_REVIEWS} sample />;
}