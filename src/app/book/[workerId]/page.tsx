import { Suspense } from "react";
import Link from "next/link";
import BookingForm from "@/components/BookingForm";

type Props = {
  params: Promise<{ workerId: string }>;
  searchParams: Promise<{ category?: string; service?: string }>;
};

async function Content({ params, searchParams }: Props) {
  const { workerId } = await params;
  const { category, service } = await searchParams;

  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <Link
        href={category ? `/services/${category}` : "/"}
        className="text-sm font-semibold text-brand"
      >
        Back
      </Link>
      <h1 className="mb-6 mt-4 text-3xl font-extrabold">Book this partner</h1>
      <BookingForm
        partnerId={workerId}
        slug={category ?? ""}
        service={service ?? null}
      />
    </main>
  );
}

export default function BookPage(props: Props) {
  return (
    <Suspense fallback={<main className="p-8 text-muted">Loading...</main>}>
      <Content {...props} />
    </Suspense>
  );
}