"use client";

import { useState } from "react";
import ConnectedBooking from "@/components/ConnectedBooking";
import { SAMPLE_CONNECTED } from "@/lib/sampleData";

export default function PreviewConnectedPage() {
  const [viewAs, setViewAs] = useState<"customer" | "partner">("customer");

  return (
    <main className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
      <h1 className="text-3xl font-extrabold">Connected booking</h1>
      <p className="mb-5 mt-1 text-muted">
        What both people see after the partner accepts. Switch sides to see
        each view. Send a message to try the chat.
      </p>

      <div
        role="group"
        aria-label="View as"
        className="mb-6 inline-flex rounded-xl bg-surface p-1"
      >
        {(["customer", "partner"] as const).map((v) => (
          <button
            key={v}
            type="button"
            aria-pressed={viewAs === v}
            onClick={() => setViewAs(v)}
            className={`min-h-10 cursor-pointer rounded-lg px-5 text-sm font-semibold capitalize ${
              viewAs === v ? "bg-white text-brand shadow-sm" : "text-muted"
            }`}
          >
            View as {v}
          </button>
        ))}
      </div>

      <ConnectedBooking data={SAMPLE_CONNECTED} viewAs={viewAs} sample />
    </main>
  );
}