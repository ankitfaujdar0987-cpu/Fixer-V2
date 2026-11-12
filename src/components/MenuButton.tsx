"use client";

import { useCallback, useState } from "react";
import { useAccount } from "@/lib/useAccount";
import SidebarDrawer from "./SidebarDrawer";

export default function MenuButton() {
  const account = useAccount();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  // Only people who are logged in get the menu
  if (!account.ready || !account.user) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-line bg-white hover:bg-surface"
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

      <SidebarDrawer open={open} onClose={close} account={account} />
    </>
  );
}