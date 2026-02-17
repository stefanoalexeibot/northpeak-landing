"use client";

import { useEffect, useRef } from "react";
import { useDesktop } from "@/hooks/use-media-query";

export default function CursorGlow() {
  const isDesktop = useDesktop();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDesktop) return;

    const handleMove = (e: MouseEvent) => {
      if (ref.current) {
        ref.current.style.setProperty("--mouse-x", `${e.clientX}px`);
        ref.current.style.setProperty("--mouse-y", `${e.clientY}px`);
      }
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMove);
  }, [isDesktop]);

  if (!isDesktop) return null;

  return (
    <div
      ref={ref}
      className="fixed inset-0 z-[50] pointer-events-none"
      style={{
        background:
          "radial-gradient(600px circle at var(--mouse-x, -1000px) var(--mouse-y, -1000px), rgba(0,229,160,0.08), transparent 40%)",
        mixBlendMode: "screen",
      }}
      aria-hidden="true"
    />
  );
}
