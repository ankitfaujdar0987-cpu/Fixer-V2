import Link from "next/link";

const links = ["About", "Services", "Become a partner", "Help"];

export default function Footer() {
  return (
    <footer className="bg-ink text-sm text-slate-300">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-8 gap-y-4 px-5 py-8 sm:px-10">
        <span className="font-display text-2xl font-extrabold text-white">
          Fixer
        </span>
        <nav className="flex flex-wrap gap-5">
          {links.map((link) => (
            <Link key={link} href="#" className="hover:text-white">
              {link}
            </Link>
          ))}
        </nav>
        <span>© 2026 Fixer. All rights reserved.</span>
      </div>
    </footer>
  );
}