"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export type Account = {
  ready: boolean;
  user: User | null;
  name: string;
  email: string;
  avatarUrl: string | null;
  isAdmin: boolean;
  isPartner: boolean;
  verification: "pending" | "verified" | "rejected" | null;
};

const empty: Account = {
  ready: true,
  user: null,
  name: "",
  email: "",
  avatarUrl: null,
  isAdmin: false,
  isPartner: false,
  verification: null,
};

export function useAccount(): Account {
  const [state, setState] = useState<Account>({ ...empty, ready: false });

  useEffect(() => {
    const supabase = createClient();

    async function load(u: User | null) {
      if (!u) {
        setState(empty);
        return;
      }
      const [{ data: prof }, { data: partner }] = await Promise.all([
        supabase
          .from("profiles")
          .select("role, full_name")
          .eq("id", u.id)
          .maybeSingle(),
        supabase
          .from("partner_profiles")
          .select("verification")
          .eq("partner_id", u.id)
          .maybeSingle(),
      ]);
      const photo = String(
        u.user_metadata?.avatar_url ?? u.user_metadata?.picture ?? ""
      );
      setState({
        ready: true,
        user: u,
        name: prof?.full_name ?? String(u.user_metadata?.full_name ?? u.email ?? ""),
        email: u.email ?? "",
        avatarUrl: photo || null,
        isAdmin: prof?.role === "admin",
        isPartner: !!partner,
        verification:
          (partner?.verification as Account["verification"]) ?? null,
      });
    }

    supabase.auth.getUser().then(({ data }) => load(data.user));

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setTimeout(() => load(session?.user ?? null), 0);
      }
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  return state;
}