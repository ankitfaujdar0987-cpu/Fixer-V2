import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categories } from "@/lib/services";
import PartnerList from "@/components/PartnerList";

type Props = {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ service?: string }>;
};

async function Content({ params, searchParams }: Props) {
  const { category } = await params;
  const { service } = await searchParams;

  const found = categories.find((c) => c.slug === category);
  if (!found) notFound();

  return (
    <main className="mx-auto max-w-4xl px-5 py-10">
      <Link href="/" className="text-sm font-semibold text-brand">
        Back to home
      </Link>
      <h1 className="mb-1 mt-4 text-3xl font-extrabold sm:text-4xl">
        {found.name}
        {service ? `: ${service}` : ""}
      </h1>
      <p className="mb-8 text-muted">
        Compare verified partners and pick the one you like.
      </p>
      <PartnerList
        slug={found.slug}
        categoryName={found.name}
        service={service ?? null}
      />
    </main>
  );
}

export default function CategoryPage(props: Props) {
  return (
    <Suspense fallback={<main className="p-8 text-muted">Loading...</main>}>
      <Content {...props} />
    </Suspense>
  );
}