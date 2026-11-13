"use client";

import { useEffect, useState } from "react";

function formatPhone(digits: string) {
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
}

export default function PhoneVerify({
  sample = false,
  onDone,
}: {
  sample?: boolean;
  onDone?: (phone: string) => void;
}) {
  const [step, setStep] = useState<"enter" | "code" | "done">("enter");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [wait, setWait] = useState(0);

  // Countdown for "Resend code"
  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const digits = phone.replace(/\D/g, "").slice(-10);

  function sendCode() {
    setError("");
    if (!/^[6-9]\d{9}$/.test(digits)) {
      return setError("Enter a valid 10-digit mobile number.");
    }
    // Real version: ask the SMS service to send a code to this number
    setCode("");
    setWait(30);
    setStep("code");
  }

  function verify() {
    setError("");
    if (!/^\d{6}$/.test(code)) return setError("Enter the 6-digit code.");
    // Real version: check the code with the SMS service
    setStep("done");
    onDone?.("+91" + digits);
  }

  const inputClass =
    "min-h-12 w-full rounded-xl border border-line bg-white px-3.5 text-[15px]";
  const primary =
    "min-h-12 w-full cursor-pointer rounded-xl bg-brand px-6 text-[15px] font-semibold text-white hover:bg-brand-dark";

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-line bg-white p-6">
      {sample && (
        <p className="mb-5 rounded-xl bg-accent-light px-4 py-3 text-sm font-semibold text-ink">
          Sample screen: no SMS is sent. Any 6-digit code works.
        </p>
      )}

      {step === "enter" && (
        <>
          <h2 className="text-2xl font-extrabold">Verify your mobile number</h2>
          <p className="mb-5 mt-1 text-muted">
            Add your number once. After that it is shared automatically with the
            person you are connected to for a booking, so you never type it
            again.
          </p>

          <label className="block text-sm">
            <span className="mb-1 block font-semibold">Mobile number</span>
            <div className="flex gap-2">
              <span className="flex min-h-12 items-center rounded-xl bg-surface px-3.5 text-[15px] text-muted">
                +91
              </span>
              <input
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="10-digit number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClass}
              />
            </div>
          </label>

          {error && (
            <p role="alert" className="mt-3 text-sm font-semibold text-red-700">
              {error}
            </p>
          )}

          <button type="button" onClick={sendCode} className={`${primary} mt-5`}>
            Send code
          </button>
        </>
      )}

      {step === "code" && (
        <>
          <h2 className="text-2xl font-extrabold">Enter the code</h2>
          <p className="mb-5 mt-1 text-muted">
            We sent a 6-digit code to {formatPhone(digits)}.
          </p>

          <label className="block text-sm">
            <span className="mb-1 block font-semibold">6-digit code</span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className={`${inputClass} text-center text-2xl tracking-[0.5em]`}
            />
          </label>

          {error && (
            <p role="alert" className="mt-3 text-sm font-semibold text-red-700">
              {error}
            </p>
          )}

          <button type="button" onClick={verify} className={`${primary} mt-5`}>
            Verify
          </button>

          <div className="mt-4 flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => {
                setError("");
                setStep("enter");
              }}
              className="cursor-pointer font-semibold text-brand hover:underline"
            >
              Change number
            </button>
            {wait > 0 ? (
              <span className="text-muted">Resend code in {wait}s</span>
            ) : (
              <button
                type="button"
                onClick={() => setWait(30)}
                className="cursor-pointer font-semibold text-brand hover:underline"
              >
                Resend code
              </button>
            )}
          </div>
        </>
      )}

      {step === "done" && (
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-2xl text-green-700">
            ✓
          </div>
          <h2 className="text-2xl font-extrabold">Number verified</h2>
          <p className="mt-1 font-bold">{formatPhone(digits)}</p>
          <p className="mt-3 text-muted">
            From now on this number is shared automatically when a booking is
            accepted. You never type it again.
          </p>
        </div>
      )}
    </div>
  );
}