"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { Category } from "@/lib/services";
import CategoryIcon from "./CategoryIcon";

type Props = {
  category: Category | null;
  open: boolean;
  onClose: () => void;
};

// Popup on desktop, bottom sheet that slides up on phones.
export default function SubServiceSheet({ category, open, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden"; // stop the page scrolling behind
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose(); // click outside closes
      }}
      aria-hidden={!open}
      className={`fixed inset-0 z-50 flex items-end justify-center bg-ink/55 backdrop-blur-[3px] transition-[opacity,visibility] duration-300 sm:items-center sm:p-5 ${
        open ? "visible opacity-100" : "invisible opacity-0"
      }`}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
        className={`flex max-h-[88vh] w-full flex-col rounded-t-3xl bg-white p-5 shadow-2xl transition duration-300 ease-out sm:max-w-xl sm:rounded-3xl sm:p-7 ${
          open
            ? "translate-y-0 sm:scale-100"
            : "translate-y-full sm:translate-y-8 sm:scale-95"
        }`}
      >
        {category && (
          <>
            <div className="mb-5 flex items-center gap-3.5">
              <span className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-brand-light text-brand">
                <CategoryIcon paths={category.icon} />
              </span>
              <div className="flex-1">
                <h2 id="sheet-title" className="text-2xl font-extrabold">
                  {category.name}
                </h2>
                <p className="text-sm text-muted">
                  What do you need help with?
                </p>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-surface text-muted hover:bg-line"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </div>

            <ul className="grid gap-2.5 overflow-y-auto pb-1 sm:grid-cols-2">
              {category.subs.map((sub) => (
                <li key={sub}>
                  <Link
                    href={`/services/${category.slug}?service=${encodeURIComponent(sub)}`}
                    className="flex min-h-12 items-center rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-brand hover:bg-brand-light hover:text-brand-dark"
                  >
                    {sub}
                  </Link>
                </li>
              ))}
            </ul>

            <Link
              href={`/services/${category.slug}`}
              className="mt-4 flex min-h-12 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              View all {category.name} partners
            </Link>
          </>
        )}
      </div>
    </div>
  );
}