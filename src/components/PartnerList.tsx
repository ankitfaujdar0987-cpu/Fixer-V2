"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Row = {
  partner_id: string;
  full_name: string | null;
  price: number;
  price_type: string;
  distance_km: number | null;
  avg_rating: number;
  review_count: number;
  availability: "online" | "offline" | "busy";
  experience_years: number | null;
};

type Sort = "distance" | "price" | "rating";

const dot = {
  online: "bg-green-500",
  busy: "bg-accent",
  offline: "bg-slate-400",
};
const dotLabel = { online: "Online", busy: "Busy", offline: "Offline" };

export default function PartnerList({
  slug,
  categoryName,
  service,
}: {
  slug: string;
  categoryName: string;
  service: string | null;
}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [nearbyOnly, setNearbyOnly] = useState(false);
  const [sort, setSort] = useState<Sort>("rating");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const supabase = createClient();

      const { data: cat } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();

      let result: Row[] = [];

      if (cat && coords && nearbyOnly) {
        // Partners within 25 km, with distance
        const { data, error } = await supabase.rpc("nearby_partners", {
          p_lat: coords.lat,
          p_lng: coords.lng,
          p_category_id: cat.id,
          p_radius_km: 25,
        });
        if (error) setMessage("Nearby search failed: " + error.message);
        result = (data ?? []) as Row[];
      } else if (cat) {
        // Everyone who offers this service
        const { data: svc } = await supabase
          .from("partner_services")
          .select("partner_id, price, price_type")
          .eq("category_id", cat.id);

        const ids = (svc ?? []).map((s) => s.partner_id);
        if (ids.length > 0) {
          const { data: people } = await supabase
            .from("partner_public")
            .select("*")
            .in("partner_id", ids);

          result = (people ?? []).map((p) => {
            const s = svc!.find((x) => x.partner_id === p.partner_id)!;
            return {
              partner_id: p.partner_id,
              full_name: p.full_name,
              price: s.price,
              price_type: s.price_type,
              distance_km: null,
              avg_rating: p.avg_rating,
              review_count: p.review_count,
              availability: p.availability,
              experience_years: p.experience_years,
            };
          });
        }
      }

      if (!cancelled) {
        setRows(result);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [slug, coords, nearbyOnly]);

  function useMyLocation() {
    setMessage("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setNearbyOnly(true);
        setSort("distance");
      },
      () =>
        setMessage(
          "Could not get your location. Please allow location access and try again."
        )
    );
  }

  const showingDistance = coords !== null && nearbyOnly;

  const sorted = [...rows].sort((a, b) => {
    if (sort === "price") return a.price - b.price;
    if (sort === "distance")
      return (a.distance_km ?? 1e9) - (b.distance_km ?? 1e9);
    return b.avg_rating - a.avg_rating || b.review_count - a.review_count;
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={useMyLocation}
          className="min-h-11 cursor-pointer rounded-xl border border-line bg-white px-4 text-sm font-semibold hover:bg-surface"
        >
          Use my location
        </button>

        <label className="flex items-center gap-2 text-sm font-semibold">
          Sort by
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="min-h-11 rounded-xl border border-line bg-white px-3"
          >
            <option value="rating">Rating</option>
            <option value="price">Price (low to high)</option>
            {showingDistance && <option value="distance">Distance</option>}
          </select>
        </label>
      </div>

      {message && (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {message}
        </p>
      )}

      {loading && <p className="text-muted">Loading partners...</p>}

      {!loading && sorted.length === 0 && (
        <div className="rounded-2xl bg-surface p-6">
          <p className="mb-3 font-semibold">
            {showingDistance
              ? `No ${categoryName} partners within 25 km of you yet.`
              : `No ${categoryName} partners are available yet.`}
          </p>
          {showingDistance && (
            <button
              type="button"
              onClick={() => setNearbyOnly(false)}
              className="min-h-11 cursor-pointer rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              Show all partners
            </button>
          )}
        </div>
      )}

      <ul className="grid gap-4">
        {sorted.map((r) => {
          const name = r.full_name ?? "Fixer partner";
          const bookHref = `/book/${r.partner_id}?category=${slug}${
            service ? `&service=${encodeURIComponent(service)}` : ""
          }`;

          return (
            <li
              key={r.partner_id}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-white p-4"
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-light font-display text-xl font-extrabold text-brand">
                {name.charAt(0).toUpperCase()}
              </span>

              <div className="min-w-[180px] flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold">{name}</h3>
                  <span className="rounded-full bg-brand-light px-2 py-0.5 text-xs font-bold text-brand-dark">
                    Verified
                  </span>
                </div>
                <p className="text-sm text-muted">
                  {r.review_count > 0
                    ? `★ ${r.avg_rating} (${r.review_count} reviews)`
                    : "New on Fixer"}
                  {" · "}
                  {r.experience_years ?? 0} yrs experience
                  {r.distance_km !== null &&
                    ` · ${r.distance_km.toFixed(1)} km away`}
                </p>
                <p className="mt-1 flex items-center gap-2 text-sm font-semibold">
                  <span className={`h-2.5 w-2.5 rounded-full ${dot[r.availability]}`} />
                  {dotLabel[r.availability]}
                </p>
              </div>

              <div className="text-right">
                <div className="text-lg font-extrabold">₹{r.price}</div>
                <div className="text-xs text-muted">
                  {r.price_type === "hourly" ? "per hour" : "per job"}
                </div>
              </div>

              <Link
                href={bookHref}
                className="flex min-h-11 items-center rounded-xl bg-accent px-6 text-sm font-bold text-ink transition-colors hover:bg-accent-dark"
              >
                Book
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}