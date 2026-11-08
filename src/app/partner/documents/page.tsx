"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

type Status = {
  verification: "pending" | "verified" | "rejected";
  submitted_at: string | null;
} | null;

const MAX_BYTES = 5 * 1024 * 1024;

export default function PartnerDocumentsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<Status>(null);
  const [ready, setReady] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [selfie, setSelfie] = useState<Blob | null>(null);
  const [selfieUrl, setSelfieUrl] = useState("");

  const [idType, setIdType] = useState<"aadhaar" | "pan">("aadhaar");
  const [idFile, setIdFile] = useState<File | null>(null);
  const [idUrl, setIdUrl] = useState("");

  const [consent, setConsent] = useState(false);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user);
      if (data.user) {
        const { data: row } = await supabase
          .from("partner_profiles")
          .select("verification, submitted_at")
          .eq("partner_id", data.user.id)
          .maybeSingle();
        setStatus(row as Status);
      }
      setReady(true);
    });
    return () => streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  async function startCamera() {
    setMessage("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOn(true);
    } catch {
      setMessage(
        "Could not open the camera. Please allow camera access and try again."
      );
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOn(false);
  }

  function takeSelfie() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        setSelfie(blob);
        setSelfieUrl(URL.createObjectURL(blob));
        stopCamera();
      },
      "image/jpeg",
      0.85
    );
  }

  function pickId(file: File | undefined) {
    setMessage("");
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      return setMessage("Please choose a JPG, PNG or WebP photo.");
    }
    if (file.size > MAX_BYTES) {
      return setMessage("The photo is too large. Maximum size is 5 MB.");
    }
    setIdFile(file);
    setIdUrl(URL.createObjectURL(file));
  }

  async function submit() {
    setMessage("");
    if (!user) return;
    if (!selfie) return setMessage("Take your live selfie first.");
    if (!idFile)
      return setMessage("Upload a photo of your Aadhaar or PAN card.");
    if (!consent) return setMessage("Please tick the consent box.");

    setSaving(true);
    const supabase = createClient();
    const fail = (text: string) => {
      setSaving(false);
      setMessage(text);
    };

    const stamp = Date.now();
    const ext =
      idFile.type === "image/png"
        ? "png"
        : idFile.type === "image/webp"
          ? "webp"
          : "jpg";
    const selfiePath = `${user.id}/selfie-${stamp}.jpg`;
    const idPath = `${user.id}/${idType}-${stamp}.${ext}`;

    const up1 = await supabase.storage
      .from("partner-docs")
      .upload(selfiePath, selfie, { contentType: "image/jpeg" });
    if (up1.error) return fail(up1.error.message);

    const up2 = await supabase.storage
      .from("partner-docs")
      .upload(idPath, idFile, { contentType: idFile.type });
    if (up2.error) return fail(up2.error.message);

    const del = await supabase
      .from("partner_documents")
      .delete()
      .eq("partner_id", user.id);
    if (del.error) return fail(del.error.message);

    const ins = await supabase.from("partner_documents").insert([
      { partner_id: user.id, doc_type: "selfie", file_path: selfiePath },
      { partner_id: user.id, doc_type: idType, file_path: idPath },
    ]);
    if (ins.error) return fail(ins.error.message);

    const upd = await supabase
      .from("partner_profiles")
      .update({ submitted_at: new Date().toISOString() })
      .eq("partner_id", user.id);
    if (upd.error) return fail(upd.error.message);

    setSaving(false);
    setDone(true);
  }

  const box = "mx-auto max-w-xl px-5 py-16";
  const linkBtn =
    "inline-flex min-h-12 items-center rounded-xl bg-brand px-6 text-sm font-semibold text-white hover:bg-brand-dark";

  if (!ready) return <main className="p-8 text-muted">Loading...</main>;

  if (!user) {
    return (
      <main className={box}>
        <h1 className="mb-3 text-3xl font-extrabold">Please log in first</h1>
        <Link href="/" className={linkBtn}>
          Back to home
        </Link>
      </main>
    );
  }

  if (!status) {
    return (
      <main className={box}>
        <h1 className="mb-3 text-3xl font-extrabold">Fill in your details first</h1>
        <p className="mb-6 text-muted">
          We need your services and experience before your documents.
        </p>
        <Link href="/partner/apply" className={linkBtn}>
          Go to the partner form
        </Link>
      </main>
    );
  }

  if (status.verification === "verified") {
    return (
      <main className={box}>
        <h1 className="mb-3 text-3xl font-extrabold">You are approved</h1>
        <p className="text-muted">
          Your documents are verified. You can now receive bookings.
        </p>
      </main>
    );
  }

  if (status.verification === "rejected") {
    return (
      <main className={box}>
        <h1 className="mb-3 text-3xl font-extrabold">Documents not accepted</h1>
        <p className="text-muted">
          We could not verify your documents. Please contact Fixer support to
          try again.
        </p>
      </main>
    );
  }

  if (done || status.submitted_at) {
    return (
      <main className={box}>
        <h1 className="mb-3 text-3xl font-extrabold">Documents submitted</h1>
        <p className="text-muted">
          Thank you. We are checking your documents. You can start receiving
          bookings once you are approved.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="mb-2 text-3xl font-extrabold">Verify your identity</h1>
      <p className="mb-8 text-muted">
        We check every partner before they go live. Your photos are private and
        only the Fixer team can see them.
      </p>

      <section className="mb-8 rounded-2xl border border-line bg-white p-5">
        <h2 className="mb-1 text-xl font-bold">1. Live selfie</h2>
        <p className="mb-4 text-sm text-muted">
          Look at the camera in good light. You take this photo now, you cannot
          upload an old one.
        </p>

        <video
          ref={videoRef}
          playsInline
          muted
          className={
            cameraOn ? "mb-4 w-full max-w-sm rounded-xl bg-black" : "hidden"
          }
        />

        {selfieUrl && !cameraOn && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={selfieUrl}
            alt="Your selfie"
            className="mb-4 w-full max-w-sm rounded-xl"
          />
        )}

        {!cameraOn ? (
          <button
            type="button"
            onClick={startCamera}
            className="min-h-11 cursor-pointer rounded-xl border border-line bg-white px-4 text-sm font-semibold hover:bg-surface"
          >
            {selfie ? "Retake selfie" : "Open camera"}
          </button>
        ) : (
          <button
            type="button"
            onClick={takeSelfie}
            className="min-h-11 cursor-pointer rounded-xl bg-accent px-5 text-sm font-bold text-ink hover:bg-accent-dark"
          >
            Take photo
          </button>
        )}
      </section>

      <section className="mb-8 rounded-2xl border border-line bg-white p-5">
        <h2 className="mb-1 text-xl font-bold">2. Government ID</h2>
        <p className="mb-4 text-sm text-muted">
          Upload a clear photo of your Aadhaar or PAN card. For Aadhaar you can
          hide the first 8 digits. Your name and photo must be clearly visible.
        </p>

        <div className="mb-4 flex gap-5 text-sm font-semibold">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="idType"
              checked={idType === "aadhaar"}
              onChange={() => setIdType("aadhaar")}
            />
            Aadhaar card
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="idType"
              checked={idType === "pan"}
              onChange={() => setIdType("pan")}
            />
            PAN card
          </label>
        </div>

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => pickId(e.target.files?.[0])}
          className="mb-4 block text-sm"
        />

        {idUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={idUrl}
            alt="Your ID card"
            className="w-full max-w-sm rounded-xl border border-line"
          />
        )}
      </section>

      <label className="mb-6 flex cursor-pointer items-start gap-3 text-sm">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-5 w-5 shrink-0"
        />
        I agree to share my selfie and ID photo with Fixer only to verify who I
        am.
      </label>

      {message && (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {message}
        </p>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={saving}
        className="min-h-12 cursor-pointer rounded-xl bg-brand px-7 text-[15px] font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {saving ? "Submitting..." : "Submit for verification"}
      </button>
    </main>
  );
}