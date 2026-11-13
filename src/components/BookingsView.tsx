"use client";

import { useState } from "react";
import ConnectedBooking from "./ConnectedBooking";
import type { ConnectedData, SampleBooking } from "@/lib/sampleData";

type Status = SampleBooking["status"];

const TABS: { key: string; label: string; match: Status[]; empty: string }[] = [
  {
    key: "pending",
    label: "Pending",
    match: ["requested"],
    empty: "No new requests. They appear here instantly.",
  },
  {
    key: "accepted",
    label: "Accepted",
    match: ["accepted"],
    empty: "No active jobs right now.",
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
    empty: "Declined and cancelled requests show up here.",
  },
];

const chip: Record<Status, { label: string; style: string }> = {
  requested: { label: "New request", style: "bg-accent-light text-ink" },
  accepted: { label: "Accepted", style: "bg-brand-light text-brand-dark" },
  completed: { label: "Completed", style: "bg-green-50 text-green-700" },
  declined: { label: "Declined", style: "bg-surface text-muted" },
  cancelled: { label: "Cancelled", style: "bg-surface text-muted" },
};

export default function BookingsView({
  bookings,
  partner,
  sample = false,
}: {
  bookings: SampleBooking[];
  partner: { name: string; phone: string; role: string };
  sample?: boolean;
}) {
  const [items, setItems] = useState(bookings);
  const [tab, setTab] = useState("pending");
  const [chatId, setChatId] = useState<string | null>(null);

  const current = TABS.find((t) => t.key === tab) ?? TABS[0];
  const visible = items.filter((b) => current.match.includes(b.status));

  function setStatus(id: string, status: Status) {
    setItems((list) => list.map((b) => (b.id === id ? { ...b, status } : b)));
    if (status === "accepted") setTab("accepted");
    if (status !== "accepted") setChatId((c) => (c === id ? null : c));
  }

  const connected = (b: SampleBooking): ConnectedData => ({
    booking: {
      id: b.id,
      service: b.service,
      price: b.price,
      when: b.when,
      locationUrl: b.mapsUrl,
    },
    customer: { name: b.customer, phone: b.phone },
    partner,
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

      <h1 className="text-3xl font-extrabold">Bookings</h1>
      <p className="mb-6 text-muted">Manage your service requests</p>

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
            <p className="text-muted">{current.empty}</p>
          </div>
        ) : (
          <ul className="grid gap-4">
            {visible.map((b) => {
              const st = chip[b.status];
              const first = b.customer.split(" ")[0];
              return (
                <li key={b.id}>
                  <article className="rounded-2xl border border-line bg-white p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span
                          aria-hidden="true"
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-light font-display text-lg font-extrabold text-brand"
                        >
                          {b.customer.charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <div className="font-bold">{b.customer}</div>
                          <div className="text-sm text-muted">
                            {b.service} · {b.id}
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

                    <p className="mt-3 text-[15px]">{b.note}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
                      <span>{b.when}</span>
                      <span>{b.address}</span>
                      <a
                        href={b.mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-brand underline"
                      >
                        Open in Maps
                      </a>
                    </div>

                    {b.status === "requested" && (
                      <div className="mt-4 flex gap-3">
                        <button
                          type="button"
                          onClick={() => setStatus(b.id, "accepted")}
                          className="min-h-11 cursor-pointer rounded-xl bg-accent px-6 text-sm font-bold text-ink hover:bg-accent-dark"
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={() => setStatus(b.id, "declined")}
                          className="min-h-11 cursor-pointer rounded-xl border border-line bg-white px-6 text-sm font-semibold hover:bg-surface"
                        >
                          Decline
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
                          onClick={() => setStatus(b.id, "completed")}
                          className="min-h-11 cursor-pointer rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-dark"
                        >
                          Mark completed
                        </button>
                      </div>
                    )}
                  </article>

                  {chatId === b.id && b.status === "accepted" && (
                    <div className="mt-4">
                      <ConnectedBooking
                        key={b.id}
                        data={connected(b)}
                        viewAs="partner"
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