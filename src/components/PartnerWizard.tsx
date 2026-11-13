"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { categories as uiCategories } from "@/lib/services";
import CategoryIcon from "./CategoryIcon";
import CameraCapture from "./CameraCapture";

type DbCategory = { id: number; name: string; slug: string };
type Picked = { price: string; type: "fixed" | "hourly" };
type Existing = {
  verification: "pending" | "verified" | "rejected";
  submitted_at: string | null;
} | null;

const STEPS = ["Basic info", "Services", "Experience", "Verification", "Review"];
const TITLES = [
  ["Tell us about yourself", "Your basic information"],
  ["What do you offer?", "Choose your services and set your prices"],
  ["Almost done", "Your experience and background"],
  ["Verify your identity", "A live selfie and a photo of your ID"],
  ["Review and submit", "Check your details before you submit"],
];
const HEARD = [
  "Friend or colleague",
  "Social media",
  "Google search",
  "Advertisement",
  "Other",
];
const BENEFITS = [
  {
    title: "Booking requests near you",
    text: "Customers nearby send requests straight to you.",
  },
  {
    title: "Set your own prices",
    text: "You choose what you charge for each service.",
  },
  {
    title: "Work when you want",
    text: "Go online or offline whenever you like.",
  },
  {
    title: "Everything in one place",
    text: "Track your bookings and ratings in one dashboard.",
  },
];
const MAX_BYTES = 5 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const inputClass =
  "min-h-11 w-full rounded-xl border border-line bg-white px-3.5 text-[15px]";

const tenDigits = (v: string) => v.replace(/\D/g, "").slice(-10);
const extOf = (f: File) =>
  f.type === "image/png" ? "png" : f.type === "image/webp" ? "webp" : "jpg";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-semibold">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </span>
      {children}
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-t border-line py-2.5 text-sm first:border-t-0">
      <span className="text-muted">{label}</span>
      <span className="text-right font-semibold">{value}</span>
    </div>
  );
}

function ReviewCard({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-4 rounded-2xl border border-line bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-bold">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="cursor-pointer text-sm font-bold text-brand hover:underline"
        >
          Edit
        </button>
      </div>
      {children}
    </section>
  );
}

