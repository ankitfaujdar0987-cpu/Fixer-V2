// Shows the profile photo, or the first letter of the name if there is none.
export default function Avatar({
  name,
  url,
  size = 40,
}: {
  name: string;
  url: string | null;
  size?: number;
}) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt=""
        width={size}
        height={size}
        referrerPolicy="no-referrer"
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className="flex shrink-0 items-center justify-center rounded-full bg-brand-light font-display font-extrabold text-brand"
      style={{ width: size, height: size, fontSize: size * 0.45 }}
    >
      {(name || "?").charAt(0).toUpperCase()}
    </span>
  );
}