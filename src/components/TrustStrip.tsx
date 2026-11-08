const points = [
  {
    title: "Verified partners",
    text: "Documents are checked before a partner goes live on Fixer.",
  },
  {
    title: "Compare before you book",
    text: "See price, rating, distance and availability side by side.",
  },
  {
    title: "Pay online, then review",
    text: "Secure payment, and reviews only from completed jobs.",
  },
];

export default function TrustStrip() {
  return (
    <section className="bg-surface">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-9 sm:px-10 md:grid-cols-3">
        {points.map((point) => (
          <div key={point.title}>
            <h3 className="mb-1.5 text-lg font-bold">{point.title}</h3>
            <p className="text-muted">{point.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}