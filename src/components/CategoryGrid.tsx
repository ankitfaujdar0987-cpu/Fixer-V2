"use client";

import { useCallback, useState } from "react";
import { categories, type Category } from "@/lib/services";
import CategoryIcon from "./CategoryIcon";
import SubServiceSheet from "./SubServiceSheet";

export default function CategoryGrid() {
  const [active, setActive] = useState<Category | null>(null);
  const [open, setOpen] = useState(false);

  const closeSheet = useCallback(() => setOpen(false), []);

  function openSheet(category: Category) {
    setActive(category);
    setOpen(true);
  }

  return (
    <>
      <div className="grid max-w-[560px] grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-3">
        {categories.map((category) => (
          <button
            key={category.slug}
            type="button"
            onClick={() => openSheet(category)}
            className="flex cursor-pointer flex-col items-center gap-2.5 rounded-2xl border border-line bg-white px-2 py-4 text-sm font-semibold transition hover:border-brand hover:shadow-lg hover:shadow-brand/15"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-light text-brand">
              <CategoryIcon paths={category.icon} />
            </span>
            {category.name}
          </button>
        ))}
      </div>

      <SubServiceSheet category={active} open={open} onClose={closeSheet} />
    </>
  );
}