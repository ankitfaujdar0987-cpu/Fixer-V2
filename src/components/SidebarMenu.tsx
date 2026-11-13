"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Account } from "@/lib/useAccount";
import { createClient } from "@/lib/supabase/client";
import Avatar from "./Avatar";

type Item = { label: string; href: string; icon: string; ready: boolean };

const ICONS: Record<string, string> = {
  home: "M4 11l8-7 8 7M6 10v10h12V10",
  dashboard: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 20a8 8 0 0 1 16 0",
  bookings: "M9 4h6l1 2h3v14H5V6h3zM9 11h6M9 15h6",
  earnings:
    "M12 3v18M16 7.5C16 6 14.2 5 12 5S8 6 8 8s1.8 2.5 4 3 4 1 4 3-1.8 3-4 3-4-1-4-2.5",
  star: "m12 3 2.7 5.5 6 .9-4.4 4.2 1 6-5.3-2.8-5.3 2.8 1-6L3.3 9.4l6-.9z",
  file: "M7 3h7l5 5v13H7zM14 3v5h5",
  settings: "M4 7h10M18 7h2M4 17h2M10 17h10M14 5v4M8 15v4",
  shield: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z",
  logout: "M10 4H5v16h5M15 8l4 4-4 4M19 12H9",
};
// Pages that have a sample-data preview version
const PREVIEWABLE = [
  "/dashboard",
  "/bookings",
  "/my-bookings",
  "/reviews",
  "/settings",
];

function Icon({ name }: { name: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d={ICONS[name]} />
    </svg>
  );
}

// "ready: false" shows a "Soon" tag. Set it to true when the page is built.
function menuFor(a: Account): Item[] {
  const home: Item = { label: "Home", href: "/", icon: "home", ready: true };
  const profile: Item = {
    label: "My profile",
    href: "/profile",
    icon: "user",
    ready: true,
  };
  const settings: Item = {
    label: "Settings",
    href: "/settings",
    icon: "settings",
    ready: true,
  };
    const myBookings: Item = {
    label: "My bookings",
    href: "/my-bookings",
    icon: "bookings",
    ready: true,
  };

  const partnerItems: Item[] = [
    { label: "Dashboard", href: "/dashboard", icon: "dashboard", ready: true },
    profile,
    { label: "Bookings", href: "/bookings", icon: "bookings", ready: true },
    { label: "Reviews", href: "/reviews", icon: "star", ready: true },
    {
      label: "Documents",
      href: "/partner/documents",
      icon: "file",
      ready: true,
    },
    settings,
  ];

  if (a.isAdmin) {
    return [
      home,
      ...partnerItems,
      myBookings,
      { label: "Admin panel", href: "/admin", icon: "shield", ready: true },
    ];
  }
  if (a.isPartner) return [home, ...partnerItems];
  return [home, profile, myBookings, settings];
}

export default function SidebarMenu({
  account,
  onNavigate,
  onClose,
}: {
  account: Account;
  onNavigate?: () => void;
  onClose?: () => void;
}) {
  const rawPath = usePathname();
  const inPreview = rawPath.startsWith("/preview");
  const path = rawPath.replace(/^\/preview(?=\/|$)/, "") || "/";
  const items = menuFor(account);

  // The most specific matching page is the highlighted one
  const activeHref = items
    .filter(
      (i) =>
        i.ready &&
        (i.href === "/" ? path === "/" : path === i.href || path.startsWith(i.href + "/"))
    )
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  const role = account.isAdmin ? "Admin" : account.isPartner ? "Partner" : "Customer";

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.assign("/");
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 pb-4 pt-5">
        <Link
          href="/"
          onClick={onNavigate}
          className="font-display text-3xl font-extrabold tracking-tight text-brand"
        >
          Fixer
        </Link>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white text-muted hover:bg-line"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        )}
      </div>

      <div className="mx-4 mb-4 flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-line">
        <Avatar name={account.name} url={account.avatarUrl} size={44} />
        <div className="min-w-0">
          <div className="truncate font-bold">{account.name || "Your account"}</div>
          <div className="text-sm text-muted">{role}</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3" aria-label="Account menu">
        <ul className="grid gap-1">
          {items.map((item) => {
            const active = item.href === activeHref;
            const base =
              "flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-[15px] font-semibold transition-colors";

            if (!item.ready) {
              return (
                <li key={item.label}>
                  <div
                    aria-disabled="true"
                    className={`${base} cursor-not-allowed text-muted/70`}
                  >
                    <Icon name={item.icon} />
                    {item.label}
                    <span className="ml-auto rounded-full bg-line px-2 py-0.5 text-[11px] font-bold text-muted">
                      Soon
                    </span>
                  </div>
                </li>
              );
            }

            return (
              <li key={item.label}>
                <Link
                  href={
                    inPreview && PREVIEWABLE.includes(item.href)
                      ? "/preview" + item.href
                      : item.href
                  }
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={`${base} ${
                    active
                      ? "bg-white text-brand shadow-sm ring-1 ring-line"
                      : "hover:bg-white/70"
                  }`}
                >
                  <Icon name={item.icon} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="grid gap-2 p-4">
        {!account.isPartner && !account.isAdmin && (
          <Link
            href="/partner/apply"
            onClick={onNavigate}
            className="flex min-h-11 items-center justify-center rounded-xl bg-accent px-4 text-sm font-bold text-ink transition-colors hover:bg-accent-dark"
          >
            Become a partner
          </Link>
        )}
        <button
          type="button"
          onClick={logout}
          className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-xl px-3.5 text-[15px] font-semibold text-red-700 transition-colors hover:bg-red-50"
        >
          <Icon name="logout" />
          Log out
        </button>
      </div>
    </div>
  );
}