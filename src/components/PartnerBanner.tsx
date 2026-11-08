import Link from "next/link";

const benefits = [
  "Set your own service prices",
  "Switch online or offline whenever you like",
  "Get paid online after each completed job",
];

export default function PartnerBanner() {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-10">
      <div className="grid items-center gap-8 rounded-[28px] bg-brand p-8 text-white sm:p-12 md:grid-cols-2">
        <div>
          <h2 className="mb-3 text-[clamp(1.75rem,3.4vw,2.5rem)] font-extrabold leading-[1.1]">
            Earn with your skills
          </h2>
          <p className="mb-6 max-w-[460px] text-[17px] text-brand-light">
            Join Fixer as a service partner. Set your own prices and get
            booking requests from people nearby.
          </p>
          <Link
            href="#"
            className="inline-flex min-h-12 items-center rounded-xl bg-accent px-6 text-[15px] font-bold text-ink transition-colors hover:bg-accent-dark"
          >
            Become a Fixer partner
          </Link>
        </div>

        <ul className="grid gap-3.5 text-[17px]">
          {benefits.map((benefit) => (
            <li key={benefit} className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-accent" />
              {benefit}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}