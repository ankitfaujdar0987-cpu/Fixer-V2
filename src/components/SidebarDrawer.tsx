"use client";

import { useEffect } from "react";
import type { Account } from "@/lib/useAccount";
import SidebarMenu from "./SidebarMenu";

export default function SidebarDrawer({
  open,
  onClose,
  account,
}: {
  open: boolean;
  onClose: () => void;
  account: Account;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-hidden={!open}
      className={`fixed inset-0 z-50 flex bg-ink/55 backdrop-blur-[3px] transition-[opacity,visibility] duration-300 ${
        open ? "visible opacity-100" : "invisible opacity-0"
      }`}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={`h-full w-80 max-w-[85vw] bg-surface shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarMenu account={account} onNavigate={onClose} onClose={onClose} />
      </aside>
    </div>
  );
}