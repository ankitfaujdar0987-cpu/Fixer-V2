"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage, ConnectedData } from "@/lib/sampleData";

const QUICK = {
  customer: ["I am at the gate", "Please call me", "How long will you take?"],
  partner: ["On my way", "I have reached", "Running 5 minutes late"],
};

function formatPhone(p: string) {
  const d = p.replace(/\D/g, "").slice(-10);
  return `+91 ${d.slice(0, 5)} ${d.slice(5)}`;
}

function timeNow() {
  return new Date().toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ConnectedBooking({
  data,
  viewAs,
  sample = false,
}: {
  data: ConnectedData;
  viewAs: "customer" | "partner";
  sample?: boolean;
}) {
  const other = viewAs === "customer" ? data.partner : data.customer;
  const otherRole = viewAs === "customer" ? data.partner.role : "Customer";
  const otherSide = viewAs === "customer" ? "partner" : "customer";

  const [messages, setMessages] = useState<ChatMessage[]>(data.messages);
  const [text, setText] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  // Keep the newest message in view
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  function send(body: string) {
    const t = body.trim();
    if (!t) return;
    setMessages((m) => [
      ...m,
      { id: String(Date.now()), from: viewAs, text: t, time: timeNow() },
    ]);
    setText("");

    // In the sample, the other person answers so you can see a live chat
    if (sample) {
      setTimeout(() => {
        setMessages((m) => [
          ...m,
          {
            id: String(Date.now() + 1),
            from: otherSide,
            text:
              viewAs === "customer"
                ? "Okay, I will be there soon."
                : "Okay, thank you.",
            time: timeNow(),
          },
        ]);
      }, 1500);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <div className="grid content-start gap-4">
        <section className="rounded-2xl border border-line bg-white p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold">Booking {data.booking.id}</h2>
            <span className="rounded-full bg-brand-light px-3 py-1 text-xs font-bold text-brand-dark">
              Accepted
            </span>
          </div>
          <dl className="grid gap-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Service</dt>
              <dd className="font-semibold">{data.booking.service}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Time</dt>
              <dd className="font-semibold">{data.booking.when}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Price</dt>
              <dd className="font-semibold">₹{data.booking.price}</dd>
            </div>
          </dl>
          {viewAs === "partner" && (
            <a
              href={data.booking.locationUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-block text-sm font-semibold text-brand underline"
            >
              Open customer location in Maps
            </a>
          )}
          {viewAs === "customer" && (
            <p className="mt-4 text-sm text-muted">
              Your partner has your location and is on the way.
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-line bg-white p-5">
          <div className="mb-4 flex items-center gap-3">
            <span
              aria-hidden="true"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-light font-display text-xl font-extrabold text-brand"
            >
              {other.name.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <div className="truncate font-bold">{other.name}</div>
              <div className="text-sm text-muted">{otherRole}</div>
            </div>
          </div>

          <div className="mb-4 rounded-xl bg-surface p-3">
            <div className="text-xs text-muted">Mobile number</div>
            <div className="text-lg font-bold tracking-wide">
              {formatPhone(other.phone)}
            </div>
            <div className="text-xs text-muted">
              Added automatically from their account
            </div>
          </div>

          <a
            href={`tel:${other.phone}`}
            className="flex min-h-12 items-center justify-center rounded-xl bg-accent px-5 text-[15px] font-bold text-ink transition-colors hover:bg-accent-dark"
          >
            Call {other.name.split(" ")[0]}
          </a>
        </section>
      </div>

      <section className="flex min-h-[460px] flex-col overflow-hidden rounded-2xl border border-line bg-white">
        <header className="flex items-center gap-3 border-b border-line px-5 py-3.5">
          <span
            aria-hidden="true"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-light font-display font-extrabold text-brand"
          >
            {other.name.charAt(0).toUpperCase()}
          </span>
          <div>
            <div className="font-bold leading-tight">{other.name}</div>
            <div className="text-xs text-muted">Chat about this booking</div>
          </div>
        </header>

        <div
          ref={listRef}
          role="log"
          aria-live="polite"
          className="flex max-h-[420px] flex-1 flex-col gap-2.5 overflow-y-auto bg-surface/60 px-4 py-4"
        >
                      {messages.length === 0 && (
            <p className="m-auto text-center text-sm text-muted">
              No messages yet. Say hello with a quick reply below.
            </p>
          )}
          {messages.map((m) => {
            const mine = m.from === viewAs;
            return (
              <div
                key={m.id}
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-[15px] ${
                  mine
                    ? "ml-auto rounded-br-md bg-brand text-white"
                    : "rounded-bl-md bg-white ring-1 ring-line"
                }`}
              >
                <div>{m.text}</div>
                <div
                  className={`mt-1 text-[11px] ${
                    mine ? "text-brand-light" : "text-muted"
                  }`}
                >
                  {m.time}
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-line p-3">
          <div className="mb-3 flex flex-wrap gap-2">
            {QUICK[viewAs].map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => send(q)}
                className="min-h-9 cursor-pointer rounded-full border border-line bg-white px-3.5 text-sm font-semibold hover:bg-brand-light hover:text-brand-dark"
              >
                {q}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(text);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a message"
              aria-label="Type a message"
              className="min-h-11 flex-1 rounded-xl border border-line bg-white px-3.5 text-[15px]"
            />
            <button
              type="submit"
              className="min-h-11 cursor-pointer rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              Send
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}