"use client";

import Link from "next/link";
import { useState } from "react";
import ConnectedBooking from "./ConnectedBooking";
import type { ConnectedData, MyBooking } from "@/lib/sampleData";

type Status = MyBooking["status"];
type Draft = { rating: number; comment: string };

const TABS: { key: string; label: string; match: Status[]; empty: string }[] = [
  {
    key: "active",
    label: "Active",
    match: ["requested", "accepted"],
    empty: "No active bookings. Book a service from the home page.",
  },
  {
    key: "completed",
    label: "Completed",
    match: ["completed"],
    empty: "Completed jobs show up here.",
  },
  {
    key: "cancelled",
    label: "Cancelled",
    match: ["declined", "cancelled"],
    empty: "Cancelled bookings show up here.",
  },
];

const chip: Record<Status, { label: string; style: string }> = {
  requested: { label: "Waiting for partner", style: "bg-accent-light text-ink" },
  accepted: { label: "Accepted", style: "bg-brand-light text-brand-dark" },
  completed: { label: "Completed", style: "bg-green-50 text-green-700" },
  declined: { label: "Not available", style: "bg-surface text-muted" },
  cancelled: { label: "Cancelled", style: "bg-surface text-muted" },
};

function Stars({ value }: { value: number }) {
  return (
    <span
      role="img"
      aria-label={`${value} out of 5 stars`}
      className="text-lg tracking-tight text-accent"
    >
      {"★".repeat(value)}
      <span className="text-line">{"★".repeat(5 - value)}</span>
    </span>
  );
}

