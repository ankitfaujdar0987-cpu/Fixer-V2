import { notFound } from "next/navigation";
import PartnerWizard from "@/components/PartnerWizard";

// Development-only preview of the partner form. Nothing is saved.
export default function PartnerPreviewPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <PartnerWizard preview />;
}