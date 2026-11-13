import { notFound } from "next/navigation";
import PreviewShell from "@/components/PreviewShell";

// Development-only previews with sample data. No login needed.
export default function PreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (process.env.NODE_ENV !== "development") notFound();

  return <PreviewShell>{children}</PreviewShell>;
}