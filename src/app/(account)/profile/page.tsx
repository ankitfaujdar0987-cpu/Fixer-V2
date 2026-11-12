"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: auth } = await supabase.auth.getUser();
      setUser(auth.user);

      if (auth.user) {
        const { data } = await supabase
          .from("profiles")
          .select("full_name, phone, city")
          .eq("id", auth.user.id)
          .maybeSingle();
        setName(data?.full_name ?? "");
        setPhone((data?.phone ?? "").replace(/^\+91/, ""));
        setCity(data?.city ?? "");
      }
      setReady(true);
    }
    load();
  }, []);

  async function save() {
    if (!user) return;
    setMessage("");
    setSaved(false);

    const digits = phone.replace(/\D/g, "").slice(-10);
    if (!name.trim()) return setMessage("Enter your name.");
    if (digits && !/^[6-9]\d{9}$/.test(digits)) {
      return setMessage("Enter a valid 10-digit mobile number, or leave it empty.");
    }

    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: name.trim(),
        phone: digits ? "+91" + digits : null,
        city: city.trim() || null,
      })
      .eq("id", user.id);
    setSaving(false);

    if (error) return setMessage(error.message);
    setSaved(true);
  }

  const inputClass =
    "min-h-11 w-full rounded-xl border border-line bg-white px-3.5 text-[15px]";

  if (!ready) return <main className="p-8 text-muted">Loading...</main>;

  if (!user) {
    return (
      <main className="mx-auto max-w-xl px-5 py-16">
        <h1 className="mb-3 text-3xl font-extrabold">Please log in first</h1>
        <Link
          href="/"
          className="inline-flex min-h-12 items-center rounded-xl bg-brand px-6 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Back to home
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl px-5 py-12">
      <h1 className="mb-8 text-3xl font-extrabold">My profile</h1>

      <div className="grid gap-4">
        <div className="text-sm">
          <span className="mb-1 block font-semibold">Email</span>
          <div className="min-h-11 rounded-xl bg-surface px-3.5 py-2.5 text-[15px] text-muted">
            {user.email}
          </div>
        </div>

        <label className="text-sm">
          <span className="mb-1 block font-semibold">Full name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-semibold">Mobile number</span>
          <input
            type="tel"
            inputMode="numeric"
            placeholder="10-digit number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClass}
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-semibold">City</span>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className={inputClass}
          />
        </label>
      </div>

      {message && (
        <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {message}
        </p>
      )}
      {saved && (
        <p className="mt-5 rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
          Profile saved.
        </p>
      )}

      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="mt-6 min-h-12 cursor-pointer rounded-xl bg-brand px-7 text-[15px] font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save changes"}
      </button>
    </main>
  );
}