"use client";

import DecryptedText from "@/components/reactbits/DecryptedText";

export default function HeroBadge() {
    return (
        <div className="inline-flex items-center gap-2.5 mb-8 px-4 py-1.5 rounded-full border border-northpeak-green/25 bg-northpeak-green/8">
            <span className="h-1.5 w-1.5 rounded-full bg-northpeak-green animate-pulse shrink-0" />
            <DecryptedText
                text="IA para Ventas · Monterrey, N.L."
                className="font-mono text-[11px] tracking-[0.15em] uppercase text-northpeak-green"
                speed={40}
                characters="01█▓▒░▀▄▌▐●◆◇■□▪▫"
                animateOn="view"
            />
        </div>
    );
}
