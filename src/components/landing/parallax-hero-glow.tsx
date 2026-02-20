"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function ParallaxHeroGlow() {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll();

    // Move glow up at 30% of scroll speed for subtle parallax
    const y = useTransform(scrollY, [0, 800], [0, -120]);
    const opacity = useTransform(scrollY, [0, 600], [1, 0.3]);
    const scale = useTransform(scrollY, [0, 800], [1, 1.15]);

    return (
        <div ref={ref} className="pointer-events-none absolute inset-0">
            <motion.div
                style={{ y, opacity, scale }}
                className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-northpeak-green/8 blur-[100px]"
            />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-northpeak-green/25 to-transparent" />
        </div>
    );
}
