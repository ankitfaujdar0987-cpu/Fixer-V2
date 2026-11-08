"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

type Request = {
  booking_id: string;
  status: "requested" | "accepted" | "declined" | "completed" | "cancelled";
  problem: string | null;
  price: number;
  created_at: string;
  customer_name: string | null;
  customer_phone: string | null;
  lat: number | null;
  lng: number | null;
};

type Me = {
  verification: "pending" | "verified" | "rejected";
  availability: "online" | "offline" | "busy";
} | null;

export default function PartnerDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [me, setMe] = useState<Me>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const [phoneInput, setPhoneInput] = useState("");
  const [requests, setRequests] = useState<Request[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.rpc("partner_requests");
    setRequests((data ?? []) as Request[]);
  }, []);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: auth } = await supabase.auth.getUser();
      setUser(auth.user);

      if (auth.user) {
        const { data: row } = await supabase
          .from("partner_profiles")
          .select("verification, availability")
          .eq("partner_id", auth.user.id)
          .maybeSingle();
        setMe(row as Me);

        const { data: prof } = await supabase
          .from("profiles")
          .select("phone")
          .eq("id", auth.user.id)
          .maybeSingle();
        setPhone(prof?.phone ?? null);

        if (row?.verification === "verified") await loadRequests();
      }
      setReady(true);
    }
    load();
  }, [loadRequests]);

  const verified = me?.verification === "verified";

  // New requests appear live, with a backup check every 5 seconds
  useEffect(() => {
    if (!user || !verified) return;
    const supabase = createClient();

    const channel = supabase
      .channel(`partner-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
          filter: `partner_id=eq.${user.id}`,
        },
        () => loadRequests()
      )
      .subscribe();

    const timer = setInterval(loadRequests, 5000);
    return () => {
      clearInterval(timer);
      supabase.removeChannel(channel);
    };
  }, [user, verified, loadRequests]);

  async function setAvailability(value: "online" | "offline") {
    if (!user) return;
    setMessage("");
    const supabase = createClient();
    const { error } = await supabase
      .from("partner_profiles")
      .update({ availability: value })
      .eq("partner_id", user.id);
    if (error) return setMessage(error.message);
    setMe((m) => (m ? { ...m, availability: value } : m));
  }

  async function savePhone() {
    if (!user) return;
    setMessage("");
    const digits = phoneInput.replace(/\D/g, "").slice(-10);
    if (!/^[6-9]\d{9}$/.test(digits)) {
      return setMessage("Enter a valid 10-digit mobile number.");
    }
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ phone: "+91" + digits })
      .eq("id", user.id);
    if (error) return setMessage(error.message);
    setPhone("+91" + digits);
  }

  async function decide(
    id: string,
    status: "accepted" | "declined" | "completed"
  ) {
    setBusy(id);
    setMessage("");
    const supabase = createClient();
    const { error } = await supabase.rpc("set_booking_status", {
      p_booking: id,
      p_status: status,
    });
    setBusy(null);
    if (error) return setMessage(error.message);
    await loadRequests();
  }

  const box = "mx-auto max-w-xl px-5 py-16";
  const linkBtn =
    "inline-flex min-h-12 items-center rounded-xl bg-brand px-6 text-sm font-semibold text-white hover:bg-brand-dark";

  if (!ready) return <main className="p-8 text-muted">Loading...</main>;

  if (!user) {
    return (
      <main className={box}>
        <h1 className="mb-3 text-3xl font-extrabold">Please log in first</h1>
        <Link href="/" className={linkBtn}>
          Back to home
        </Link>
      </main>
    );
  }

  if (!me) {
    return (
      <main className={box}>
        <h1 className="mb-3 text-3xl font-extrabold">You are not a partner yet</h1>
        <Link href="/partner/apply" className={linkBtn}>
          Become a partner
        </Link>
      </main>
    );
  }

  if (!verified) {
    return (
      <main className={box}>
        <h1 className="mb-3 text-3xl font-extrabold">Not approved yet</h1>
        <p className="mb-6 text-muted">
          Your account is being checked. You can start receiving bookings once
          you are approved.
        </p>
        <Link href="/partner/documents" className={linkBtn}>
          Check my documents
        </Link>
      </main>
    );
  }

  const isOnline = me.availability === "online";
  const fresh = requests.filter((r) => r.status === "requested");
  const active = requests.filter((r) => r.status === "accepted");
  const past = requests.filter(
    (r) => !["requested", "accepted"].includes(r.status)
  );

  function RequestCard({ r }: { r: Request }) {
    return (
      <li className="rounded-2xl border border-line bg-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-lg font-bold">
              {r.customer_name ?? "Customer"}
            </div>
            {r.customer_phone && (
              <a
                href={`tel:${r.customer_phone}`}
                className="text-sm font-semibold text-brand"
              >
                {r.customer_phone}
              </a>
            )}
          </div>
          <div className="text-right">
            <div className="text-lg font-extrabold">₹{r.price}</div>
            <div className="text-xs text-muted">
              {new Date(r.created_at).toLocaleString()}
            </div>
          </div>
        </div>

        {r.problem && <p className="mt-3 text-sm">{r.problem}</p>}

        {r.lat !== null && r.lng !== null && (
          <a
            href={`https://www.google.com/maps?q=${r.lat},${r.lng}`}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block text-sm font-semibold text-brand underline"
          >
            Open customer location in Maps
          </a>
        )}

        {r.status === "requested" && (
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              disabled={busy === r.booking_id}
              onClick={() => decide(r.booking_id, "accepted")}
              className="min-h-11 cursor-pointer rounded-xl bg-accent px-6 text-sm font-bold text-ink hover:bg-accent-dark disabled:opacity-60"
            >
              Accept
            </button>
            <button
              type="button"
              disabled={busy === r.booking_id}
              onClick={() => decide(r.booking_id, "declined")}
              className="min-h-11 cursor-pointer rounded-xl border border-line bg-white px-6 text-sm font-semibold hover:bg-surface disabled:opacity-60"
            >
              Decline
            </button>
          </div>
        )}

        {r.status === "accepted" && (
          <button
            type="button"
            disabled={busy === r.booking_id}
            onClick={() => decide(r.booking_id, "completed")}
            className="mt-4 min-h-11 cursor-pointer rounded-xl bg-brand px-6 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
          >
            Mark job as completed
          </button>
        )}

        {!["requested", "accepted"].includes(r.status) && (
          <p className="mt-3 text-sm font-semibold capitalize text-muted">
            {r.status}
          </p>
        )}
      </li>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <h1 className="mb-6 text-3xl font-extrabold">Partner dashboard</h1>

      <section className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-white p-5">
        <div>
          <div className="text-lg font-bold">
            You are {isOnline ? "online" : "offline"}
          </div>
          <p className="text-sm text-muted">
            {isOnline
              ? "Customers can see you are available."
              : "Go online so customers know you are available."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAvailability(isOnline ? "offline" : "online")}
          className={`min-h-11 cursor-pointer rounded-xl px-6 text-sm font-bold ${
            isOnline
              ? "border border-line bg-white hover:bg-surface"
              : "bg-accent text-ink hover:bg-accent-dark"
          }`}
        >
          {isOnline ? "Go offline" : "Go online"}
        </button>
      </section>

      {!phone ? (
        <section className="mb-5 rounded-2xl bg-accent-light p-5">
          <div className="mb-1 font-bold">Add your mobile number</div>
          <p className="mb-3 text-sm text-muted">
            Customers use it to call you after you accept a job.
          </p>
          <div className="flex flex-wrap gap-3">
            <input
              type="tel"
              inputMode="numeric"
              placeholder="10-digit number"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              className="min-h-11 flex-1 rounded-xl border border-line bg-white px-3.5 text-[15px]"
            />
            <button
              type="button"
              onClick={savePhone}
              className="min-h-11 cursor-pointer rounded-xl bg-brand px-6 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              Save
            </button>
          </div>
        </section>
      ) : (
        <p className="mb-5 text-sm text-muted">Your number: {phone}</p>
      )}

      {message && (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {message}
        </p>
      )}

      <h2 className="mb-3 text-xl font-bold">New requests ({fresh.length})</h2>
      {fresh.length === 0 ? (
        <p className="mb-8 rounded-2xl bg-surface p-5 text-muted">
          No new requests. They appear here instantly.
        </p>
      ) : (
        <ul className="mb-8 grid gap-4">
          {fresh.map((r) => (
            <RequestCard key={r.booking_id} r={r} />
          ))}
        </ul>
      )}

      {active.length > 0 && (
        <>
          <h2 className="mb-3 text-xl font-bold">Active jobs</h2>
          <ul className="mb-8 grid gap-4">
            {active.map((r) => (
              <RequestCard key={r.booking_id} r={r} />
            ))}
          </ul>
        </>
      )}

      {past.length > 0 && (
        <>
          <h2 className="mb-3 text-xl font-bold">Earlier</h2>
          <ul className="grid gap-4">
            {past.map((r) => (
              <RequestCard key={r.booking_id} r={r} />
            ))}
          </ul>
        </>
      )}
    </main>
  );
}