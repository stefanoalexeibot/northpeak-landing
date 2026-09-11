"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

interface RollingNumberProps {
    value: number;
    className?: string;
    duration?: number;
    prefix?: string;
    suffix?: string;
    decimals?: number;
}

const DIGIT_HEIGHT = 40;
const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

function SingleDigit({
    digit,
    duration,
    delay,
}: {
    digit: number;
    duration: number;
    delay: number;
}) {
    return (
        <div
            className="relative overflow-hidden inline-block"
            style={{ height: DIGIT_HEIGHT, width: "0.6em" }}
        >
            <motion.div
                initial={{ y: 0 }}
                animate={{ y: -digit * DIGIT_HEIGHT }}
                transition={{
                    duration,
                    delay,
                    ease: [0.25, 0.1, 0.25, 1],
                }}
                className="flex flex-col"
            >
                {DIGITS.map((d) => (
                    <div
                        key={d}
                        className="flex items-center justify-center"
                        style={{ height: DIGIT_HEIGHT }}
                    >
                        {d}
                    </div>
                ))}
            </motion.div>
        </div>
    );
}

export default function RollingNumber({
    value,
    className = "",
    duration = 1.2,
    prefix = "",
    suffix = "",
    decimals = 0,
}: RollingNumberProps) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });
    const [triggered, setTriggered] = useState(false);

    useEffect(() => {
        if (isInView && !triggered) setTriggered(true);
    }, [isInView, triggered]);

    const formatted = value.toFixed(decimals);
    const chars = formatted.split("");

    return (
        <div ref={ref} className={`inline-flex items-center ${className}`}>
            {prefix && <span>{prefix}</span>}
            {chars.map((char, i) => {
                if (char === "." || char === ",") {
                    return (
                        <span key={`sep-${i}`} style={{ lineHeight: `${DIGIT_HEIGHT}px` }}>
                            {char}
                        </span>
                    );
                }
                const digit = parseInt(char, 10);
                return (
                    <SingleDigit
                        key={`d-${i}`}
                        digit={triggered ? digit : 0}
                        duration={duration}
                        delay={i * 0.1}
                    />
                );
            })}
            {suffix && <span>{suffix}</span>}
        </div>
    );
}
