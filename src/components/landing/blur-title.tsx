"use client";

import BlurText from "@/components/reactbits/BlurText";

export default function BlurTitle({ text, className = "" }: { text: string; className?: string }) {
    return <BlurText text={text} className={className} delay={0.1} />;
}
