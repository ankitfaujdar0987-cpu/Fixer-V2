import type { DashboardData } from "@/lib/sampleData";

const ICONS = {
  bookings: "M9 4h6l1 2h3v14H5V6h3zM9 11h6M9 15h6",
  check: "M5 12l5 5L20 7",
  earnings:
    "M12 3v18M16 7.5C16 6 14.2 5 12 5S8 6 8 8s1.8 2.5 4 3 4 1 4 3-1.8 3-4 3-4-1-4-2.5",
  star: "m12 3 2.7 5.5 6 .9-4.4 4.2 1 6-5.3-2.8-5.3 2.8 1-6L3.3 9.4l6-.9z",
};

const statusStyle: Record<string, { label: string; style: string }> = {
  requested: { label: "New request", style: "bg-accent-light text-ink" },
  accepted: { label: "Accepted", style: "bg-brand-light text-brand-dark" },
  completed: { label: "Completed", style: "bg-green-50 text-green-700" },
  declined: { label: "Declined", style: "bg-surface text-muted" },
  cancelled: { label: "Cancelled", style: "bg-surface text-muted" },
};

const verificationInfo = {
  pending: {
    title: "Verification pending",
    text: "Our team is checking your documents. You can start receiving bookings once you are approved.",
    style: "bg-accent-light",
  },
  verified: {
    title: "You are verified",
    text: "Customers can find you and send you booking requests.",
    style: "bg-green-50",
  },
  rejected: {
    title: "Application not accepted",
    text: "We could not verify your documents. Please contact Fixer support.",
    style: "bg-red-50",
  },
};

export default function DashboardView({
  data,
  sample = false,
}: {
  data: DashboardData;
  sample?: boolean;
}) {
  const done = data.steps.filter((s) => s.done).length;
  const percent = Math.round((done / data.steps.length) * 100);
  const info = verificationInfo[data.verification];

  const stats = [
    { label: "Total bookings", value: String(data.totalBookings), icon: ICONS.bookings },
    { label: "Completed jobs", value: String(data.completedJobs), icon: ICONS.check },
    {
      label: "Earnings this month",
      value: "₹" + data.monthEarnings.toLocaleString("en-IN"),
      icon: ICONS.earnings,
    },
    {
      label: "Average rating",
      value: data.reviewCount > 0 ? data.rating.toFixed(1) : "New",
      icon: ICONS.star,
    },
  ];

  return (
    <main className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
      {sample && (
        <p className="mb-6 rounded-xl bg-accent-light px-4 py-3 text-sm font-semibold text-ink">
          Sample data: these numbers are not real. We connect them to your real
          bookings later.
        </p>
      )}

      <h1 className="text-3xl font-extrabold">Overview</h1>
      <p className="mb-6 text-muted">Your performance at a glance</p>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-line bg-white p-5"
          >
            <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-light text-brand">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d={s.icon} />
              </svg>
            </span>
            <div className="font-display text-3xl font-extrabold">{s.value}</div>
            <div className="text-sm text-muted">{s.label}</div>
          </div>
        ))}
      </div>

      <section className="mb-6 rounded-2xl border border-line bg-white p-5">
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold">Profile completion</h2>
            <p className="text-sm text-muted">
              Complete your profile to start receiving bookings
            </p>
          </div>
          <div className="font-display text-3xl font-extrabold text-brand">
            {percent}%
          </div>
        </div>

        <div
          className="mb-4 h-2.5 overflow-hidden rounded-full bg-line"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-accent"
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {data.steps.map((s) => (
            <span
              key={s.label}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                s.done
                  ? "bg-green-50 text-green-700"
                  : "bg-surface text-muted"
              }`}
            >
              {s.done ? "✓ " : "○ "}
              {s.label}
            </span>
          ))}
        </div>
      </section>

      <section className={`mb-6 rounded-2xl p-5 ${info.style}`}>
        <h2 className="font-bold">{info.title}</h2>
        <p className="text-sm text-ink/80">{info.text}</p>
      </section>

      <section className="rounded-2xl border border-line bg-white p-5">
        <h2 className="mb-3 text-lg font-bold">Recent requests</h2>
        <ul>
          {data.recent.map((r) => {
            const st = statusStyle[r.status];
            return (
              <li
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-3 border-t border-line py-3 first:border-t-0"
              >
                <div>
                  <div className="font-semibold">{r.customer}</div>
                  <div className="text-sm text-muted">{r.service}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold">₹{r.price}</span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${st.style}`}
                  >
                    {st.label}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}