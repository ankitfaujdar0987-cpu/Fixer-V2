"use client";

import Link from "next/link";
import { useAccount } from "@/lib/useAccount";

export default function PartnerButton() {
  const account = useAccount();

  if (account.ready && (account.isPartner || account.isAdmin)) return null;

  return (
    <Link
      href="/partner/apply"
      className="flex min-h-11 items-center rounded-xl bg-accent px-5 text-sm font-bold text-ink transition-colors hover:bg-accent-dark"
    >
      Become a partner
    </Link>
  );
}