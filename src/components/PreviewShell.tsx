"use client";

import { useEffect, useState } from "react";
import AccountShell from "./AccountShell";
import { SAMPLE_ACCOUNTS } from "@/lib/sampleData";

type Role = keyof typeof SAMPLE_ACCOUNTS;
const ROLES: Role[] = ["customer", "partner", "admin"];

// Frame for the preview pages: sample account plus a "Preview as" switch
export default function PreviewShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [role, setRole] = useState<Role>("partner");

  useEffect(() => {
    const saved = localStorage.getItem("preview-role");
    if (saved === "customer" || saved === "partner" || saved === "admin") {
      setRole(saved);
    }
  }, []);

  function choose(r: Role) {
    setRole(r);
    localStorage.setItem("preview-role", r);
  }

  return (
    <>
      <AccountShell previewAccount={SAMPLE_ACCOUNTS[role]}>
        {children}
      </AccountShell>

      <div
        role="group"
        aria-label="Preview as"
        className="fixed bottom-4 right-4 z-40 flex items-center gap-1 rounded-2xl bg-ink p-1.5 text-white shadow-2xl"
      >
        <span className="px-2 text-xs text-white/70">Preview as</span>
        {ROLES.map((r) => (
          <button
            key={r}
            type="button"
            aria-pressed={role === r}
            onClick={() => choose(r)}
            className={`min-h-9 cursor-pointer rounded-xl px-3.5 text-sm font-semibold capitalize ${
              role === r ? "bg-white text-ink" : "text-white/80 hover:bg-white/10"
            }`}
          >
            {r}
          </button>
        ))}
      </div>
    </>
  );
}