export default function MyBookingsView({
  bookings,
  me,
  sample = false,
}: {
  bookings: MyBooking[];
  me: { name: string; phone: string };
  sample?: boolean;
}) {
  const [items, setItems] = useState(bookings);
  const [tab, setTab] = useState("active");
  const [chatId, setChatId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const current = TABS.find((t) => t.key === tab) ?? TABS[0];
  const visible = items.filter((b) => current.match.includes(b.status));

  function cancel(id: string) {
    setItems((list) =>
      list.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b))
    );
    setChatId((c) => (c === id ? null : c));
  }

  function setDraft(id: string, change: Partial<Draft>) {
    setDrafts((d) => ({
      ...d,
      [id]: { rating: 0, comment: "", ...d[id], ...change },
    }));
  }

  function submitReview(id: string) {
    const d = drafts[id];
    if (!d || d.rating < 1) {
      return setErrors((e) => ({ ...e, [id]: "Choose a star rating." }));
    }
    setItems((list) =>
      list.map((b) =>
        b.id === id
          ? { ...b, reviewed: { rating: d.rating, comment: d.comment.trim() } }
          : b
      )
    );
    setErrors((e) => ({ ...e, [id]: "" }));
  }

  const connected = (b: MyBooking): ConnectedData => ({
    booking: {
      id: b.id,
      service: b.service,
      price: b.price,
      when: b.when,
      locationUrl: "",
    },
    customer: me,
    partner: { name: b.partner, phone: b.phone, role: b.role },
    messages: [],
  });

  return (
    <main className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
      {sample && (
        <p className="mb-6 rounded-xl bg-accent-light px-4 py-3 text-sm font-semibold text-ink">
          Sample data: these bookings are not real, and the buttons only change
          this screen. We connect it to your real bookings later.
        </p>
      )}

      <h1 className="text-3xl font-extrabold">My bookings</h1>
      <p className="mb-6 text-muted">Track the services you booked</p>

      <div
        role="tablist"
        aria-label="Booking status"
        className="mb-6 flex flex-wrap gap-2 rounded-2xl bg-surface p-1.5"
      >
        {TABS.map((t) => {
          const count = items.filter((b) => t.match.includes(b.status)).length;
          const active = t.key === tab;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.key)}
              className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-xl px-4 text-sm font-semibold ${
                active ? "bg-white text-brand shadow-sm" : "text-muted"
              }`}
            >
              {t.label}
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                  active ? "bg-brand-light text-brand-dark" : "bg-line"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div role="tabpanel">
        {visible.length === 0 ? (
          <div className="rounded-2xl bg-surface p-10 text-center">
            <div className="text-lg font-bold">Nothing here</div>
            <p className="mb-4 text-muted">{current.empty}</p>
            <Link
              href="/"
              className="inline-flex min-h-11 items-center rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              Book a service
            </Link>
          </div>
        ) : (
          <ul className="grid gap-4">
            {visible.map((b) => {
              const st = chip[b.status];
              const first = b.partner.split(" ")[0];
              const draft = drafts[b.id] ?? { rating: 0, comment: "" };

              return (
                <li key={b.id}>
                  <article className="rounded-2xl border border-line bg-white p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span
                          aria-hidden="true"
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-light font-display text-lg font-extrabold text-brand"
                        >
                          {b.partner.charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <div className="font-bold">{b.partner}</div>
                          <div className="text-sm text-muted">
                            {b.role} · {b.service}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-extrabold">₹{b.price}</span>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${st.style}`}
                        >
                          {st.label}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 text-sm text-muted">
                      {b.when} · {b.id}
                    </div>

                    {b.status === "requested" && (
                      <div className="mt-4">
                        <p className="mb-3 text-sm text-muted">
                          Waiting for {first} to accept. This page updates by
                          itself.
                        </p>
                        <button
                          type="button"
                          onClick={() => cancel(b.id)}
                          className="min-h-11 cursor-pointer rounded-xl border border-line bg-white px-5 text-sm font-semibold hover:bg-surface"
                        >
                          Cancel request
                        </button>
                      </div>
                    )}

                    {b.status === "accepted" && (
                      <div className="mt-4 flex flex-wrap gap-3">
                        <a
                          href={`tel:${b.phone}`}
                          className="flex min-h-11 items-center rounded-xl bg-accent px-5 text-sm font-bold text-ink hover:bg-accent-dark"
                        >
                          Call {first}
                        </a>
                        <button
                          type="button"
                          aria-expanded={chatId === b.id}
                          onClick={() =>
                            setChatId((c) => (c === b.id ? null : b.id))
                          }
                          className="min-h-11 cursor-pointer rounded-xl border border-line bg-white px-5 text-sm font-semibold hover:bg-surface"
                        >
                          {chatId === b.id ? "Close chat" : "Chat"}
                        </button>
                        <button
                          type="button"
                          onClick={() => cancel(b.id)}
                          className="min-h-11 cursor-pointer rounded-xl px-4 text-sm font-semibold text-red-700 hover:bg-red-50"
                        >
                          Cancel booking
                        </button>
                      </div>
                    )}

                    {b.status === "declined" && (
                      <Link
                        href="/"
                        className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-dark"
                      >
                        Find another partner
                      </Link>
                    )}

                    {b.status === "completed" && b.reviewed && (
                      <div className="mt-4 rounded-xl bg-surface p-4">
                        <div className="mb-1 flex items-center gap-2">
                          <Stars value={b.reviewed.rating} />
                          <span className="text-sm font-semibold">
                            Thanks for your review
                          </span>
                        </div>
                        {b.reviewed.comment && (
                          <p className="text-sm">{b.reviewed.comment}</p>
                        )}
                      </div>
                    )}

                    {b.status === "completed" && !b.reviewed && (
                      <div className="mt-4 rounded-xl bg-surface p-4">
                        <div className="mb-2 font-semibold">
                          How was {first}?
                        </div>
                        <div
                          role="radiogroup"
                          aria-label="Rating"
                          className="mb-3 flex gap-1"
                        >
                          {[1, 2, 3, 4, 5].map((n) => (
                            <button
                              key={n}
                              type="button"
                              role="radio"
                              aria-checked={draft.rating === n}
                              aria-label={`${n} star${n > 1 ? "s" : ""}`}
                              onClick={() => setDraft(b.id, { rating: n })}
                              className={`cursor-pointer text-3xl leading-none ${
                                n <= draft.rating ? "text-accent" : "text-line"
                              }`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                        <textarea
                          rows={2}
                          placeholder="Write a short review (optional)"
                          value={draft.comment}
                          onChange={(e) =>
                            setDraft(b.id, { comment: e.target.value })
                          }
                          className="mb-3 w-full rounded-xl border border-line bg-white px-3.5 py-3 text-[15px]"
                        />
                        {errors[b.id] && (
                          <p className="mb-3 text-sm font-semibold text-red-700">
                            {errors[b.id]}
                          </p>
                        )}
                        <button
                          type="button"
                          onClick={() => submitReview(b.id)}
                          className="min-h-11 cursor-pointer rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-dark"
                        >
                          Submit review
                        </button>
                      </div>
                    )}
                  </article>

                  {chatId === b.id && b.status === "accepted" && (
                    <div className="mt-4">
                      <ConnectedBooking
                        key={b.id}
                        data={connected(b)}
                        viewAs="customer"
                        sample={sample}
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}