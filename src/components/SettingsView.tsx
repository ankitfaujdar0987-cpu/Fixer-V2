"use client";

import { useState } from "react";
import { useAccount } from "@/lib/useAccount";

type NotifKey = "booking" | "payment" | "offers" | "sms";

const NOTIFS: { key: NotifKey; title: string; text: string }[] = [
  {
    key: "booking",
    title: "Booking alerts",
    text: "Get notified when a booking request or its status changes.",
  },
  {
    key: "payment",
    title: "Payment alerts",
    text: "Get notified about payments for your jobs.",
  },
  {
    key: "offers",
    title: "Tips and offers",
    text: "Tips, offers and platform updates.",
  },
  {
    key: "sms",
    title: "SMS alerts",
    text: "Receive important updates by SMS.",
  },
];

function Toggle({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`relative h-7 w-12 shrink-0 cursor-pointer rounded-full transition-colors ${
        on ? "bg-brand" : "bg-line"
      }`}
    >
      <span
        className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          on ? "translate-x-5" : ""
        }`}
      />
    </button>
  );
}

function Card({
  title,
  text,
  danger,
  children,
}: {
  title: string;
  text?: string;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`mb-5 rounded-2xl border bg-white p-5 ${
        danger ? "border-red-200" : "border-line"
      }`}
    >
      <h2 className={`text-lg font-bold ${danger ? "text-red-700" : ""}`}>
        {title}
      </h2>
      {text && <p className="mb-3 text-sm text-muted">{text}</p>}
      {children}
    </section>
  );
}

const inputClass =
  "min-h-11 w-full rounded-xl border border-line bg-white px-3.5 text-[15px]";

export default function SettingsView({
  isPartner,
  sample = false,
}: {
  isPartner?: boolean;
  sample?: boolean;
}) {
  const account = useAccount();
  const partner = isPartner ?? account.isPartner;

  const [notif, setNotif] = useState<Record<NotifKey, boolean>>({
    booking: true,
    payment: true,
    offers: false,
    sms: true,
  });
  const [accepting, setAccepting] = useState(true);
  const [radius, setRadius] = useState("10");
  const [bank, setBank] = useState({
    open: false,
    holder: "",
    number: "",
    ifsc: "",
    added: false,
  });
  const [del, setDel] = useState({ open: false, text: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function addBank() {
    setError("");
    if (!bank.holder.trim()) return setError("Enter the account holder name.");
    if (!/^\d{9,18}$/.test(bank.number.trim()))
      return setError("Enter a valid account number (9 to 18 digits).");
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bank.ifsc.trim().toUpperCase()))
      return setError("Enter a valid IFSC code, like SBIN0001234.");
    setBank((b) => ({ ...b, open: false, added: true }));
    setMessage("Sample only: bank details are not stored anywhere yet.");
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-8 sm:px-8">
      {sample && (
        <p className="mb-6 rounded-xl bg-accent-light px-4 py-3 text-sm font-semibold text-ink">
          Sample screen: nothing you change here is saved yet. We connect it to
          your real account later.
        </p>
      )}

      <h1 className="text-3xl font-extrabold">Settings</h1>
      <p className="mb-6 text-muted">Manage your account preferences</p>

      {message && (
        <p className="mb-5 rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
          {message}
        </p>
      )}

      <Card title="Notifications">
        <ul>
          {NOTIFS.map((n) => (
            <li
              key={n.key}
              className="flex items-center justify-between gap-4 border-t border-line py-3.5 first:border-t-0"
            >
              <div>
                <div className="font-semibold">{n.title}</div>
                <div className="text-sm text-muted">{n.text}</div>
              </div>
              <Toggle
                label={n.title}
                on={notif[n.key]}
                onChange={(v) => setNotif((s) => ({ ...s, [n.key]: v }))}
              />
            </li>
          ))}
        </ul>
      </Card>

      {partner && (
        <>
          <Card title="Availability">
            <div className="flex items-center justify-between gap-4 border-b border-line pb-4">
              <div>
                <div className="font-semibold">Accept new bookings</div>
                <div className="text-sm text-muted">
                  Turn off when you are on a break. Customers see you as
                  offline.
                </div>
              </div>
              <Toggle
                label="Accept new bookings"
                on={accepting}
                onChange={setAccepting}
              />
            </div>

            <label className="mt-4 block text-sm">
              <span className="mb-1 block font-semibold">Service area</span>
              <select
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                className={inputClass}
              >
                {["5", "10", "15", "25", "50"].map((r) => (
                  <option key={r} value={r}>
                    Within {r} km of my location
                  </option>
                ))}
              </select>
            </label>
          </Card>

          <Card
            title="Bank account"
            text="Add your bank account to receive payouts."
          >
            {bank.added && !bank.open ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface p-4">
                <div>
                  <div className="font-semibold">{bank.holder}</div>
                  <div className="text-sm text-muted">
                    Account ending {bank.number.slice(-4)} ·{" "}
                    {bank.ifsc.toUpperCase()}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setBank((b) => ({ ...b, open: true }))}
                  className="min-h-11 cursor-pointer rounded-xl border border-line bg-white px-4 text-sm font-semibold hover:bg-white/60"
                >
                  Change
                </button>
              </div>
            ) : bank.open ? (
              <div className="grid gap-3">
                <input
                  type="text"
                  placeholder="Account holder name"
                  value={bank.holder}
                  onChange={(e) =>
                    setBank((b) => ({ ...b, holder: e.target.value }))
                  }
                  className={inputClass}
                />
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Account number"
                  value={bank.number}
                  onChange={(e) =>
                    setBank((b) => ({ ...b, number: e.target.value }))
                  }
                  className={inputClass}
                />
                <input
                  type="text"
                  placeholder="IFSC code"
                  value={bank.ifsc}
                  onChange={(e) =>
                    setBank((b) => ({ ...b, ifsc: e.target.value }))
                  }
                  className={inputClass}
                />
                {error && (
                  <p className="text-sm font-semibold text-red-700">{error}</p>
                )}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={addBank}
                    className="min-h-11 cursor-pointer rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-dark"
                  >
                    Save bank account
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setBank((b) => ({ ...b, open: false }));
                    }}
                    className="min-h-11 cursor-pointer rounded-xl border border-line bg-white px-5 text-sm font-semibold hover:bg-surface"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setBank((b) => ({ ...b, open: true }))}
                className="min-h-11 cursor-pointer rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-dark"
              >
                Add bank account
              </button>
            )}
          </Card>
        </>
      )}

      <Card
        title="Delete account"
        danger
        text="Permanently delete your account. This cannot be undone."
      >
        {!del.open ? (
          <button
            type="button"
            onClick={() => setDel({ open: true, text: "" })}
            className="min-h-11 cursor-pointer rounded-xl border border-red-300 bg-white px-5 text-sm font-semibold text-red-700 hover:bg-red-50"
          >
            Delete account
          </button>
        ) : (
          <div className="grid gap-3">
            <label className="text-sm">
              <span className="mb-1 block font-semibold">
                Type DELETE to confirm
              </span>
              <input
                type="text"
                value={del.text}
                onChange={(e) => setDel((d) => ({ ...d, text: e.target.value }))}
                className={inputClass}
              />
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                disabled={del.text !== "DELETE"}
                onClick={() => {
                  setDel({ open: false, text: "" });
                  setMessage("Sample only: nothing was deleted.");
                }}
                className="min-h-11 cursor-pointer rounded-xl bg-red-700 px-5 text-sm font-semibold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Permanently delete
              </button>
              <button
                type="button"
                onClick={() => setDel({ open: false, text: "" })}
                className="min-h-11 cursor-pointer rounded-xl border border-line bg-white px-5 text-sm font-semibold hover:bg-surface"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Card>
    </main>
  );
}