import CategoryGrid from "./CategoryGrid";

export default function Hero() {
  return (
    <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-14 pt-12 sm:px-10 lg:grid-cols-2">
      <div>
        <h1 className="mb-3.5 text-[clamp(2.1rem,4.6vw,3.5rem)] font-extrabold leading-[1.06]">
          Book trusted local experts in minutes
        </h1>
        <p className="mb-8 max-w-[480px] text-lg text-muted">
          Electricians, plumbers, tutors, cleaners and more. Compare verified
          partners near you and book the one you like.
        </p>
        <h2 className="mb-3.5 text-xl font-bold">What do you need help with?</h2>
        <CategoryGrid />
      </div>

      {/* Decorative panel: a preview of the provider list */}
      <div
        aria-hidden="true"
        className="relative flex min-h-[480px] items-center justify-center overflow-hidden rounded-[28px] bg-brand p-8"
      >
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent" />
        <div className="absolute -bottom-14 -left-12 h-44 w-44 rounded-full bg-brand-dark" />

        <div className="relative w-full max-w-[340px] rounded-[20px] bg-white p-5 shadow-2xl shadow-black/30">
          <div className="mb-3 font-display text-base font-bold">
            Electricians near you
          </div>
          <div className="mb-4 flex gap-2">
            <span className="rounded-full bg-brand-light px-3 py-1 text-xs font-semibold text-brand-dark">
              Price
            </span>
            <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-muted">
              Rating
            </span>
            <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-muted">
              Distance
            </span>
          </div>
          {[70, 60, 75].map((w, i) => (
            <div
              key={i}
              className="flex items-center gap-3 border-t border-line py-3 last:pb-0"
            >
              <span
                className={`h-10 w-10 rounded-full ${i === 1 ? "bg-accent-light" : "bg-brand-light"}`}
              />
              <span className="flex-1">
                <span
                  className="mb-2 block h-2.5 rounded-full bg-slate-300"
                  style={{ width: `${w}%` }}
                />
                <span className="block h-2 w-2/5 rounded-full bg-line" />
              </span>
              <span className="rounded-lg bg-accent px-3.5 py-1.5 text-xs font-bold text-ink">
                Book
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}