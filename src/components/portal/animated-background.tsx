"use client";

import { useDesktop } from "@/hooks/use-media-query";

export default function AnimatedBackground() {
  const isDesktop = useDesktop();
  if (!isDesktop) return null;

  return (
    <div className="fixed inset-0 z-[-10] overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Layer 1: gray blob */}
      <div
        className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] animate-gradient-shift-1 gpu-accelerated"
        style={{
          background:
            "radial-gradient(ellipse at 30% 50%, rgba(128,128,128,0.04) 0%, transparent 50%)",
          filter: "blur(80px)",
        }}
      />
      {/* Layer 2: card-color blob */}
      <div
        className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] animate-gradient-shift-2 gpu-accelerated"
        style={{
          background:
            "radial-gradient(ellipse at 70% 50%, rgba(12,13,18,0.06) 0%, transparent 50%)",
          filter: "blur(80px)",
        }}
      />
      {/* Layer 3: green accent blob */}
      <div
        className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] animate-gradient-shift-3 gpu-accelerated"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(0,229,160,0.03) 0%, transparent 50%)",
          filter: "blur(80px)",
        }}
      />
    </div>
  );
}
