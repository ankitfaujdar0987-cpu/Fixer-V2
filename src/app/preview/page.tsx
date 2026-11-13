import Link from "next/link";

const previews = [
  {
    label: "Partner sign-up form",
    href: "/partner/preview",
    note: "All 5 steps. Nothing is saved.",
  },
  {
    label: "Partner dashboard",
    href: "/preview/dashboard",
    note: "Overview with sample numbers.",
  },
  {
    label: "Reviews",
    href: "/preview/reviews",
    note: "Rating summary and customer reviews with sample data.",
  },
  {
    label: "Settings",
    href: "/preview/settings",
    note: "Notifications, availability, bank account and delete account.",
  },
  {
    label: "Verify mobile number",
    href: "/preview/phone",
    note: "Enter the number, then the 6-digit code. Any code works.",
  },
  {
    label: "Connected booking: call and chat",
    href: "/preview/connected",
    note: "After the partner accepts: numbers, Call button and chat.",
  },
  {
    label: "Bookings",
    href: "/preview/bookings",
    note: "Pending, Accepted, Completed and Cancelled tabs. Accept, call, chat.",
  },
    {
    label: "My bookings (customer)",
    href: "/preview/my-bookings",
    note: "Active, Completed and Cancelled tabs. Call, chat, cancel and review.",
  },
];

export default function PreviewIndex() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <h1 className="text-3xl font-extrabold">Previews</h1>
      <p className="mb-6 mt-1 text-muted">
        Check screens with sample data, no login needed. This page only exists
        on your own computer.
      </p>
      <ul className="grid gap-3">
        {previews.map((p) => (
          <li key={p.href}>
            <Link
              href={p.href}
              className="block rounded-2xl border border-line bg-white p-4 transition-shadow hover:shadow-lg hover:shadow-brand/15"
            >
              <div className="font-bold">{p.label}</div>
              <div className="text-sm text-muted">{p.note}</div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}