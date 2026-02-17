"use client";

import { useRef, useState, useCallback } from "react";
import { useDesktop } from "@/hooks/use-media-query";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  glowEffect?: boolean;
}

export default function TiltCard({
  children,
  className = "",
  intensity = 12,
  glowEffect = true,
}: TiltCardProps) {
  const isDesktop = useDesktop();
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});

  const handleMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rotateX = (0.5 - y) * intensity;
      const rotateY = (x - 0.5) * intensity;

      setStyle({
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
        ...(glowEffect
          ? {
              background: `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(0,229,160,0.06) 0%, transparent 60%)`,
            }
          : {}),
      });
    },
    [intensity, glowEffect]
  );

  const handleLeave = useCallback(() => {
    setStyle({
      transform:
        "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
    });
  }, []);

  if (!isDesktop) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={ref}
      className={`gpu-accelerated ${className}`}
      style={{
        transition: "transform 0.25s cubic-bezier(0.03, 0.98, 0.52, 0.99)",
        transformStyle: "preserve-3d",
        ...style,
      }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {children}
    </div>
  );
}
