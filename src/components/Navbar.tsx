import Link from "next/link";
import AuthButton from "./AuthButton";

export default function Navbar() {
  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3.5 px-5 py-4 sm:px-10">
        <Link
          href="/"
          className="font-display text-3xl font-extrabold tracking-tight text-brand"
        >
          Fixer
        </Link>

        <button
          type="button"
          className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-line bg-white px-3.5 text-sm font-semibold"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 21s7-6.2 7-11.5a7 7 0 0 0-14 0C5 14.8 12 21 12 21z" />
            <circle cx="12" cy="9.5" r="2.5" />
          </svg>
          Select your city
        </button>

        <label className="relative block min-w-[220px] flex-1">
          <span className="sr-only">Search for a service</span>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden="true"
            className="absolute left-3.5 top-3.5 text-muted"
          >
            <circle cx="11" cy="11" r="6.5" />
            <path d="m16 16 4 4" />
          </svg>
          <input
            type="search"
            placeholder="Search for a service, like AC repair"
            className="min-h-11 w-full rounded-xl border border-line bg-surface pl-11 pr-4 text-[15px] font-medium text-ink placeholder:text-muted"
          />
        </label>

        <Link
          href="/partner/apply"
          className="flex min-h-11 items-center px-1.5 text-sm font-semibold hover:text-brand"
        >
          Become a partner
        </Link>
        <AuthButton />
      </div>
    </header>
  );
}