"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

type Info = {
  categoryId: number;
  categoryName: string;
  name: string;
  price: number;
  priceType: string;
};

type Status = "requested" | "accepted" | "declined" | "completed" | "cancelled";

export default function BookingForm({
  partnerId,
  slug,
  service,
}: {
  partnerId: string;
  slug: string;
  service: string | null;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [info, setInfo] = useState<Info | null>(null);
  const [missing, setMissing] = useState(false);

  const [hasPhone, setHasPhone] = useState(true);
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const [bookingId, setBookingId] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("requested");
  const [partnerPhone, setPartnerPhone] = useState<string | null>(null);

  // Load the partner, the price and the logged-in user
  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: auth } = await supabase.auth.getUser();
      setUser(auth.user);

      if (auth.user) {
        const { data: me } = await supabase
          .from("profiles")
          .select("phone")
          .eq("id", auth.user.id)
          .maybeSingle();
        setHasPhone(!!me?.phone);
      }

      const { data: cat } = await supabase
        .from("categories")
        .select("id, name")
        .eq("slug", slug)
        .maybeSingle();

      const { data: partner } = await supabase
        .from("partner_public")
        .select("full_name")
        .eq("partner_id", partnerId)
        .maybeSingle();

      if (cat && partner) {
        const { data: svc } = await supabase
          .from("partner_services")
          .select("price, price_type")
          .eq("partner_id", partnerId)
          .eq("category_id", cat.id)
          .maybeSingle();

        if (svc) {
          setInfo({
            categoryId: cat.id,
            categoryName: cat.name,
            name: partner.full_name ?? "Fixer partner",
            price: svc.price,
            priceType: svc.price_type,
          });
        } else {
          setMissing(true);
        }
      } else {
        setMissing(true);
      }
      setReady(true);
    }
    load();
  }, [partnerId, slug]);

  // After booking: watch the status live (with a backup check every 5 seconds)
  useEffect(() => {
    if (!bookingId) return;
    const supabase = createClient();

    const channel = supabase
      .channel(`booking-${bookingId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "bookings",
          filter: `id=eq.${bookingId}`,
        },
        (payload) => setStatus(payload.new.status as Status)
      )
      .subscribe();

    const timer = setInterval(async () => {
      const { data } = await supabase
        .from("bookings")
        .select("status")
        .eq("id", bookingId)
        .maybeSingle();
      if (data) setStatus(data.status as Status);
    }, 5000);

    return () => {
      clearInterval(timer);
      supabase.removeChannel(channel);
    };
  }, [bookingId]);

  // When the partner accepts, fetch their number
  useEffect(() => {
    if (status !== "accepted") return;
    const supabase = createClient();
    supabase
      .from("profiles")
      .select("phone")
      .eq("id", partnerId)
      .maybeSingle()
      .then(({ data }) => setPartnerPhone(data?.phone ?? null));
  }, [status, partnerId]);

  async function login() {
    const supabase = createClient();
    const here = window.location.pathname + window.location.search;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(here)}`,
      },
    });
  }

  async function bookNow() {
    setMessage("");
    if (!user || !info) return;

    if (user.id === partnerId) {
      return setMessage(
        "You cannot book yourself. Log in with a different Google account to test a booking."
      );
    }

    let phoneToSave: string | null = null;
    if (!hasPhone) {
      const digits = phone.replace(/\D/g, "").slice(-10);
      if (!/^[6-9]\d{9}$/.test(digits)) {
        return setMessage("Enter a valid 10-digit mobile number.");
      }
      phoneToSave = "+91" + digits;
    }

    setBusy(true);

    let pos: GeolocationPosition;
    try {
      pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
        })
      );
    } catch {
      setBusy(false);
      return setMessage(
        "We need your location so the partner can find you. Please allow location access and try again."
      );
    }

    const supabase = createClient();

    if (phoneToSave) {
      const { error } = await supabase
        .from("profiles")
        .update({ phone: phoneToSave })
        .eq("id", user.id);
      if (error) {
        setBusy(false);
        return setMessage(error.message);
      }
      setHasPhone(true);
    }

    const problem =
      [service, note.trim()].filter(Boolean).join(" - ") || info.categoryName;

    const { data, error } = await supabase.rpc("create_booking", {
      p_partner: partnerId,
      p_category: info.categoryId,
      p_problem: problem,
      p_address: null,
      p_lat: pos.coords.latitude,
      p_lng: pos.coords.longitude,
      p_scheduled: null,
    });
    setBusy(false);

    if (error) return setMessage(error.message);
    setStatus("requested");
    setBookingId(data as string);
  }

  async function cancel() {
    if (!bookingId) return;
    const supabase = createClient();
    const { error } = await supabase.rpc("set_booking_status", {
      p_booking: bookingId,
      p_status: "cancelled",
    });
    if (error) return setMessage(error.message);
    setStatus("cancelled");
  }

  const linkBtn =
    "inline-flex min-h-12 items-center rounded-xl bg-brand px-6 text-sm font-semibold text-white hover:bg-brand-dark";

  if (!ready) return <p className="text-muted">Loading...</p>;

  if (missing || !info) {
    return (
      <div className="rounded-2xl bg-surface p-6">
        <p className="font-semibold">This partner is not available.</p>
        <Link href="/" className="mt-3 inline-block text-sm font-semibold text-brand">
          Back to home
        </Link>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-2xl bg-surface p-6">
        <p className="mb-4 font-semibold">
          Log in to book {info.name}. It takes one click.
        </p>
        <button
          type="button"
          onClick={login}
          className="min-h-12 cursor-pointer rounded-xl bg-brand px-6 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Login with Google
        </button>
      </div>
    );
  }

  // After booking: live status
  if (bookingId) {
    return (
      <div className="rounded-2xl bg-surface p-6">
        {status === "requested" && (
          <>
            <h2 className="mb-2 text-2xl font-extrabold">Request sent</h2>
            <p className="mb-5 text-muted">
              Waiting for {info.name} to accept. This page updates by itself.
            </p>
            <button
              type="button"
              onClick={cancel}
              className="min-h-11 cursor-pointer rounded-xl border border-line bg-white px-5 text-sm font-semibold hover:bg-white/60"
            >
              Cancel request
            </button>
          </>
        )}

        {status === "accepted" && (
          <>
            <h2 className="mb-2 text-2xl font-extrabold">
              {info.name} accepted
            </h2>
            <p className="mb-5 text-muted">
              Your partner has your location and is on the way.
            </p>
            {partnerPhone ? (
              <a
                href={`tel:${partnerPhone}`}
                className="inline-flex min-h-12 items-center rounded-xl bg-accent px-6 text-sm font-bold text-ink hover:bg-accent-dark"
              >
                Call {partnerPhone}
              </a>
            ) : (
              <p className="text-sm text-muted">
                The partner has not added a phone number yet.
              </p>
            )}
          </>
        )}

        {status === "declined" && (
          <>
            <h2 className="mb-2 text-2xl font-extrabold">Not available</h2>
            <p className="mb-5 text-muted">
              {info.name} could not take this job. Try another partner.
            </p>
            <Link href={`/services/${slug}`} className={linkBtn}>
              See other partners
            </Link>
          </>
        )}

        {status === "cancelled" && (
          <>
            <h2 className="mb-2 text-2xl font-extrabold">Request cancelled</h2>
            <Link href="/" className={linkBtn}>
              Back to home
            </Link>
          </>
        )}

        {status === "completed" && (
          <>
            <h2 className="mb-2 text-2xl font-extrabold">Job completed</h2>
            <p className="mb-5 text-muted">Thank you for using Fixer.</p>
            <Link href="/" className={linkBtn}>
              Back to home
            </Link>
          </>
        )}

        {message && (
          <p className="mt-4 text-sm font-semibold text-red-700">{message}</p>
        )}
      </div>
    );
  }

  // One-tap booking screen
  return (
    <div>
      <div className="mb-6 flex items-center gap-4 rounded-2xl border border-line bg-white p-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-light font-display text-xl font-extrabold text-brand">
          {info.name.charAt(0).toUpperCase()}
        </span>
        <div className="flex-1">
          <div className="text-lg font-bold">{info.name}</div>
          <div className="text-sm text-muted">
            {service ?? info.categoryName}
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-extrabold">₹{info.price}</div>
          <div className="text-xs text-muted">
            {info.priceType === "hourly" ? "per hour" : "per job"}
          </div>
        </div>
      </div>

      {!hasPhone && (
        <label className="mb-4 block text-sm">
          <span className="mb-1 block font-semibold">
            Your mobile number (asked only once)
          </span>
          <input
            type="tel"
            inputMode="numeric"
            placeholder="10-digit number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="min-h-11 w-full rounded-xl border border-line bg-white px-3.5 text-[15px]"
          />
        </label>
      )}

      <label className="mb-5 block text-sm">
        <span className="mb-1 block font-semibold">
          Message for the partner (optional)
        </span>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Example: 2nd floor, call when you reach"
          className="min-h-11 w-full rounded-xl border border-line bg-white px-3.5 text-[15px]"
        />
      </label>

      {message && (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {message}
        </p>
      )}

      <button
        type="button"
        onClick={bookNow}
        disabled={busy}
        className="min-h-14 w-full cursor-pointer rounded-xl bg-accent px-7 text-base font-bold text-ink hover:bg-accent-dark disabled:opacity-60"
      >
        {busy ? "Sending..." : "Book now"}
      </button>

      <p className="mt-3 text-center text-sm text-muted">
        Tapping Book now shares your live location, your name and your mobile
        number with {info.name}.
      </p>
    </div>
  );
}