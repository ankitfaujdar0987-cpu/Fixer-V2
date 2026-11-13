import type { ReviewsData } from "@/lib/sampleData";

function Stars({ value, size = "text-lg" }: { value: number; size?: string }) {
  const full = Math.round(value);
  return (
    <span
      role="img"
      aria-label={`${value} out of 5 stars`}
      className={`${size} tracking-tight text-accent`}
    >
      {"★".repeat(full)}
      <span className="text-line">{"★".repeat(5 - full)}</span>
    </span>
  );
}

export default function ReviewsView({
  data,
  sample = false,
}: {
  data: ReviewsData;
  sample?: boolean;
}) {
  const stars = [5, 4, 3, 2, 1] as const;

  return (
    <main className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
      {sample && (
        <p className="mb-6 rounded-xl bg-accent-light px-4 py-3 text-sm font-semibold text-ink">
          Sample data: these reviews are not real. We connect them to your real
          reviews later.
        </p>
      )}

      <h1 className="text-3xl font-extrabold">Reviews</h1>
      <p className="mb-6 text-muted">What customers say about you</p>

      <section className="mb-6 grid gap-6 rounded-2xl border border-line bg-white p-5 sm:grid-cols-[200px_1fr] sm:p-6">
        <div className="text-center sm:text-left">
          <div className="font-display text-6xl font-extrabold">
            {data.count > 0 ? data.average.toFixed(1) : "0.0"}
          </div>
          <Stars value={data.count > 0 ? data.average : 0} size="text-2xl" />
          <div className="mt-1 text-sm text-muted">
            {data.count} {data.count === 1 ? "review" : "reviews"}
          </div>
        </div>

        <ul className="grid content-center gap-2">
          {stars.map((s) => {
            const n = data.counts[s];
            const pct = data.count > 0 ? (n / data.count) * 100 : 0;
            return (
              <li key={s} className="flex items-center gap-3 text-sm">
                <span className="w-8 shrink-0 font-semibold">{s} ★</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-line">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-6 shrink-0 text-right text-muted">{n}</span>
              </li>
            );
          })}
        </ul>
      </section>

      {data.items.length === 0 ? (
        <div className="rounded-2xl bg-surface p-10 text-center">
          <div className="text-lg font-bold">No reviews yet</div>
          <p className="text-muted">
            Reviews from customers appear here after you complete jobs.
          </p>
        </div>
      ) : (
        <ul className="grid gap-4">
          {data.items.map((r) => (
            <li
              key={r.id}
              className="rounded-2xl border border-line bg-white p-5"
            >
              <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-light font-display text-lg font-extrabold text-brand"
                  >
                    {r.customer.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <div className="font-bold">{r.customer}</div>
                    <div className="text-sm text-muted">
                      {r.service} · {r.date}
                    </div>
                  </div>
                </div>
                <Stars value={r.rating} />
              </div>
              <p className="text-[15px]">{r.comment}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}