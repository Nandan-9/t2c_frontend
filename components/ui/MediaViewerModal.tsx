"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface Props {
  src: string;
  type: "image" | "video";
  onClose: () => void;
}

export function MediaViewerModal({ src, type, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose();
  }

  if (!mounted) return null;

  return createPortal(
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-9999 flex items-center justify-center  backdrop-blur-sm"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2  rounded-full bg-black/50 hover:bg-white/20 text-white transition-colors"
        aria-label="Close"
      >
        <X size={22} />
      </button>

      <div className="relative flex items-center justify-center w-full h-full px-4 py-16 md:px-16 md:py-12">
        {type === "image" ? (
          <img
            src={src}
            alt=""
            className="max-w-full max-h-full object-contain rounded-lg select-none"
            draggable={false}
          />
        ) : (
          <video
            src={src}
            controls
            autoPlay
            className="max-w-full max-h-full rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        )}
      </div>
    </div>,
    document.body
  );
}
