"use client";

import { motion } from "framer-motion";

interface AuroraProps {
    className?: string;
    colorStops?: string[];
    blend?: string;
    blur?: string;
    speed?: number;
    opacity?: number;
}

export default function Aurora({
    className = "",
    colorStops = ["#00e5a0", "#0066ff", "#8b5cf6", "#00e5a0"],
    blend = "screen",
    blur = "100px",
    speed = 8,
    opacity = 0.35,
}: AuroraProps) {
    const gradient = `radial-gradient(ellipse at 50% 50%, ${colorStops.join(", ")})`;

    return (
        <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
            {/* Layer 1 — large slow drift */}
            <motion.div
                className="absolute"
                style={{
                    width: "140%",
                    height: "140%",
                    left: "-20%",
                    top: "-20%",
                    background: gradient,
                    filter: `blur(${blur})`,
                    mixBlendMode: blend as React.CSSProperties["mixBlendMode"],
                    opacity,
                }}
                animate={{
                    x: [0, 60, -30, 0],
                    y: [0, -40, 20, 0],
                    scale: [1, 1.1, 0.95, 1],
                    rotate: [0, 8, -5, 0],
                }}
                transition={{
                    duration: speed,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Layer 2 — secondary offset */}
            <motion.div
                className="absolute"
                style={{
                    width: "120%",
                    height: "120%",
                    left: "-10%",
                    top: "-10%",
                    background: `radial-gradient(ellipse at 30% 70%, ${colorStops.slice().reverse().join(", ")})`,
                    filter: `blur(${blur})`,
                    mixBlendMode: blend as React.CSSProperties["mixBlendMode"],
                    opacity: opacity * 0.7,
                }}
                animate={{
                    x: [0, -50, 40, 0],
                    y: [0, 30, -50, 0],
                    scale: [1, 0.9, 1.15, 1],
                    rotate: [0, -10, 6, 0],
                }}
                transition={{
                    duration: speed * 1.3,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Layer 3 — subtle highlight */}
            <motion.div
                className="absolute"
                style={{
                    width: "80%",
                    height: "80%",
                    left: "10%",
                    top: "10%",
                    background: `radial-gradient(circle at 60% 40%, ${colorStops[0]}66, transparent 60%)`,
                    filter: `blur(80px)`,
                    mixBlendMode: blend as React.CSSProperties["mixBlendMode"],
                    opacity: opacity * 0.5,
                }}
                animate={{
                    x: [0, 30, -20, 0],
                    y: [0, -20, 30, 0],
                }}
                transition={{
                    duration: speed * 0.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
        </div>
    );
}
