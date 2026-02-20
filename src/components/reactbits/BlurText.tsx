"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface BlurTextProps {
    text: string;
    className?: string;
    delay?: number;
    direction?: "top" | "bottom";
}

export default function BlurText({
    text,
    className = "",
    delay = 0,
    direction = "bottom",
}: BlurTextProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    const words = text.split(" ");

    const yFrom = direction === "top" ? -12 : 12;

    return (
        <span ref={ref} className={`inline-flex flex-wrap gap-x-[0.25em] ${className}`}>
            {words.map((word, i) => (
                <motion.span
                    key={`${word}-${i}`}
                    initial={{ opacity: 0, filter: "blur(12px)", y: yFrom }}
                    animate={
                        isInView
                            ? { opacity: 1, filter: "blur(0px)", y: 0 }
                            : { opacity: 0, filter: "blur(12px)", y: yFrom }
                    }
                    transition={{
                        duration: 0.5,
                        delay: delay + i * 0.08,
                        ease: "easeOut",
                    }}
                >
                    {word}
                </motion.span>
            ))}
        </span>
    );
}
