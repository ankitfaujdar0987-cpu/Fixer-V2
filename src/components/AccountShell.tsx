"use client";

import { useCallback, useState } from "react";
import { useAccount, type Account } from "@/lib/useAccount";
import SidebarMenu from "./SidebarMenu";
import SidebarDrawer from "./SidebarDrawer";
import Avatar from "./Avatar";
import { usePathname } from "next/navigation";

export default function AccountShell({
  children,
  previewAccount,
}: {
  children: React.ReactNode;
  previewAccount?: Account;
}) {
  const realAccount = useAccount();
  const account = previewAccount ?? realAccount;
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  // The partner sign-up form is a full page without the sidebar
  if (path.startsWith("/partner/apply") || path.startsWith("/partner/preview")) {
    return <>{children}</>;
  }

  if (!account.ready) {
    return <div className="min-h-screen bg-white" aria-busy="true" />;
  }

  // Not logged in: show the page alone, it asks the person to log in
  if (!account.user) return <>{children}</>;

  const first = account.name.split(" ")[0] || "there";
  const title = account.isAdmin
    ? "Admin"
    : account.isPartner
      ? "Partner dashboard"
      : "My account";

  const badge = !account.isPartner
    ? null
    : account.verification === "verified"
      ? { text: "Verified", style: "bg-green-50 text-green-700" }
      : account.verification === "rejected"
        ? { text: "Not approved", style: "bg-red-50 text-red-700" }
        : { text: "Pending verification", style: "bg-accent-light text-ink" };

  return (
    <div className="min-h-screen bg-white lg:flex">
      <aside className="hidden w-72 shrink-0 border-r border-line bg-surface lg:block">
        <div className="sticky top-0 h-screen">
          <SidebarMenu account={account} />
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-white px-5 py-3.5">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-line bg-white hover:bg-surface lg:hidden"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>

          <div>
            <div className="text-sm text-muted">{title}</div>
            <div className="font-display text-lg font-extrabold leading-tight">
              Welcome back, {first}
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3">
            {badge && (
              <span
                className={`hidden rounded-full px-3 py-1.5 text-sm font-bold sm:inline ${badge.style}`}
              >
                {badge.text}
              </span>
            )}
            <Avatar name={account.name} url={account.avatarUrl} size={40} />
          </div>
        </header>

        <div>{children}</div>
      </div>

      <SidebarDrawer open={open} onClose={close} account={account} />
    </div>
  );
}