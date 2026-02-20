"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

interface DecryptedTextProps {
    text: string;
    className?: string;
    speed?: number;
    characters?: string;
    revealDirection?: "start" | "end" | "center";
    parentClassName?: string;
    animateOn?: "view" | "hover";
}

export default function DecryptedText({
    text,
    className = "",
    speed = 50,
    characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+",
    revealDirection = "start",
    parentClassName = "",
    animateOn = "view",
}: DecryptedTextProps) {
    const [displayText, setDisplayText] = useState(text);
    const [isAnimating, setIsAnimating] = useState(false);
    const [hasAnimated, setHasAnimated] = useState(false);
    const containerRef = useRef<HTMLSpanElement>(null);

    const getRandomChar = () =>
        characters[Math.floor(Math.random() * characters.length)];

    const animate = () => {
        if (isAnimating) return;
        setIsAnimating(true);

        let step = 0;
        const totalSteps = text.length;
        const interval = setInterval(() => {
            step++;
            setDisplayText(() => {
                return text
                    .split("")
                    .map((char, i) => {
                        if (char === " ") return " ";
                        const revealed =
                            revealDirection === "end"
                                ? i >= totalSteps - step
                                : revealDirection === "center"
                                    ? Math.abs(i - Math.floor(totalSteps / 2)) <
                                    step / 2
                                    : i < step;
                        return revealed ? char : getRandomChar();
                    })
                    .join("");
            });

            if (step >= totalSteps) {
                clearInterval(interval);
                setDisplayText(text);
                setIsAnimating(false);
                setHasAnimated(true);
            }
        }, speed);
    };

    useEffect(() => {
        if (animateOn !== "view" || hasAnimated) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasAnimated) {
                    animate();
                }
            },
            { threshold: 0.5 }
        );

        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasAnimated, animateOn]);

    return (
        <motion.span
            ref={containerRef}
            className={parentClassName}
            onMouseEnter={animateOn === "hover" ? animate : undefined}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <span className={className} aria-label={text}>
                {displayText}
            </span>
        </motion.span>
    );
}
