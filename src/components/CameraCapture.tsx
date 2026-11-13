"use client";

import { useEffect, useRef, useState } from "react";

export default function CameraCapture({
  previewUrl,
  onCapture,
}: {
  previewUrl: string;
  onCapture: (blob: Blob, url: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [on, setOn] = useState(false);
  const [error, setError] = useState("");

  // Turn the camera off when leaving the page
  useEffect(() => {
    return () => streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  async function start() {
    setError("");
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
      setOn(true);
    } catch {
      setError(
        "Could not open the camera. Please allow camera access and try again."
      );
    }
  }

  function stop() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setOn(false);
  }

  function shoot() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        onCapture(blob, URL.createObjectURL(blob));
        stop();
      },
      "image/jpeg",
      0.85
    );
  }

  return (
    <div>
      <div className="relative aspect-[4/3] w-full max-w-md overflow-hidden rounded-2xl border border-line bg-surface">
        <video
          ref={videoRef}
          playsInline
          muted
          className={`h-full w-full -scale-x-100 object-cover ${on ? "" : "hidden"}`}
        />
        {!on && previewUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="Your selfie"
            className="h-full w-full object-cover"
          />
        )}
        {!on && !previewUrl && (
          <div className="flex h-full items-center justify-center text-sm text-muted">
            Camera not started
          </div>
        )}
      </div>

      {error && (
        <p className="mt-3 text-sm font-semibold text-red-700">{error}</p>
      )}

      <div className="mt-3">
        {on ? (
          <button
            type="button"
            onClick={shoot}
            className="min-h-11 cursor-pointer rounded-xl bg-accent px-6 text-sm font-bold text-ink hover:bg-accent-dark"
          >
            Take photo
          </button>
        ) : (
          <button
            type="button"
            onClick={start}
            className="min-h-11 cursor-pointer rounded-xl border border-line bg-white px-5 text-sm font-semibold hover:bg-surface"
          >
            {previewUrl ? "Retake selfie" : "Start camera"}
          </button>
        )}
      </div>
    </div>
  );
}