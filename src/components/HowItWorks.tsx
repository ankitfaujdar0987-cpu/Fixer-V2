const steps = [
  {
    title: "Search and choose",
    text: "Pick a service, set your location, and compare partners nearby.",
  },
  {
    title: "Book a time",
    text: "Log in, add your address, and send a booking request.",
  },
  {
    title: "Pay and review",
    text: "Pay online once the job is accepted, then rate your partner.",
  },
];

export default function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-14 sm:px-10">
      <h2 className="mb-8 text-3xl font-extrabold sm:text-4xl">
        How Fixer works
      </h2>
      <div className="grid gap-8 md:grid-cols-3">
        {steps.map((step, i) => (
          <div key={step.title} className="flex gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent font-display text-lg font-extrabold">
              {i + 1}
            </span>
            <div>
              <h3 className="mb-1 text-lg font-bold">{step.title}</h3>
              <p className="text-muted">{step.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}