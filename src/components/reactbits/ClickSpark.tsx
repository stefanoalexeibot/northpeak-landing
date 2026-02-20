"use client";

import { useRef, useCallback } from "react";

interface ClickSparkProps {
    children: React.ReactNode;
    sparkColor?: string;
    sparkSize?: number;
    sparkCount?: number;
    duration?: number;
}

export default function ClickSpark({
    children,
    sparkColor = "#00e5a0",
    sparkSize = 10,
    sparkCount = 8,
    duration = 500,
}: ClickSparkProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    const createSpark = useCallback(
        (e: React.MouseEvent) => {
            const container = containerRef.current;
            if (!container) return;

            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            for (let i = 0; i < sparkCount; i++) {
                const spark = document.createElement("div");
                const angle = (360 / sparkCount) * i + Math.random() * 30 - 15;
                const distance = 20 + Math.random() * 30;
                const rad = (angle * Math.PI) / 180;

                spark.style.cssText = `
          position: absolute;
          left: ${x}px;
          top: ${y}px;
          width: ${sparkSize}px;
          height: ${sparkSize}px;
          border-radius: 50%;
          background: ${sparkColor};
          pointer-events: none;
          z-index: 9999;
          transform: translate(-50%, -50%) scale(1);
          transition: all ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
          opacity: 1;
          box-shadow: 0 0 ${sparkSize * 2}px ${sparkColor}40;
        `;

                container.appendChild(spark);

                // Force reflow
                void spark.offsetHeight;

                requestAnimationFrame(() => {
                    spark.style.transform = `translate(
            calc(-50% + ${Math.cos(rad) * distance}px),
            calc(-50% + ${Math.sin(rad) * distance}px)
          ) scale(0)`;
                    spark.style.opacity = "0";
                });

                setTimeout(() => spark.remove(), duration);
            }
        },
        [sparkColor, sparkSize, sparkCount, duration]
    );

    return (
        <div
            ref={containerRef}
            onClick={createSpark}
            className="relative"
            style={{ position: "relative" }}
        >
            {children}
        </div>
    );
}