export default function PartnerWizard({
  preview = false,
}: {
  preview?: boolean;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [existing, setExisting] = useState<Existing>(null);
  const [dbCats, setDbCats] = useState<DbCategory[]>([]);

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    city: "",
    address: "",
    pincode: "",
    experience: "",
    bio: "",
    heard: "",
  });
  const [idType, setIdType] = useState<"aadhaar" | "pan">("aadhaar");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [picked, setPicked] = useState<Record<number, Picked>>({});
  const [selfie, setSelfie] = useState<{ blob: Blob; url: string } | null>(
    null
  );
  const [idFront, setIdFront] = useState<{ file: File; url: string } | null>(
    null
  );
  const [idBack, setIdBack] = useState<{ file: File; url: string } | null>(
    null
  );
  const [consent, setConsent] = useState(false);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
    // In preview mode there is no logged-in person, so we use a sample email
  const email = preview ? "preview@example.com" : (user?.email ?? "");

  const set = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: auth } = await supabase.auth.getUser();
      setUser(auth.user);

      const { data: cats } = await supabase
        .from("categories")
        .select("id, name, slug")
        .is("parent_id", null)
        .order("sort_order");
      setDbCats((cats ?? []) as DbCategory[]);

      if (auth.user) {
        const [{ data: prof }, { data: partner }] = await Promise.all([
          supabase
            .from("profiles")
            .select("full_name, phone, city")
            .eq("id", auth.user.id)
            .maybeSingle(),
          supabase
            .from("partner_profiles")
            .select("verification, submitted_at")
            .eq("partner_id", auth.user.id)
            .maybeSingle(),
        ]);
        setExisting(partner as Existing);
        setForm((f) => ({
          ...f,
          fullName: prof?.full_name ?? "",
          phone: (prof?.phone ?? "").replace(/^\+91/, ""),
          city: prof?.city ?? "",
        }));
      }
      setReady(true);
    }
    load();
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

  function updatePick(id: number, change: Partial<Picked>) {
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

  function pickId(side: "front" | "back", file: File | undefined) {
    setMessage("");
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type)) {
      return setMessage("Please choose a JPG, PNG or WebP photo.");
    }
    if (file.size > MAX_BYTES) {
      return setMessage("The photo is too large. Maximum size is 5 MB.");
    }
    const item = { file, url: URL.createObjectURL(file) };
    if (side === "front") setIdFront(item);
    else setIdBack(item);
  }

  function validate(s: number): string {
    if (s === 0) {
      if (!form.fullName.trim()) return "Enter your full name.";
      if (!/^[6-9]\d{9}$/.test(tenDigits(form.phone)))
        return "Enter a valid 10-digit mobile number.";
      if (!form.city.trim()) return "Enter your city.";
      if (!form.address.trim()) return "Enter your full address.";
      if (!/^\d{6}$/.test(form.pincode.trim()))
        return "Enter a valid 6-digit pincode.";
      if (!coords)
        return 'Tap "Use my current location" so nearby customers can find you.';
    }
    if (s === 1) {
      const chosen = Object.values(picked);
      if (chosen.length === 0) return "Choose at least one service.";
      if (chosen.some((p) => !(Number(p.price) > 0)))
        return "Enter a price for every service you choose.";
    }
    if (s === 2) {
      const years = Number(form.experience);
      if (form.experience === "" || !(years >= 0 && years <= 60))
        return "Enter your years of experience (0 to 60).";
      if (form.bio.trim().length < 30)
        return "Write at least 30 characters about yourself.";
    }
    if (s === 3) {
      if (!selfie) return "Take your live selfie.";
      if (!idFront)
        return idType === "aadhaar"
          ? "Upload the front of your Aadhaar card."
          : "Upload a photo of your PAN card.";
      if (idType === "aadhaar" && !idBack)
        return "Upload the back of your Aadhaar card.";
    }
    return "";
  }

  function next() {
    const err = validate(step);
    if (err) return setMessage(err);
    setMessage("");
    setStep((s) => s + 1);
    window.scrollTo({ top: 0 });
  }

  function back() {
    setMessage("");
    setStep((s) => s - 1);
    window.scrollTo({ top: 0 });
  }

  function goTo(s: number) {
    setMessage("");
    setStep(s);
    window.scrollTo({ top: 0 });
  }

  async function submit() {
    setMessage("");
    for (let s = 0; s < 4; s++) {
      const err = validate(s);
      if (err) {
        setStep(s);
        return setMessage(err);
      }
    }
    if (!consent) return setMessage("Please tick the confirmation box.");

    // Preview mode: pretend it worked, save nothing
    if (preview) {
      setDone(true);
      return;
    }

    if (!user || !coords || !selfie || !idFront) return;

    setSaving(true);
    const supabase = createClient();
    const fail = (text: string) => {
      setSaving(false);
      setMessage(text);
    };

    const { error: e1 } = await supabase.rpc("become_partner");
    if (e1) return fail(e1.message);

    const { error: e2 } = await supabase
      .from("profiles")
      .update({
        full_name: form.fullName.trim(),
        phone: "+91" + tenDigits(form.phone),
        city: form.city.trim(),
      })
      .eq("id", user.id);
    if (e2) return fail(e2.message);

    const { error: e3 } = await supabase
      .from("partner_profiles")
      .update({
        bio: form.bio.trim(),
        experience_years: Number(form.experience),
        service_city: form.city.trim(),
        address: form.address.trim(),
        pincode: form.pincode.trim(),
        heard_from: form.heard || null,
        location: `SRID=4326;POINT(${coords.lng} ${coords.lat})`,
      })
      .eq("partner_id", user.id);
    if (e3) return fail(e3.message);

    const { error: e4 } = await supabase
      .from("partner_services")
      .delete()
      .eq("partner_id", user.id);
    if (e4) return fail(e4.message);

    const rows = Object.entries(picked).map(([id, p]) => ({
      partner_id: user.id,
      category_id: Number(id),
      price: Number(p.price),
      price_type: p.type,
    }));
    const { error: e5 } = await supabase.from("partner_services").insert(rows);
    if (e5) return fail(e5.message);

    const stamp = Date.now();
    const uploads: {
      type: string;
      path: string;
      body: Blob;
      contentType: string;
    }[] = [
      {
        type: "selfie",
        path: `${user.id}/selfie-${stamp}.jpg`,
        body: selfie.blob,
        contentType: "image/jpeg",
      },
      {
        type: idType,
        path: `${user.id}/${idType}-${stamp}.${extOf(idFront.file)}`,
        body: idFront.file,
        contentType: idFront.file.type,
      },
    ];
    if (idType === "aadhaar" && idBack) {
      uploads.push({
        type: "aadhaar_back",
        path: `${user.id}/aadhaar-back-${stamp}.${extOf(idBack.file)}`,
        body: idBack.file,
        contentType: idBack.file.type,
      });
    }

    for (const u of uploads) {
      const { error } = await supabase.storage
        .from("partner-docs")
        .upload(u.path, u.body, { contentType: u.contentType });
      if (error) return fail(error.message);
    }

    const { error: e6 } = await supabase
      .from("partner_documents")
      .delete()
      .eq("partner_id", user.id);
    if (e6) return fail(e6.message);

    const { error: e7 } = await supabase.from("partner_documents").insert(
      uploads.map((u) => ({
        partner_id: user.id,
        doc_type: u.type,
        file_path: u.path,
      }))
    );
    if (e7) return fail(e7.message);

    // Marked as submitted only when everything above worked
    const { error: e8 } = await supabase
      .from("partner_profiles")
      .update({ submitted_at: new Date().toISOString() })
      .eq("partner_id", user.id);
    if (e8) return fail(e8.message);

    setSaving(false);
    setDone(true);
  }

  if (!ready) return <main className="p-8 text-muted">Loading...</main>;

  // The page frame: blue panel on the left, the form on the right
  const shell = (content: React.ReactNode) => (
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-[minmax(320px,440px)_1fr]">
      <aside className="bg-brand px-6 py-8 text-white sm:px-10 lg:px-12 lg:py-12">
        <div className="lg:sticky lg:top-12">
          <Link
            href="/"
            className="font-display text-3xl font-extrabold tracking-tight"
          >
            Fixer
          </Link>
          <h1 className="mt-6 text-[clamp(1.8rem,3vw,2.6rem)] font-extrabold leading-[1.1] lg:mt-10">
            Grow your business with Fixer
          </h1>
          <p className="mt-3 max-w-sm text-brand-light">
            Join as a service partner and get booking requests from people near
            you.
          </p>
          <ul className="mt-10 hidden gap-5 lg:grid">
            {BENEFITS.map((b) => (
              <li key={b.title} className="flex gap-3">
                <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-accent" />
                <div>
                  <div className="font-bold">{b.title}</div>
                  <div className="text-sm text-brand-light">{b.text}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </aside>
      <main className="px-5 py-8 sm:px-10 lg:px-14 lg:py-12">
        <div className="mx-auto max-w-xl">{content}</div>
      </main>
    </div>
  );

  const linkBtn =
    "inline-flex min-h-12 items-center rounded-xl bg-brand px-6 text-sm font-semibold text-white hover:bg-brand-dark";

  if (!user && !preview) {
    return shell(
      <>
        <h2 className="mb-3 text-3xl font-extrabold">Log in to continue</h2>
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
      </>
    );
  }

  if (done || (!preview && existing?.submitted_at)) {
    const verification = done ? "pending" : existing?.verification;

    if (verification === "verified") {
      return shell(
        <>
          <h2 className="mb-3 text-3xl font-extrabold">You are approved</h2>
          <p className="mb-6 text-muted">
            Your details are verified. You can now receive bookings.
          </p>
          <Link href="/partner" className={linkBtn}>
            Go to my bookings
          </Link>
        </>
      );
    }

    if (verification === "rejected") {
      return shell(
        <>
          <h2 className="mb-3 text-3xl font-extrabold">
            Application not accepted
          </h2>
          <p className="mb-6 text-muted">
            We could not verify your details. Please contact Fixer support to
            try again.
          </p>
          <Link href="/" className={linkBtn}>
            Back to home
          </Link>
        </>
      );
    }

    return shell(
      <>
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-2xl text-green-700">
          ✓
        </div>
        <h2 className="mb-3 text-3xl font-extrabold">Application submitted</h2>
        <p className="mb-6 text-muted">
          Thank you. We will check your details as soon as we can.
        </p>
        <div className="mb-8 rounded-2xl bg-surface p-5">
          <div className="mb-2 font-bold">What happens next</div>
          <ol className="grid list-decimal gap-1.5 pl-5 text-sm text-muted">
            <li>Our team checks your selfie and ID.</li>
            <li>We approve or reject your application.</li>
            <li>
              Once approved, you appear in the partner list and can receive
              bookings.
            </li>
          </ol>
        </div>
        <Link href="/" className={linkBtn}>
          Back to home
        </Link>
      </>
    );
  }

  const isLast = step === STEPS.length - 1;

  return shell(
    
    <>
          {preview && (
        <p className="mb-6 rounded-xl bg-accent-light px-4 py-3 text-sm font-semibold text-ink">
          Preview mode: nothing you enter here is saved.
        </p>
      )}
      <div className="mb-2 flex gap-2" aria-hidden="true">
        {STEPS.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full ${
              i < step ? "bg-brand" : i === step ? "bg-accent" : "bg-line"
            }`}
          />
        ))}
      </div>
      <p className="mb-8 text-sm text-muted">
        Step {step + 1} of {STEPS.length} · {STEPS[step]}
      </p>

      <h2 className="text-3xl font-extrabold">{TITLES[step][0]}</h2>
      <p className="mb-6 mt-1 text-muted">{TITLES[step][1]}</p>

      {step === 0 && (
        <div className="grid gap-4">
          <Field label="Full name" required>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => set("fullName", e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Mobile number" required>
            <div className="flex gap-2">
              <span className="flex min-h-11 items-center rounded-xl bg-surface px-3.5 text-[15px] text-muted">
                +91
              </span>
              <input
                type="tel"
                inputMode="numeric"
                placeholder="10-digit number"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                className={inputClass}
              />
            </div>
          </Field>

          <div className="text-sm">
            <span className="mb-1 block font-semibold">Email</span>
            <div className="min-h-11 rounded-xl bg-surface px-3.5 py-2.5 text-[15px] text-muted">
              {email}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="City" required>
              <input
                type="text"
                placeholder="Delhi, Mumbai, Jaipur..."
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Pincode" required>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="e.g. 110001"
                value={form.pincode}
                onChange={(e) => set("pincode", e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Full address" required>
            <textarea
              rows={3}
              placeholder="House or flat number, street, area, landmark"
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              className="w-full rounded-xl border border-line bg-white px-3.5 py-3 text-[15px]"
            />
          </Field>

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
            <p className="mt-2 text-sm text-muted">
              Customers near you find you using this location.
            </p>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {dbCats.map((c) => {
            const p = picked[c.id];
            const ui = uiCategories.find((u) => u.slug === c.slug);
            return (
              <div
                key={c.id}
                className={`rounded-2xl border p-3 ${
                  p ? "border-brand bg-brand-light/50" : "border-line bg-white"
                } ${p ? "sm:col-span-2" : ""}`}
              >
                <button
                  type="button"
                  onClick={() => toggle(c.id)}
                  aria-pressed={!!p}
                  className="flex w-full cursor-pointer items-center gap-3 text-left font-semibold"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand">
                    {ui && <CategoryIcon paths={ui.icon} size={22} />}
                  </span>
                  {c.name}
                  <span className="ml-auto text-brand">{p ? "✓" : ""}</span>
                </button>

                {p && (
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <label className="text-sm">
                      <span className="mb-1 block text-muted">
                        Your price (₹)
                      </span>
                      <input
                        type="number"
                        min="1"
                        value={p.price}
                        onChange={(e) =>
                          updatePick(c.id, { price: e.target.value })
                        }
                        className={inputClass}
                      />
                    </label>
                    <label className="text-sm">
                      <span className="mb-1 block text-muted">Charged</span>
                      <select
                        value={p.type}
                        onChange={(e) =>
                          updatePick(c.id, {
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
      )}

      {step === 2 && (
        <div className="grid gap-4">
          <Field label="Years of experience" required>
            <input
              type="number"
              min="0"
              max="60"
              value={form.experience}
              onChange={(e) => set("experience", e.target.value)}
              className={inputClass}
            />
          </Field>

          <div>
            <Field label="About you" required>
              <textarea
                rows={4}
                placeholder="Tell customers about your skills, specialities and the work you have done."
                value={form.bio}
                onChange={(e) => set("bio", e.target.value)}
                className="w-full rounded-xl border border-line bg-white px-3.5 py-3 text-[15px]"
              />
            </Field>
            <div className="mt-1 flex justify-between text-xs text-muted">
              <span>Minimum 30 characters</span>
              <span>{form.bio.trim().length} characters</span>
            </div>
          </div>

          <Field label="How did you hear about Fixer?">
            <select
              value={form.heard}
              onChange={(e) => set("heard", e.target.value)}
              className={inputClass}
            >
              <option value="">Select source</option>
              {HEARD.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Government ID type" required>
            <select
              value={idType}
              onChange={(e) => setIdType(e.target.value as "aadhaar" | "pan")}
              className={inputClass}
            >
              <option value="aadhaar">Aadhaar card</option>
              <option value="pan">PAN card</option>
            </select>
          </Field>
        </div>
      )}

      {step === 3 && (
        <div className="grid gap-6">
          <div>
            <div className="mb-1 text-sm font-semibold">
              Live selfie <span className="text-red-600">*</span>
            </div>
            <p className="mb-3 text-sm text-muted">
              Look at the camera in good light. You take this photo now, you
              cannot upload an old one.
            </p>
            <CameraCapture
              previewUrl={selfie?.url ?? ""}
              onCapture={(blob, url) => setSelfie({ blob, url })}
            />
          </div>

          <div>
            <div className="mb-1 text-sm font-semibold">
              {idType === "aadhaar" ? "Aadhaar card, front" : "PAN card"}{" "}
              <span className="text-red-600">*</span>
            </div>
            <p className="mb-3 text-sm text-muted">
              Your name and photo must be clearly visible.
              {idType === "aadhaar" &&
                " You can hide the first 8 digits of the Aadhaar number."}
            </p>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => pickId("front", e.target.files?.[0])}
              className="block w-full text-sm file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-brand-light file:px-4 file:py-2 file:font-semibold file:text-brand-dark"
            />
            {idFront && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={idFront.url}
                alt="Front of your ID"
                className="mt-3 w-full max-w-xs rounded-xl border border-line"
              />
            )}
          </div>

          {idType === "aadhaar" && (
            <div>
              <div className="mb-3 text-sm font-semibold">
                Aadhaar card, back <span className="text-red-600">*</span>
              </div>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => pickId("back", e.target.files?.[0])}
                className="block w-full text-sm file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-brand-light file:px-4 file:py-2 file:font-semibold file:text-brand-dark"
              />
              {idBack && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={idBack.url}
                  alt="Back of your ID"
                  className="mt-3 w-full max-w-xs rounded-xl border border-line"
                />
              )}
            </div>
          )}

          <p className="rounded-xl bg-surface px-4 py-3 text-sm text-muted">
            Your selfie and ID photos are stored privately. Only the Fixer team
            can open them, and we use them only to check who you are.
          </p>
        </div>
      )}

      {step === 4 && (
        <div>
          <ReviewCard title="Basic information" onEdit={() => goTo(0)}>
            <Row label="Name" value={form.fullName} />
            <Row label="Mobile" value={"+91 " + tenDigits(form.phone)} />
            <Row label="Email" value={email} />
            <Row label="City" value={form.city} />
            <Row label="Pincode" value={form.pincode} />
            <Row label="Address" value={form.address} />
            <Row label="Location" value={coords ? "Saved" : "Not added"} />
          </ReviewCard>

          <ReviewCard title="Services offered" onEdit={() => goTo(1)}>
            {Object.entries(picked).map(([id, p]) => (
              <Row
                key={id}
                label={dbCats.find((c) => c.id === Number(id))?.name ?? "Service"}
                value={`₹${p.price} ${p.type === "hourly" ? "per hour" : "per job"}`}
              />
            ))}
          </ReviewCard>

          <ReviewCard title="Experience" onEdit={() => goTo(2)}>
            <Row label="Experience" value={`${form.experience} years`} />
            <Row
              label="ID type"
              value={idType === "aadhaar" ? "Aadhaar card" : "PAN card"}
            />
            <Row label="Heard via" value={form.heard || "Not answered"} />
            <p className="border-t border-line pt-2.5 text-sm">{form.bio}</p>
          </ReviewCard>

          <ReviewCard title="Identity verification" onEdit={() => goTo(3)}>
            <Row label="Live selfie" value={selfie ? "Captured" : "Missing"} />
            <Row label="ID front" value={idFront ? "Uploaded" : "Missing"} />
            {idType === "aadhaar" && (
              <Row label="ID back" value={idBack ? "Uploaded" : "Missing"} />
            )}
          </ReviewCard>

          <label className="mt-2 flex cursor-pointer items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0"
            />
            I confirm the information is correct, and I agree to share my
            selfie and ID photo with Fixer to verify who I am.
          </label>
        </div>
      )}

      {message && (
        <p
          role="alert"
          className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
        >
          {message}
        </p>
      )}

      <div className="mt-8 flex gap-3">
        {step > 0 && (
          <button
            type="button"
            onClick={back}
            className="min-h-12 cursor-pointer rounded-xl border border-line bg-white px-6 text-[15px] font-semibold hover:bg-surface"
          >
            Back
          </button>
        )}
        {isLast ? (
          <button
            type="button"
            onClick={submit}
            disabled={saving}
            className="min-h-12 flex-1 cursor-pointer rounded-xl bg-accent px-6 text-[15px] font-bold text-ink hover:bg-accent-dark disabled:opacity-60"
          >
            {saving ? "Submitting..." : "Submit application"}
          </button>
        ) : (
          <button
            type="button"
            onClick={next}
            className="min-h-12 flex-1 cursor-pointer rounded-xl bg-brand px-6 text-[15px] font-semibold text-white hover:bg-brand-dark"
          >
            Continue
          </button>
        )}
      </div>
    </>
  );
}