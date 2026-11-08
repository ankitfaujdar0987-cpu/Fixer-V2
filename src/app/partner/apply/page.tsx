"use client";
import Link from "next/link";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

type Category = { id: number; name: string; slug: string };
type Picked = { price: string; type: "fixed" | "hourly" };

export default function PartnerApplyPage() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [picked, setPicked] = useState<Record<number, Picked>>({});
  const [experience, setExperience] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setReady(true);
    });
    supabase
      .from("categories")
      .select("id, name, slug")
      .is("parent_id", null)
      .order("sort_order")
      .then(({ data }) => setCategories(data ?? []));
  }, []);

  async function login() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/partner/apply`,
      },
    });
  }

  function toggle(id: number) {
    setPicked((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = { price: "", type: "fixed" };
      return next;
    });
  }

  function update(id: number, change: Partial<Picked>) {
    setPicked((prev) => ({ ...prev, [id]: { ...prev[id], ...change } }));
  }

  function getLocation() {
    setMessage("");
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () =>
        setMessage(
          "Could not get your location. Please allow location access and try again."
        )
    );
  }

  async function save() {
    setMessage("");
    const chosen = Object.entries(picked);
    const years = Number(experience);

    if (chosen.length === 0) return setMessage("Choose at least one service.");
    if (chosen.some(([, p]) => !(Number(p.price) > 0)))
      return setMessage("Enter a price for every service you choose.");
    if (experience === "" || !(years >= 0 && years <= 60))
      return setMessage("Enter your years of experience (0 to 60).");
    if (!city.trim()) return setMessage("Enter your city.");
    if (!coords)
      return setMessage(
        'Tap "Use my current location" so customers nearby can find you.'
      );
    if (!user) return;

    setSaving(true);
    const supabase = createClient();

    const fail = (text: string) => {
      setSaving(false);
      setMessage(text);
    };

    const { error: e1 } = await supabase.rpc("become_partner");
    if (e1) return fail(e1.message);

    const { error: e2 } = await supabase
      .from("partner_profiles")
      .update({
        bio: bio.trim() || null,
        experience_years: years,
        service_city: city.trim(),
        location: `SRID=4326;POINT(${coords.lng} ${coords.lat})`,
      })
      .eq("partner_id", user.id);
    if (e2) return fail(e2.message);

    const { error: e3 } = await supabase
      .from("partner_services")
      .delete()
      .eq("partner_id", user.id);
    if (e3) return fail(e3.message);

    const rows = chosen.map(([id, p]) => ({
      partner_id: user.id,
      category_id: Number(id),
      price: Number(p.price),
      price_type: p.type,
    }));
    const { error: e4 } = await supabase.from("partner_services").insert(rows);
    if (e4) return fail(e4.message);

    setSaving(false);
    setSaved(true);
  }

  if (!ready) {
    return <main className="p-8 text-muted">Loading...</main>;
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-xl px-5 py-16">
        <h1 className="mb-3 text-3xl font-extrabold">Become a Fixer partner</h1>
        <p className="mb-6 text-muted">
          Log in with Google first, then we ask a few questions about your
          work.
        </p>
        <button
          type="button"
          onClick={login}
          className="min-h-12 cursor-pointer rounded-xl bg-brand px-6 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Login with Google
        </button>
      </main>
    );
  }

  if (saved) {
    return (
      <main className="mx-auto max-w-xl px-5 py-16">
        <h1 className="mb-3 text-3xl font-extrabold">Details saved</h1>
        <p className="mb-6 text-muted">
          Your services and details are saved. Next, add your selfie and ID
          photo.
        </p>
        <Link
          href="/partner/documents"
          className="inline-flex min-h-12 items-center rounded-xl bg-brand px-6 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Add my documents
        </Link>
      </main>
    );
  }

  const inputClass =
    "min-h-11 w-full rounded-xl border border-line bg-white px-3.5 text-[15px]";

  return (
    <main className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="mb-2 text-3xl font-extrabold">Become a Fixer partner</h1>
      <p className="mb-8 text-muted">
        Tell us what work you do. You add your documents in the next step.
      </p>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-bold">Services you offer</h2>
        <div className="grid gap-3">
          {categories.map((c) => {
            const p = picked[c.id];
            return (
              <div
                key={c.id}
                className="rounded-2xl border border-line bg-white p-4"
              >
                <label className="flex cursor-pointer items-center gap-3 font-semibold">
                  <input
                    type="checkbox"
                    checked={!!p}
                    onChange={() => toggle(c.id)}
                    className="h-5 w-5"
                  />
                  {c.name}
                </label>
                {p && (
                  <div className="mt-3 flex flex-wrap gap-3">
                    <label className="flex-1 min-w-[140px] text-sm">
                      <span className="mb-1 block text-muted">Your price (₹)</span>
                      <input
                        type="number"
                        min="1"
                        value={p.price}
                        onChange={(e) => update(c.id, { price: e.target.value })}
                        className={inputClass}
                      />
                    </label>
                    <label className="flex-1 min-w-[140px] text-sm">
                      <span className="mb-1 block text-muted">Charged</span>
                      <select
                        value={p.type}
                        onChange={(e) =>
                          update(c.id, {
                            type: e.target.value as "fixed" | "hourly",
                          })
                        }
                        className={inputClass}
                      >
                        <option value="fixed">Per job</option>
                        <option value="hourly">Per hour</option>
                      </select>
                    </label>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="mb-8 grid gap-4">
        <h2 className="text-xl font-bold">About you</h2>
        <label className="text-sm">
          <span className="mb-1 block font-semibold">Years of experience</span>
          <input
            type="number"
            min="0"
            max="60"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-semibold">Short bio (optional)</span>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell customers about your skills and the work you do"
            className="w-full rounded-xl border border-line bg-white px-3.5 py-3 text-[15px]"
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
        <div>
          <button
            type="button"
            onClick={getLocation}
            className="min-h-11 cursor-pointer rounded-xl border border-line bg-white px-4 text-sm font-semibold hover:bg-surface"
          >
            Use my current location
          </button>
          {coords && (
            <span className="ml-3 text-sm font-semibold text-green-700">
              Location saved
            </span>
          )}
        </div>
      </section>

      {message && (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {message}
        </p>
      )}

      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="min-h-12 cursor-pointer rounded-xl bg-brand px-7 text-[15px] font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save and continue"}
      </button>
    </main>
  );
}