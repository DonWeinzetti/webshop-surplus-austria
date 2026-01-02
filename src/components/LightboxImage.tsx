"use client";

import { useEffect, useState } from "react";

type Props = {
  thumbUrl?: string | null;
  originalUrl?: string | null;
  alt?: string;
  className?: string;
};

export default function LightboxImage({
  thumbUrl,
  originalUrl,
  alt = "Bild",
  className = "",
}: Props) {
  const [open, setOpen] = useState(false);

  const preview = thumbUrl ?? originalUrl ?? null;
  const full = originalUrl ?? thumbUrl ?? null;

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    // scroll lock
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  if (!preview || !full) return null;

  return (
    <>
      <button
        type="button"
        className="block w-full"
        onClick={() => setOpen(true)}
        aria-label="Bild vergrößern"
      >
        <img
          src={preview}
          alt={alt}
          className={`h-40 w-40 rounded-xl border object-cover ${className}`}
          loading="lazy"
        />
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => {
            // Klick außerhalb schließen
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="relative max-h-[90vh] max-w-[95vw]">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute -top-3 -right-3 rounded-full bg-white px-3 py-1 text-sm shadow"
              aria-label="Schließen"
            >
              ✕
            </button>

            <img
              src={full}
              alt={alt}
              className="max-h-[90vh] max-w-[95vw] rounded-xl"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
