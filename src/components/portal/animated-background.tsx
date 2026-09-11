"use client";

import { useDesktop } from "@/hooks/use-media-query";

export default function AnimatedBackground() {
  const isDesktop = useDesktop();
  if (!isDesktop) return null;

  return (
    <div className="fixed inset-0 z-[2] overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Layer 1: blue-gray blob */}
      <div
        className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] animate-gradient-shift-1 gpu-accelerated"
        style={{
          background:
            "radial-gradient(ellipse at 30% 50%, rgba(100,130,180,0.18) 0%, transparent 50%)",
          filter: "blur(60px)",
        }}
      />
      {/* Layer 2: purple blob */}
      <div
        className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] animate-gradient-shift-2 gpu-accelerated"
        style={{
          background:
            "radial-gradient(ellipse at 70% 50%, rgba(120,80,200,0.14) 0%, transparent 50%)",
          filter: "blur(60px)",
        }}
      />
      {/* Layer 3: green accent blob */}
      <div
        className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] animate-gradient-shift-3 gpu-accelerated"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(0,229,160,0.16) 0%, transparent 50%)",
          filter: "blur(60px)",
        }}
      />
    </div>
  );
}
