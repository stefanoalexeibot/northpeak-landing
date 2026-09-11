"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useDesktop } from "@/hooks/use-media-query";

export default function ParallaxHeroGlow() {
    const isDesktop = useDesktop();
    const ref = useRef<HTMLDivElement>(null);

    // Hooks must be called unconditionally
    const { scrollY } = useScroll();
    const y       = useTransform(scrollY, [0, 800], [0, -120]);
    const opacity = useTransform(scrollY, [0, 600], [1, 0.3]);
    const scale   = useTransform(scrollY, [0, 800], [1, 1.15]);

    // On mobile: static, no scroll tracking, no blur
    if (!isDesktop) {
        return (
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[300px] w-[400px] rounded-full bg-northpeak-green/6 blur-[60px]" />
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-northpeak-green/20 to-transparent" />
            </div>
        );
    }

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
