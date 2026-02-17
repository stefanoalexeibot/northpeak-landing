"use client";

import { useDesktop } from "@/hooks/use-media-query";

export default function DotGrid() {
  const isDesktop = useDesktop();
  if (!isDesktop) return null;

  return (
    <div
      className="fixed inset-0 z-[1] pointer-events-none animate-dot-pulse gpu-accelerated"
      style={{
        backgroundImage:
          "radial-gradient(circle, rgba(0,229,160,0.30) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }}
      aria-hidden="true"
    />
  );
}
