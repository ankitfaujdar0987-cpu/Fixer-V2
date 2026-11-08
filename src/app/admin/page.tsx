"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Applicant = {
  partner_id: string;
  name: string;
  phone: string | null;
  city: string | null;
  experience: number | null;
  bio: string | null;
  submitted_at: string | null;
  services: string[];
  docs: { type: string; url: string }[];
};

const docLabel: Record<string, string> = {
  selfie: "Live selfie",
  aadhaar: "Aadhaar card",
  pan: "PAN card",
};

export default function AdminPage() {
  const [state, setState] = useState<"loading" | "denied" | "ok">("loading");
  const [list, setList] = useState<Applicant[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return setState("denied");

      const { data: me } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", auth.user.id)
        .single();
      if (me?.role !== "admin") return setState("denied");

      const { data: partners } = await supabase
        .from("partner_profiles")
        .select("partner_id, bio, experience_years, service_city, submitted_at")
        .eq("verification", "pending")
        .not("submitted_at", "is", null)
        .order("submitted_at");

      const ids = (partners ?? []).map((p) => p.partner_id);
      if (ids.length === 0) {
        setList([]);
        return setState("ok");
      }

      const [{ data: profs }, { data: svc }, { data: cats }, { data: docs }] =
        await Promise.all([
          supabase.from("profiles").select("id, full_name, phone").in("id", ids),
          supabase
            .from("partner_services")
            .select("partner_id, category_id, price, price_type")
            .in("partner_id", ids),
          supabase.from("categories").select("id, name"),
          supabase
            .from("partner_documents")
            .select("partner_id, doc_type, file_path")
            .in("partner_id", ids),
        ]);

      const catName = new Map((cats ?? []).map((c) => [c.id, c.name]));

      // Private photos need a temporary link (valid for 10 minutes)
      const urlByPath = new Map<string, string>();
      const paths = (docs ?? []).map((d) => d.file_path);
      if (paths.length > 0) {
        const { data: signed } = await supabase.storage
          .from("partner-docs")
          .createSignedUrls(paths, 600);
        (signed ?? []).forEach((s) => {
          if (s.path && s.signedUrl) urlByPath.set(s.path, s.signedUrl);
        });
      }

      const result: Applicant[] = (partners ?? []).map((p) => {
        const prof = (profs ?? []).find((x) => x.id === p.partner_id);
        return {
          partner_id: p.partner_id,
          name: prof?.full_name ?? "(no name)",
          phone: prof?.phone ?? null,
          city: p.service_city,
          experience: p.experience_years,
          bio: p.bio,
          submitted_at: p.submitted_at,
          services: (svc ?? [])
            .filter((s) => s.partner_id === p.partner_id)
            .map(
              (s) =>
                `${catName.get(s.category_id) ?? "Service"}: ₹${s.price} ${
                  s.price_type === "hourly" ? "per hour" : "per job"
                }`
            ),
          docs: (docs ?? [])
            .filter((d) => d.partner_id === p.partner_id)
            .map((d) => ({
              type: d.doc_type,
              url: urlByPath.get(d.file_path) ?? "",
            })),
        };
      });

      setList(result);
      setState("ok");
    }
    load();
  }, []);

  async function decide(id: string, status: "verified" | "rejected") {
    setBusy(id);
    setMessage("");
    const supabase = createClient();
    const { error } = await supabase.rpc("verify_partner", {
      p_partner: id,
      p_status: status,
    });
    setBusy(null);
    if (error) return setMessage(error.message);
    setList((prev) => prev.filter((a) => a.partner_id !== id));
  }

  if (state === "loading") {
    return <main className="p-8 text-muted">Loading...</main>;
  }

  if (state === "denied") {
    return (
      <main className="mx-auto max-w-xl px-5 py-16">
        <h1 className="mb-3 text-3xl font-extrabold">Not allowed</h1>
        <p className="text-muted">This page is only for Fixer admins.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-5 py-12">
      <h1 className="mb-2 text-3xl font-extrabold">Partner applications</h1>
      <p className="mb-8 text-muted">
        Check the selfie and ID, then approve or reject.
      </p>

      {message && (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {message}
        </p>
      )}

      {list.length === 0 && (
        <p className="rounded-2xl bg-surface p-6 text-muted">
          No applications are waiting right now.
        </p>
      )}

      <div className="grid gap-6">
        {list.map((a) => (
          <section
            key={a.partner_id}
            className="rounded-2xl border border-line bg-white p-5"
          >
            <h2 className="text-xl font-bold">{a.name}</h2>
            <p className="mb-3 text-sm text-muted">
              {a.city ?? "No city"} · {a.experience ?? 0} years experience
              {a.phone ? ` · ${a.phone}` : ""}
            </p>

            <ul className="mb-3 list-disc pl-5 text-sm">
              {a.services.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>

            {a.bio && <p className="mb-4 text-sm">{a.bio}</p>}

            <div className="mb-5 flex flex-wrap gap-4">
              {a.docs.map((d) => (
                <div key={d.type}>
                  <p className="mb-1 text-sm font-semibold">
                    {docLabel[d.type] ?? d.type}
                  </p>
                  {d.url ? (
                    <a href={d.url} target="_blank" rel="noreferrer">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={d.url}
                        alt={docLabel[d.type] ?? d.type}
                        className="h-48 rounded-xl border border-line object-cover"
                      />
                    </a>
                  ) : (
                    <p className="text-sm text-red-700">Could not load photo</p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                disabled={busy === a.partner_id}
                onClick={() => decide(a.partner_id, "verified")}
                className="min-h-11 cursor-pointer rounded-xl bg-brand px-6 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
              >
                Approve
              </button>
              <button
                type="button"
                disabled={busy === a.partner_id}
                onClick={() => decide(a.partner_id, "rejected")}
                className="min-h-11 cursor-pointer rounded-xl border border-line bg-white px-6 text-sm font-semibold hover:bg-surface disabled:opacity-60"
              >
                Reject
              </button>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}