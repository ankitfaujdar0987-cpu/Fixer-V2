import Link from "next/link";
import { categories } from "@/lib/services";
import CategoryIcon from "./CategoryIcon";

const picks = [
  {
    name: "AC repair",
    category: "Electrician",
    slug: "electrician",
    service: "AC Repair",
    look: "bg-brand-light text-brand",
  },
  {
    name: "Leakage repair",
    category: "Plumber",
    slug: "plumber",
    service: "Leakage Repair",
    look: "bg-accent-light text-accent-dark",
  },
  {
    name: "Home cleaning",
    category: "Cleaner",
    slug: "cleaner",
    service: "Home Cleaning",
    look: "bg-brand-light text-brand",
  },
  {
    name: "Interior painting",
    category: "Painter",
    slug: "painter",
    service: "Interior Painting",
    look: "bg-accent-light text-accent-dark",
  },
  {
    name: "School tuition",
    category: "Tutor",
    slug: "tutor",
    service: "School Tuition",
    look: "bg-brand-light text-brand",
  },
];

export default function QuickPicks() {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-6 pt-16 sm:px-10">
      <h2 className="mb-1.5 text-3xl font-extrabold sm:text-4xl">Quick picks</h2>
      <p className="mb-7 text-[17px] text-muted">
        Jump straight to a common job.
      </p>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5">
        {picks.map((pick) => {
          const category = categories.find((c) => c.slug === pick.slug);
          return (
            <Link
              key={pick.name}
              href={`/services/${pick.slug}?service=${encodeURIComponent(pick.service)}`}
              className="block overflow-hidden rounded-[18px] border border-line transition hover:shadow-lg hover:shadow-brand/15"
            >
              <div
                className={`flex h-28 items-center justify-center ${pick.look}`}
              >
                {category && <CategoryIcon paths={category.icon} size={44} />}
              </div>
              <div className="p-4">
                <div className="font-display text-[17px] font-bold">
                  {pick.name}
                </div>
                <div className="text-sm text-muted">{pick.category}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}