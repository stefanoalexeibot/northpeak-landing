"use client";

import Aurora from "@/components/reactbits/Aurora";
import SplashCursor from "@/components/reactbits/SplashCursor";

export default function HeroEffects() {
    return (
        <>
            {/* Aurora background — three animated gradient layers */}
            <Aurora
                colorStops={["#00e5a0", "#0066ff", "#8b5cf6", "#00e5a0"]}
                blend="screen"
                blur="120px"
                speed={10}
                opacity={0.25}
            />

            {/* Fluid cursor trail */}
            <SplashCursor
                SPLAT_RADIUS={0.15}
            />
        </>
    );
}
