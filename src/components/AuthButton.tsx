"use client";

import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAccount } from "@/lib/useAccount";
import Avatar from "./Avatar";

export default function AuthButton() {
  const account = useAccount();

  async function login() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  // Keeps the space reserved while we check if someone is logged in
  if (!account.ready) return <div className="h-11 w-24" aria-hidden="true" />;

  if (!account.user) {
    return (
      <div className="flex items-center gap-2">
        {process.env.NODE_ENV === "development" && (
          <a
            href="/dev-login"
            className="flex min-h-11 items-center rounded-xl border border-dashed border-line px-3 text-xs font-semibold text-muted hover:bg-surface"
          >
            Dev admin
          </a>
        )}
        <button
          type="button"
          onClick={login}
          className="min-h-11 cursor-pointer rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/profile"
      className="flex min-h-11 items-center gap-2.5 rounded-xl border border-line bg-white py-1 pl-1.5 pr-3.5 text-sm font-semibold transition-colors hover:bg-surface"
    >
      <Avatar name={account.name} url={account.avatarUrl} size={34} />
      <span className="hidden max-w-[150px] truncate sm:inline">
        {account.name || "My account"}
      </span>
    </Link>
  );
}