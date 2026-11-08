"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setReady(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  async function login() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
  }

  // Keeps the space reserved while we check if someone is logged in
  if (!ready) return <div className="h-11 w-24" aria-hidden="true" />;

  if (user) {
    const fullName = user.user_metadata?.full_name ?? user.email ?? "there";
    const firstName = String(fullName).split(" ")[0];

    return (
      <div className="flex items-center gap-3">
        <span className="hidden text-sm font-semibold sm:inline">
          Hi, {firstName}
        </span>
        <button
          type="button"
          onClick={logout}
          className="min-h-11 cursor-pointer rounded-xl border border-line bg-white px-5 text-sm font-semibold transition-colors hover:bg-surface"
        >
          Log out
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={login}
      className="min-h-11 cursor-pointer rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
    >
      Login
    </button>
  );
}